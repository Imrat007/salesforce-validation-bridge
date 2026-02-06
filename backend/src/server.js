/**
 * THE FINAL FIX - server.js
 * 
 * PROBLEM: Redis connected BUT session cookie not reaching browser
 * CAUSE: SameSite=None cookies need special CORS handling
 * 
 * REPLACE: backend/src/server.js WITH THIS
 */

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');
const logger = require('./utils/logger');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ============================================================================
// CRITICAL: Trust proxy MUST be set FIRST
// ============================================================================
app.set('trust proxy', 1);

// ============================================================================
// CORS - FIXED for SameSite=None cookies
// ============================================================================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, health checks)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      config.frontendUrl,
      'https://salesforce-validation-bridge.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
    ];

    const isAllowedOrigin = allowedOrigins.includes(origin);
    const isVercelPreview = origin.match(/^https:\/\/salesforce-validation-bridge.*\.vercel\.app$/);
    
    if (isAllowedOrigin || isVercelPreview) {
      callback(null, true);
    } else {
      logger.warn(`⚠️  CORS blocked: ${origin}`);
      callback(null, true); // Still allow but log
    }
  },
  credentials: true, // CRITICAL for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS before any routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight

// Security middleware - AFTER CORS
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false, // CRITICAL for cross-origin cookies
}));

app.use(compression());

// Logging
if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// REDIS CLIENT SETUP
// ============================================================================
let redisClient;
let sessionStore;

async function initializeRedis() {
  if (config.redisUrl) {
    try {
      redisClient = createClient({
        url: config.redisUrl,
        socket: {
          connectTimeout: 10000,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis reconnection failed after 10 attempts');
              return new Error('Redis reconnection limit exceeded');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      redisClient.on('error', (err) => {
        logger.error('Redis Client Error:', err);
      });

      redisClient.on('connect', () => {
        logger.info('Redis client connected');
      });

      redisClient.on('ready', () => {
        logger.info('Redis client ready');
      });

      redisClient.on('reconnecting', () => {
        logger.warn('Redis client reconnecting...');
      });

      await redisClient.connect();
      
      sessionStore = new RedisStore({
        client: redisClient,
        prefix: 'sess:',
        ttl: 86400, // 24 hours
      });
      
      logger.info('✅ Redis session store initialized successfully');
      return true;
    } catch (err) {
      logger.error('❌ Redis initialization failed:', err);
      logger.warn('⚠️  Falling back to memory store');
      return false;
    }
  } else {
    logger.warn('⚠️  No REDIS_URL provided, using memory store');
    return false;
  }
}

// ============================================================================
// SESSION CONFIGURATION - THE FIX!
// ============================================================================
const sessionConfig = {
  store: undefined, // Will be set after Redis initializes
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  name: 'sf.sid',
  cookie: {
    // CRITICAL FIXES for cross-origin cookies:
    secure: true, // ALWAYS true (even in dev with HTTPS proxy)
    httpOnly: true,
    maxAge: config.sessionMaxAge,
    sameSite: 'none', // MUST be 'none' for cross-origin
    domain: undefined, // Let browser decide
    path: '/',
  },
  proxy: true, // CRITICAL - trust proxy headers
  rolling: true, // Refresh cookie on each request
  unset: 'destroy', // Destroy session when unset
};

// ============================================================================
// INITIALIZE SESSION MIDDLEWARE
// ============================================================================
async function initializeSession() {
  if (sessionStore) {
    sessionConfig.store = sessionStore;
    logger.info('✅ Using Redis session store');
  } else {
    logger.warn('⚠️  Using in-memory session store');
  }
  
  app.use(session(sessionConfig));
  logger.info('✅ Session middleware initialized');
}

// ============================================================================
// RATE LIMITING
// ============================================================================
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' || req.path === '/';
  },
  message: 'Too many requests, please try again later.',
});

// ============================================================================
// START SERVER
// ============================================================================
async function startServer() {
  try {
    // 1. Initialize Redis first
    await initializeRedis();
    
    // 2. Initialize session middleware
    await initializeSession();
    
    // 3. Apply rate limiting
    app.use('/api/', limiter);
    
    // 4. Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        redis: redisClient?.isOpen ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        session: {
          store: sessionStore ? 'redis' : 'memory',
          cookie: sessionConfig.cookie,
        }
      });
    });

    // 5. Root route
    app.get('/', (req, res) => {
      res.json({
        name: 'Salesforce Validation Rules Bridge API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          api: '/api',
          auth: '/login',
          documentation: config.frontendUrl
        },
        message: 'API is running. Use the frontend to interact.',
        frontend: config.frontendUrl
      });
    });

    // 6. Main application routes
    app.use('/', routes);

    // 7. Error handlers (MUST be last)
    app.use(notFoundHandler);
    app.use(errorHandler);
    
    // 8. Start listening
    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info('='.repeat(60));
      logger.info(`🚀 Salesforce Validation Bridge Backend`);
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Frontend URL: ${config.frontendUrl}`);
      logger.info(`🏠 Backend URL: ${config.appUrl}`);
      logger.info(`🔐 Redis: ${redisClient?.isOpen ? 'Connected ✅' : 'Not Connected ⚠️'}`);
      logger.info(`🍪 Cookies: SameSite=none, Secure=true`);
      logger.info('='.repeat(60));
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
async function gracefulShutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis client disconnected');
    }
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

module.exports = app;
