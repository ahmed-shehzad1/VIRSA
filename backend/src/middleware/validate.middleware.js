const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Run after an array of express-validator checks in a route definition.
 * Collects all validation errors and throws a single 400 with details.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  next(ApiError.badRequest('Validation failed', 'VALIDATION_ERROR', details));
}

module.exports = validate;
