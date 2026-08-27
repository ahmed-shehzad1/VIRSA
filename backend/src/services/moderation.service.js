const storyService = require('./story.service');
const memoryService = require('./memory.service');
const mediaService = require('./media.service');
const personModel = require('../models/person.model');
const memoryModel = require('../models/personMemory.model');
const ApiError = require('../utils/ApiError');

const CONTENT_TYPES = ['biography', 'memory', 'photo'];

function assertValidContentType(contentType) {
  if (!CONTENT_TYPES.includes(contentType)) {
    throw ApiError.badRequest(`contentType must be one of: ${CONTENT_TYPES.join(', ')}`, 'INVALID_CONTENT_TYPE');
  }
}

// 12.4
async function reportContent(familyId, contentType, contentId, flaggedBy, reason) {
  assertValidContentType(contentType);
  if (contentType === 'biography') return storyService.flagBiography(familyId, contentId, flaggedBy, reason);
  if (contentType === 'memory') return memoryService.flagMemory(familyId, contentId, flaggedBy, reason);
  return mediaService.flagMedia(familyId, contentId, flaggedBy, reason);
}

// 12.1 / 12.6
async function getDashboard(familyId) {
  const [biographyFlags, memoryFlags, mediaFlags] = await Promise.all([
    storyService.listPendingFlags(familyId),
    memoryService.listPendingFlags(familyId),
    mediaService.listPendingMediaFlags(familyId),
  ]);

  return {
    biography: biographyFlags.map((f) => ({ ...f, contentType: 'biography' })),
    memory: memoryFlags.map((f) => ({ ...f, contentType: 'memory' })),
    photo: mediaFlags.map((f) => ({ ...f, contentType: 'photo' })),
    totalPending: biographyFlags.length + memoryFlags.length + mediaFlags.length,
  };
}

// 12.5
async function getHistory(familyId) {
  const [biographyFlags, memoryFlags, mediaFlags] = await Promise.all([
    storyService.listResolvedFlags(familyId),
    memoryService.listResolvedFlags(familyId),
    mediaService.listResolvedMediaFlags(familyId),
  ]);

  const all = [
    ...biographyFlags.map((f) => ({ ...f, contentType: 'biography' })),
    ...memoryFlags.map((f) => ({ ...f, contentType: 'memory' })),
    ...mediaFlags.map((f) => ({ ...f, contentType: 'photo' })),
  ];
  return all.sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at));
}

async function resolveReport(familyId, contentType, flagId, resolution, resolvedBy, note) {
  assertValidContentType(contentType);
  if (contentType === 'biography') return storyService.resolveFlag(familyId, flagId, resolution, resolvedBy, note);
  if (contentType === 'memory') return memoryService.resolveFlag(familyId, flagId, resolution, resolvedBy, note);
  return mediaService.resolveMediaFlag(familyId, flagId, resolution, resolvedBy, note);
}

// 12.7
async function removeContent(familyId, contentType, contentId) {
  assertValidContentType(contentType);
  if (contentType === 'biography') return personModel.updateById(contentId, { biography_status: 'hidden' });
  if (contentType === 'memory') return memoryModel.updateById(contentId, { moderation_status: 'hidden' });
  return mediaService.hideMedia(familyId, contentId);
}

async function restoreContent(familyId, contentType, contentId) {
  assertValidContentType(contentType);
  if (contentType === 'biography') return personModel.updateById(contentId, { biography_status: 'published' });
  if (contentType === 'memory') return memoryModel.updateById(contentId, { moderation_status: 'visible' });
  return mediaService.restoreMedia(familyId, contentId);
}

module.exports = { reportContent, getDashboard, getHistory, resolveReport, removeContent, restoreContent };