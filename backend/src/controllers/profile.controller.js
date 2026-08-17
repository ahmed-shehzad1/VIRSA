const profileService = require('../services/profile.service');
const mediaService = require('../services/media.service');
const memoryService = require('../services/memory.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const getFullProfile = catchAsync(async (req, res) => {
  const profile = await profileService.getFullProfile(req.family.id, req.params.personId, req.membership);
  new ApiResponse(200, { profile }).send(res);
});

const getBiography = catchAsync(async (req, res) => {
  const result = await profileService.getBiography(req.family.id, req.params.personId, req.membership);
  new ApiResponse(200, result).send(res);
});

const getRelationships = catchAsync(async (req, res) => {
  const relationships = await profileService.getRelationships(req.family.id, req.params.personId, req.membership);
  new ApiResponse(200, { relationships }).send(res);
});

const getDatesInfo = catchAsync(async (req, res) => {
  const dates = await profileService.getDatesInfo(req.family.id, req.params.personId, req.membership);
  new ApiResponse(200, { dates }).send(res);
});

const updateVisibility = catchAsync(async (req, res) => {
  const person = await profileService.updateVisibility(req.family.id, req.params.personId, req.body.visibility);
  new ApiResponse(200, { person }, 'Profile visibility updated').send(res);
});

// 6.5 - media
const uploadMedia = catchAsync(async (req, res) => {
  const media = await mediaService.uploadMedia(req.family.id, req.params.personId, req.membership, req.user.id, req.file, req.body);
  new ApiResponse(201, { media }, 'Media uploaded').send(res);
});

const listMedia = catchAsync(async (req, res) => {
  const media = await mediaService.listMedia(req.family.id, req.params.personId, req.membership);
  new ApiResponse(200, { media }).send(res);
});

const deleteMedia = catchAsync(async (req, res) => {
  await mediaService.deleteMedia(req.family.id, req.params.personId, req.params.mediaId);
  new ApiResponse(200, null, 'Media deleted').send(res);
});

// 6.6 - memories
const addMemory = catchAsync(async (req, res) => {
  const memory = await memoryService.addMemory(req.family.id, req.params.personId, req.membership, req.user.id, req.body);
  new ApiResponse(201, { memory }, 'Memory added').send(res);
});

const listMemories = catchAsync(async (req, res) => {
  const memories = await memoryService.listMemories(req.family.id, req.params.personId, req.membership);
  new ApiResponse(200, { memories }).send(res);
});

const updateMemory = catchAsync(async (req, res) => {
  const memory = await memoryService.updateMemory(req.family.id, req.params.personId, req.params.memoryId, req.user.id, req.membership, req.body);
  new ApiResponse(200, { memory }, 'Memory updated').send(res);
});

const deleteMemory = catchAsync(async (req, res) => {
  await memoryService.deleteMemory(req.family.id, req.params.personId, req.params.memoryId, req.user.id, req.membership);
  new ApiResponse(200, null, 'Memory deleted').send(res);
});

const getTimeline = catchAsync(async (req, res) => {
  const profile = await profileService.getFullProfile(req.family.id, req.params.personId, req.membership);
  new ApiResponse(200, { timeline: profile.timeline }).send(res);
});

module.exports = {
  getFullProfile, getBiography, getRelationships, getDatesInfo, updateVisibility,
  uploadMedia, listMedia, deleteMedia, addMemory, listMemories, updateMemory, deleteMemory, getTimeline,
};