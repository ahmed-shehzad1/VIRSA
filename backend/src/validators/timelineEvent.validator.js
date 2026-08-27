const { body } = require('express-validator');

const CATEGORIES = ['birth', 'education', 'career', 'marriage', 'relocation', 'achievement', 'health', 'death', 'other'];

const createEventValidator = [
  body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Title is required (max 150 characters)'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 2000 }).withMessage('Description must be under 2000 characters'),
  body('category').optional().isIn(CATEGORIES).withMessage(`category must be one of: ${CATEGORIES.join(', ')}`),
  body('eventDate').isISO8601().withMessage('eventDate is required and must be a valid date'),
  body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('endDate must be a valid date'),
];

const updateEventValidator = [
  body('title').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 150 }),
  body('description').optional({ checkFalsy: true }).isLength({ max: 2000 }),
  body('category').optional().isIn(CATEGORIES).withMessage(`category must be one of: ${CATEGORIES.join(', ')}`),
  body('eventDate').optional({ checkFalsy: true }).isISO8601().withMessage('eventDate must be a valid date'),
  body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('endDate must be a valid date'),
];

module.exports = { createEventValidator, updateEventValidator };