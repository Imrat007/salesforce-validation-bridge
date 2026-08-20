const express = require('express');
const authRoutes = require('./auth.routes');
const apiRoutes = require('./api.routes');

const router = express.Router();


router.use('/', authRoutes);


router.use('/api', apiRoutes);

module.exports = router;
