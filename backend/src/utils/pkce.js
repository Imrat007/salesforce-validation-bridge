const crypto = require('crypto');


function base64URLEncode(str) {
  return str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}


function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}


function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(32));
}


function generateCodeChallenge(verifier) {
  return base64URLEncode(sha256(verifier));
}

module.exports = {
  base64URLEncode,
  sha256,
  generateCodeVerifier,
  generateCodeChallenge,
};
