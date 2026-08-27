const changeRequestModel = require('../models/changeRequest.model');
const personModel = require('../models/person.model');
const familyMemberModel = require('../models/familyMember.model');
const notificationService = require('./notification.service');
const ApiError = require('../utils/ApiError');

// same field set as person.service's editable fields
const FIELD_MAP = {
  firstName: 'first_name', middleName: 'middle_name', lastName: 'last_name',
  gender: 'gender', birthDate: 'birth_date', birthPlace: 'birth_place',
  isLiving: 'is_living', deathDate: 'death_date', deathPlace: 'death_place',
  biography: 'biography', photoUrl: 'photo_url',
};

function toDbColumn(fieldName) {
  const column = FIELD_MAP[fieldName];
  if (!column) throw ApiError.badRequest(`"${fieldName}" is not an editable field`, 'INVALID_FIELD');
  return column;
}

function stringifyValue(value) {
  return value === null || value === undefined ? null : String(value);
}

async function notifyFamilyAdmins(familyId, excludeUserId, notification) {
  try {
    const members = await familyMemberModel.listByFamily(familyId);
    const admins = members.filter((m) => (m.role === 'admin' || m.role === 'owner') && m.user_id !== excludeUserId);
    await Promise.all(admins.map((m) =>
      notificationService.createNotification(m.user_id, familyId, notification.type, notification.title, notification.body, notification.data)
    ));
  } catch (err) {
    console.error('[changeRequest.service] Failed to notify admins:', err.message);
  }
}

// 11.1 / 11.2
async function submitChangeRequest(familyId, personId, submittedBy, { fieldName, proposedValue, reason }) {
  const column = toDbColumn(fieldName);
  const person = await personModel.findById(personId);
  if (!person || person.family_id !== familyId) throw ApiError.notFound('Person not found in this family', 'PERSON_NOT_FOUND');

  const currentValue = stringifyValue(person[column]);

  const changeRequest = await changeRequestModel.create({
    family_id: familyId,
    person_id: personId,
    field_name: fieldName,
    current_value: currentValue,
    proposed_value: stringifyValue(proposedValue),
    reason: reason || null,
    submitted_by: submittedBy,
  });

  await notifyFamilyAdmins(familyId, submittedBy, {
    type: 'change_request',
    title: 'New change suggestion',
    body: `A change was suggested for ${person.first_name}'s ${fieldName}`,
    data: { familyId, personId, changeRequestId: changeRequest.id },
  });

  return changeRequest;
}

// 11.3
async function listPending(familyId) {
  return changeRequestModel.listPendingByFamily(familyId);
}

// 11.6
async function listForPerson(familyId, personId) {
  const person = await personModel.findById(personId);
  if (!person || person.family_id !== familyId) throw ApiError.notFound('Person not found', 'PERSON_NOT_FOUND');
  return changeRequestModel.listByPerson(personId);
}

async function listFamilyHistory(familyId, query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  const { history, total } = await changeRequestModel.listByFamilyHistory(familyId, { page, limit });
  return { history, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getChangeRequestOrThrow(familyId, changeRequestId) {
  const cr = await changeRequestModel.findById(changeRequestId);
  if (!cr || cr.family_id !== familyId) throw ApiError.notFound('Change request not found', 'CHANGE_REQUEST_NOT_FOUND');
  return cr;
}

// 11.4 / 11.7 / 11.9
async function approveChangeRequest(familyId, changeRequestId, reviewerId, { note, forceApply }) {
  const cr = await getChangeRequestOrThrow(familyId, changeRequestId);
  if (cr.status !== 'pending') throw ApiError.badRequest('This change request has already been reviewed', 'ALREADY_REVIEWED');

  const person = await personModel.findById(cr.person_id);
  const column = toDbColumn(cr.field_name);
  const liveValue = stringifyValue(person[column]);

  // 11.9 - the field changed since this request was submitted
  const hasConflict = liveValue !== cr.current_value;
  if (hasConflict && !forceApply) {
    throw ApiError.conflict(
      `The current value of "${cr.field_name}" has changed since this request was submitted. Review before approving, or resubmit with forceApply.`,
      'CHANGE_REQUEST_CONFLICT'
    );
  }

  await personModel.updateById(cr.person_id, { [column]: cr.proposed_value });

  const updated = await changeRequestModel.updateById(changeRequestId, {
    status: 'approved',
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(),
    review_note: note || null,
    conflict_detected: hasConflict,
  });

  await notificationService.createNotification(
    cr.submitted_by, familyId, 'change_request', 'Your suggestion was approved',
    `Your suggested change to ${cr.field_name} was approved`,
    { familyId, personId: cr.person_id, changeRequestId }
  ).catch((err) => console.error('[changeRequest.service] notify failed:', err.message));

  return updated;
}

// 11.5 / 11.7
async function rejectChangeRequest(familyId, changeRequestId, reviewerId, { note }) {
  const cr = await getChangeRequestOrThrow(familyId, changeRequestId);
  if (cr.status !== 'pending') throw ApiError.badRequest('This change request has already been reviewed', 'ALREADY_REVIEWED');

  const updated = await changeRequestModel.updateById(changeRequestId, {
    status: 'rejected',
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(),
    review_note: note || null,
  });

  await notificationService.createNotification(
    cr.submitted_by, familyId, 'change_request', 'Your suggestion was declined',
    `Your suggested change to ${cr.field_name} was declined${note ? `: ${note}` : ''}`,
    { familyId, personId: cr.person_id, changeRequestId }
  ).catch((err) => console.error('[changeRequest.service] notify failed:', err.message));

  return updated;
}

module.exports = { submitChangeRequest, listPending, listForPerson, listFamilyHistory, approveChangeRequest, rejectChangeRequest };