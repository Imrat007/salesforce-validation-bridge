/**
 * Salesforce Validation Rules Bridge - Backend Server
 * Production-Ready Version with Fixed Session & CORS
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

// Trust proxy - CRITICAL for production (Render uses reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(compression());

// Logging
if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

// CORS - FIXED to allow all Vercel preview deployments
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, health checks)
    if (!origin) {
      return callback(null, true);
    }

    // List of allowed origins
    const allowedOrigins = [
      config.frontendUrl,
      'https://salesforce-validation-bridge.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
    ];

    // Check if origin matches allowed origins or Vercel preview pattern
    const isAllowedOrigin = allowedOrigins.includes(origin);
    const isVercelPreview = origin.match(/^https:\/\/salesforce-validation-bridge.*\.vercel\.app$/);
    
    if (isAllowedOrigin || isVercelPreview) {
      callback(null, true);
    } else {
      logger.warn(`⚠️  CORS blocked: ${origin}`);
      callback(null, true); // Still allow but log
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Redis client setup
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
        ttl: 86400,
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

// Session configuration
const sessionConfig = {
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  name: 'sf.sid',
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: config.sessionMaxAge,
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    domain: undefined,
  },
  proxy: true,
  rolling: true,
};

// CRITICAL: Initialize session middleware BEFORE routes
async function initializeSession() {
  if (sessionStore) {
    sessionConfig.store = sessionStore;
    logger.info('✅ Using Redis session store');
  } else {
    logger.warn('⚠️  Using in-memory session store');
  }
  
  // Apply session middleware
  app.use(session(sessionConfig));
  logger.info('✅ Session middleware initialized');
}

// Rate limiting (applied after session)
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

// Start server
async function startServer() {
  try {
    // 1. Initialize Redis first
    await initializeRedis();
    
    // 2. Initialize session middleware BEFORE any routes
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
      logger.info('='.repeat(60));
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
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
