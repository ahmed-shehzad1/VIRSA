const config = require('../config/env');
const aiUsageLogModel = require('../models/aiUsageLog.model');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// 15.6 - persistent, per-user daily quota (survives server restarts,
// unlike an in-memory rate limiter)
const checkAiQuota = catchAsync(async (req, res, next) => {
  const used = await aiUsageLogModel.countLast24h(req.user.id);
  if (used >= config.ai.dailyLimitPerUser) {
    throw ApiError.tooManyRequests(
      `You've reached your daily AI generation limit (${config.ai.dailyLimitPerUser}). Try again tomorrow.`,
      'AI_QUOTA_EXCEEDED'
    );
  }
  next();
});

module.exports = { checkAiQuota };