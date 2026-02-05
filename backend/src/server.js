/**
 * Salesforce Validation Rules Bridge - Backend Server
 * Production-Ready Version
 * 
 * Features:
 * - Dynamic domain selection (Production/Sandbox/Custom)
 * - Secure OAuth 2.0 flow with PKCE support
 * - User info fetching and display
 * - Validation rules management
 * - Security best practices (Helmet, Rate Limiting, CORS)
 * - Error handling and logging
 * - Health checks
 * - Compression
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

const config = require('./config/config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = config.port;

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: config.isDev ? false : undefined,
  crossOriginEmbedderPolicy: false,
}));

// Compression
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isDev ? 1000 : 100, // Limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/login', limiter);

// API-specific rate limiting (stricter)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many API requests, please slow down.',
});

app.use('/api/validation-toggle', apiLimiter);

// ---------------------------------------------------------------------------
// Session Configuration
// ---------------------------------------------------------------------------

const sessionConfig = {
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  name: 'sf.sid', // Custom session name
  cookie: {
    secure: config.isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: config.isProduction ? 'strict' : 'lax',
  },
};


// Production session store (use Redis in production)
if (config.isProduction) {
  if (process.env.REDIS_URL) {
    const Redis = require('ioredis');
    const RedisStore = require('connect-redis')(session);
    const redisClient = new Redis(process.env.REDIS_URL);
    sessionConfig.store = new RedisStore({ client: redisClient });
    logger.info('Using Redis session store in production.');
  } else {
    logger.warn('REDIS_URL not set! Using memory session store. This is NOT safe for production.');
  }
}

app.use(session(sessionConfig));

// ---------------------------------------------------------------------------
// CORS Configuration
// ---------------------------------------------------------------------------

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (config.corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request ID middleware
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  next();
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use('/', routes);

// ---------------------------------------------------------------------------
// Serve Frontend - Development Only
// ---------------------------------------------------------------------------

if (config.isDev) {
  // Development: Proxy to Vite dev server
  try {
    const { createProxyMiddleware } = require('http-proxy-middleware');
    
    app.use(
      createProxyMiddleware({
        target: 'http://localhost:5173',
        changeOrigin: true,
        ws: true,
        logLevel: 'silent',
        onError: (err, req, res) => {
          logger.error('Proxy Error:', err.message);
          res.status(500).json({ 
            error: 'Frontend dev server not running',
            message: 'Please start frontend: cd frontend && npm run dev'
          });
        }
      })
    );
    
    logger.info('Development mode: Proxying to Vite dev server at http://localhost:5173');
  } catch (error) {
    logger.warn('http-proxy-middleware not available. Install it for dev proxy support.');
  }
} else {
  // Production: Frontend deployed separately (Vercel)
  logger.info('Production mode: Backend API only (Frontend on Vercel)');
  
  // Root endpoint for API documentation or status
  app.get('/', (req, res) => {
    res.json({
      name: 'Salesforce Validation Rules Bridge API',
      version: '1.0.0',
      status: 'running',
      environment: config.nodeEnv,
      endpoints: {
        health: '/api/health',
        login: '/login',
        callback: '/callback',
        validation: '/api/validation-rules',
        toggle: '/api/validation-toggle'
      },
      frontend: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
      documentation: 'See README.md for API usage'
    });
  });
}

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------

app.use(notFoundHandler);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Graceful Shutdown
// ---------------------------------------------------------------------------

const server = app.listen(PORT, () => {
  logger.info('═══════════════════════════════════════════════════');
  logger.info('🚀 Salesforce Validation Rules Bridge');
  logger.info('═══════════════════════════════════════════════════');
  logger.info(`✅ Server running on: http://localhost:${PORT}`);
  logger.info(`✅ Environment: ${config.nodeEnv}`);
  logger.info(`✅ OAuth callback: ${config.redirectUri}`);
  logger.info(`✅ App URL: ${config.appUrl}`);
  logger.info(`✅ PKCE Security: Enabled`);
  logger.info(`✅ Rate Limiting: Enabled`);
  
  if (config.isDev) {
    logger.info('\n💡 Development Instructions:');
    logger.info('   1. Start frontend: cd frontend && npm run dev');
    logger.info('   2. Open browser: http://localhost:5173');
    logger.info('   3. Backend API: http://localhost:3000');
  } else {
    logger.info(`\n🌐 Backend API: ${config.appUrl}`);
    logger.info(`🌐 Frontend: ${process.env.FRONTEND_URL || 'Deployed on Vercel'}`);
  }
  
  logger.info('═══════════════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;