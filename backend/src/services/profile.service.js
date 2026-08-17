const personModel = require('../models/person.model');
const mediaModel = require('../models/personMedia.model');
const memoryModel = require('../models/personMemory.model');
const relationshipService = require('./relationship.service');
const storageService = require('./storage.service');
const ApiError = require('../utils/ApiError');
const { canViewFullProfile } = require('../utils/privacy');
const { roleAtLeast } = require('../utils/roles');

async function getPersonOrThrow(personId, familyId) {
  const person = await personModel.findById(personId);
  if (!person || person.family_id !== familyId) throw ApiError.notFound('Person not found', 'PERSON_NOT_FOUND');
  return person;
}

function assertViewable(membership, person) {
  if (!canViewFullProfile(membership, person)) {
    throw ApiError.forbidden('This profile is restricted to family admins', 'PROFILE_RESTRICTED');
  }
}

// 6.4 / 6.8
function buildDates(person) {
  return {
    birthDate: person.birth_date,
    birthPlace: person.birth_place,
    isLiving: person.is_living,
    deceased: !person.is_living,
    deathDate: !person.is_living ? person.death_date : null,
    deathPlace: !person.is_living ? person.death_place : null,
  };
}

// 6.7 - assembled from birth/death + relationship start dates + memories
async function buildTimeline(person, relationships, memories) {
  const events = [];

  if (person.birth_date) {
    events.push({ type: 'birth', date: person.birth_date, label: `Born${person.birth_place ? ` in ${person.birth_place}` : ''}` });
  }
  for (const spouse of relationships.spouses) {
    if (spouse.startDate) {
      events.push({ type: 'marriage', date: spouse.startDate, label: `Married ${spouse.person.first_name}`, personId: spouse.person.id });
    }
    if (spouse.endDate) {
      events.push({ type: 'marriage_end', date: spouse.endDate, label: `Separated from ${spouse.person.first_name}`, personId: spouse.person.id });
    }
  }
  for (const memory of memories) {
    if (memory.memory_date) {
      events.push({ type: 'memory', date: memory.memory_date, label: memory.title, memoryId: memory.id });
    }
  }
  if (!person.is_living && person.death_date) {
    events.push({ type: 'death', date: person.death_date, label: `Passed away${person.death_place ? ` in ${person.death_place}` : ''}` });
  }

  return events
    .filter((e) => e.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// 6.1 - the full aggregated profile in one call
async function getFullProfile(familyId, personId, membership) {
  const person = await getPersonOrThrow(personId, familyId);
  assertViewable(membership, person);

  const includeAdminOnly = roleAtLeast(membership.role, 'admin');

  const [relationships, media, memories] = await Promise.all([
    relationshipService.getPersonRelationships(familyId, personId),
    mediaModel.listByPerson(personId),
    memoryModel.listByPerson(personId, { includeAdminOnly }),
  ]);

  const timeline = await buildTimeline(person, relationships, memories);

  return {
    person: {
      id: person.id,
      firstName: person.first_name,
      middleName: person.middle_name,
      lastName: person.last_name,
      gender: person.gender,
      photoUrl: person.photo_url,
      profileVisibility: person.profile_visibility,
      claimed: !!person.claimed_by_user_id,
    },
    dates: buildDates(person),
    biography: person.biography,
    relationships,
    media,
    memories,
    timeline,
  };
}

// 6.2
async function getBiography(familyId, personId, membership) {
  const person = await getPersonOrThrow(personId, familyId);
  assertViewable(membership, person);
  return { biography: person.biography };
}

// 6.3 (thin wrapper - real logic lives in relationship.service from Milestone 4)
async function getRelationships(familyId, personId, membership) {
  const person = await getPersonOrThrow(personId, familyId);
  assertViewable(membership, person);
  return relationshipService.getPersonRelationships(familyId, personId);
}

// 6.4 / 6.8
async function getDatesInfo(familyId, personId, membership) {
  const person = await getPersonOrThrow(personId, familyId);
  assertViewable(membership, person);
  return buildDates(person);
}

// 6.9 - lets an admin change who can view this person's full profile
async function updateVisibility(familyId, personId, visibility) {
  await getPersonOrThrow(personId, familyId);
  return personModel.updateById(personId, { profile_visibility: visibility });
}

module.exports = { getFullProfile, getBiography, getRelationships, getDatesInfo, updateVisibility, getPersonOrThrow, assertViewable };