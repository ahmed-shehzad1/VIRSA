const timelineEventService = require('../services/timelineEvent.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const createEvent = catchAsync(async (req, res) => {
  const event = await timelineEventService.createEvent(req.family.id, req.params.personId, req.user.id, req.body);
  new ApiResponse(201, { event }, 'Timeline event added').send(res);
});

const listEvents = catchAsync(async (req, res) => {
  const events = await timelineEventService.listForPerson(req.family.id, req.params.personId, req.query.order);
  new ApiResponse(200, { events }).send(res);
});

const getEvent = catchAsync(async (req, res) => {
  const event = await timelineEventService.getEvent(req.family.id, req.params.eventId);
  new ApiResponse(200, { event }).send(res);
});

const updateEvent = catchAsync(async (req, res) => {
  const event = await timelineEventService.updateEvent(req.family.id, req.params.eventId, req.user.id, req.membership, req.body);
  new ApiResponse(200, { event }, 'Timeline event updated').send(res);
});

const deleteEvent = catchAsync(async (req, res) => {
  await timelineEventService.deleteEvent(req.family.id, req.params.eventId, req.user.id, req.membership);
  new ApiResponse(200, null, 'Timeline event deleted').send(res);
});

module.exports = { createEvent, listEvents, getEvent, updateEvent, deleteEvent };