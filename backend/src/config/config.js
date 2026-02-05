/**
 * Configuration Management
 * Centralized configuration with validation
 * Supports both local development and production deployment
 */

const path = require('path');

// ---------------------------------------------------------------------------
// Environment Detection
// ---------------------------------------------------------------------------

const nodeEnv = process.env.NODE_ENV || 'development';
const isDev = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';

// ---------------------------------------------------------------------------
// Environment Variables Validation
// ---------------------------------------------------------------------------

const REQUIRED_ENV = ['CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI'];

// Only validate in production or when explicitly required
if (isProduction || process.env.STRICT_ENV_CHECK === 'true') {
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      console.error(`❌ Missing required environment variable: ${key}`);
      console.error('Please check your .env file or environment settings');
      process.exit(1);
    }
  }
} else if (isDev) {
  // Warn in development if missing
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      console.warn(`⚠️  Warning: ${key} not set in .env file`);
    }
  }
}

// ---------------------------------------------------------------------------
// URL Configuration
// ---------------------------------------------------------------------------

/**
 * Determine app URL for redirects and CORS
 * Priority: APP_URL env > Derived from REDIRECT_URI > Default localhost
 */
const getAppUrl = () => {
  // Use APP_URL if explicitly set
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  
  // Development default
  if (isDev) {
    return 'http://localhost:3000';
  }
  
  // Production: Try to derive from REDIRECT_URI
  const redirectUri = process.env.REDIRECT_URI || '';
  const match = redirectUri.match(/^(https?:\/\/[^\/]+)/);
  
  if (match) {
    return match[1];
  }
  
  // Fallback
  return `http://localhost:${process.env.PORT || 3000}`;
};

/**
 * Get frontend URL for CORS
 */
const getFrontendUrl = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  
  // Development default
  if (isDev) {
    return 'http://localhost:5173';
  }
  
  // Production: Must be explicitly set
  console.warn('⚠️  FRONTEND_URL not set. CORS may not work correctly!');
  return null;
};

const appUrl = getAppUrl();
const frontendUrl = getFrontendUrl();

// ---------------------------------------------------------------------------
// CORS Origins Configuration
// ---------------------------------------------------------------------------

const getCorsOrigins = () => {
  const origins = [];
  
  if (isDev) {
    // Development: Allow both frontend and backend localhost
    origins.push(
      'http://localhost:5173',  // Vite dev server
      'http://localhost:3000',  // Backend server
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    );
  } else {
    // Production: Only allow configured origins
    if (frontendUrl) {
      origins.push(frontendUrl);
    }
    if (appUrl && appUrl !== frontendUrl) {
      origins.push(appUrl);
    }
  }
  
  // Add any additional origins from env
  if (process.env.ADDITIONAL_CORS_ORIGINS) {
    const additional = process.env.ADDITIONAL_CORS_ORIGINS.split(',').map(o => o.trim());
    origins.push(...additional);
  }
  
  // Remove duplicates and empty values
  return [...new Set(origins.filter(Boolean))];
};

const corsOrigins = getCorsOrigins();

// ---------------------------------------------------------------------------
// Main Configuration Object
// ---------------------------------------------------------------------------

const config = {
  // Environment
  nodeEnv,
  isDev,
  isProduction,
  
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  appUrl,
  frontendUrl,
  
  // Salesforce OAuth
  clientId: process.env.CLIENT_ID || '',
  clientSecret: process.env.CLIENT_SECRET || '',
  redirectUri: process.env.REDIRECT_URI || `${appUrl}/callback`,
  
  // Salesforce API
  toolingApiVersion: process.env.TOOLING_API_VERSION || 'v59.0',
  salesforceDomains: {
    production: 'https://login.salesforce.com',
    sandbox: 'https://test.salesforce.com',
  },
  
  // Session Configuration
  sessionSecret: process.env.SESSION_SECRET || (isDev ? 'dev-secret-change-in-production' : null),
  sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours default
  
  // Security & CORS
  corsOrigins,
  trustProxy: isProduction, // Trust proxy in production (for Render, Heroku, etc.)
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || (isDev ? '1000' : '100'), 10),
  apiRateLimitWindowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 min
  apiRateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX || '30', 10),
  
  // Redis
  redisUrl: process.env.REDIS_URL || '',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  
  // Timeouts
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10), // 30 seconds
  
  // Features
  enableProxyMiddleware: isDev, // Only proxy in development
};

// ---------------------------------------------------------------------------
// Production Validations
// ---------------------------------------------------------------------------

if (isProduction) {
  // Validate session secret
  if (!config.sessionSecret || config.sessionSecret === 'dev-secret-change-in-production') {
    console.error('❌ SESSION_SECRET must be set to a secure value in production!');
    console.error('   Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }
  
  // Validate frontend URL
  if (!frontendUrl) {
    console.error('❌ FRONTEND_URL must be set in production for CORS!');
    console.error('   Example: https://your-app.vercel.app');
    process.exit(1);
  }
  
  // Validate HTTPS in production
  if (appUrl && !appUrl.startsWith('https://')) {
    console.warn('⚠️  Warning: APP_URL should use HTTPS in production');
  }
  
  if (frontendUrl && !frontendUrl.startsWith('https://')) {
    console.warn('⚠️  Warning: FRONTEND_URL should use HTTPS in production');
  }
}

// ---------------------------------------------------------------------------
// Configuration Summary (for debugging)
// ---------------------------------------------------------------------------

if (isDev) {
  console.log('\n🔧 Configuration Loaded:');
  console.log('   Environment:', nodeEnv);
  console.log('   Backend URL:', appUrl);
  console.log('   Frontend URL:', frontendUrl);
  console.log('   CORS Origins:', corsOrigins);
  console.log('   Redirect URI:', config.redirectUri);
  console.log('');
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = config;