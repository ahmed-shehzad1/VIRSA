const { body } = require('express-validator');
const { checkPasswordStrength } = require('../utils/password.util');

const registerValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').custom((value) => {
    const { valid, reasons } = checkPasswordStrength(value);
    if (!valid) throw new Error(reasons.join('. '));
    return true;
  }),
  body('fullName')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .trim(),
];

const loginValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').custom((value) => {
    const { valid, reasons } = checkPasswordStrength(value);
    if (!valid) throw new Error(reasons.join('. '));
    return true;
  }),
];

const verifyEmailValidator = [body('token').notEmpty().withMessage('Verification token is required')];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').custom((value) => {
    const { valid, reasons } = checkPasswordStrength(value);
    if (!valid) throw new Error(reasons.join('. '));
    return true;
  }),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  changePasswordValidator,
};
