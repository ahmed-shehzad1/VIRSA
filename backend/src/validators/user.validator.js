const { body } = require('express-validator');

const updateProfileValidator = [
  body('fullName')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .trim(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('A valid email is required').normalizeEmail(),
];

const deleteAccountValidator = [
  body('password').notEmpty().withMessage('Password confirmation is required to delete your account'),
];

module.exports = { updateProfileValidator, deleteAccountValidator };
