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
const isDevelopment = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';

// ---------------------------------------------------------------------------
// Salesforce OAuth Configuration
// ---------------------------------------------------------------------------
const clientId = process.env.CLIENT_ID || '';
const clientSecret = process.env.CLIENT_SECRET || '';

// FIXED: Handle both old and new redirect URI formats
let redirectUri = process.env.REDIRECT_URI || '';
if (isProduction && !redirectUri) {
  const appUrl = process.env.APP_URL || '';
  if (appUrl) {
    redirectUri = `${appUrl}/oauth/callback`;
  }
}

// ---------------------------------------------------------------------------
// Server Configuration
// ---------------------------------------------------------------------------
const port = parseInt(process.env.PORT || '3000', 10);
const appUrl = process.env.APP_URL || (isDevelopment ? `http://localhost:${port}` : '');
const frontendUrl = process.env.FRONTEND_URL || 
  (isDevelopment ? 'http://localhost:5173' : 'https://salesforce-validation-bridge.vercel.app');

// ---------------------------------------------------------------------------
// Session Configuration - FIXED
// ---------------------------------------------------------------------------
// Generate a strong session secret if not provided
const generateSessionSecret = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

const sessionSecret = process.env.SESSION_SECRET && 
                     process.env.SESSION_SECRET !== 'REPLACE_THIS_WITH_GENERATED_SECRET_KEY_FROM_COMMAND_ABOVE'
  ? process.env.SESSION_SECRET
  : (isProduction 
      ? generateSessionSecret() // Auto-generate in production if missing
      : 'dev-secret-key-not-for-production');

const sessionMaxAge = parseInt(
  process.env.SESSION_MAX_AGE || '86400000', // 24 hours
  10
);

// ---------------------------------------------------------------------------
// Redis Configuration - FIXED
// ---------------------------------------------------------------------------
const redisUrl = process.env.REDIS_URL || '';

// ---------------------------------------------------------------------------
// Security Configuration
// ---------------------------------------------------------------------------
const trustProxy = process.env.TRUST_PROXY === 'true' || isProduction;

// ---------------------------------------------------------------------------
// Rate Limiting
// ---------------------------------------------------------------------------
const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 min
const apiRateLimitMax = parseInt(process.env.API_RATE_LIMIT_MAX || '30', 10);
const apiRateLimitWindowMs = parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 min

// ---------------------------------------------------------------------------
// Salesforce API Configuration
// ---------------------------------------------------------------------------
const toolingApiVersion = process.env.TOOLING_API_VERSION || 'v59.0';
const requestTimeout = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);

// ---------------------------------------------------------------------------
// Logging Configuration
// ---------------------------------------------------------------------------
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// ---------------------------------------------------------------------------
// Validation - FIXED to be less strict
// ---------------------------------------------------------------------------
const strictEnvCheck = process.env.STRICT_ENV_CHECK === 'true';

function validateConfig() {
  const errors = [];
  const warnings = [];

  // Critical validations
  if (!clientId) errors.push('CLIENT_ID is required');
  if (!clientSecret) errors.push('CLIENT_SECRET is required');
  if (!redirectUri) errors.push('REDIRECT_URI is required');

  // Production-specific validations
  if (isProduction) {
    if (!redisUrl) {
      warnings.push('⚠️  REDIS_URL not set - sessions will not persist across restarts');
    }
    
    if (sessionSecret === 'dev-secret-key-not-for-production') {
      warnings.push('⚠️  Using auto-generated SESSION_SECRET - set a permanent one for consistency');
    }
    
    if (!appUrl) {
      warnings.push('⚠️  APP_URL not set - using default');
    }
  }

  // Log results
  if (errors.length > 0) {
    console.error('❌ Configuration Errors:');
    errors.forEach(err => console.error(`   - ${err}`));
    if (strictEnvCheck) {
      throw new Error('Configuration validation failed. Please check environment variables.');
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Configuration Warnings:');
    warnings.forEach(warn => console.warn(`   - ${warn}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Configuration validated successfully');
  }
}

// Run validation on load
validateConfig();

// ---------------------------------------------------------------------------
// Export Configuration
// ---------------------------------------------------------------------------
const config = {
  // Environment
  nodeEnv,
  isDevelopment,
  isProduction,

  // Server
  port,
  appUrl,
  frontendUrl,
  trustProxy,

  // Salesforce OAuth
  clientId,
  clientSecret,
  redirectUri,

  // Session
  sessionSecret,
  sessionMaxAge,
  redisUrl,

  // Rate Limiting
  rateLimitMax,
  rateLimitWindowMs,
  apiRateLimitMax,
  apiRateLimitWindowMs,

  // Salesforce API
  toolingApiVersion,
  requestTimeout,

  // Logging
  logLevel,
};

// Log configuration (without secrets) in development
if (isDevelopment) {
  console.log('\n📋 Current Configuration:');
  console.log('  Environment:', config.nodeEnv);
  console.log('  Port:', config.port);
  console.log('  App URL:', config.appUrl);
  console.log('  Frontend URL:', config.frontendUrl);
  console.log('  Redirect URI:', config.redirectUri);
  console.log('  Redis:', config.redisUrl ? 'Configured ✅' : 'Not configured ⚠️');
  console.log('  Trust Proxy:', config.trustProxy);
  console.log('');
}

module.exports = config;