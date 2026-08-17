const storyService = require('../services/story.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const saveBiography = catchAsync(async (req, res) => {
  const person = await storyService.saveBiography(req.family.id, req.params.personId, req.membership, req.user.id, req.body.content);
  new ApiResponse(200, { person }, 'Story saved').send(res);
});

const getBiography = catchAsync(async (req, res) => {
  const result = await storyService.getBiography(req.family.id, req.params.personId);
  new ApiResponse(200, result).send(res);
});

const getHistory = catchAsync(async (req, res) => {
  const versions = await storyService.getHistory(req.family.id, req.params.personId);
  new ApiResponse(200, { versions }).send(res);
});

const restoreVersion = catchAsync(async (req, res) => {
  const person = await storyService.restoreVersion(req.family.id, req.params.personId, req.params.versionId, req.membership, req.user.id);
  new ApiResponse(200, { person }, 'Story restored to previous version').send(res);
});

const flagBiography = catchAsync(async (req, res) => {
  const flag = await storyService.flagBiography(req.family.id, req.params.personId, req.user.id, req.body.reason);
  new ApiResponse(201, { flag }, 'Story reported for review').send(res);
});

const listPendingFlags = catchAsync(async (req, res) => {
  const flags = await storyService.listPendingFlags(req.family.id);
  new ApiResponse(200, { flags }).send(res);
});

const resolveFlag = catchAsync(async (req, res) => {
  const flag = await storyService.resolveFlag(req.family.id, req.params.flagId, req.body.resolution, req.user.id, req.body.note);
  new ApiResponse(200, { flag }, 'Report resolved').send(res);
});

module.exports = { saveBiography, getBiography, getHistory, restoreVersion, flagBiography, listPendingFlags, resolveFlag };