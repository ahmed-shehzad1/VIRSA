const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { loginLimiter, registerLimiter, emailActionLimiter } = require('../middleware/rateLimiters');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

// 1.1
router.post('/register', registerLimiter, registerValidator, validate, authController.register);

// 1.3
router.post('/login', loginLimiter, loginValidator, validate, authController.login);

// 1.4
router.post('/refresh-token', authController.refresh);

// 1.7
router.post('/logout', authController.logout);
router.post('/logout-all', requireAuth, authController.logoutAll);

// 1.10
router.post('/verify-email', verifyEmailValidator, validate, authController.verifyEmail);
router.get('/verify-email', authController.verifyEmail); // supports clicking a plain link
router.post('/resend-verification', emailActionLimiter, authController.resendVerification);

// 1.8 / 1.9
router.post('/forgot-password', emailActionLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);

// 1.11 (change password while logged in)
router.post('/change-password', requireAuth, changePasswordValidator, validate, authController.changePassword);

module.exports = router;
