const { body } = require('express-validator');

const submitChangeRequestValidator = [
  body('fieldName').notEmpty().withMessage('fieldName is required'),
  body('proposedValue').exists().withMessage('proposedValue is required'),
  body('reason').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Reason must be under 500 characters'),
];

const reviewChangeRequestValidator = [
  body('note').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Note must be under 500 characters'),
  body('forceApply').optional().isBoolean(),
];

module.exports = { submitChangeRequestValidator, reviewChangeRequestValidator };