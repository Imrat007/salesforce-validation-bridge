
function cleanUrl(url) {
  if (!url) return url;

  url = url.replace(/^https?:\/\/https?:\/\//, 'https://');

  url = url.replace(/\/$/, '');
  return url;
}




const nodeEnv = process.env.NODE_ENV || 'development';
const isDevelopment = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';




const port = parseInt(process.env.PORT || '3000', 10);
const appUrl = cleanUrl(process.env.APP_URL || (isDevelopment ? `http://localhost:${port}` : ''));
const frontendUrl = cleanUrl(process.env.FRONTEND_URL ||
  (isDevelopment ? 'http://localhost:5173' : 'https://salesforce-validation-bridge.vercel.app'));




const clientId = process.env.CLIENT_ID || process.env.SALESFORCE_CLIENT_ID || '';
const clientSecret = process.env.CLIENT_SECRET || process.env.SALESFORCE_CLIENT_SECRET || '';


let redirectUri = cleanUrl(process.env.REDIRECT_URI || process.env.SALESFORCE_REDIRECT_URI || '');
if (!redirectUri && appUrl) {
  redirectUri = `${appUrl}/oauth/callback`;
}




const crypto = require('crypto');

const generateSessionSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

let sessionSecret = process.env.SESSION_SECRET || '';


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

const sessionMaxAge = parseInt(process.env.SESSION_MAX_AGE || '86400000', 10);




const redisUrl = process.env.REDIS_URL || '';




const trustProxy = process.env.TRUST_PROXY === 'true' || isProduction;




const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const apiRateLimitMax = parseInt(process.env.API_RATE_LIMIT_MAX || '30', 10);
const apiRateLimitWindowMs = parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000', 10);




const toolingApiVersion = process.env.TOOLING_API_VERSION || 'v59.0';
const requestTimeout = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);




const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');




function validateConfig() {
  const errors = [];
  const warnings = [];


  if (!clientId) {
    errors.push('❌ CLIENT_ID or SALESFORCE_CLIENT_ID is required');
  }

  if (!clientSecret) {
    errors.push('❌ CLIENT_SECRET or SALESFORCE_CLIENT_SECRET is required');
  }

  if (!redirectUri) {
    errors.push('❌ REDIRECT_URI could not be determined');
  }


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


validateConfig();




module.exports = {

  nodeEnv,
  isDevelopment,
  isProduction,


  port,
  appUrl,
  frontendUrl,
  trustProxy,


  clientId,
  clientSecret,
  redirectUri,


  sessionSecret,
  sessionMaxAge,
  redisUrl,


  rateLimitMax,
  rateLimitWindowMs,
  apiRateLimitMax,
  apiRateLimitWindowMs,


  toolingApiVersion,
  requestTimeout,


  logLevel,
};
