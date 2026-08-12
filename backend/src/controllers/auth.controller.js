const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { REFRESH_COOKIE_NAME, setRefreshCookie, clearRefreshCookie } = require('../utils/cookies.util');

// 1.1 Register
const register = catchAsync(async (req, res) => {
  const { email, password, fullName } = req.body;
  const user = await authService.register({ email, password, fullName });
  new ApiResponse(201, { user }, 'Account created. Please check your email to verify your address.').send(res);
});

// 1.3 Login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken, refreshTokenExpiresAt } = await authService.login({
    email,
    password,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  setRefreshCookie(res, refreshToken, refreshTokenExpiresAt);
  new ApiResponse(200, { user, accessToken }, 'Logged in successfully').send(res);
});

// 1.4 Refresh access token
const refresh = catchAsync(async (req, res) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const { accessToken, refreshToken, refreshTokenExpiresAt } = await authService.refreshSession(rawRefreshToken, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  setRefreshCookie(res, refreshToken, refreshTokenExpiresAt);
  new ApiResponse(200, { accessToken }, 'Session refreshed').send(res);
});

// 1.7 Logout (current session only)
const logout = catchAsync(async (req, res) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  await authService.logout(rawRefreshToken);
  clearRefreshCookie(res);
  new ApiResponse(200, null, 'Logged out successfully').send(res);
});

// 1.7 Logout everywhere (requires auth)
const logoutAll = catchAsync(async (req, res) => {
  await authService.logoutAll(req.user.id);
  clearRefreshCookie(res);
  new ApiResponse(200, null, 'Logged out of all devices').send(res);
});

// 1.10 Verify email
const verifyEmail = catchAsync(async (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token) throw ApiError.badRequest('Verification token is required', 'MISSING_TOKEN');
  await authService.verifyEmail(token);
  new ApiResponse(200, null, 'Email verified successfully').send(res);
});

// 1.10 Resend verification email
const resendVerification = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest('Email is required', 'MISSING_EMAIL');
  await authService.resendVerificationEmail(email);
  new ApiResponse(200, null, 'If an account exists for that email, a verification link has been sent').send(res);
});

// 1.8 Forgot password
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  new ApiResponse(200, null, 'If an account exists for that email, a reset link has been sent').send(res);
});

// 1.9 Reset password
const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  new ApiResponse(200, null, 'Password reset successfully. Please log in with your new password.').send(res);
});

// 1.11 Change password (logged in)
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  new ApiResponse(200, null, 'Password changed successfully. Other sessions have been logged out.').send(res);
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
};
