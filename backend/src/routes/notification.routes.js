const router = require('express').Router();
const notificationController = require('../controllers/notification.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { updatePreferencesValidator } = require('../validators/notification.validator');

router.use(requireAuth);

router.get('/me', notificationController.listMyNotifications); // ?unreadOnly=true&page=&limit=
router.get('/me/unread-count', notificationController.getUnreadCount);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);

router.get('/preferences', notificationController.getPreferences);
router.patch('/preferences', updatePreferencesValidator, validate, notificationController.updatePreferences);

module.exports = router;