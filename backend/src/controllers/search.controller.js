const searchService = require('../services/search.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const searchAll = catchAsync(async (req, res) => {
  const result = await searchService.searchAll(req.family.id, req.membership, req.query);
  new ApiResponse(200, result).send(res);
});

const searchPeople = catchAsync(async (req, res) => {
  const result = await searchService.searchPeople(req.family.id, req.query);
  new ApiResponse(200, result).send(res);
});

const searchMemories = catchAsync(async (req, res) => {
  const result = await searchService.searchMemories(req.family.id, req.membership, req.query);
  new ApiResponse(200, result).send(res);
});

module.exports = { searchAll, searchPeople, searchMemories };