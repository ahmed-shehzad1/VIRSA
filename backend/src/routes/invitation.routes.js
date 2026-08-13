const router = require('express').Router();
const invitationController = require('../controllers/invitation.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

// 2.11
router.get('/me', invitationController.listMyInvitations);
router.post('/:token/accept', invitationController.acceptInvitation);
router.post('/:token/reject', invitationController.rejectInvitation);

module.exports = router;