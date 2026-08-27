const memoryService = require('../services/memory.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const createFamilyMemory = catchAsync(async (req, res) => {
  const memory = await memoryService.createMemory(req.family.id, req.membership, req.user.id, req.body);
  new ApiResponse(201, { memory }, 'Memory added').send(res);
});

const listFamilyMemories = catchAsync(async (req, res) => {
  const result = await memoryService.listForFamily(req.family.id, req.membership, req.query);
  new ApiResponse(200, result).send(res);
});

const getMemory = catchAsync(async (req, res) => {
  const memory = await memoryService.getMemory(req.family.id, req.params.memoryId, req.membership);
  new ApiResponse(200, { memory }).send(res);
});

const flagMemory = catchAsync(async (req, res) => {
  const flag = await memoryService.flagMemory(req.family.id, req.params.memoryId, req.user.id, req.body.reason);
  new ApiResponse(201, { flag }, 'Memory reported for review').send(res);
});

const listPendingFlags = catchAsync(async (req, res) => {
  const flags = await memoryService.listPendingFlags(req.family.id);
  new ApiResponse(200, { flags }).send(res);
});

const resolveFlag = catchAsync(async (req, res) => {
  const flag = await memoryService.resolveFlag(req.family.id, req.params.flagId, req.body.resolution, req.user.id, req.body.note);
  new ApiResponse(200, { flag }, 'Report resolved').send(res);
});

module.exports = { createFamilyMemory, listFamilyMemories, getMemory, flagMemory, listPendingFlags, resolveFlag };