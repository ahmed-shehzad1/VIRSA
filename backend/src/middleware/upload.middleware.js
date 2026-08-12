const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage(); // buffer goes straight to Supabase Storage

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG, PNG, WEBP or GIF images are allowed', 'INVALID_FILE_TYPE'));
  }
  cb(null, true);
};

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
}).single('avatar');

/** Wraps multer's callback style so errors flow into the normal error handler. */
function handleAvatarUpload(req, res, next) {
  uploadAvatar(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest('Avatar must be smaller than 5MB', 'FILE_TOO_LARGE'));
      }
      return next(ApiError.badRequest(err.message, 'UPLOAD_ERROR'));
    }
    if (err) return next(err);
    if (!req.file) return next(ApiError.badRequest('No avatar file provided', 'NO_FILE'));
    next();
  });
}

module.exports = { handleAvatarUpload };
