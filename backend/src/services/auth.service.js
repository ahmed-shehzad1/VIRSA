const supabase = require('../config/database');
const config = require('../config/env');
const userModel = require('../models/user.model');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const { hashPassword, comparePassword } = require('../utils/password.util');
const { generateRawToken, hashToken } = require('../utils/token.util');
const ApiError = require('../utils/ApiError');

// ---------------------------------------------------------------
// 1.1 / 1.2 - Registration + password hashing
// ---------------------------------------------------------------
async function register({ email, password, fullName }) {
  const existing = await userModel.findByEmail(email);
  if (existing) throw ApiError.conflict('An account with this email already exists', 'EMAIL_TAKEN');

  const passwordHash = await hashPassword(password);
  const user = await userModel.create({ email, passwordHash, fullName });

  // Fire off verification email but don't block registration on it.
  await sendVerificationEmail(user.id, user.email).catch((err) =>
    console.error('[auth.service] Failed to send verification email:', err.message)
  );

  return user;
}

// ---------------------------------------------------------------
// 1.3 / 1.4 - Login + JWT issuance
// 1.11 - lockout after repeated failed attempts
// ---------------------------------------------------------------
async function login({ email, password, userAgent, ipAddress }) {
  const user = await userModel.findByEmail(email);

  // Same generic error whether the email doesn't exist or the password is
  // wrong - avoids leaking which emails are registered.
  const invalidCredentialsError = ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');

  if (!user) throw invalidCredentialsError;

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw ApiError.forbidden(
      'Account temporarily locked due to too many failed login attempts. Try again later.',
      'ACCOUNT_LOCKED'
    );
  }

  if (!user.is_active) {
    throw ApiError.forbidden('This account has been deactivated', 'ACCOUNT_INACTIVE');
  }

  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) {
    const attempts = await userModel.incrementFailedLogin(user.id, {
      lockUntil:
        (user.failed_login_count || 0) + 1 >= config.security.maxFailedLoginAttempts
          ? new Date(Date.now() + config.security.lockoutDurationMin * 60 * 1000).toISOString()
          : null,
    });
    if (attempts >= config.security.maxFailedLoginAttempts) {
      throw ApiError.forbidden(
        `Too many failed attempts. Account locked for ${config.security.lockoutDurationMin} minutes.`,
        'ACCOUNT_LOCKED'
      );
    }
    throw invalidCredentialsError;
  }

  await userModel.resetFailedLogin(user.id);

  const accessToken = tokenService.signAccessToken(user);
  const { rawToken: refreshToken, expiresAt } = await tokenService.issueRefreshToken(user.id, {
    userAgent,
    ipAddress,
  });

  const { password_hash, failed_login_count, locked_until, ...publicUser } = user;

  return { user: publicUser, accessToken, refreshToken, refreshTokenExpiresAt: expiresAt };
}

// ---------------------------------------------------------------
// 1.4 - refresh access token using a valid refresh token
// ---------------------------------------------------------------
async function refreshSession(rawRefreshToken, { userAgent, ipAddress } = {}) {
  const row = await tokenService.verifyRefreshToken(rawRefreshToken);
  const user = await userModel.findById(row.user_id);
  if (!user || !user.is_active) throw ApiError.unauthorized('Session no longer valid', 'INVALID_SESSION');

  // Rotate: revoke the old refresh token, issue a new one.
  await tokenService.revokeRefreshToken(rawRefreshToken);
  const accessToken = tokenService.signAccessToken(user);
  const { rawToken: refreshToken, expiresAt } = await tokenService.issueRefreshToken(user.id, {
    userAgent,
    ipAddress,
  });

  return { accessToken, refreshToken, refreshTokenExpiresAt: expiresAt };
}

// ---------------------------------------------------------------
// 1.7 - Logout / session invalidation
// ---------------------------------------------------------------
async function logout(rawRefreshToken) {
  if (rawRefreshToken) await tokenService.revokeRefreshToken(rawRefreshToken);
}

async function logoutAll(userId) {
  await tokenService.revokeAllRefreshTokens(userId);
}

// ---------------------------------------------------------------
// 1.10 - Email verification
// ---------------------------------------------------------------
async function sendVerificationEmail(userId, email) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + config.tokens.emailVerificationExpiresInMin * 60 * 1000);

  const { error } = await supabase.from('email_verification_tokens').insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw ApiError.internal('Failed to create verification token');

  await emailService.sendVerificationEmail(email, rawToken);
}

async function resendVerificationEmail(email) {
  const user = await userModel.findByEmail(email);
  // Don't reveal whether the email exists.
  if (!user) return;
  if (user.is_email_verified) return;
  await sendVerificationEmail(user.id, user.email);
}

async function verifyEmail(rawToken) {
  const tokenHash = hashToken(rawToken);

  const { data: row, error } = await supabase
    .from('email_verification_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .is('used_at', null)
    .maybeSingle();

  if (error) throw ApiError.internal('Failed to verify email');
  if (!row) throw ApiError.badRequest('Invalid or already-used verification link', 'INVALID_TOKEN');
  if (new Date(row.expires_at) < new Date()) {
    throw ApiError.badRequest('Verification link has expired', 'TOKEN_EXPIRED');
  }

  await supabase.from('users').update({ is_email_verified: true }).eq('id', row.user_id);
  await supabase
    .from('email_verification_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', row.id);
}

// ---------------------------------------------------------------
// 1.8 / 1.9 - Forgot password + reset password
// ---------------------------------------------------------------
async function forgotPassword(email) {
  const user = await userModel.findByEmail(email);
  // Always behave the same way whether or not the account exists,
  // so attackers can't use this endpoint to enumerate emails.
  if (!user) return;

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + config.tokens.passwordResetExpiresInMin * 60 * 1000);

  const { error } = await supabase.from('password_reset_tokens').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw ApiError.internal('Failed to create reset token');

  await emailService.sendPasswordResetEmail(user.email, rawToken);
}

async function resetPassword(rawToken, newPassword) {
  const tokenHash = hashToken(rawToken);

  const { data: row, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .is('used_at', null)
    .maybeSingle();

  if (error) throw ApiError.internal('Failed to reset password');
  if (!row) throw ApiError.badRequest('Invalid or already-used reset link', 'INVALID_TOKEN');
  if (new Date(row.expires_at) < new Date()) {
    throw ApiError.badRequest('Reset link has expired', 'TOKEN_EXPIRED');
  }

  const passwordHash = await hashPassword(newPassword);
  await supabase
    .from('users')
    .update({ password_hash: passwordHash, failed_login_count: 0, locked_until: null })
    .eq('id', row.user_id);

  await supabase
    .from('password_reset_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', row.id);

  // Resetting the password invalidates every existing session - if
  // someone else had access, this locks them out.
  await tokenService.revokeAllRefreshTokens(row.user_id);
}

// ---------------------------------------------------------------
// 1.11 - Change password (while logged in)
// ---------------------------------------------------------------
async function changePassword(userId, currentPassword, newPassword) {
  const user = await userModel.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const matches = await comparePassword(currentPassword, user.password_hash);
  if (!matches) throw ApiError.badRequest('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');

  const passwordHash = await hashPassword(newPassword);
  await supabase.from('users').update({ password_hash: passwordHash }).eq('id', userId);

  // Keep the current session alive but kill every other session.
  await tokenService.revokeAllRefreshTokens(userId);
}

module.exports = {
  register,
  login,
  refreshSession,
  logout,
  logoutAll,
  sendVerificationEmail,
  resendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};
