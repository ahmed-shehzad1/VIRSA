const mediaModel = require('../models/personMedia.model');
const storageService = require('../services/storage.service');
const personModel = require('../models/person.model');
const memoryModel = require('../models/personMemory.model');
const { roleAtLeast } = require('../utils/roles');
const ApiError = require('../utils/ApiError');
const mediaFlagModel = require('../models/mediaFlag.model');
const notificationService = require('./notification.service');

async function assertOwnerBelongsToFamily(familyId, personId, memoryId) {
  if (!personId && !memoryId) throw ApiError.badRequest('A photo must be linked to a person or a memory', 'MISSING_OWNER');

  if (personId) {
    const person = await personModel.findById(personId);
    if (!person || person.family_id !== familyId) throw ApiError.notFound('Person not found in this family', 'PERSON_NOT_FOUND');
  }
  if (memoryId) {
    const memory = await memoryModel.findById(memoryId);
    if (!memory || memory.family_id !== familyId) throw ApiError.notFound('Memory not found in this family', 'MEMORY_NOT_FOUND');
  }
}

// 9.1 / 9.2 / 9.3 / 9.4
async function uploadMedia(familyId, membership, uploaderId, file, { personId, memoryId, caption, takenDate, mediaType }) {
  await assertOwnerBelongsToFamily(familyId, personId, memoryId);

  const result = await storageService.uploadPersonMedia(personId || memoryId, file);

  return mediaModel.create({
    person_id: personId || null,
    memory_id: memoryId || null,
    family_id: familyId,
    uploader_id: uploaderId,
    storage_path: result.path,
    public_url: result.publicUrl,
    thumbnail_path: result.thumbnailPath,
    thumbnail_url: result.thumbnailUrl,
    width: result.width,
    height: result.height,
    file_size_bytes: result.fileSizeBytes,
    media_type: mediaType || 'photo',
    caption: caption || null,
    taken_date: takenDate || null,
  });
}

// 9.3
async function listForPerson(familyId, personId) {
  const person = await personModel.findById(personId);
  if (!person || person.family_id !== familyId) throw ApiError.notFound('Person not found', 'PERSON_NOT_FOUND');
  return mediaModel.listByPerson(personId);
}

// 9.4
async function listForMemory(familyId, memoryId) {
  const memory = await memoryModel.findById(memoryId);
  if (!memory || memory.family_id !== familyId) throw ApiError.notFound('Memory not found', 'MEMORY_NOT_FOUND');
  return mediaModel.listByMemory(memoryId);
}

// 9.8 - single-item fetch, used for image detail/loading states
async function getMedia(familyId, mediaId) {
  const media = await mediaModel.findById(mediaId);
  if (!media || media.family_id !== familyId) throw ApiError.notFound('Photo not found', 'MEDIA_NOT_FOUND');
  return media;
}

// 9.1 - edit caption/taken date after upload
async function updateMediaMetadata(familyId, mediaId, actorId, membership, { caption, takenDate }) {
  const media = await getMedia(familyId, mediaId);

  // 9.6 - uploader or admin+ can edit metadata
  const isUploader = media.uploader_id === actorId;
  if (!isUploader && !roleAtLeast(membership.role, 'admin')) {
    throw ApiError.forbidden('Only the uploader or a family admin can edit this photo', 'INSUFFICIENT_ROLE');
  }

  const updates = {};
  if (caption !== undefined) updates.caption = caption;
  if (takenDate !== undefined) updates.taken_date = takenDate;
  if (Object.keys(updates).length === 0) return media;

  return mediaModel.updateById(mediaId, updates);
}

// 9.5 / 9.6
async function deleteMedia(familyId, mediaId, actorId, membership) {
  const media = await getMedia(familyId, mediaId);

  const isUploader = media.uploader_id === actorId;
  if (!isUploader && !roleAtLeast(membership.role, 'admin')) {
    throw ApiError.forbidden('Only the uploader or a family admin can delete this photo', 'INSUFFICIENT_ROLE');
  }

  await storageService.deletePersonMedia(media.storage_path, media.thumbnail_path);
  await mediaModel.deleteById(mediaId);
}

// 12.3 / 12.4
async function flagMedia(familyId, mediaId, flaggedBy, reason) {
  const media = await mediaModel.findById(mediaId);
  if (!media || media.family_id !== familyId) throw ApiError.notFound('Photo not found', 'MEDIA_NOT_FOUND');

  const flag = await mediaFlagModel.create({ mediaId, familyId, flaggedBy, reason });
  await mediaModel.updateById(mediaId, { moderation_status: 'flagged' });
  return flag;
}

async function resolveMediaFlag(familyId, flagId, resolution, resolvedBy, resolutionNote) {
  const flag = await mediaFlagModel.findById(flagId);
  if (!flag || flag.family_id !== familyId) throw ApiError.notFound('Flag not found', 'FLAG_NOT_FOUND');
  if (flag.status !== 'pending') throw ApiError.badRequest('This report has already been resolved', 'FLAG_RESOLVED');

  const status = resolution === 'hide' ? 'resolved_hidden' : 'resolved_dismissed';
  const resolved = await mediaFlagModel.resolve(flagId, status, resolvedBy, resolutionNote);

  const media = await mediaModel.findById(flag.media_id);
  await mediaModel.updateById(flag.media_id, { moderation_status: resolution === 'hide' ? 'hidden' : 'visible' });

  if (media?.uploader_id) {
    await notificationService.createNotification(
      media.uploader_id, familyId, 'moderation',
      resolution === 'hide' ? 'Your photo was hidden' : 'Report on your photo dismissed',
      resolution === 'hide' ? 'A photo you uploaded was hidden after a report.' : 'A report against your photo was reviewed and dismissed.',
      { familyId, mediaId: flag.media_id }
    ).catch((err) => console.error('[media.service] notify failed:', err.message));
  }

  return resolved;
}

async function listPendingMediaFlags(familyId) {
  return mediaFlagModel.listPendingByFamily(familyId);
}

async function listResolvedMediaFlags(familyId) {
  return mediaFlagModel.listResolvedByFamily(familyId);
}

// 12.7 - direct admin action, no report required
async function hideMedia(familyId, mediaId) {
  await getMedia(familyId, mediaId);
  return mediaModel.updateById(mediaId, { moderation_status: 'hidden' });
}

async function restoreMedia(familyId, mediaId) {
  await getMedia(familyId, mediaId);
  return mediaModel.updateById(mediaId, { moderation_status: 'visible' });
}

module.exports = { uploadMedia, listForPerson, listForMemory, getMedia, updateMediaMetadata, deleteMedia, flagMedia, resolveMediaFlag, listPendingMediaFlags, listResolvedMediaFlags, hideMedia, restoreMedia };