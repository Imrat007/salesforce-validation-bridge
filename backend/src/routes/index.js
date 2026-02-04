/**
 * Routes Index
 * Consolidates all application routes
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const apiRoutes = require('./api.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// Auth routes (login, callback, logout)
router.use('/', authRoutes);

// API routes (validation rules, user info)
router.use('/api', apiRoutes);

module.exports = router;
