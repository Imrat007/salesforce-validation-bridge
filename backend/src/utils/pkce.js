/**
 * PKCE (Proof Key for Code Exchange) Utilities
 * For secure OAuth 2.0 authentication
 */

const crypto = require('crypto');

/**
 * Base64 URL encode
 */
function base64URLEncode(str) {
  return str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * SHA256 hash
 */
function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

/**
 * Generate code verifier
 */
function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(32));
}

/**
 * Generate code challenge from verifier
 */
function generateCodeChallenge(verifier) {
  return base64URLEncode(sha256(verifier));
}

module.exports = {
  base64URLEncode,
  sha256,
  generateCodeVerifier,
  generateCodeChallenge,
};
