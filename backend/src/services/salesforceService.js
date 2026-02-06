/**
 * Salesforce Service
 * Handles all Salesforce API interactions
 * FIXED: Removed undefined config.salesforceDomains reference
 */

const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Get session tokens from request
 * FIXED: Proper null checks and fallback values
 */
function getSessionTokens(req) {
  // Check if session exists
  if (!req.session) {
    logger.warn('No session object found');
    return null;
  }

  // Check if required tokens exist
  if (!req.session.access_token || !req.session.instance_url) {
    logger.warn('Missing access_token or instance_url in session');
    return null;
  }
  
  return {
    access_token: req.session.access_token,
    instance_url: req.session.instance_url,
    // FIXED: Use domain_type from session or default to 'production'
    salesforce_domain: req.session.domain_type || 'production',
  };
}

/**
 * Make authenticated Salesforce API request
 */
async function salesforceRequest(req, method, path, body = null) {
  const tokens = getSessionTokens(req);
  
  if (!tokens) {
    const err = new Error('Not authenticated');
    err.status = 401;
    err.code = 'NO_SESSION';
    throw err;
  }

  const url = `${tokens.instance_url}${path}`;
  const requestConfig = {
    method,
    url,
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
  };

  if (body && ['POST', 'PATCH', 'PUT'].includes(method)) {
    requestConfig.data = body;
  }

  try {
    logger.debug(`Salesforce API request: ${method} ${path}`);
    const response = await axios(requestConfig);
    return response.data;
  } catch (axiosError) {
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;
    
    logger.error(`Salesforce API error: ${status}`, data);
    
    const err = new Error(data?.message || axiosError.message || 'Salesforce request failed');
    err.status = status || 500;
    err.code = Array.isArray(data) ? data[0]?.errorCode : data?.errorCode;
    throw err;
  }
}

/**
 * Fetch validation rules from Salesforce
 */
async function fetchValidationRules(req) {
  const query = 'SELECT Id, ValidationName, Active, EntityDefinition.QualifiedApiName FROM ValidationRule ORDER BY ValidationName';
  
  const result = await salesforceRequest(
    req,
    'GET',
    `/services/data/${config.toolingApiVersion}/tooling/query?q=${encodeURIComponent(query)}`
  );

  const records = (result.records || []).map((r) => ({
    Id: r.Id,
    ValidationName: r.ValidationName || 'Unnamed Rule',
    Active: r.Active === true,
    EntityName: r.EntityDefinition?.QualifiedApiName || 'Unknown',
  }));

  return {
    success: true,
    totalSize: result.totalSize || records.length,
    records,
  };
}

/**
 * Toggle validation rule active status
 */
async function toggleValidationRule(req, ruleId, newActive) {
  // Fetch current rule metadata
  const queryResult = await salesforceRequest(
    req,
    'GET',
    `/services/data/${config.toolingApiVersion}/tooling/query?q=${encodeURIComponent(
      `SELECT Id, FullName, Metadata FROM ValidationRule WHERE Id = '${ruleId}'`
    )}`
  );

  const records = queryResult.records || [];
  
  if (records.length === 0) {
    const err = new Error('Validation rule not found');
    err.status = 404;
    throw err;
  }

  const rule = records[0];
  const existingMeta = rule.Metadata || {};

  // Update metadata with new active status
  const metadata = {
    ...existingMeta,
    active: newActive,
    description: existingMeta.description || '',
    errorConditionFormula: existingMeta.errorConditionFormula || 'TRUE',
    errorMessage: existingMeta.errorMessage || 'Validation error',
  };

  // Update the rule
  await salesforceRequest(
    req,
    'PATCH',
    `/services/data/${config.toolingApiVersion}/tooling/sobjects/ValidationRule/${ruleId}`,
    { Metadata: metadata }
  );

  logger.info(`Updated validation rule ${ruleId} - Active: ${newActive}`);

  return {
    success: true,
    Id: ruleId,
    Active: newActive,
  };
}

/**
 * Fetch user information from Salesforce
 */
async function fetchUserInfo(idUrl, accessToken) {
  try {
    const userInfoResponse = await axios.get(idUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });

    const userInfo = userInfoResponse.data;
    
    return {
      username: userInfo.username || userInfo.display_name || userInfo.email || 'User',
      email: userInfo.email || '',
      userType: userInfo.user_type || 'Standard',
    };
  } catch (error) {
    logger.warn('Could not fetch user info:', error.message);
    return {
      username: 'User',
      email: '',
      userType: 'Standard',
    };
  }
}

module.exports = {
  getSessionTokens,
  salesforceRequest,
  fetchValidationRules,
  toggleValidationRule,
  fetchUserInfo,
};
