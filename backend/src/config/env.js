require('dotenv').config();
const { parseDurationToMs } = require('../utils/parseDuration');

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    avatarBucket: process.env.SUPABASE_AVATAR_BUCKET || 'avatars',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    get refreshExpiresInMs() {
      return parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN || '30d');
    },
  },

  tokens: {
    emailVerificationExpiresInMin: Number(process.env.EMAIL_VERIFICATION_EXPIRES_IN_MIN || 60),
    passwordResetExpiresInMin: Number(process.env.PASSWORD_RESET_EXPIRES_IN_MIN || 30),
    familyInviteExpiresInMin: Number(process.env.FAMILY_INVITE_EXPIRES_IN_MIN || 4320), // 3 days
  },

  security: {
    maxFailedLoginAttempts: Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS || 5),
    lockoutDurationMin: Number(process.env.LOCKOUT_DURATION_MIN || 15),
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'Virsa <no-reply@virsa.app>',
  },

    ai: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    dailyLimitPerUser: Number(process.env.AI_DAILY_LIMIT_PER_USER || 20),
  },
};
