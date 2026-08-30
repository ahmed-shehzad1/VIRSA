const multer = require('multer');
const ApiError = require('../utils/ApiError');

// 20.5 - one consistent error mapping for every upload endpoint in the
// app, so the frontend gets identical error codes/messages whether it's
// an avatar, a person photo, or a memory attachment.
function mapMulterError(err) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return ApiError.badRequest('File is too large', 'FILE_TOO_LARGE');
    if (err.code === 'LIMIT_FILE_COUNT') return ApiError.badRequest('Only one file is allowed per upload', 'UPLOAD_ERROR');
    return ApiError.badRequest(err.message, 'UPLOAD_ERROR');
  }
  return err;
}

module.exports = { mapMulterError };