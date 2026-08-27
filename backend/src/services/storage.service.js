const sharp = require('sharp');
const supabase = require('../config/database');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const AVATAR_BUCKET = config.supabase.avatarBucket;
const PERSON_MEDIA_BUCKET = 'person-media';
const THUMBNAIL_MAX_DIMENSION = 400;

// ---- avatars (Milestone 1) ----
async function uploadAvatar(userId, file) {
  const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw ApiError.internal(`Avatar upload failed: ${error.message}`);

  const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return { path, publicUrl: publicUrlData.publicUrl };
}

async function deleteAvatar(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  if (error) console.error('[storage.service] Failed to delete avatar:', error.message);
}

// ---- person/memory media (Milestone 6 + 9) ----

// 9.9 - generates a resized thumbnail alongside the original upload.
// Non-image files (PDFs) skip thumbnail generation entirely.
async function uploadPersonMedia(ownerId, file) {
  const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const basePath = `${ownerId}/${Date.now()}`;
  const originalPath = `${basePath}.${ext}`;

  let width = null;
  let height = null;
  let thumbnailPath = null;
  let thumbnailUrl = null;

  const isImage = file.mimetype.startsWith('image/');

  if (isImage) {
    try {
      const metadata = await sharp(file.buffer).metadata();
      width = metadata.width || null;
      height = metadata.height || null;

      const thumbnailBuffer = await sharp(file.buffer)
        .resize(THUMBNAIL_MAX_DIMENSION, THUMBNAIL_MAX_DIMENSION, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();

      thumbnailPath = `${basePath}_thumb.jpg`;
      const { error: thumbError } = await supabase.storage
        .from(PERSON_MEDIA_BUCKET)
        .upload(thumbnailPath, thumbnailBuffer, { contentType: 'image/jpeg', upsert: false });

      if (thumbError) {
        console.error('[storage.service] Thumbnail upload failed, continuing without it:', thumbError.message);
        thumbnailPath = null;
      }
    } catch (err) {
      console.error('[storage.service] Thumbnail generation failed, continuing without it:', err.message);
    }
  }

  const { error } = await supabase.storage.from(PERSON_MEDIA_BUCKET).upload(originalPath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw ApiError.internal(`Media upload failed: ${error.message}`);

  const { data: publicUrlData } = supabase.storage.from(PERSON_MEDIA_BUCKET).getPublicUrl(originalPath);

  if (thumbnailPath) {
    const { data: thumbUrlData } = supabase.storage.from(PERSON_MEDIA_BUCKET).getPublicUrl(thumbnailPath);
    thumbnailUrl = thumbUrlData.publicUrl;
  }

  return {
    path: originalPath,
    publicUrl: publicUrlData.publicUrl,
    thumbnailPath,
    thumbnailUrl,
    width,
    height,
    fileSizeBytes: file.size,
  };
}

async function deletePersonMedia(path, thumbnailPath) {
  const paths = [path, thumbnailPath].filter(Boolean);
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(PERSON_MEDIA_BUCKET).remove(paths);
  if (error) console.error('[storage.service] Failed to delete media:', error.message);
}

module.exports = { uploadAvatar, deleteAvatar, uploadPersonMedia, deletePersonMedia, PERSON_MEDIA_BUCKET };