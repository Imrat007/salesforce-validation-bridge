/**
 * Authentication Routes
 * OAuth login, callback, and logout
 */

const express = require('express');
const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');
const { generateCodeVerifier, generateCodeChallenge } = require('../utils/pkce');
const { fetchUserInfo } = require('../services/salesforceService');

const router = express.Router();

/**
 * GET /login - Start OAuth flow with PKCE
 */
router.get('/login', (req, res) => {
  const domainType = req.query.domain || 'production';
  const customDomain = req.query.customDomain || '';

  // Determine Salesforce domain
  let salesforceDomain;
  if (domainType === 'custom' && customDomain) {
    salesforceDomain = customDomain.replace(/\/$/, '');
  } else if (domainType === 'sandbox') {
    salesforceDomain = config.salesforceDomains.sandbox;
  } else {
    salesforceDomain = config.salesforceDomains.production;
  }

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Store in session
  req.session.salesforce_domain = salesforceDomain;
  req.session.domain_type = domainType;
  req.session.code_verifier = codeVerifier;

  req.session.save((err) => {
    if (err) {
      logger.error('Session save error:', err);
      // ✅ FIXED: Redirect to frontend, not backend
      const frontendUrl = config.frontendUrl || config.appUrl;
      return res.redirect(`${frontendUrl}?error=${encodeURIComponent('Session initialization failed')}`);
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: 'api refresh_token',
      prompt: 'login',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${salesforceDomain}/services/oauth2/authorize?${params.toString()}`;
    
    logger.info(`OAuth redirect to: ${salesforceDomain}`);
    logger.debug('PKCE enabled with code challenge');
    
    res.redirect(authUrl);
  });
});

/**
 * GET /oauth/callback - Handle OAuth callback
 */
router.get('/oauth/callback', async (req, res) => {
  const { code, error, error_description } = req.query;

  // ✅ FIXED: Use frontend URL for redirects
  const frontendUrl = config.frontendUrl || config.appUrl;

  if (error) {
    logger.error('OAuth error:', error, error_description);
    return res.redirect(`${frontendUrl}?error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}?error=${encodeURIComponent('No authorization code received')}`);
  }

  const salesforceDomain = req.session.salesforce_domain || config.salesforceDomains.production;
  const codeVerifier = req.session.code_verifier;

  if (!codeVerifier) {
    logger.error('Code verifier not found in session');
    return res.redirect(`${frontendUrl}?error=${encodeURIComponent('Session expired. Please try logging in again.')}`);
  }

  const tokenUrl = `${salesforceDomain}/services/oauth2/token`;
  const tokenBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
  });

  try {
    logger.info('Exchanging authorization code for access token');
    
    const tokenResponse = await axios.post(tokenUrl, tokenBody.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    });

    const { access_token, instance_url, id } = tokenResponse.data;

    if (!access_token || !instance_url) {
      throw new Error('Token response missing access_token or instance_url');
    }

    logger.info('Access token received, fetching user info');

    // Fetch user information
    const userInfo = await fetchUserInfo(id, access_token);

    // Store in session
    req.session.access_token = access_token;
    req.session.instance_url = instance_url.replace(/\/$/, '');
    req.session.salesforce_domain = salesforceDomain;
    req.session.username = userInfo.username;
    req.session.email = userInfo.email;
    req.session.userType = userInfo.userType;
    req.session.authenticated = true;

    // Clear code verifier
    delete req.session.code_verifier;

    req.session.save((err) => {
      if (err) {
        logger.error('Session save error:', err);
        return res.redirect(`${frontendUrl}?error=${encodeURIComponent('Failed to save session')}`);
      }

      logger.info(`User authenticated: ${userInfo.username} (${userInfo.userType})`);
      
      // ✅ FIXED: Redirect to frontend with success
      res.redirect(`${frontendUrl}?success=1`);
    });
  } catch (err) {
    logger.error('Token exchange error:', err.response?.data || err.message);
    const errorMsg = err.response?.data?.error_description || err.message || 'Authentication failed';
    
    // ✅ FIXED: Redirect to frontend with error
    res.redirect(`${frontendUrl}?error=${encodeURIComponent(errorMsg)}`);
  }
});

/**
 * POST /logout - Destroy session
 */
router.post('/logout', (req, res) => {
  const username = req.session?.username || 'User';

  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to logout',
      });
    }

    res.clearCookie('sf.sid', {
      path: '/',
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'strict' : 'lax',
    });

    logger.info(`User logged out: ${username}`);
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

/**
 * GET /logout - Browser-friendly logout
 */
router.get('/logout', (req, res) => {
  const username = req.session?.username || 'User';
  
  // ✅ FIXED: Redirect to frontend after logout
  const frontendUrl = config.frontendUrl || config.appUrl;

  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error:', err);
      return res.redirect(`${frontendUrl}?error=${encodeURIComponent('Logout failed')}`);
    }

    res.clearCookie('sf.sid', {
      path: '/',
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'strict' : 'lax',
    });

    logger.info(`User logged out: ${username}`);
    
    // ✅ FIXED: Redirect to frontend home
    res.redirect(frontendUrl);
  });
});

module.exports = router;