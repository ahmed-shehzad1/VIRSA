const { body } = require('express-validator');

const createPersonValidator = [
  body('firstName').trim().isLength({ min: 1, max: 100 }).withMessage('First name is required'),
  body('lastName').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('gender').optional().isIn(['male', 'female', 'other', 'unknown']).withMessage('Invalid gender value'),
  body('birthDate').optional({ checkFalsy: true }).isISO8601().withMessage('birthDate must be a valid date (YYYY-MM-DD)'),
  body('deathDate').optional({ checkFalsy: true }).isISO8601().withMessage('deathDate must be a valid date (YYYY-MM-DD)'),
  body('isLiving').optional().isBoolean(),
  body('biography').optional({ checkFalsy: true }).isLength({ max: 5000 }).withMessage('Biography must be under 5000 characters'),
];

const updatePersonValidator = [
  body('firstName').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 100 }),
  body('lastName').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('gender').optional().isIn(['male', 'female', 'other', 'unknown']).withMessage('Invalid gender value'),
  body('birthDate').optional({ checkFalsy: true }).isISO8601().withMessage('birthDate must be a valid date (YYYY-MM-DD)'),
  body('deathDate').optional({ checkFalsy: true }).isISO8601().withMessage('deathDate must be a valid date (YYYY-MM-DD)'),
  body('isLiving').optional().isBoolean(),
  body('biography').optional({ checkFalsy: true }).isLength({ max: 5000 }).withMessage('Biography must be under 5000 characters'),
];

const linkPersonValidator = [
  body('userId').isUUID().withMessage('A valid userId is required'),
];

module.exports = { createPersonValidator, updatePersonValidator, linkPersonValidator };