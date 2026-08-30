const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB - documents can be bigger than avatars
const { mapMulterError } = require('./multerErrorMapper');
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Only JPEG, PNG, WEBP, GIF or PDF files are allowed', 'INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
}).single('file');

function handleMediaUpload(req, res, next) {
  upload(req, res, (err) => {
    if (err) return next(mapMulterError(err));
    if (!req.file) return next(ApiError.badRequest('No file provided', 'NO_FILE'));
    next();
  });
}

module.exports = { handleMediaUpload };