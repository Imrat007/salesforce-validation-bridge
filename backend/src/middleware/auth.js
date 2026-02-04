/**
 * Authentication Middleware
 */

const { getSessionTokens } = require('../services/salesforceService');
const logger = require('../utils/logger');

/**
 * Require authentication middleware
 */
function requireAuth(req, res, next) {
  const tokens = getSessionTokens(req);
  
  if (!tokens || !req.session.authenticated) {
    logger.warn('Unauthorized access attempt:', req.originalUrl);
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    });
  }
  
  next();
}

module.exports = {
  requireAuth,
};
