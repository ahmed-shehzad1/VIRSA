const supabase = require('../config/database');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const BUCKET = config.supabase.avatarBucket;

/**
 * Uploads an avatar buffer to Supabase Storage under `<userId>/<filename>`
 * and returns { path, publicUrl }.
 */
async function uploadAvatar(userId, file) {
  const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) throw ApiError.internal(`Avatar upload failed: ${error.message}`);

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, publicUrl: publicUrlData.publicUrl };
}

async function deleteAvatar(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    // Non-fatal: log and move on, we don't want a storage hiccup to
    // block the user's profile update.
    console.error('[storage.service] Failed to delete old avatar:', error.message);
  }
}

const PERSON_MEDIA_BUCKET = 'person-media';

async function uploadPersonMedia(personId, file) {
  const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const path = `${personId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(PERSON_MEDIA_BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw ApiError.internal(`Media upload failed: ${error.message}`);

  const { data: publicUrlData } = supabase.storage.from(PERSON_MEDIA_BUCKET).getPublicUrl(path);
  return { path, publicUrl: publicUrlData.publicUrl };
}

async function deletePersonMedia(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(PERSON_MEDIA_BUCKET).remove([path]);
  if (error) console.error('[storage.service] Failed to delete person media:', error.message);
}

module.exports = { uploadAvatar, deleteAvatar, BUCKET };
