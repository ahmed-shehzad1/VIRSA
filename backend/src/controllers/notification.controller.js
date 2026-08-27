const notificationService = require('../services/notification.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const listMyNotifications = catchAsync(async (req, res) => {
  const result = await notificationService.listForUser(req.user.id, req.query);
  new ApiResponse(200, result).send(res);
});

const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  new ApiResponse(200, { count }).send(res);
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user.id, req.params.notificationId);
  new ApiResponse(200, { notification }, 'Marked as read').send(res);
});

const markAllAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  new ApiResponse(200, null, 'All notifications marked as read').send(res);
});

const getPreferences = catchAsync(async (req, res) => {
  const preferences = await notificationService.getPreferences(req.user.id);
  new ApiResponse(200, { preferences }).send(res);
});

const updatePreferences = catchAsync(async (req, res) => {
  const preferences = await notificationService.updatePreferences(req.user.id, req.body);
  new ApiResponse(200, { preferences }, 'Preferences updated').send(res);
});

module.exports = { listMyNotifications, getUnreadCount, markAsRead, markAllAsRead, getPreferences, updatePreferences };