const crypto = require('crypto');

/**
 * Generates a random URL-safe token. The RAW token is sent to the user
 * (email link, refresh cookie); only its SHA-256 HASH is stored in the
 * database. This way a leaked database never leaks usable tokens.
 */
function generateRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

module.exports = { generateRawToken, hashToken };
