const personModel = require('../models/person.model');
const claimModel = require('../models/personClaim.model');
const ApiError = require('../utils/ApiError');
const { sanitizePersonForViewer, sanitizePeopleList } = require('../utils/personPrivacy');
const cache = require('../utils/cache');
const ALLOWED_FIELDS = [
  'first_name', 'middle_name', 'last_name', 'gender',
  'birth_date', 'birth_place', 'is_living', 'death_date', 'death_place',
  'biography', 'photo_url',
];

function pickAllowedFields(body) {
  const map = {
    firstName: 'first_name', middleName: 'middle_name', lastName: 'last_name',
    gender: 'gender', birthDate: 'birth_date', birthPlace: 'birth_place',
    isLiving: 'is_living', deathDate: 'death_date', deathPlace: 'death_place',
    biography: 'biography', photoUrl: 'photo_url',
  };
  const fields = {};
  for (const [bodyKey, dbKey] of Object.entries(map)) {
    if (body[bodyKey] !== undefined) fields[dbKey] = body[bodyKey];
  }
  return fields;
}

// 3.1 / 3.5 / 3.6 / 3.7
async function createPerson(familyId, createdByUserId, body) {
  const fields = pickAllowedFields(body);
  if (!fields.first_name) throw ApiError.badRequest('First name is required', 'MISSING_FIRST_NAME');
  if (fields.death_date && fields.is_living === undefined) fields.is_living = false;

  const person = await personModel.create({
    ...fields,
    family_id: familyId,
    created_by: createdByUserId,
  });

  cache.invalidatePrefix(`tree:${familyId}:`);

  return person;
}
async function getPerson(personId, familyId, membership, viewerUserId) {
  const person = await personModel.findById(personId);
  if (!person || person.family_id !== familyId) throw ApiError.notFound('Person not found', 'PERSON_NOT_FOUND');
  return membership ? sanitizePersonForViewer(person, membership, viewerUserId) : person;
}

// 3.3 / 3.5 / 3.6 / 3.7
async function updatePerson(personId, familyId, body) {
  await getPerson(personId, familyId);

  const fields = pickAllowedFields(body);

  if (fields.death_date && body.isLiving === undefined) {
    fields.is_living = false;
  }

  if (Object.keys(fields).length === 0) {
    return getPerson(personId, familyId);
  }

  const person = await personModel.updateById(personId, fields);

  cache.invalidatePrefix(`tree:${familyId}:`);

  return person;
}

// 3.4
async function archivePerson(personId, familyId) {
  await getPerson(personId, familyId);

  const person = await personModel.archiveById(personId);

  cache.invalidatePrefix(`tree:${familyId}:`);

  return person;
}

async function restorePerson(personId, familyId) {
  await getPerson(personId, familyId);
  return personModel.restoreById(personId);
}

async function deletePerson(personId, familyId) {
  await getPerson(personId, familyId);

  await personModel.deleteById(personId);

  cache.invalidatePrefix(`tree:${familyId}:`);
}

// 3.2 / 3.8 / 3.9 / 3.10
async function listPeople(familyId, query, membership, viewerUserId) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));

  let claimed;

  if (query.claimed === 'true') claimed = true;
  if (query.claimed === 'false') claimed = false;

  let isLiving;

  if (query.isLiving === 'true') isLiving = true;
  if (query.isLiving === 'false') isLiving = false;

  const { people, total } = await personModel.findMany(familyId, {
    search: query.q?.trim() || undefined,
    gender: query.gender || undefined,
    isLiving,
    isArchived: query.archived === 'true',
    claimed,
    page,
    limit,
  });

  return {
    people: sanitizePeopleList(people, membership, viewerUserId),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// 3.12 - claim flow
async function requestClaim(personId, familyId, userId) {
  const person = await getPerson(personId, familyId);
  if (person.claimed_by_user_id) throw ApiError.conflict('This person is already linked to an account', 'ALREADY_CLAIMED');

  const existing = await claimModel.findPendingByPersonAndUser(personId, userId);
  if (existing) throw ApiError.conflict('You already have a pending claim for this person', 'CLAIM_PENDING');

  return claimModel.create({ personId, userId });
}

async function listClaims(personId, familyId) {
  await getPerson(personId, familyId);
  return claimModel.listByPerson(personId);
}

async function approveClaim(claimId, personId, familyId, resolvedBy) {
  await getPerson(personId, familyId);
  const claim = await claimModel.findById(claimId);
  if (!claim || claim.person_id !== personId) throw ApiError.notFound('Claim not found', 'CLAIM_NOT_FOUND');
  if (claim.status !== 'pending') throw ApiError.badRequest('This claim has already been resolved', 'CLAIM_RESOLVED');

  await personModel.updateById(personId, { claimed_by_user_id: claim.user_id });
  return claimModel.resolve(claimId, 'approved', resolvedBy);
}

async function rejectClaim(claimId, personId, familyId, resolvedBy) {
  await getPerson(personId, familyId);
  const claim = await claimModel.findById(claimId);
  if (!claim || claim.person_id !== personId) throw ApiError.notFound('Claim not found', 'CLAIM_NOT_FOUND');
  if (claim.status !== 'pending') throw ApiError.badRequest('This claim has already been resolved', 'CLAIM_RESOLVED');

  return claimModel.resolve(claimId, 'rejected', resolvedBy);
}

// direct admin/owner link, no claim request needed
async function linkPersonToUser(personId, familyId, userId) {
  const person = await getPerson(personId, familyId);
  if (person.claimed_by_user_id) throw ApiError.conflict('This person is already linked to an account', 'ALREADY_CLAIMED');
  return personModel.updateById(personId, { claimed_by_user_id: userId });
}

async function unlinkPerson(personId, familyId) {
  await getPerson(personId, familyId);
  return personModel.updateById(personId, { claimed_by_user_id: null });
}

module.exports = {
  createPerson, getPerson, updatePerson, archivePerson, restorePerson, deletePerson,
  listPeople, requestClaim, listClaims, approveClaim, rejectClaim, linkPersonToUser, unlinkPerson,
};