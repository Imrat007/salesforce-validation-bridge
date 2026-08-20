const express = require('express');
const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');
const { generateCodeVerifier, generateCodeChallenge } = require('../utils/pkce');

const router = express.Router();

function normalizeCustomDomain(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const normalized = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
  const url = new URL(normalized);
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.salesforce.com')) {
    throw new Error('Invalid Salesforce custom domain');
  }
  return url.origin;
}

function getAuthBase(domainType, customDomain) {
  if (domainType === 'sandbox') return 'https://test.salesforce.com';
  if (domainType === 'custom') return normalizeCustomDomain(customDomain);
  return 'https://login.salesforce.com';
}

router.get('/login', (req, res) => {
  try {
    const domainType = req.query.domain || 'production';
    const customDomain = domainType === 'custom' ? normalizeCustomDomain(req.query.customDomain) : '';
    const authBase = getAuthBase(domainType, customDomain);
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    if (!req.session) {
      return res.status(500).json({ success: false, error: 'Session initialization failed', code: 'SESSION_ERROR' });
    }

    req.session.code_verifier = codeVerifier;
    req.session.domain_type = domainType;
    req.session.custom_domain = customDomain;

    req.session.save((err) => {
      if (err) {
        logger.error('Session save error in /login:', err);
        return res.status(500).json({ success: false, error: 'Failed to save session', code: 'SESSION_SAVE_ERROR' });
      }

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: 'api web refresh_token openid profile email',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        prompt: 'login',
      });

      res.redirect(`${authBase}/services/oauth2/authorize?${params.toString()}`);
    });
  } catch (err) {
    logger.error('Login error:', err.message);
    res.status(400).json({ success: false, error: err.message || 'Failed to initiate login', code: 'LOGIN_ERROR' });
  }
});

router.get('/oauth/callback', async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.redirect(`${config.frontendUrl}/?error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    return res.redirect(`${config.frontendUrl}/?error=no_code`);
  }

  try {
    if (!req.session || !req.session.code_verifier) {
      return res.redirect(`${config.frontendUrl}/?error=session_expired`);
    }

    const codeVerifier = req.session.code_verifier;
    const domainType = req.session.domain_type || 'production';
    const customDomain = req.session.custom_domain || '';
    const authBase = getAuthBase(domainType, customDomain);
    const tokenUrl = `${authBase}/services/oauth2/token`;

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    });

    const tokenResponse = await axios.post(tokenUrl, tokenParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: config.requestTimeout,
    });

    const { access_token, refresh_token, instance_url, id: idUrl } = tokenResponse.data;
    const userInfoResponse = await axios.get(idUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
      timeout: config.requestTimeout,
    });
    const userInfo = userInfoResponse.data;

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

    req.session.regenerate((regenerateError) => {
      if (regenerateError) {
        logger.error('Session regeneration error:', regenerateError);
        return res.redirect(`${config.frontendUrl}/?error=session_regeneration_failed`);
      }

      Object.assign(req.session, sessionData);
      req.session.save((saveError) => {
        if (saveError) {
          logger.error('Session save error after authentication:', saveError);
          return res.redirect(`${config.frontendUrl}/?error=session_save_failed`);
        }
        res.redirect(`${config.frontendUrl}/?login=success`);
      });
    });
  } catch (err) {
    logger.error('OAuth callback error:', err.response?.data || err.message);
    const errorMsg = err.response?.data?.error_description || err.response?.data?.error || err.message || 'Authentication failed';
    res.redirect(`${config.frontendUrl}/?error=${encodeURIComponent(errorMsg)}`);
  }
});

router.post('/logout', (req, res) => {
  if (!req.session) return res.json({ success: true, message: 'Already logged out' });
  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destruction error:', err);
      return res.status(500).json({ success: false, error: 'Failed to logout', code: 'LOGOUT_ERROR' });
    }
    res.clearCookie('sf.sid', { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

router.get('/logout', (req, res) => {
  if (!req.session) return res.redirect(`${config.frontendUrl}/?logout=success`);
  req.session.destroy((err) => {
    if (err) return res.redirect(`${config.frontendUrl}/?error=logout_failed`);
    res.clearCookie('sf.sid', { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
    res.redirect(`${config.frontendUrl}/?logout=success`);
  });
});

module.exports = router;
