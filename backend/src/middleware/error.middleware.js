const ApiError = require('../utils/ApiError');
const config = require('../config/env');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Unexpected / programming error - don't leak internals to the client.
    console.error('[UNHANDLED ERROR]', err);
    error = ApiError.internal(
      config.nodeEnv === 'development' ? err.message : 'Something went wrong'
    );
  }

  const response = {
    success: false,
    message: error.message,
    code: error.code || 'ERROR',
  };

  if (error.details) response.details = error.details;
  if (config.nodeEnv === 'development' && err.stack) response.stack = err.stack;

  res.status(error.statusCode || 500).json(response);
}

module.exports = { notFoundHandler, errorHandler };
