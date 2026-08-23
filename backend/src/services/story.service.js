const personModel = require('../models/person.model');
const versionModel = require('../models/biographyVersion.model');
const flagModel = require('../models/biographyFlag.model');
const ApiError = require('../utils/ApiError');
const { roleAtLeast } = require('../utils/roles');
const notificationService = require('./notification.service');

async function getPersonOrThrow(personId, familyId) {
  const person = await personModel.findBiographyFields(personId);
  if (!person || person.family_id !== familyId) throw ApiError.notFound('Person not found', 'PERSON_NOT_FOUND');
  return person;
}

// 7.4 - only the original author or an admin+ may edit an existing story;
// anyone member+ may write the FIRST version (claiming authorship)
function assertCanEdit(person, membership, actorId) {
  const isAdmin = roleAtLeast(membership.role, 'admin');
  const isAuthor = person.biography_author_id === actorId;
  const isFirstEver = !person.biography_author_id;

  if (isFirstEver || isAuthor || isAdmin) return;
  throw ApiError.forbidden('Only the original author or a family admin can edit this story', 'INSUFFICIENT_ROLE');
}

// 7.1
async function saveBiography(familyId, personId, membership, actorId, content, aiAssisted = false) {
  const person = await getPersonOrThrow(personId, familyId);
  assertCanEdit(person, membership, actorId);

  if (person.biography && person.biography.trim().length > 0) {
    await versionModel.create({ personId, familyId, content: person.biography, editedBy: person.biography_author_id });
  }

  return personModel.updateById(personId, {
    biography: content,
    biography_author_id: person.biography_author_id || actorId,
    biography_status: 'published',
    biography_updated_at: new Date().toISOString(),
    biography_ai_assisted: aiAssisted,
  });
}
// 7.2
async function getBiography(familyId, personId) {
  const person = await getPersonOrThrow(personId, familyId);
  return {
    biography: person.biography,
    status: person.biography_status,
    authorId: person.biography_author_id,
    updatedAt: person.biography_updated_at,
  };
}

// 7.3
async function getHistory(familyId, personId) {
  await getPersonOrThrow(personId, familyId);
  return versionModel.listByPerson(personId);
}

// 7.3 - restore a past version as the new current content (keeps full trail)
async function restoreVersion(familyId, personId, versionId, membership, actorId) {
  const person = await getPersonOrThrow(personId, familyId);
  assertCanEdit(person, membership, actorId);

  const version = await versionModel.findById(versionId);
  if (!version || version.person_id !== personId) throw ApiError.notFound('Version not found', 'VERSION_NOT_FOUND');

  return saveBiography(familyId, personId, membership, actorId, version.content);
}

// 7.5 - any member can report/flag a story for review
async function flagBiography(familyId, personId, flaggedBy, reason) {
  await getPersonOrThrow(personId, familyId);
  const flag = await flagModel.create({ personId, familyId, flaggedBy, reason });
  await personModel.updateById(personId, { biography_status: 'flagged' });
  return flag;
}

// 7.5 - admin reviews a report: hide the story or dismiss the report
async function resolveFlag(familyId, flagId, resolution, resolvedBy, resolutionNote) {
  const flag = await flagModel.findById(flagId);
  if (!flag || flag.family_id !== familyId) throw ApiError.notFound('Flag not found', 'FLAG_NOT_FOUND');
  if (flag.status !== 'pending') throw ApiError.badRequest('This report has already been resolved', 'FLAG_RESOLVED');

  const status = resolution === 'hide' ? 'resolved_hidden' : 'resolved_dismissed';
  const resolved = await flagModel.resolve(flagId, status, resolvedBy, resolutionNote);

  const person = await personModel.findBiographyFields(flag.person_id);
  await personModel.updateById(flag.person_id, { biography_status: resolution === 'hide' ? 'hidden' : 'published' });

  if (person?.biography_author_id) {
    await notificationService.createNotification(
      person.biography_author_id, familyId, 'moderation',
      resolution === 'hide' ? 'A story was hidden' : 'Report dismissed',
      resolution === 'hide' ? 'A biography you wrote was hidden after a report.' : 'A report against a biography you wrote was dismissed.',
      { familyId, personId: flag.person_id }
    ).catch((err) => console.error('[story.service] notify failed:', err.message));
  }

  return resolved;
}

async function listPendingFlags(familyId) {
  return flagModel.listPendingByFamily(familyId);
}

async function listResolvedFlags(familyId) {
  return flagModel.listResolvedByFamily(familyId);
}

module.exports = { saveBiography, getBiography, getHistory, restoreVersion, flagBiography, resolveFlag, listPendingFlags, listResolvedFlags };