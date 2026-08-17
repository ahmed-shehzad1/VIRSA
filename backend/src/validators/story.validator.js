const { body } = require('express-validator');

const saveBiographyValidator = [
  body('content').trim().isLength({ min: 1, max: 20000 }).withMessage('Story content is required (max 20000 characters)'),
];

const flagValidator = [
  body('reason').trim().isLength({ min: 3, max: 500 }).withMessage('A reason is required (max 500 characters)'),
];

const resolveFlagValidator = [
  body('resolution').isIn(['hide', 'dismiss']).withMessage('resolution must be hide or dismiss'),
  body('note').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Note must be under 500 characters'),
];

module.exports = { saveBiographyValidator, flagValidator, resolveFlagValidator };