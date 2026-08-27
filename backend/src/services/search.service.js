const personModel = require('../models/person.model');
const memoryModel = require('../models/personMemory.model');
const { roleAtLeast } = require('../utils/roles');

function paginate(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit };
}

// 14.1 / 14.2 / 14.4 / 14.5 / 14.6
async function searchPeople(familyId, query) {
  const { page, limit } = paginate(query);
  const { people, total } = await personModel.findMany(familyId, {
    search: query.q?.trim() || undefined,
    gender: query.gender || undefined,
    isLiving: query.isLiving === 'true' ? true : query.isLiving === 'false' ? false : undefined,
    isArchived: false,
    claimed: undefined,
    page,
    limit,
  });
  return { people, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

// 14.3 / 14.6
async function searchMemories(familyId, membership, query) {
  const { page, limit } = paginate(query);
  const q = (query.q || '').trim();
  if (!q) return { memories: [], pagination: { page, limit, total: 0, totalPages: 0 } };

  const { memories, total } = await memoryModel.searchByFamily(familyId, {
    q,
    includeAdminOnly: roleAtLeast(membership.role, 'admin'),
    includeHidden: roleAtLeast(membership.role, 'admin'),
    page,
    limit,
  });
  return { memories, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

// 14.1 - combined "global search" across both types, capped small since
// it's meant for a quick search-bar preview, not a full results page
async function searchAll(familyId, membership, query) {
  const q = (query.q || '').trim();
  if (!q) return { people: [], memories: [] };

  const [peopleResult, memoriesResult] = await Promise.all([
    searchPeople(familyId, { q, page: 1, limit: 5 }),
    searchMemories(familyId, membership, { q, page: 1, limit: 5 }),
  ]);

  return { people: peopleResult.people, memories: memoriesResult.memories };
}

module.exports = { searchPeople, searchMemories, searchAll };