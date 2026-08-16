const mediaModel = require('../models/personMedia.model');
const storageService = require('./storage.service');
const profileService = require('./profile.service');
const ApiError = require('../utils/ApiError');

// 6.5
async function uploadMedia(familyId, personId, membership, uploaderId, file, { caption, takenDate, mediaType }) {
  const person = await profileService.getPersonOrThrow(personId, familyId);
  profileService.assertViewable(membership, person);

  const { path, publicUrl } = await storageService.uploadPersonMedia(personId, file);

  return mediaModel.create({
    person_id: personId,
    family_id: familyId,
    uploader_id: uploaderId,
    storage_path: path,
    public_url: publicUrl,
    media_type: mediaType || 'photo',
    caption: caption || null,
    taken_date: takenDate || null,
  });
}

async function listMedia(familyId, personId, membership) {
  const person = await profileService.getPersonOrThrow(personId, familyId);
  profileService.assertViewable(membership, person);
  return mediaModel.listByPerson(personId);
}

async function deleteMedia(familyId, personId, mediaId) {
  await profileService.getPersonOrThrow(personId, familyId);
  const media = await mediaModel.findById(mediaId);
  if (!media || media.person_id !== personId) throw ApiError.notFound('Media not found', 'MEDIA_NOT_FOUND');

  await storageService.deletePersonMedia(media.storage_path);
  await mediaModel.deleteById(mediaId);
}

module.exports = { uploadMedia, listMedia, deleteMedia };