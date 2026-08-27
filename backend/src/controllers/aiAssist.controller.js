const aiAssistService = require('../services/aiAssist.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const generateBiography = catchAsync(async (req, res) => {
  const result = await aiAssistService.generateBiography(req.family.id, req.params.personId, req.user.id);
  new ApiResponse(200, result).send(res);
});

const summarizeMemory = catchAsync(async (req, res) => {
  const result = await aiAssistService.summarizeMemory(req.family.id, req.params.memoryId, req.user.id);
  new ApiResponse(200, result).send(res);
});

module.exports = { generateBiography, summarizeMemory };