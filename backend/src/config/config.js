/**
 * Configuration Management
 * Centralized configuration with validation
 */

const path = require('path');

// Environment validation
const REQUIRED_ENV = ['CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI'];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    console.error('Please check your .env file');
    process.exit(1);
  }
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isDev = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';

// Determine app URL for redirects
const getAppUrl = () => {
  if (isDev) {
    return process.env.APP_URL || 'http://localhost:5173';
  }
  if (process.env.APP_URL) return process.env.APP_URL;
  
  const redirectUri = process.env.REDIRECT_URI || '';
  const match = redirectUri.match(/^(https?:\/\/[^\/]+)/);
  return match ? match[1] : `http://localhost:${process.env.PORT || 3000}`;
};

const appUrl = getAppUrl();

// CORS origins
const corsOrigins = isDev
  ? ['http://localhost:5173', 'http://localhost:3000', appUrl]
  : [appUrl];

const config = {
  // Environment
  nodeEnv,
  isDev,
  isProduction,
  
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  appUrl,
  
  // Salesforce OAuth
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
  
  // Salesforce API
  toolingApiVersion: process.env.TOOLING_API_VERSION || 'v59.0',
  salesforceDomains: {
    production: 'https://login.salesforce.com',
    sandbox: 'https://test.salesforce.com',
  },
  
  // Session
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  
  // Security
  corsOrigins,
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
};

// Validate session secret in production
if (isProduction && config.sessionSecret === 'dev-secret-change-in-production') {
  console.error('❌ SESSION_SECRET must be set to a secure value in production!');
  process.exit(1);
}

module.exports = config;
