const memoryModel = require('../models/personMemory.model');
const flagModel = require('../models/memoryFlag.model');
const personModel = require('../models/person.model');
const { roleAtLeast } = require('../utils/roles');
const ApiError = require('../utils/ApiError');

async function assertPeopleInFamily(familyId, personId, taggedPersonIds = []) {
  const idsToCheck = [personId, ...taggedPersonIds].filter(Boolean);
  for (const id of idsToCheck) {
    const person = await personModel.findById(id);
    if (!person || person.family_id !== familyId) {
      throw ApiError.badRequest('One or more tagged people do not belong to this family', 'PERSON_NOT_FOUND');
    }
  }
}

// 8.1 / 8.5 / 8.7 / 8.8 / 8.9
// The guide treats memories as personal recollection, not fact — so unlike
// the Life Stories module (Milestone 7), there is no "one canonical version"
// or edit-history requirement here: memories are personal, attributed posts.
async function createMemory(familyId, membership, authorId, { personId, taggedPersonIds, title, content, memoryDate, visibility }) {
  await assertPeopleInFamily(familyId, personId, taggedPersonIds);

  return memoryModel.create({
    family_id: familyId,
    person_id: personId || null,
    tagged_person_ids: taggedPersonIds || [],
    author_id: authorId,
    title,
    content,
    memory_date: memoryDate || null,
    visibility: visibility === 'admins_only' ? 'admins_only' : 'all_members',
  });
}

// 8.2 / 8.8
async function listForPerson(familyId, personId, membership) {
  const person = await personModel.findById(personId);
  if (!person || person.family_id !== familyId) throw ApiError.notFound('Person not found', 'PERSON_NOT_FOUND');

  return memoryModel.listByPerson(personId, {
    includeAdminOnly: roleAtLeast(membership.role, 'admin'),
    includeHidden: roleAtLeast(membership.role, 'admin'),
  });
}

// 8.2 / 8.9
async function listForFamily(familyId, membership, query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));

  const { memories, total } = await memoryModel.listByFamily(familyId, {
    includeAdminOnly: roleAtLeast(membership.role, 'admin'),
    includeHidden: roleAtLeast(membership.role, 'admin'),
    page,
    limit,
  });

  return { memories, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getMemory(familyId, memoryId, membership) {
  const memory = await memoryModel.findById(memoryId);
  if (!memory || memory.family_id !== familyId) throw ApiError.notFound('Memory not found', 'MEMORY_NOT_FOUND');

  if (memory.visibility === 'admins_only' && !roleAtLeast(membership.role, 'admin')) {
    throw ApiError.forbidden('This memory is restricted to family admins', 'MEMORY_RESTRICTED');
  }
  if (memory.moderation_status === 'hidden' && !roleAtLeast(membership.role, 'admin')) {
    throw ApiError.notFound('Memory not found', 'MEMORY_NOT_FOUND'); // hidden memories are invisible to non-admins
  }
  return memory;
}

function assertCanModify(memory, actorId, membership) {
  const isAuthor = memory.author_id === actorId;
  const isAdmin = roleAtLeast(membership.role, 'admin');
  if (!isAuthor && !isAdmin) {
    throw ApiError.forbidden('Only the original author or a family admin can modify this memory', 'INSUFFICIENT_ROLE');
  }
}

// 8.3
async function updateMemory(familyId, memoryId, actorId, membership, fields) {
  const memory = await getMemory(familyId, memoryId, membership);
  assertCanModify(memory, actorId, membership);

  if (fields.taggedPersonIds || fields.personId !== undefined) {
    await assertPeopleInFamily(familyId, fields.personId, fields.taggedPersonIds);
  }

  const updates = {};
  if (fields.title !== undefined) updates.title = fields.title;
  if (fields.content !== undefined) updates.content = fields.content;
  if (fields.memoryDate !== undefined) updates.memory_date = fields.memoryDate;
  if (fields.visibility !== undefined) updates.visibility = fields.visibility;
  if (fields.personId !== undefined) updates.person_id = fields.personId || null;
  if (fields.taggedPersonIds !== undefined) updates.tagged_person_ids = fields.taggedPersonIds;

  return memoryModel.updateById(memoryId, updates);
}

// 8.4
async function deleteMemory(familyId, memoryId, actorId, membership) {
  const memory = await getMemory(familyId, memoryId, membership);
  assertCanModify(memory, actorId, membership);
  await memoryModel.deleteById(memoryId);
}

// 8.6 - moderation: any member can flag; admin resolves
async function flagMemory(familyId, memoryId, flaggedBy, reason) {
  const memory = await memoryModel.findById(memoryId);
  if (!memory || memory.family_id !== familyId) throw ApiError.notFound('Memory not found', 'MEMORY_NOT_FOUND');

  const flag = await flagModel.create({ memoryId, familyId, flaggedBy, reason });
  await memoryModel.updateById(memoryId, { moderation_status: 'flagged' });
  return flag;
}

async function resolveFlag(familyId, flagId, resolution, resolvedBy, resolutionNote) {
  const flag = await flagModel.findById(flagId);
  if (!flag || flag.family_id !== familyId) throw ApiError.notFound('Flag not found', 'FLAG_NOT_FOUND');
  if (flag.status !== 'pending') throw ApiError.badRequest('This report has already been resolved', 'FLAG_RESOLVED');

  const status = resolution === 'hide' ? 'resolved_hidden' : 'resolved_dismissed';
  const resolved = await flagModel.resolve(flagId, status, resolvedBy, resolutionNote);

  await memoryModel.updateById(flag.memory_id, {
    moderation_status: resolution === 'hide' ? 'hidden' : 'visible',
  });

  return resolved;
}

async function listPendingFlags(familyId) {
  return flagModel.listPendingByFamily(familyId);
}

module.exports = {
  createMemory, listForPerson, listForFamily, getMemory, updateMemory, deleteMemory,
  flagMemory, resolveFlag, listPendingFlags,
};