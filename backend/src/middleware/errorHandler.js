/**
 * Error Handling Middleware
 */

const logger = require('../utils/logger');

/**
 * 404 Not Found Handler
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

/**
 * Global Error Handler
 */
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  // Log error
  if (status >= 500) {
    logger.error(`Error ${status}:`, {
      message,
      code,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn(`Error ${status}:`, {
      message,
      code,
      url: req.originalUrl,
    });
  }

  // Send error response
  res.status(status).json({
    success: false,
    error: message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
