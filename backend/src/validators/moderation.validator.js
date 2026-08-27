const { body, param } = require('express-validator');

const CONTENT_TYPES = ['biography', 'memory', 'photo'];

const reportContentValidator = [
  body('contentType').isIn(CONTENT_TYPES).withMessage(`contentType must be one of: ${CONTENT_TYPES.join(', ')}`),
  body('contentId').isUUID().withMessage('contentId must be a valid UUID'),
  body('reason').trim().isLength({ min: 3, max: 500 }).withMessage('A reason is required (max 500 characters)'),
];

const resolveReportValidator = [
  param('contentType').isIn(CONTENT_TYPES).withMessage(`contentType must be one of: ${CONTENT_TYPES.join(', ')}`),
  body('resolution').isIn(['hide', 'dismiss']).withMessage('resolution must be hide or dismiss'),
  body('note').optional({ checkFalsy: true }).isLength({ max: 500 }),
];

module.exports = { reportContentValidator, resolveReportValidator };