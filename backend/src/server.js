/**
 * Salesforce Validation Rules Bridge - Backend Server
 * Production-Ready Version with Fixed Session Management & Routes
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
  contentSecurityPolicy: false, // Allow frontend to load resources
}));

app.use(compression());

// Logging
if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

// CORS - FIXED for production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      config.frontendUrl,
      'https://salesforce-validation-bridge.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, curl, health checks)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Blocked CORS request from origin: ${origin}`);
      callback(null, true); // Allow for now, log for debugging
    }
  },
  credentials: true, // CRITICAL: Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
};

app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs || 15 * 60 * 1000, // 15 minutes default
  max: config.rateLimitMax || 100, // 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});

app.use('/api/', limiter);

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
        ttl: 86400, // 24 hours in seconds
      });
      
      logger.info('✅ Redis session store initialized successfully');
      return true;
    } catch (err) {
      logger.error('❌ Redis initialization failed:', err);
      logger.warn('⚠️  Falling back to memory store (sessions will not persist)');
      return false;
    }
  } else {
    logger.warn('⚠️  No REDIS_URL provided, using memory store');
    return false;
  }
}

// Session configuration - FIXED for production
const sessionConfig = {
  secret: config.sessionSecret || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'sf.sid', // Custom session cookie name
  cookie: {
    secure: config.nodeEnv === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: config.sessionMaxAge || 24 * 60 * 60 * 1000, // 24 hours default
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax', // CRITICAL for cross-domain
    domain: undefined, // Let browser handle
  },
  proxy: true, // CRITICAL: Trust the reverse proxy
  rolling: true, // Reset expiration on each request
};

// Initialize session after Redis (if available)
async function initializeSession() {
  if (sessionStore) {
    sessionConfig.store = sessionStore;
    logger.info('✅ Using Redis session store');
  } else {
    logger.warn('⚠️  Using in-memory session store (development only)');
  }
  
  app.use(session(sessionConfig));
}

// Health check (before session) - for monitoring services
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    redis: redisClient?.isOpen ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// Root route - FIXED: Added welcome message for base URL
app.get('/', (req, res) => {
  res.json({
    name: 'Salesforce Validation Rules Bridge API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      oauth: '/oauth',
      documentation: config.frontendUrl
    },
    message: 'API is running. Please use the frontend application to interact with this service.',
    frontend: config.frontendUrl
  });
});

// Main routes - Your application routes
app.use('/', routes);

// Error handlers (MUST be last)
app.use(notFoundHandler);
app.use(errorHandler);

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

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
async function startServer() {
  try {
    // Initialize Redis first
    await initializeRedis();
    
    // Then initialize session
    await initializeSession();
    
    // Start listening
    const PORT = config.port || process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info('='.repeat(60));
      logger.info(`🚀 Salesforce Validation Bridge Backend`);
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Frontend URL: ${config.frontendUrl}`);
      logger.info(`🏠 Backend URL: ${config.appUrl}`);
      logger.info(`🔐 Redis: ${redisClient?.isOpen ? 'Connected ✅' : 'Not Connected ⚠️'}`);
      logger.info(`📚 API Docs: ${config.appUrl}/`);
      logger.info('='.repeat(60));
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
