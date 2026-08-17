const { body } = require('express-validator');

const parentChildValidator = [
  body('parentId').isUUID().withMessage('A valid parentId is required'),
  body('childId').isUUID().withMessage('A valid childId is required'),
];

const spouseValidator = [
  body('personAId').isUUID().withMessage('A valid personAId is required'),
  body('personBId').isUUID().withMessage('A valid personBId is required'),
  body('status').optional().isIn(['married', 'divorced', 'widowed', 'separated']).withMessage('Invalid status'),
  body('startDate').optional({ checkFalsy: true }).isISO8601().withMessage('startDate must be a valid date'),
  body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('endDate must be a valid date'),
];

const siblingValidator = [
  body('personAId').isUUID().withMessage('A valid personAId is required'),
  body('personBId').isUUID().withMessage('A valid personBId is required'),
  body('siblingType').optional().isIn(['full', 'half', 'step']).withMessage('Invalid siblingType'),
];

module.exports = { parentChildValidator, spouseValidator, siblingValidator };