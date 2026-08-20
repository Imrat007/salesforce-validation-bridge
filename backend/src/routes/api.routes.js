const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getSessionTokens, fetchValidationRules, toggleValidationRule } = require('../services/salesforceService');
const logger = require('../utils/logger');

const router = express.Router();


router.get('/me', (req, res) => {

  if (!req.session) {
    return res.json({
      loggedIn: false,
    });
  }

  const tokens = getSessionTokens(req);

  if (tokens && req.session.authenticated) {
    res.json({
      loggedIn: true,
      username: req.session.username || 'User',
      email: req.session.email || '',
      userType: req.session.userType || 'Standard',
      instanceUrl: req.session.instance_url || '',
      domainType: req.session.domain_type || 'production',
    });
  } else {
    res.json({
      loggedIn: false,
    });
  }
});


router.get('/validation-rules', requireAuth, async (req, res, next) => {
  try {
    const result = await fetchValidationRules(req);

    logger.info(`Fetched ${result.records.length} validation rules`);

    res.json(result);
  } catch (err) {
    next(err);
  }
});


router.post('/validation-toggle', requireAuth, async (req, res, next) => {
  const ruleId = (req.query.id || req.body.Id || req.body.id || '').toString().trim();
  const activeRaw = req.query.active ?? req.body.Active ?? req.body.active;


  let newActive;
  if (['true', true, '1', 1].includes(activeRaw)) {
    newActive = true;
  } else if (['false', false, '0', 0].includes(activeRaw)) {
    newActive = false;
  }


  if (!ruleId) {
    return res.status(400).json({
      success: false,
      error: 'Missing rule ID',
      code: 'MISSING_RULE_ID',
    });
  }

  if (newActive === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing active status (true/false)',
      code: 'MISSING_ACTIVE_STATUS',
    });
  }

  try {
    const result = await toggleValidationRule(req, ruleId, newActive);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
