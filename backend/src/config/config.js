/**
 * Configuration Management
 * Centralized configuration with validation
 */

const path = require('path');

// Helper function to clean URLs - removes duplicate protocols
function cleanUrl(url) {
  if (!url) return url;
  // Remove duplicate protocols like http://https://
  url = url.replace(/^https?:\/\/https?:\/\//, 'https://');
  // Remove trailing slash
  url = url.replace(/\/$/, '');
  return url;
}

// ---------------------------------------------------------------------------
// Environment Detection
// ---------------------------------------------------------------------------
const nodeEnv = process.env.NODE_ENV || 'development';
const isDevelopment = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';

// ---------------------------------------------------------------------------
// Server Configuration
// ---------------------------------------------------------------------------
const port = parseInt(process.env.PORT || '3000', 10);
const appUrl = cleanUrl(process.env.APP_URL || (isDevelopment ? `http://localhost:${port}` : ''));
const frontendUrl = cleanUrl(process.env.FRONTEND_URL || 
  (isDevelopment ? 'http://localhost:5173' : 'https://salesforce-validation-bridge.vercel.app'));

// ---------------------------------------------------------------------------
// Salesforce OAuth Configuration
// ---------------------------------------------------------------------------
const clientId = process.env.CLIENT_ID || process.env.SALESFORCE_CLIENT_ID || '';
const clientSecret = process.env.CLIENT_SECRET || process.env.SALESFORCE_CLIENT_SECRET || '';

// FIXED: Handle redirect URI properly
let redirectUri = cleanUrl(process.env.REDIRECT_URI || process.env.SALESFORCE_REDIRECT_URI || '');
if (!redirectUri && appUrl) {
  redirectUri = `${appUrl}/oauth/callback`;
}

// ---------------------------------------------------------------------------
// Session Configuration
// ---------------------------------------------------------------------------
const crypto = require('crypto');

const generateSessionSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

let sessionSecret = process.env.SESSION_SECRET || '';

// Don't use placeholder values
if (sessionSecret === 'REPLACE_THIS_WITH_GENERATED_SECRET_KEY_FROM_COMMAND_ABOVE' || 
    sessionSecret === 'your-secret-key-change-in-production' ||
    sessionSecret === '') {
  if (isProduction) {
    sessionSecret = generateSessionSecret();
    console.warn('⚠️  Auto-generated SESSION_SECRET - set a permanent one!');
  } else {
    sessionSecret = 'dev-secret-key-not-for-production';
  }
}

const sessionMaxAge = parseInt(process.env.SESSION_MAX_AGE || '86400000', 10); // 24 hours

// ---------------------------------------------------------------------------
// Redis Configuration
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
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const apiRateLimitMax = parseInt(process.env.API_RATE_LIMIT_MAX || '30', 10);
const apiRateLimitWindowMs = parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000', 10);

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
// Validation
// ---------------------------------------------------------------------------
function validateConfig() {
  const errors = [];
  const warnings = [];

  // Critical validations
  if (!clientId) {
    errors.push('❌ CLIENT_ID or SALESFORCE_CLIENT_ID is required');
  }
  
  if (!clientSecret) {
    errors.push('❌ CLIENT_SECRET or SALESFORCE_CLIENT_SECRET is required');
  }
  
  if (!redirectUri) {
    errors.push('❌ REDIRECT_URI could not be determined');
  }

  // Production-specific validations
  if (isProduction) {
    if (!redisUrl) {
      warnings.push('⚠️  REDIS_URL not set - sessions will not persist');
    }
    
    if (!appUrl) {
      warnings.push('⚠️  APP_URL not set');
    }
    
    if (!process.env.SESSION_SECRET) {
      warnings.push('⚠️  SESSION_SECRET not set - using auto-generated value');
    }
  }

  // Log configuration summary
  console.log('✅ Configuration validated successfully');
  console.log('📋 Current Configuration:');
  console.log(`  Environment: ${nodeEnv}`);
  console.log(`  Port: ${port}`);
  console.log(`  App URL: ${appUrl || 'Not set'}`);
  console.log(`  Frontend URL: ${frontendUrl}`);
  console.log(`  Redirect URI: ${redirectUri}`);
  console.log(`  Redis: ${redisUrl ? 'Configured ✅' : 'Not configured ⚠️'}`);
  console.log(`  Trust Proxy: ${trustProxy}`);

  if (warnings.length > 0) {
    console.log('');
    warnings.forEach(warn => console.log(`  ${warn}`));
  }

  if (errors.length > 0) {
    console.log('');
    console.error('❌ Configuration Errors:');
    errors.forEach(err => console.error(`  ${err}`));
    throw new Error('Configuration validation failed');
  }
}

// Run validation
validateConfig();

// ---------------------------------------------------------------------------
// Export Configuration
// ---------------------------------------------------------------------------
module.exports = {
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
