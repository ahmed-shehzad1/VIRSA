const rateLimit = require('express-rate-limit');

const jsonRateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later.',
    data: null,
  });
};

// Tight limit on login to slow down brute-force / credential stuffing.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

// Registration abuse / bot signups.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

// Forgot-password / resend-verification - prevent email bombing.
const emailActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

// General-purpose limiter for the rest of the API.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

module.exports = { loginLimiter, registerLimiter, emailActionLimiter, generalLimiter };
