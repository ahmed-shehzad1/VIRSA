// Central reference of every error `code` the API can return, grouped by
// category. Not enforced at runtime - this is documentation-as-code so
// the frontend can build ONE consistent, accessible error-handling
// component instead of special-casing each module's error shape.
//
// Every error response follows this shape (see error.middleware.js):
//   { success: false, message: string, code: string, details？: array }
//
// `details` is only present on VALIDATION_ERROR, and is an array of
// { field, message } - use this to focus/announce the specific invalid
// field for screen readers, rather than just showing the top-level message.

const ERROR_CODES = {
  auth: [
    'NO_TOKEN', 'INVALID_TOKEN', 'TOKEN_EXPIRED', 'USER_NOT_FOUND',
    'ACCOUNT_INACTIVE', 'ACCOUNT_LOCKED', 'INVALID_CREDENTIALS',
    'NO_REFRESH_TOKEN', 'INVALID_REFRESH_TOKEN', 'REFRESH_TOKEN_EXPIRED', 'INVALID_SESSION',
  ],
  validation: ['VALIDATION_ERROR', 'INVALID_FIELD', 'MISSING_TOKEN', 'MISSING_EMAIL'],
  authorization: [
    'NOT_FAMILY_MEMBER', 'INSUFFICIENT_ROLE', 'FAMILY_ARCHIVED',
    'PROFILE_RESTRICTED', 'MEMORY_RESTRICTED', 'FORBIDDEN',
  ],
  notFound: [
    'ROUTE_NOT_FOUND', 'FAMILY_NOT_FOUND', 'PERSON_NOT_FOUND', 'MEMBER_NOT_FOUND',
    'MEMORY_NOT_FOUND', 'MEDIA_NOT_FOUND', 'EVENT_NOT_FOUND', 'CLAIM_NOT_FOUND',
    'VERSION_NOT_FOUND', 'FLAG_NOT_FOUND', 'CHANGE_REQUEST_NOT_FOUND', 'NOTIFICATION_NOT_FOUND',
  ],
  conflict: [
    'EMAIL_TAKEN', 'ALREADY_MEMBER', 'INVITE_PENDING', 'RELATIONSHIP_ALREADY_EXISTS',
    'ALREADY_CLAIMED', 'CLAIM_PENDING', 'ALREADY_REVIEWED', 'CHANGE_REQUEST_CONFLICT', 'FLAG_RESOLVED',
  ],
  upload: ['INVALID_FILE_TYPE', 'FILE_TOO_LARGE', 'NO_FILE', 'UPLOAD_ERROR'],
  rateLimit: ['RATE_LIMITED', 'AI_QUOTA_EXCEEDED', 'AI_PROVIDER_RATE_LIMITED'],
  ai: ['INSUFFICIENT_DATA', 'CONTENT_TOO_LONG'],
};

module.exports = ERROR_CODES;