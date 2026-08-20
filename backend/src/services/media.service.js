const mediaModel = require('../models/personMedia.model');
const storageService = require('../services/storage.service');
const personModel = require('../models/person.model');
const memoryModel = require('../models/personMemory.model');
const { roleAtLeast } = require('../utils/roles');
const ApiError = require('../utils/ApiError');

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

module.exports = { uploadMedia, listForPerson, listForMemory, getMedia, updateMediaMetadata, deleteMedia };