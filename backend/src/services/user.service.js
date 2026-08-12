const supabase = require('../config/database');
const userModel = require('../models/user.model');
const tokenService = require('./token.service');
const storageService = require('./storage.service');
const { comparePassword } = require('../utils/password.util');
const ApiError = require('../utils/ApiError');

// ---------------------------------------------------------------
// 1.6 - Current user
// ---------------------------------------------------------------
async function getCurrentUser(userId) {
  const user = await userModel.findPublicById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

// ---------------------------------------------------------------
// 1.13 - Update profile
// ---------------------------------------------------------------
async function updateProfile(userId, { fullName, email }) {
  const fields = {};
  if (fullName !== undefined) fields.full_name = fullName;

  if (email !== undefined) {
    const existing = await userModel.findByEmail(email);
    if (existing && existing.id !== userId) {
      throw ApiError.conflict('This email is already in use', 'EMAIL_TAKEN');
    }
    if (existing?.id !== userId) {
      // Changing email means re-verifying it.
      fields.email = email;
      fields.is_email_verified = false;
    }
  }

  if (Object.keys(fields).length === 0) {
    return userModel.findPublicById(userId);
  }

  return userModel.updateById(userId, fields);
}

// ---------------------------------------------------------------
// 1.14 - Avatar upload / removal
// ---------------------------------------------------------------
async function updateAvatar(userId, file) {
  const user = await userModel.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const { path, publicUrl } = await storageService.uploadAvatar(userId, file);

  // Clean up the old avatar (best-effort, non-blocking on failure).
  if (user.avatar_path) await storageService.deleteAvatar(user.avatar_path);

  return userModel.updateById(userId, { avatar_url: publicUrl, avatar_path: path });
}

async function removeAvatar(userId) {
  const user = await userModel.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (user.avatar_path) await storageService.deleteAvatar(user.avatar_path);
  return userModel.updateById(userId, { avatar_url: null, avatar_path: null });
}

// ---------------------------------------------------------------
// 1.12 - Account deletion
// ---------------------------------------------------------------
async function deleteAccount(userId, password) {
  const user = await userModel.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const matches = await comparePassword(password, user.password_hash);
  if (!matches) throw ApiError.badRequest('Password is incorrect', 'INVALID_PASSWORD');

  if (user.avatar_path) await storageService.deleteAvatar(user.avatar_path);
  await tokenService.revokeAllRefreshTokens(userId);

  // Related rows (refresh_tokens, verification/reset tokens) cascade-delete
  // via the FK constraints defined in schema.sql.
  await userModel.deleteById(userId);
}

module.exports = { getCurrentUser, updateProfile, updateAvatar, removeAvatar, deleteAccount };
