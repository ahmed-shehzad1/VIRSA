const jwt = require('jsonwebtoken');
const config = require('../config/env');
const supabase = require('../config/database');
const { generateRawToken, hashToken } = require('../utils/token.util');
const ApiError = require('../utils/ApiError');

/**
 * Short-lived access token. Sent in the JSON response body; the frontend
 * keeps it in memory and sends it as `Authorization: Bearer <token>`.
 */
function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

/**
 * Long-lived refresh token. Issued as an httpOnly cookie. The RAW value
 * is only ever seen by the client; the DB stores just its hash so a DB
 * leak alone can't be used to impersonate sessions.
 */
async function issueRefreshToken(userId, { userAgent, ipAddress } = {}) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + config.jwt.refreshExpiresInMs);

  const { error } = await supabase.from('refresh_tokens').insert({
    user_id: userId,
    token_hash: tokenHash,
    user_agent: userAgent || null,
    ip_address: ipAddress || null,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw ApiError.internal('Failed to create session');

  return { rawToken, expiresAt };
}

/**
 * Validates a raw refresh token against the DB, ensuring it exists,
 * isn't revoked, and hasn't expired. Returns the matching row.
 */
async function verifyRefreshToken(rawToken) {
  if (!rawToken) throw ApiError.unauthorized('Missing refresh token', 'NO_REFRESH_TOKEN');

  const tokenHash = hashToken(rawToken);
  const { data: row, error } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .is('revoked_at', null)
    .maybeSingle();

  if (error) throw ApiError.internal('Failed to verify session');
  if (!row) throw ApiError.unauthorized('Invalid or expired session', 'INVALID_REFRESH_TOKEN');

  if (new Date(row.expires_at).getTime() < Date.now()) {
    throw ApiError.unauthorized('Session expired, please log in again', 'REFRESH_TOKEN_EXPIRED');
  }

  return row;
}

async function revokeRefreshToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  await supabase
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', tokenHash)
    .is('revoked_at', null);
}

/** Revokes every active session for a user (used on password change / "logout all"). */
async function revokeAllRefreshTokens(userId) {
  await supabase
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('revoked_at', null);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  issueRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
};
