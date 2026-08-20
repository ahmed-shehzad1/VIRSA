const eventModel = require('../models/timelineEvent.model');
const personModel = require('../models/person.model');
const { roleAtLeast } = require('../utils/roles');
const ApiError = require('../utils/ApiError');

async function assertPersonInFamily(personId, familyId) {
  const person = await personModel.findById(personId);
  if (!person || person.family_id !== familyId) throw ApiError.notFound('Person not found in this family', 'PERSON_NOT_FOUND');
  return person;
}

// 10.1 / 10.5 / 10.6 / 10.7
async function createEvent(familyId, personId, createdBy, { title, description, category, eventDate, endDate }) {
  await assertPersonInFamily(personId, familyId);

  if (endDate && new Date(endDate) < new Date(eventDate)) {
    throw ApiError.badRequest('endDate cannot be before eventDate', 'INVALID_DATE_RANGE');
  }

  return eventModel.create({
    person_id: personId,
    family_id: familyId,
    title,
    description: description || null,
    category: category || 'other',
    event_date: eventDate,
    end_date: endDate || null,
    created_by: createdBy,
  });
}

// 10.2 / 10.7 / 10.8
async function listForPerson(familyId, personId, order) {
  await assertPersonInFamily(personId, familyId);
  return eventModel.listByPerson(personId, order);
}

async function getEvent(familyId, eventId) {
  const event = await eventModel.findById(eventId);
  if (!event || event.family_id !== familyId) throw ApiError.notFound('Event not found', 'EVENT_NOT_FOUND');
  return event;
}

// 10.3
async function updateEvent(familyId, eventId, actorId, membership, fields) {
  const event = await getEvent(familyId, eventId);

  const isCreator = event.created_by === actorId;
  if (!isCreator && !roleAtLeast(membership.role, 'admin')) {
    throw ApiError.forbidden('Only the creator or a family admin can edit this event', 'INSUFFICIENT_ROLE');
  }

  const updates = {};
  if (fields.title !== undefined) updates.title = fields.title;
  if (fields.description !== undefined) updates.description = fields.description;
  if (fields.category !== undefined) updates.category = fields.category;
  if (fields.eventDate !== undefined) updates.event_date = fields.eventDate;
  if (fields.endDate !== undefined) updates.end_date = fields.endDate;

  const nextEventDate = updates.event_date || event.event_date;
  const nextEndDate = updates.end_date !== undefined ? updates.end_date : event.end_date;
  if (nextEndDate && new Date(nextEndDate) < new Date(nextEventDate)) {
    throw ApiError.badRequest('endDate cannot be before eventDate', 'INVALID_DATE_RANGE');
  }

  if (Object.keys(updates).length === 0) return event;
  return eventModel.updateById(eventId, updates);
}

// 10.4
async function deleteEvent(familyId, eventId, actorId, membership) {
  const event = await getEvent(familyId, eventId);

  const isCreator = event.created_by === actorId;
  if (!isCreator && !roleAtLeast(membership.role, 'admin')) {
    throw ApiError.forbidden('Only the creator or a family admin can delete this event', 'INSUFFICIENT_ROLE');
  }

  await eventModel.deleteById(eventId);
}

module.exports = { createEvent, listForPerson, getEvent, updateEvent, deleteEvent };