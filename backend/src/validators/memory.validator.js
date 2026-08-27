const { body } = require('express-validator');

const createMemoryValidator = [
  body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Title is required (max 150 characters)'),
  body('content').trim().isLength({ min: 1, max: 10000 }).withMessage('Content is required (max 10000 characters)'),
  body('memoryDate').optional({ checkFalsy: true }).isISO8601().withMessage('memoryDate must be a valid date'),
  body('visibility').optional().isIn(['all_members', 'admins_only']).withMessage('Invalid visibility value'),
  body('personId').optional({ checkFalsy: true }).isUUID().withMessage('personId must be a valid UUID'),
  body('taggedPersonIds').optional().isArray().withMessage('taggedPersonIds must be an array'),
  body('taggedPersonIds.*').optional().isUUID().withMessage('Each taggedPersonId must be a valid UUID'),
];

const updateMemoryValidator = [
  body('title').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 150 }),
  body('content').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 10000 }),
  body('memoryDate').optional({ checkFalsy: true }).isISO8601().withMessage('memoryDate must be a valid date'),
  body('visibility').optional().isIn(['all_members', 'admins_only']).withMessage('Invalid visibility value'),
  body('personId').optional({ checkFalsy: true }).isUUID().withMessage('personId must be a valid UUID'),
  body('taggedPersonIds').optional().isArray().withMessage('taggedPersonIds must be an array'),
];

const flagMemoryValidator = [
  body('reason').trim().isLength({ min: 3, max: 500 }).withMessage('A reason is required (max 500 characters)'),
];

const resolveFlagValidator = [
  body('resolution').isIn(['hide', 'dismiss']).withMessage('resolution must be hide or dismiss'),
  body('note').optional({ checkFalsy: true }).isLength({ max: 500 }),
];

module.exports = { createMemoryValidator, updateMemoryValidator, flagMemoryValidator, resolveFlagValidator };