const treeService = require('../services/tree.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

function parseIntParam(value) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

const getTree = catchAsync(async (req, res) => {
  const result = await treeService.getTree(req.family.id, {
    rootPersonId: req.query.rootPersonId || undefined,
    depth: parseIntParam(req.query.depth),
    maxNodes: parseIntParam(req.query.maxNodes),
  });
  new ApiResponse(200, result).send(res);
});

const getAncestors = catchAsync(async (req, res) => {
  const result = await treeService.getAncestors(req.family.id, req.params.personId, parseIntParam(req.query.depth));
  new ApiResponse(200, result).send(res);
});

const getDescendants = catchAsync(async (req, res) => {
  const result = await treeService.getDescendants(req.family.id, req.params.personId, parseIntParam(req.query.depth));
  new ApiResponse(200, result).send(res);
});

const getPersonNode = catchAsync(async (req, res) => {
  const node = await treeService.getPersonNode(req.family.id, req.params.personId);
  new ApiResponse(200, { node }).send(res);
});

const getSuggestedRoot = catchAsync(async (req, res) => {
  const node = await treeService.getSuggestedRoot(req.family.id);
  new ApiResponse(200, { node }).send(res);
});

module.exports = { getTree, getAncestors, getDescendants, getPersonNode, getSuggestedRoot };