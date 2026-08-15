const relationshipService = require('../services/relationship.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const createParentChild = catchAsync(async (req, res) => {
  const relationship = await relationshipService.createParentChild(req.family.id, req.user.id, req.body);
  new ApiResponse(201, { relationship }, 'Parent/child relationship created').send(res);
});

const createSpouse = catchAsync(async (req, res) => {
  const relationship = await relationshipService.createSpouse(req.family.id, req.user.id, req.body);
  new ApiResponse(201, { relationship }, 'Spouse relationship created').send(res);
});

const createSibling = catchAsync(async (req, res) => {
  const relationship = await relationshipService.createSibling(req.family.id, req.user.id, req.body);
  new ApiResponse(201, { relationship }, 'Sibling relationship created').send(res);
});

const deleteRelationship = catchAsync(async (req, res) => {
  await relationshipService.deleteRelationship(req.family.id, req.params.relationshipId);
  new ApiResponse(200, null, 'Relationship removed').send(res);
});

const getPersonRelationships = catchAsync(async (req, res) => {
  const relationships = await relationshipService.getPersonRelationships(req.family.id, req.params.personId);
  new ApiResponse(200, { relationships }).send(res);
});

const getFamilyRelationships = catchAsync(async (req, res) => {
  const relationships = await relationshipService.getFamilyRelationships(req.family.id);
  new ApiResponse(200, { relationships }).send(res);
});

module.exports = { createParentChild, createSpouse, createSibling, deleteRelationship, getPersonRelationships, getFamilyRelationships };