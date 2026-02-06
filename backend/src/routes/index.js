/**
 * Routes Index
 * Consolidates all application routes
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const apiRoutes = require('./api.routes');

const router = express.Router();

// Auth routes (login, callback, logout)
router.use('/', authRoutes);

// API routes (validation rules, user info)
router.use('/api', apiRoutes);

module.exports = router;
