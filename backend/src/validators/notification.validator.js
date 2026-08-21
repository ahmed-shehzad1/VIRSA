const { body } = require('express-validator');

const updatePreferencesValidator = [
  body('emailOnInvitation').optional().isBoolean(),
  body('emailOnChangeRequest').optional().isBoolean(),
  body('emailOnModeration').optional().isBoolean(),
  body('inAppEnabled').optional().isBoolean(),
];

module.exports = { updatePreferencesValidator };