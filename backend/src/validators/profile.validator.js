const { body } = require('express-validator');

const visibilityValidator = [
  body('visibility').isIn(['all_members', 'admins_only']).withMessage('visibility must be all_members or admins_only'),
];

const addMemoryValidator = [
  body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Title is required (max 150 characters)'),
  body('content').trim().isLength({ min: 1, max: 10000 }).withMessage('Content is required (max 10000 characters)'),
  body('memoryDate').optional({ checkFalsy: true }).isISO8601().withMessage('memoryDate must be a valid date'),
  body('visibility').optional().isIn(['all_members', 'admins_only']).withMessage('Invalid visibility value'),
];

const updateMemoryValidator = [
  body('title').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 150 }),
  body('content').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 10000 }),
  body('memoryDate').optional({ checkFalsy: true }).isISO8601().withMessage('memoryDate must be a valid date'),
  body('visibility').optional().isIn(['all_members', 'admins_only']).withMessage('Invalid visibility value'),
];

module.exports = { visibilityValidator, addMemoryValidator, updateMemoryValidator };