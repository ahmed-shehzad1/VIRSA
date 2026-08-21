const moderationService = require('../services/moderation.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const reportContent = catchAsync(async (req, res) => {
  const flag = await moderationService.reportContent(req.family.id, req.body.contentType, req.body.contentId, req.user.id, req.body.reason);
  new ApiResponse(201, { flag }, 'Content reported for review').send(res);
});

const getDashboard = catchAsync(async (req, res) => {
  const dashboard = await moderationService.getDashboard(req.family.id);
  new ApiResponse(200, { dashboard }).send(res);
});

const getHistory = catchAsync(async (req, res) => {
  const history = await moderationService.getHistory(req.family.id);
  new ApiResponse(200, { history }).send(res);
});

const resolveReport = catchAsync(async (req, res) => {
  const flag = await moderationService.resolveReport(req.family.id, req.params.contentType, req.params.flagId, req.body.resolution, req.user.id, req.body.note);
  new ApiResponse(200, { flag }, 'Report resolved').send(res);
});

const removeContent = catchAsync(async (req, res) => {
  const result = await moderationService.removeContent(req.family.id, req.params.contentType, req.params.contentId);
  new ApiResponse(200, { result }, 'Content removed').send(res);
});

const restoreContent = catchAsync(async (req, res) => {
  const result = await moderationService.restoreContent(req.family.id, req.params.contentType, req.params.contentId);
  new ApiResponse(200, { result }, 'Content restored').send(res);
});

module.exports = { reportContent, getDashboard, getHistory, resolveReport, removeContent, restoreContent };