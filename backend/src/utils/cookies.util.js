const config = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';

function setRefreshCookie(res, rawToken, expiresAt) {
  res.cookie(REFRESH_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    expires: expiresAt,
    path: '/api/auth', // only sent to auth endpoints (refresh/logout)
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
}

module.exports = { REFRESH_COOKIE_NAME, setRefreshCookie, clearRefreshCookie };
