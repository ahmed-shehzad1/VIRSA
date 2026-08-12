const jwt = require('jsonwebtoken');
const { verifyAccessToken } = require('../services/token.service');
const userModel = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/**
 * Requires a valid access token. Populates req.user with the current
 * user's public fields. Use on any protected route.
 */
const requireAuth = catchAsync(async (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required', 'NO_TOKEN');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Access token expired', 'TOKEN_EXPIRED');
    }
    throw ApiError.unauthorized('Invalid access token', 'INVALID_TOKEN');
  }

  const user = await userModel.findPublicById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists', 'USER_NOT_FOUND');
  if (!user.is_active) throw ApiError.forbidden('This account has been deactivated', 'ACCOUNT_INACTIVE');

  req.user = user;
  next();
});

/**
 * Optional auth: attaches req.user if a valid token is present, but
 * doesn't fail the request if it's missing/invalid. Useful for routes
 * that behave differently for logged-in vs anonymous users.
 */
const attachUserIfPresent = catchAsync(async (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await userModel.findPublicById(payload.sub);
    if (user && user.is_active) req.user = user;
  } catch (err) {
    // silently ignore - this middleware never blocks the request
  }
  next();
});

module.exports = { requireAuth, attachUserIfPresent };
