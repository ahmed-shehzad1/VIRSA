const familyService = require('../services/family.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const createFamily = catchAsync(async (req, res) => {
  const family = await familyService.createFamily(req.user.id, req.body);
  new ApiResponse(201, { family }, 'Family created successfully').send(res);
});

const listMyFamilies = catchAsync(async (req, res) => {
  const families = await familyService.listMyFamilies(req.user.id);
  new ApiResponse(200, { families }).send(res);
});

const getFamily = catchAsync(async (req, res) => {
  new ApiResponse(200, { family: req.family, myRole: req.membership.role }).send(res);
});

const updateFamily = catchAsync(async (req, res) => {
  const family = await familyService.updateFamily(req.family.id, req.body);
  new ApiResponse(200, { family }, 'Family updated successfully').send(res);
});

const updatePrivacy = catchAsync(async (req, res) => {
  const family = await familyService.updatePrivacy(req.family.id, req.body);
  new ApiResponse(200, { family }, 'Privacy settings updated').send(res);
});

const archiveFamily = catchAsync(async (req, res) => {
  const family = await familyService.archiveFamily(req.family.id);
  new ApiResponse(200, { family }, 'Family archived').send(res);
});

const restoreFamily = catchAsync(async (req, res) => {
  const family = await familyService.restoreFamily(req.family.id);
  new ApiResponse(200, { family }, 'Family restored').send(res);
});

const permanentlyDeleteFamily = catchAsync(async (req, res) => {
  await familyService.permanentlyDeleteFamily(req.family.id);
  new ApiResponse(200, null, 'Family permanently deleted').send(res);
});

const listMembers = catchAsync(async (req, res) => {
  const members = await familyService.listMembers(req.family.id);
  new ApiResponse(200, { members }).send(res);
});

const changeMemberRole = catchAsync(async (req, res) => {
  const member = await familyService.changeMemberRole(req.family.id, req.membership, req.params.userId, req.body.role);
  new ApiResponse(200, { member }, 'Member role updated').send(res);
});

const transferOwnership = catchAsync(async (req, res) => {
  await familyService.transferOwnership(req.family.id, req.user.id, req.params.userId);
  new ApiResponse(200, null, 'Ownership transferred').send(res);
});

const removeMember = catchAsync(async (req, res) => {
  await familyService.removeMember(req.family.id, req.membership, req.params.userId);
  new ApiResponse(200, null, 'Member removed from family').send(res);
});

const leaveFamily = catchAsync(async (req, res) => {
  await familyService.leaveFamily(req.family.id, req.user.id, req.membership.role);
  new ApiResponse(200, null, 'You have left the family').send(res);
});

module.exports = {
  createFamily, listMyFamilies, getFamily, updateFamily, updatePrivacy, archiveFamily,
  restoreFamily, permanentlyDeleteFamily, listMembers, changeMemberRole,
  transferOwnership, removeMember, leaveFamily,
};