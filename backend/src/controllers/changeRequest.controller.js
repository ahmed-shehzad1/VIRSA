const changeRequestService = require('../services/changeRequest.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const submitChangeRequest = catchAsync(async (req, res) => {
  const changeRequest = await changeRequestService.submitChangeRequest(req.family.id, req.params.personId, req.user.id, req.body);
  new ApiResponse(201, { changeRequest }, 'Change suggestion submitted for review').send(res);
});

const listPending = catchAsync(async (req, res) => {
  const changeRequests = await changeRequestService.listPending(req.family.id);
  new ApiResponse(200, { changeRequests }).send(res);
});

const listForPerson = catchAsync(async (req, res) => {
  const changeRequests = await changeRequestService.listForPerson(req.family.id, req.params.personId);
  new ApiResponse(200, { changeRequests }).send(res);
});

const listFamilyHistory = catchAsync(async (req, res) => {
  const result = await changeRequestService.listFamilyHistory(req.family.id, req.query);
  new ApiResponse(200, result).send(res);
});

const approveChangeRequest = catchAsync(async (req, res) => {
  const changeRequest = await changeRequestService.approveChangeRequest(req.family.id, req.params.changeRequestId, req.user.id, req.body);
  new ApiResponse(200, { changeRequest }, 'Change approved and applied').send(res);
});

const rejectChangeRequest = catchAsync(async (req, res) => {
  const changeRequest = await changeRequestService.rejectChangeRequest(req.family.id, req.params.changeRequestId, req.user.id, req.body);
  new ApiResponse(200, { changeRequest }, 'Change rejected').send(res);
});

module.exports = { submitChangeRequest, listPending, listForPerson, listFamilyHistory, approveChangeRequest, rejectChangeRequest };