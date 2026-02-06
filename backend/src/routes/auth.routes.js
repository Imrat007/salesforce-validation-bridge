/**
 * THE FINAL FIX - auth.routes.js
 * 
 * FIXES:
 * 1. Explicit req.session.save() with error handling
 * 2. Better session verification
 * 3. Proper cookie setting
 * 
 * REPLACE: backend/src/routes/auth.routes.js WITH THIS
 */

const express = require('express');
const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');
const { generateCodeVerifier, generateCodeChallenge } = require('../utils/pkce');

const router = express.Router();

/**
 * GET /login - Initiate OAuth flow
 */
router.get('/login', (req, res) => {
  try {
    const domainType = req.query.domain || 'production';
    
    // Determine auth URL
    let authUrl;
    if (domainType === 'sandbox') {
      authUrl = 'https://test.salesforce.com/services/oauth2/authorize';
    } else if (domainType === 'custom' && req.query.customDomain) {
      authUrl = `https://${req.query.customDomain}/services/oauth2/authorize`;
    } else {
      authUrl = 'https://login.salesforce.com/services/oauth2/authorize';
    }

    // PKCE challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // Check session exists
    if (!req.session) {
      logger.error('Session not initialized!');
      return res.status(500).json({
        success: false,
        error: 'Session initialization failed',
        code: 'SESSION_ERROR'
      });
    }

    // Store PKCE data
    req.session.code_verifier = codeVerifier;
    req.session.domain_type = domainType;
    req.session.custom_domain = req.query.customDomain || '';

    // CRITICAL: Explicitly save session before redirect
    req.session.save((err) => {
      if (err) {
        logger.error('Session save error in /login:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to save session',
          code: 'SESSION_SAVE_ERROR',
          details: err.message
        });
      }

      logger.info('✅ Session saved with code_verifier');

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: 'api web refresh_token openid profile email',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        prompt: 'login',
      });

      const loginUrl = `${authUrl}?${params.toString()}`;
      logger.info(`Redirecting to Salesforce login (${domainType})`);
      
      res.redirect(loginUrl);
    });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate login',
      code: 'LOGIN_ERROR',
      details: config.isDevelopment ? err.message : undefined
    });
  }
});

/**
 * GET /oauth/callback - Handle OAuth callback
 */
router.get('/oauth/callback', async (req, res) => {
  const { code, error, error_description } = req.query;

  // Handle OAuth errors
  if (error) {
    logger.error('OAuth error:', error, error_description);
    return res.redirect(`${config.frontendUrl}/?error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    logger.error('No authorization code received');
    return res.redirect(`${config.frontendUrl}/?error=no_code`);
  }

  try {
    // Verify session exists
    if (!req.session) {
      logger.error('❌ No session object in callback!');
      return res.redirect(`${config.frontendUrl}/?error=no_session`);
    }

    if (!req.session.code_verifier) {
      logger.error('❌ No code_verifier in session!');
      logger.error('Session ID:', req.sessionID);
      logger.error('Session data:', JSON.stringify(req.session));
      return res.redirect(`${config.frontendUrl}/?error=session_expired`);
    }

    const codeVerifier = req.session.code_verifier;
    const domainType = req.session.domain_type || 'production';
    const customDomain = req.session.custom_domain || '';

    logger.info('✅ Session verified, code_verifier found');

    // Determine token URL
    let tokenUrl;
    if (domainType === 'sandbox') {
      tokenUrl = 'https://test.salesforce.com/services/oauth2/token';
    } else if (domainType === 'custom' && customDomain) {
      tokenUrl = `https://${customDomain}/services/oauth2/token`;
    } else {
      tokenUrl = 'https://login.salesforce.com/services/oauth2/token';
    }

    // Exchange code for tokens
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    });

    logger.info('Exchanging code for tokens...');
    const tokenResponse = await axios.post(tokenUrl, tokenParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: config.requestTimeout,
    });

    const {
      access_token,
      refresh_token,
      instance_url,
      id: idUrl,
    } = tokenResponse.data;

    logger.info('✅ Tokens received from Salesforce');

    // Fetch user info
    logger.info('Fetching user info...');
    const userInfoResponse = await axios.get(idUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
      timeout: config.requestTimeout,
    });

    const userInfo = userInfoResponse.data;
    logger.info(`✅ User info received: ${userInfo.username}`);

    // CRITICAL: Clear old session data first
    delete req.session.code_verifier;
    delete req.session.custom_domain;

    // Store authentication data
    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;
    req.session.instance_url = instance_url;
    req.session.authenticated = true;
    req.session.username = userInfo.username || 'User';
    req.session.email = userInfo.email || '';
    req.session.userType = userInfo.user_type || 'Standard';
    req.session.domain_type = domainType;

    // CRITICAL: Force session regeneration for security
    const sessionData = {
      access_token,
      refresh_token,
      instance_url,
      authenticated: true,
      username: userInfo.username || 'User',
      email: userInfo.email || '',
      userType: userInfo.user_type || 'Standard',
      domain_type: domainType,
    };

    req.session.regenerate((err) => {
      if (err) {
        logger.error('Session regeneration error:', err);
        // Continue anyway, try to save current session
      }

      // Restore data after regeneration
      Object.assign(req.session, sessionData);

      // CRITICAL: Explicitly save session with verification
      req.session.save((saveErr) => {
        if (saveErr) {
          logger.error('❌ Failed to save session after authentication:', saveErr);
          logger.error('Session ID:', req.sessionID);
          return res.redirect(`${config.frontendUrl}/?error=session_save_failed`);
        }

        logger.info('✅ Session saved successfully');
        logger.info(`✅ User authenticated: ${userInfo.username}`);
        logger.info('Session ID:', req.sessionID);
        
        // Redirect with success
        res.redirect(`${config.frontendUrl}/?login=success`);
      });
    });

  } catch (err) {
    logger.error('OAuth callback error:', err.response?.data || err.message);
    
    const errorMsg = err.response?.data?.error_description || 
                     err.response?.data?.error || 
                     'Authentication failed';
    
    res.redirect(`${config.frontendUrl}/?error=${encodeURIComponent(errorMsg)}`);
  }
});

/**
 * POST /logout - Clear session and logout
 */
router.post('/logout', (req, res) => {
  if (!req.session) {
    return res.json({ success: true, message: 'Already logged out' });
  }

  const username = req.session.username || 'User';
  
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destruction error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to logout',
        code: 'LOGOUT_ERROR'
      });
    }

    logger.info(`User logged out: ${username}`);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

/**
 * GET /logout - Alternative logout endpoint
 */
router.get('/logout', (req, res) => {
  if (!req.session) {
    return res.redirect(`${config.frontendUrl}/?logout=success`);
  }

  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destruction error:', err);
    }
    res.redirect(`${config.frontendUrl}/?logout=success`);
  });
});

module.exports = router;
