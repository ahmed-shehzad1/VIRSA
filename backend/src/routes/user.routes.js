const router = require('express').Router();

const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { handleAvatarUpload } = require('../middleware/upload.middleware');
const { updateProfileValidator, deleteAccountValidator } = require('../validators/user.validator');

router.use(requireAuth); // every route below requires a valid access token

// 1.6
router.get('/me', userController.getMe);

// 1.13
router.patch('/me', updateProfileValidator, validate, userController.updateMe);

// 1.14
router.post('/me/avatar', handleAvatarUpload, userController.uploadAvatar);
router.delete('/me/avatar', userController.deleteAvatar);

// 1.12
router.delete('/me', deleteAccountValidator, validate, userController.deleteMe);

module.exports = router;
