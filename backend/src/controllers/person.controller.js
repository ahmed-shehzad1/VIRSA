const personService = require('../services/person.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const createPerson = catchAsync(async (req, res) => {
  const person = await personService.createPerson(req.family.id, req.user.id, req.body);
  new ApiResponse(201, { person }, 'Person created successfully').send(res);
});

const listPeople = catchAsync(async (req, res) => {
  const { people, pagination } = await personService.listPeople(req.family.id, req.query, req.membership, req.user.id);
  new ApiResponse(200, { people, pagination }).send(res);
});

const getPerson = catchAsync(async (req, res) => {
  const person = await personService.getPerson(req.params.personId, req.family.id, req.membership, req.user.id);
  new ApiResponse(200, { person }).send(res);
});

const updatePerson = catchAsync(async (req, res) => {
  const person = await personService.updatePerson(req.params.personId, req.family.id, req.body);
  new ApiResponse(200, { person }, 'Person updated successfully').send(res);
});

const archivePerson = catchAsync(async (req, res) => {
  const person = await personService.archivePerson(req.params.personId, req.family.id);
  new ApiResponse(200, { person }, 'Person archived').send(res);
});

const restorePerson = catchAsync(async (req, res) => {
  const person = await personService.restorePerson(req.params.personId, req.family.id);
  new ApiResponse(200, { person }, 'Person restored').send(res);
});

const deletePerson = catchAsync(async (req, res) => {
  await personService.deletePerson(req.params.personId, req.family.id);
  new ApiResponse(200, null, 'Person permanently deleted').send(res);
});

const requestClaim = catchAsync(async (req, res) => {
  const claim = await personService.requestClaim(req.params.personId, req.family.id, req.user.id);
  new ApiResponse(201, { claim }, 'Claim request submitted for review').send(res);
});

const listClaims = catchAsync(async (req, res) => {
  const claims = await personService.listClaims(req.params.personId, req.family.id);
  new ApiResponse(200, { claims }).send(res);
});

const approveClaim = catchAsync(async (req, res) => {
  const claim = await personService.approveClaim(req.params.claimId, req.params.personId, req.family.id, req.user.id);
  new ApiResponse(200, { claim }, 'Claim approved - person linked to account').send(res);
});

const rejectClaim = catchAsync(async (req, res) => {
  const claim = await personService.rejectClaim(req.params.claimId, req.params.personId, req.family.id, req.user.id);
  new ApiResponse(200, { claim }, 'Claim rejected').send(res);
});

const linkPersonToUser = catchAsync(async (req, res) => {
  const person = await personService.linkPersonToUser(req.params.personId, req.family.id, req.body.userId);
  new ApiResponse(200, { person }, 'Person linked to account').send(res);
});

const unlinkPerson = catchAsync(async (req, res) => {
  const person = await personService.unlinkPerson(req.params.personId, req.family.id);
  new ApiResponse(200, { person }, 'Person unlinked from account').send(res);
});

module.exports = {
  createPerson, listPeople, getPerson, updatePerson, archivePerson, restorePerson, deletePerson,
  requestClaim, listClaims, approveClaim, rejectClaim, linkPersonToUser, unlinkPerson,
};