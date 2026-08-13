const familyModel = require('../models/family.model');
const familyMemberModel = require('../models/familyMember.model');
const ApiError = require('../utils/ApiError');
const { roleOutranks } = require('../utils/roles');

async function createFamily(ownerId, { name, description, isPrivate }) {
  const family = await familyModel.create({ name, description, ownerId, isPrivate });
  await familyMemberModel.add({ familyId: family.id, userId: ownerId, role: 'owner' });
  return family;
}

async function listMyFamilies(userId) {
  return familyModel.findAllForUser(userId);
}

async function updateFamily(familyId, fields) {
  const updates = {};
  if (fields.name !== undefined) updates.name = fields.name;
  if (fields.description !== undefined) updates.description = fields.description;
  if (Object.keys(updates).length === 0) return familyModel.findById(familyId);
  return familyModel.updateById(familyId, updates);
}

async function updatePrivacy(familyId, { isPrivate, allowMemberInvites }) {
  const updates = {};
  if (isPrivate !== undefined) updates.is_private = isPrivate;
  if (allowMemberInvites !== undefined) updates.allow_member_invites = allowMemberInvites;
  if (Object.keys(updates).length === 0) return familyModel.findById(familyId);
  return familyModel.updateById(familyId, updates);
}

async function archiveFamily(familyId) {
  return familyModel.archiveById(familyId);
}

async function restoreFamily(familyId) {
  return familyModel.restoreById(familyId);
}

async function permanentlyDeleteFamily(familyId) {
  await familyModel.deleteById(familyId);
}

async function listMembers(familyId) {
  return familyMemberModel.listByFamily(familyId);
}

async function changeMemberRole(familyId, actingMembership, targetUserId, newRole) {
  if (targetUserId === actingMembership.user_id) {
    throw ApiError.badRequest('Use the transfer-ownership endpoint to change your own role', 'CANNOT_CHANGE_OWN_ROLE');
  }

  const target = await familyMemberModel.findOne(familyId, targetUserId);
  if (!target) throw ApiError.notFound('This user is not a member of this family', 'MEMBER_NOT_FOUND');
  if (target.role === 'owner') {
    throw ApiError.forbidden('The owner role cannot be changed here - use transfer-ownership', 'CANNOT_CHANGE_OWNER');
  }
  if (newRole === 'owner') {
    throw ApiError.forbidden('Use the transfer-ownership endpoint to make someone the owner', 'USE_TRANSFER_OWNERSHIP');
  }
  if (actingMembership.role !== 'owner') {
    if (!roleOutranks(actingMembership.role, target.role)) {
      throw ApiError.forbidden('You cannot change the role of a member at or above your own rank', 'INSUFFICIENT_ROLE');
    }
    if (!roleOutranks(actingMembership.role, newRole)) {
      throw ApiError.forbidden('You cannot assign a role at or above your own rank', 'INSUFFICIENT_ROLE');
    }
  }

  return familyMemberModel.updateRole(familyId, targetUserId, newRole);
}

async function transferOwnership(familyId, currentOwnerId, newOwnerUserId) {
  const target = await familyMemberModel.findOne(familyId, newOwnerUserId);
  if (!target) throw ApiError.notFound('This user is not a member of this family', 'MEMBER_NOT_FOUND');

  await familyMemberModel.updateRole(familyId, newOwnerUserId, 'owner');
  await familyMemberModel.updateRole(familyId, currentOwnerId, 'admin');
  await familyModel.updateById(familyId, { owner_id: newOwnerUserId });
}

async function removeMember(familyId, actingMembership, targetUserId) {
  if (targetUserId === actingMembership.user_id) {
    throw ApiError.badRequest('Use the leave endpoint to remove yourself', 'USE_LEAVE_ENDPOINT');
  }
  const target = await familyMemberModel.findOne(familyId, targetUserId);
  if (!target) throw ApiError.notFound('This user is not a member of this family', 'MEMBER_NOT_FOUND');
  if (target.role === 'owner') throw ApiError.forbidden('The owner cannot be removed', 'CANNOT_REMOVE_OWNER');

  if (actingMembership.role !== 'owner' && !roleOutranks(actingMembership.role, target.role)) {
    throw ApiError.forbidden('You cannot remove a member at or above your own rank', 'INSUFFICIENT_ROLE');
  }

  await familyMemberModel.remove(familyId, targetUserId);
}

async function leaveFamily(familyId, userId, role) {
  if (role === 'owner') {
    throw ApiError.badRequest('Transfer ownership before leaving the family', 'OWNER_MUST_TRANSFER_FIRST');
  }
  await familyMemberModel.remove(familyId, userId);
}

module.exports = {
  createFamily, listMyFamilies, updateFamily, updatePrivacy, archiveFamily,
  restoreFamily, permanentlyDeleteFamily, listMembers, changeMemberRole,
  transferOwnership, removeMember, leaveFamily,
};