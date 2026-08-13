const router = require('express').Router();

const familyController = require('../controllers/family.controller');
const invitationController = require('../controllers/invitation.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { loadFamilyContext, requireFamilyRole, blockIfArchived } = require('../middleware/family.middleware');
const {
  createFamilyValidator, updateFamilyValidator, updatePrivacyValidator, inviteMemberValidator, changeRoleValidator,
} = require('../validators/family.validator');

router.use(requireAuth);

// 2.1 / 2.2
router.post('/', createFamilyValidator, validate, familyController.createFamily);
router.get('/', familyController.listMyFamilies);

router.use('/:familyId', loadFamilyContext); // 2.15 - loads membership, blocks non-members

router.get('/:familyId', familyController.getFamily);

// 2.3
router.patch('/:familyId', blockIfArchived, requireFamilyRole('admin'), updateFamilyValidator, validate, familyController.updateFamily);

// 2.14
router.patch('/:familyId/privacy', blockIfArchived, requireFamilyRole('owner'), updatePrivacyValidator, validate, familyController.updatePrivacy);

// 2.4
router.post('/:familyId/archive', requireFamilyRole('owner'), familyController.archiveFamily);
router.post('/:familyId/restore', requireFamilyRole('owner'), familyController.restoreFamily);
router.delete('/:familyId', requireFamilyRole('owner'), familyController.permanentlyDeleteFamily);

// 2.5
router.get('/:familyId/members', familyController.listMembers);

// 2.12
router.delete('/:familyId/members/:userId', blockIfArchived, requireFamilyRole('admin'), familyController.removeMember);
router.post('/:familyId/leave', familyController.leaveFamily);

// 2.13 / 2.6
router.patch('/:familyId/members/:userId/role', blockIfArchived, requireFamilyRole('admin'), changeRoleValidator, validate, familyController.changeMemberRole);
router.post('/:familyId/members/:userId/transfer-ownership', blockIfArchived, requireFamilyRole('owner'), familyController.transferOwnership);

// 2.10
router.post('/:familyId/invitations', blockIfArchived, requireFamilyRole('member'), inviteMemberValidator, validate, invitationController.inviteMember);
router.get('/:familyId/invitations', requireFamilyRole('admin'), invitationController.listFamilyInvitations);
router.delete('/:familyId/invitations/:invitationId', requireFamilyRole('admin'), invitationController.revokeInvitation);

module.exports = router;