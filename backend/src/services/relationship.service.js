const relationshipModel = require('../models/relationship.model');
const personModel = require('../models/person.model');
const ApiError = require('../utils/ApiError');
const cache = require('../utils/cache');
// ---- shared helpers -------------------------------------------------

async function assertPersonInFamily(personId, familyId, label = 'Person') {
  const person = await personModel.findById(personId);
  if (!person || person.family_id !== familyId) {
    throw ApiError.notFound(`${label} not found in this family`, 'PERSON_NOT_FOUND');
  }
  return person;
}

// 4.6 - exact duplicate + 4.7 - conflicting relationship type between same pair
async function assertNoExistingRelationship(familyId, personAId, personBId) {
  const existing = await relationshipModel.findBetween(familyId, personAId, personBId);
  if (existing.length > 0) {
    throw ApiError.conflict(
      `These two people already have a "${existing[0].type}" relationship. Remove it first if you want to change the relationship type.`,
      'RELATIONSHIP_ALREADY_EXISTS'
    );
  }
}

// 4.7 - cycle prevention: walks up the parent chain from `personId`
// looking for `ancestorCandidateId`. Bounded depth guards against bad data loops.
async function isAncestor(ancestorCandidateId, personId, maxDepth = 100) {
  let frontier = [personId];
  const visited = new Set();

  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth++) {
    const nextFrontier = [];
    for (const currentId of frontier) {
      const parents = await relationshipModel.findParentsOf(currentId);
      for (const parentId of parents) {
        if (parentId === ancestorCandidateId) return true;
        if (!visited.has(parentId)) {
          visited.add(parentId);
          nextFrontier.push(parentId);
        }
      }
    }
    frontier = nextFrontier;
  }
  return false;
}

// ---- 4.2 - parent/child ----------------------------------------------

async function createParentChild(familyId, actorId, { parentId, childId }) {
  if (parentId === childId) {
    throw ApiError.badRequest('A person cannot be their own parent', 'INVALID_RELATIONSHIP');
  }

  await assertPersonInFamily(parentId, familyId, 'Parent');
  await assertPersonInFamily(childId, familyId, 'Child');
  await assertNoExistingRelationship(familyId, parentId, childId);

  const wouldCycle = await isAncestor(childId, parentId);
  if (wouldCycle) {
    throw ApiError.badRequest(
      'This would create a circular ancestry (the child is already an ancestor of the parent)',
      'RELATIONSHIP_CYCLE'
    );
  }

  const relationship = await relationshipModel.create({
    family_id: familyId,
    type: 'parent',
    person_a_id: parentId,
    person_b_id: childId,
    created_by: actorId,
  });

  cache.invalidatePrefix(`tree:${familyId}:`);

  return relationship;
}

// ---- 4.3 - spouse -------------------------------------------------

async function createSpouse(familyId, actorId, { personAId, personBId, status, startDate, endDate }) {
  if (personAId === personBId) {
    throw ApiError.badRequest('A person cannot be their own spouse', 'INVALID_RELATIONSHIP');
  }

  await assertPersonInFamily(personAId, familyId);
  await assertPersonInFamily(personBId, familyId);
  await assertNoExistingRelationship(familyId, personAId, personBId);

  const relationship = await relationshipModel.create({
    family_id: familyId,
    type: 'spouse',
    person_a_id: personAId,
    person_b_id: personBId,
    status: status || 'married',
    start_date: startDate || null,
    end_date: endDate || null,
    created_by: actorId,
  });

  cache.invalidatePrefix(`tree:${familyId}:`);

  return relationship;
}

// ---- 4.4 - sibling --------------------------------------------------
async function createSibling(familyId, actorId, { personAId, personBId, siblingType }) {
  if (personAId === personBId) {
    throw ApiError.badRequest('A person cannot be their own sibling', 'INVALID_RELATIONSHIP');
  }

  await assertPersonInFamily(personAId, familyId);
  await assertPersonInFamily(personBId, familyId);
  await assertNoExistingRelationship(familyId, personAId, personBId);

  const relationship = await relationshipModel.create({
    family_id: familyId,
    type: 'sibling',
    person_a_id: personAId,
    person_b_id: personBId,
    sibling_type: siblingType || 'full',
    created_by: actorId,
  });

  cache.invalidatePrefix(`tree:${familyId}:`);

  return relationship;
}
// ---- 4.8 - deletion -----------------------------------------------

async function deleteRelationship(familyId, relationshipId) {
  const relationship = await relationshipModel.findById(relationshipId);

  if (!relationship || relationship.family_id !== familyId) {
    throw ApiError.notFound('Relationship not found', 'RELATIONSHIP_NOT_FOUND');
  }

  await relationshipModel.deleteById(relationshipId);

  cache.invalidatePrefix(`tree:${familyId}:`);
}

// ---- 4.9 - retrieval ------------------------------------------------

async function getPersonRelationships(familyId, personId) {
  await assertPersonInFamily(personId, familyId);

  const raw = await relationshipModel.findAllForPerson(personId);
  const otherIds = [...new Set(raw.map((r) => (r.person_a_id === personId ? r.person_b_id : r.person_a_id)))];

  const people = otherIds.length ? await Promise.all(otherIds.map((id) => personModel.findById(id))) : [];
  const peopleById = Object.fromEntries(people.filter(Boolean).map((p) => [p.id, p]));

  const result = { parents: [], children: [], spouses: [], siblings: [] };

  for (const r of raw) {
    const otherId = r.person_a_id === personId ? r.person_b_id : r.person_a_id;
    const other = peopleById[otherId];
    if (!other) continue;

    if (r.type === 'parent' && r.person_b_id === personId) {
      result.parents.push({ relationshipId: r.id, person: other });
    } else if (r.type === 'parent' && r.person_a_id === personId) {
      result.children.push({ relationshipId: r.id, person: other });
    } else if (r.type === 'spouse') {
      result.spouses.push({ relationshipId: r.id, person: other, status: r.status, startDate: r.start_date, endDate: r.end_date });
    } else if (r.type === 'sibling') {
      result.siblings.push({ relationshipId: r.id, person: other, siblingType: r.sibling_type });
    }
  }

  return result;
}

async function getFamilyRelationships(familyId) {
  return relationshipModel.findAllForFamily(familyId);
}

module.exports = {
  createParentChild, createSpouse, createSibling, deleteRelationship,
  getPersonRelationships, getFamilyRelationships,
};