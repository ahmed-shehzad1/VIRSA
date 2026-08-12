const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Returns { valid: boolean, reasons: string[] } instead of throwing,
 * so callers (validators) can surface all problems at once.
 */
function checkPasswordStrength(password) {
  const reasons = [];
  if (!password || password.length < 8) reasons.push('Password must be at least 8 characters long');
  if (!/[a-z]/.test(password)) reasons.push('Password must contain a lowercase letter');
  if (!/[A-Z]/.test(password)) reasons.push('Password must contain an uppercase letter');
  if (!/[0-9]/.test(password)) reasons.push('Password must contain a number');
  if (!/[^A-Za-z0-9]/.test(password)) reasons.push('Password must contain a special character');

  return { valid: reasons.length === 0, reasons };
}

module.exports = { hashPassword, comparePassword, checkPasswordStrength };
