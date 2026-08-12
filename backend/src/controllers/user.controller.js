const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const { clearRefreshCookie } = require('../utils/cookies.util');

// 1.6 Current user
const getMe = catchAsync(async (req, res) => {
  const user = await userService.getCurrentUser(req.user.id);
  new ApiResponse(200, { user }).send(res);
});

// 1.13 Update profile
const updateMe = catchAsync(async (req, res) => {
  const { fullName, email } = req.body;
  const user = await userService.updateProfile(req.user.id, { fullName, email });
  new ApiResponse(200, { user }, 'Profile updated successfully').send(res);
});

// 1.14 Upload avatar
const uploadAvatar = catchAsync(async (req, res) => {
  const user = await userService.updateAvatar(req.user.id, req.file);
  new ApiResponse(200, { user }, 'Avatar updated successfully').send(res);
});

// 1.14 Remove avatar
const deleteAvatar = catchAsync(async (req, res) => {
  const user = await userService.removeAvatar(req.user.id);
  new ApiResponse(200, { user }, 'Avatar removed successfully').send(res);
});

// 1.12 Delete account
const deleteMe = catchAsync(async (req, res) => {
  const { password } = req.body;
  await userService.deleteAccount(req.user.id, password);
  clearRefreshCookie(res);
  new ApiResponse(200, null, 'Account deleted successfully').send(res);
});

module.exports = { getMe, updateMe, uploadAvatar, deleteAvatar, deleteMe };
