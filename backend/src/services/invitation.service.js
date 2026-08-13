const config = require('../config/env');
const familyMemberModel = require('../models/familyMember.model');
const invitationModel = require('../models/familyInvitation.model');
const userModel = require('../models/user.model');
const emailService = require('./email.service');
const { generateRawToken, hashToken } = require('../utils/token.util');
const { roleOutranks } = require('../utils/roles');
const ApiError = require('../utils/ApiError');

async function inviteMember(familyId, family, inviterMembership, { email, role }) {
  if (role === 'owner') throw ApiError.badRequest('Cannot invite someone directly as owner', 'INVALID_ROLE');

  if (inviterMembership.role === 'member' && !family.allow_member_invites) {
    throw ApiError.forbidden('Members are not allowed to send invitations for this family', 'MEMBER_INVITES_DISABLED');
  }
  if (inviterMembership.role !== 'owner' && !roleOutranks(inviterMembership.role, role)) {
    throw ApiError.forbidden('You cannot invite someone at or above your own rank', 'INSUFFICIENT_ROLE');
  }

  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    const alreadyMember = await familyMemberModel.findOne(familyId, existingUser.id);
    if (alreadyMember) throw ApiError.conflict('This person is already a member of the family', 'ALREADY_MEMBER');
  }

  const existingInvite = await invitationModel.findActivePendingForFamilyEmail(familyId, email);
  if (existingInvite) throw ApiError.conflict('An invitation is already pending for this email', 'INVITE_PENDING');

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + config.tokens.familyInviteExpiresInMin * 60 * 1000).toISOString();

  const invitation = await invitationModel.create({
    familyId, email, role, tokenHash, invitedBy: inviterMembership.user_id, expiresAt,
  });

  await emailService.sendFamilyInvitationEmail(email, rawToken, family.name);
  return invitation;
}

async function listPendingInvitations(familyId) {
  return invitationModel.findPendingByFamily(familyId);
}

async function listMyInvitations(userEmail) {
  return invitationModel.findPendingByEmail(userEmail);
}

async function getInviteByToken(rawToken) {
  const invitation = await invitationModel.findByTokenHash(hashToken(rawToken));
  if (!invitation) throw ApiError.notFound('Invitation not found', 'INVITE_NOT_FOUND');
  if (invitation.status !== 'pending') {
    throw ApiError.badRequest('This invitation has already been responded to', 'INVITE_ALREADY_RESOLVED');
  }
  if (new Date(invitation.expires_at) < new Date()) {
    throw ApiError.badRequest('This invitation has expired', 'INVITE_EXPIRED');
  }
  return invitation;
}

async function acceptInvitation(rawToken, currentUser) {
  const invitation = await getInviteByToken(rawToken);
  if (invitation.email.toLowerCase() !== currentUser.email.toLowerCase()) {
    throw ApiError.forbidden('This invitation was sent to a different email address', 'EMAIL_MISMATCH');
  }

  const alreadyMember = await familyMemberModel.findOne(invitation.family_id, currentUser.id);
  if (alreadyMember) {
    await invitationModel.updateStatus(invitation.id, 'accepted');
    throw ApiError.conflict('You are already a member of this family', 'ALREADY_MEMBER');
  }

  await familyMemberModel.add({
    familyId: invitation.family_id, userId: currentUser.id, role: invitation.role, invitedBy: invitation.invited_by,
  });
  await invitationModel.updateStatus(invitation.id, 'accepted');
  return invitation.family_id;
}

async function rejectInvitation(rawToken, currentUser) {
  const invitation = await getInviteByToken(rawToken);
  if (invitation.email.toLowerCase() !== currentUser.email.toLowerCase()) {
    throw ApiError.forbidden('This invitation was sent to a different email address', 'EMAIL_MISMATCH');
  }
  await invitationModel.updateStatus(invitation.id, 'rejected');
}

async function revokeInvitation(familyId, invitationId) {
  const invitation = await invitationModel.findById(invitationId);
  if (!invitation || invitation.family_id !== familyId) throw ApiError.notFound('Invitation not found', 'INVITE_NOT_FOUND');
  if (invitation.status !== 'pending') throw ApiError.badRequest('Only pending invitations can be revoked', 'INVITE_NOT_PENDING');
  await invitationModel.updateStatus(invitationId, 'revoked');
}

module.exports = { inviteMember, listPendingInvitations, listMyInvitations, acceptInvitation, rejectInvitation, revokeInvitation };