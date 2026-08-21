const notificationModel = require('../models/notification.model');
const preferenceModel = require('../models/notificationPreference.model');
const ApiError = require('../utils/ApiError');

// 13.1 - internal creation function, called by other services (invitations,
// change requests, moderation). Not directly exposed as a "create" API.
async function createNotification(userId, familyId, type, title, body, data = {}) {
  if (!userId) return null; // e.g. inviting someone with no account yet

  const prefs = await preferenceModel.findByUserId(userId);
  if (prefs && prefs.in_app_enabled === false) return null; // 13.6

  return notificationModel.create({ user_id: userId, family_id: familyId || null, type, title, body: body || null, data });
}

// 13.5
async function listForUser(userId, query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  const { notifications, total } = await notificationModel.listForUser(userId, {
    unreadOnly: query.unreadOnly === 'true',
    page,
    limit,
  });
  return { notifications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getUnreadCount(userId) {
  return notificationModel.countUnread(userId);
}

async function markAsRead(userId, notificationId) {
  const notification = await notificationModel.findById(notificationId);
  if (!notification || notification.user_id !== userId) throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
  return notificationModel.markRead(notificationId);
}

async function markAllAsRead(userId) {
  await notificationModel.markAllRead(userId);
}

// 13.6
async function getPreferences(userId) {
  const prefs = await preferenceModel.findByUserId(userId);
  return prefs || { user_id: userId, ...preferenceModel.DEFAULTS };
}

async function updatePreferences(userId, fields) {
  const updates = {};
  if (fields.emailOnInvitation !== undefined) updates.email_on_invitation = fields.emailOnInvitation;
  if (fields.emailOnChangeRequest !== undefined) updates.email_on_change_request = fields.emailOnChangeRequest;
  if (fields.emailOnModeration !== undefined) updates.email_on_moderation = fields.emailOnModeration;
  if (fields.inAppEnabled !== undefined) updates.in_app_enabled = fields.inAppEnabled;
  return preferenceModel.upsert(userId, updates);
}

module.exports = { createNotification, listForUser, getUnreadCount, markAsRead, markAllAsRead, getPreferences, updatePreferences };