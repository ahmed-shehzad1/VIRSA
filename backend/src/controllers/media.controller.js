const mediaService = require('../services/media.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const uploadMedia = catchAsync(async (req, res) => {
  const media = await mediaService.uploadMedia(req.family.id, req.membership, req.user.id, req.file, req.body);
  new ApiResponse(201, { media }, 'Photo uploaded').send(res);
});

const listForPerson = catchAsync(async (req, res) => {
  const media = await mediaService.listForPerson(req.family.id, req.params.personId);
  new ApiResponse(200, { media }).send(res);
});

const listForMemory = catchAsync(async (req, res) => {
  const media = await mediaService.listForMemory(req.family.id, req.params.memoryId);
  new ApiResponse(200, { media }).send(res);
});

const getMedia = catchAsync(async (req, res) => {
  const media = await mediaService.getMedia(req.family.id, req.params.mediaId);
  new ApiResponse(200, { media }).send(res);
});

const updateMedia = catchAsync(async (req, res) => {
  const media = await mediaService.updateMediaMetadata(req.family.id, req.params.mediaId, req.user.id, req.membership, req.body);
  new ApiResponse(200, { media }, 'Photo updated').send(res);
});

const deleteMedia = catchAsync(async (req, res) => {
  await mediaService.deleteMedia(req.family.id, req.params.mediaId, req.user.id, req.membership);
  new ApiResponse(200, null, 'Photo deleted').send(res);
});

module.exports = { uploadMedia, listForPerson, listForMemory, getMedia, updateMedia, deleteMedia };