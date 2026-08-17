const invitationService = require('../services/invitation.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const inviteMember = catchAsync(async (req, res) => {
  const invitation = await invitationService.inviteMember(req.family.id, req.family, req.membership, req.body);
  new ApiResponse(201, { invitation }, 'Invitation sent').send(res);
});

const listFamilyInvitations = catchAsync(async (req, res) => {
  const invitations = await invitationService.listPendingInvitations(req.family.id);
  new ApiResponse(200, { invitations }).send(res);
});

const revokeInvitation = catchAsync(async (req, res) => {
  await invitationService.revokeInvitation(req.family.id, req.params.invitationId);
  new ApiResponse(200, null, 'Invitation revoked').send(res);
});

const listMyInvitations = catchAsync(async (req, res) => {
  const invitations = await invitationService.listMyInvitations(req.user.email);
  new ApiResponse(200, { invitations }).send(res);
});

const acceptInvitation = catchAsync(async (req, res) => {
  const familyId = await invitationService.acceptInvitation(req.params.token, req.user);
  new ApiResponse(200, { familyId }, 'Invitation accepted').send(res);
});

const rejectInvitation = catchAsync(async (req, res) => {
  await invitationService.rejectInvitation(req.params.token, req.user);
  new ApiResponse(200, null, 'Invitation declined').send(res);
});

module.exports = { inviteMember, listFamilyInvitations, revokeInvitation, listMyInvitations, acceptInvitation, rejectInvitation };