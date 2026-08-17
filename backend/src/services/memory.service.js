const memoryModel = require('../models/personMemory.model');
const profileService = require('./profile.service');
const { roleAtLeast } = require('../utils/roles');
const ApiError = require('../utils/ApiError');

// 6.6
async function addMemory(familyId, personId, membership, authorId, { title, content, memoryDate, visibility }) {
  const person = await profileService.getPersonOrThrow(personId, familyId);
  profileService.assertViewable(membership, person);

  return memoryModel.create({
    person_id: personId,
    family_id: familyId,
    author_id: authorId,
    title,
    content,
    memory_date: memoryDate || null,
    visibility: visibility === 'admins_only' ? 'admins_only' : 'all_members',
  });
}

async function listMemories(familyId, personId, membership) {
  const person = await profileService.getPersonOrThrow(personId, familyId);
  profileService.assertViewable(membership, person);
  return memoryModel.listByPerson(personId, { includeAdminOnly: roleAtLeast(membership.role, 'admin') });
}

async function updateMemory(familyId, personId, memoryId, actorId, membership, fields) {
  await profileService.getPersonOrThrow(personId, familyId);
  const memory = await memoryModel.findById(memoryId);
  if (!memory || memory.person_id !== personId) throw ApiError.notFound('Memory not found', 'MEMORY_NOT_FOUND');

  const isAuthor = memory.author_id === actorId;
  const isAdmin = roleAtLeast(membership.role, 'admin');
  if (!isAuthor && !isAdmin) throw ApiError.forbidden('Only the author or a family admin can edit this memory', 'INSUFFICIENT_ROLE');

  const updates = {};
  if (fields.title !== undefined) updates.title = fields.title;
  if (fields.content !== undefined) updates.content = fields.content;
  if (fields.memoryDate !== undefined) updates.memory_date = fields.memoryDate;
  if (fields.visibility !== undefined) updates.visibility = fields.visibility;

  return memoryModel.updateById(memoryId, updates);
}

async function deleteMemory(familyId, personId, memoryId, actorId, membership) {
  await profileService.getPersonOrThrow(personId, familyId);
  const memory = await memoryModel.findById(memoryId);
  if (!memory || memory.person_id !== personId) throw ApiError.notFound('Memory not found', 'MEMORY_NOT_FOUND');

  const isAuthor = memory.author_id === actorId;
  const isAdmin = roleAtLeast(membership.role, 'admin');
  if (!isAuthor && !isAdmin) throw ApiError.forbidden('Only the author or a family admin can delete this memory', 'INSUFFICIENT_ROLE');

  await memoryModel.deleteById(memoryId);
}

module.exports = { addMemory, listMemories, updateMemory, deleteMemory };