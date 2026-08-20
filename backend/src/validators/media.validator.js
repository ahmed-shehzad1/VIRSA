const { body } = require('express-validator');

const uploadMediaValidator = [
  body('personId').optional({ checkFalsy: true }).isUUID().withMessage('personId must be a valid UUID'),
  body('memoryId').optional({ checkFalsy: true }).isUUID().withMessage('memoryId must be a valid UUID'),
  body('caption').optional({ checkFalsy: true }).isLength({ max: 300 }).withMessage('Caption must be under 300 characters'),
  body('takenDate').optional({ checkFalsy: true }).isISO8601().withMessage('takenDate must be a valid date'),
  body('mediaType').optional().isIn(['photo', 'document']).withMessage('mediaType must be photo or document'),
];

const updateMediaValidator = [
  body('caption').optional({ checkFalsy: true }).isLength({ max: 300 }).withMessage('Caption must be under 300 characters'),
  body('takenDate').optional({ checkFalsy: true }).isISO8601().withMessage('takenDate must be a valid date'),
];

module.exports = { uploadMediaValidator, updateMediaValidator };