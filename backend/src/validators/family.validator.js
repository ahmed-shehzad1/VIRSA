const { body } = require('express-validator');
const { ROLES } = require('../utils/roles');

const createFamilyValidator = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Family name must be between 2 and 100 characters'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Description must be under 500 characters').trim(),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be true or false'),
];

const updateFamilyValidator = [
  body('name').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 100 }).withMessage('Family name must be between 2 and 100 characters'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Description must be under 500 characters').trim(),
];

const updatePrivacyValidator = [
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be true or false'),
  body('allowMemberInvites').optional().isBoolean().withMessage('allowMemberInvites must be true or false'),
];

const inviteMemberValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('role').isIn(['admin', 'member', 'viewer']).withMessage('Role must be admin, member, or viewer'),
];

const changeRoleValidator = [
  body('role').isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}`),
];

module.exports = { createFamilyValidator, updateFamilyValidator, updatePrivacyValidator, inviteMemberValidator, changeRoleValidator };