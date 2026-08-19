const router = require('express').Router();

const familyController = require('../controllers/family.controller');
const invitationController = require('../controllers/invitation.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { loadFamilyContext, requireFamilyRole, blockIfArchived } = require('../middleware/family.middleware');
const {
  createFamilyValidator, updateFamilyValidator, updatePrivacyValidator, inviteMemberValidator, changeRoleValidator,
} = require('../validators/family.validator');
const personController = require('../controllers/person.controller');
const { createPersonValidator, updatePersonValidator, linkPersonValidator } = require('../validators/person.validator');
const relationshipController = require('../controllers/relationship.controller');
const { parentChildValidator, spouseValidator, siblingValidator } = require('../validators/relationship.validator');
const treeController = require('../controllers/tree.controller');
const profileController = require('../controllers/profile.controller');
const { handleMediaUpload } = require('../middleware/mediaUpload.middleware');
const { visibilityValidator } = require('../validators/profile.validator');
const memoryFeedController = require('../controllers/memoryFeed.controller');
const { createMemoryValidator, updateMemoryValidator, flagMemoryValidator, resolveFlagValidator } = require('../validators/memory.validator');
const storyController = require('../controllers/story.controller');
const { saveBiographyValidator, flagValidator, resolveFlagValidator } = require('../validators/story.validator');

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

// ---------------- People (Milestone 3) ----------------

// 3.1 / 3.2
router.post('/:familyId/people', blockIfArchived, requireFamilyRole('member'), createPersonValidator, validate, personController.createPerson);
router.get('/:familyId/people', personController.listPeople); // 3.2 / 3.8 / 3.9 / 3.10 (viewer+ can read)

router.get('/:familyId/people/:personId', personController.getPerson);

// 3.3 / 3.5 / 3.6 / 3.7
router.patch('/:familyId/people/:personId', blockIfArchived, requireFamilyRole('member'), updatePersonValidator, validate, personController.updatePerson);

// 3.4
router.post('/:familyId/people/:personId/archive', requireFamilyRole('admin'), personController.archivePerson);
router.post('/:familyId/people/:personId/restore', requireFamilyRole('admin'), personController.restorePerson);
router.delete('/:familyId/people/:personId', requireFamilyRole('owner'), personController.deletePerson);

// 3.12 - claim flow (self-service)
router.post('/:familyId/people/:personId/claim', personController.requestClaim);
router.get('/:familyId/people/:personId/claims', requireFamilyRole('admin'), personController.listClaims);
router.post('/:familyId/people/:personId/claims/:claimId/approve', requireFamilyRole('admin'), personController.approveClaim);
router.post('/:familyId/people/:personId/claims/:claimId/reject', requireFamilyRole('admin'), personController.rejectClaim);

// 3.12 - direct admin link/unlink (no request needed)
router.post('/:familyId/people/:personId/link', requireFamilyRole('admin'), linkPersonValidator, validate, personController.linkPersonToUser);
router.delete('/:familyId/people/:personId/link', requireFamilyRole('admin'), personController.unlinkPerson);

// ---------------- Relationships (Milestone 4) ----------------

// 4.2
router.post('/:familyId/relationships/parent-child', blockIfArchived, requireFamilyRole('member'), parentChildValidator, validate, relationshipController.createParentChild);

// 4.3
router.post('/:familyId/relationships/spouse', blockIfArchived, requireFamilyRole('member'), spouseValidator, validate, relationshipController.createSpouse);

// 4.4
router.post('/:familyId/relationships/sibling', blockIfArchived, requireFamilyRole('member'), siblingValidator, validate, relationshipController.createSibling);

// 4.8
router.delete('/:familyId/relationships/:relationshipId', requireFamilyRole('admin'), relationshipController.deleteRelationship);

// 4.9
router.get('/:familyId/relationships', relationshipController.getFamilyRelationships);
router.get('/:familyId/people/:personId/relationships', relationshipController.getPersonRelationships);


// ---------------- Family Tree (Milestone 5) ----------------

// 5.1 / 5.3 / 5.8 - full or windowed tree: ?rootPersonId=&depth=&maxNodes=
router.get('/:familyId/tree', treeController.getTree);

// 5.3 - suggested default root person
router.get('/:familyId/tree/root', treeController.getSuggestedRoot);

// 5.4 / 5.5
router.get('/:familyId/people/:personId/ancestors', treeController.getAncestors);
router.get('/:familyId/people/:personId/descendants', treeController.getDescendants);

// 5.9
router.get('/:familyId/people/:personId/node', treeController.getPersonNode);


// ---------------- Person Profile (Milestone 6) ----------------

// 6.1
router.get('/:familyId/people/:personId/profile', profileController.getFullProfile);

// 6.2 / 6.3 / 6.4
router.get('/:familyId/people/:personId/biography', profileController.getBiography);
router.get('/:familyId/people/:personId/profile-relationships', profileController.getRelationships);
router.get('/:familyId/people/:personId/dates', profileController.getDatesInfo);

// 6.9 - only admins can change who's allowed to see a restricted profile
router.patch('/:familyId/people/:personId/visibility', requireFamilyRole('admin'), visibilityValidator, validate, profileController.updateVisibility);

// 6.5 - media
router.post('/:familyId/people/:personId/media', blockIfArchived, requireFamilyRole('member'), handleMediaUpload, profileController.uploadMedia);
router.get('/:familyId/people/:personId/media', profileController.listMedia);
router.delete('/:familyId/people/:personId/media/:mediaId', requireFamilyRole('admin'), profileController.deleteMedia);

// 6.6 - memories
router.post('/:familyId/people/:personId/memories', blockIfArchived, requireFamilyRole('member'), createMemoryValidator, validate, profileController.addMemory);
router.get('/:familyId/people/:personId/memories', profileController.listMemories);
router.patch('/:familyId/people/:personId/memories/:memoryId', updateMemoryValidator, validate, profileController.updateMemory);
router.delete('/:familyId/people/:personId/memories/:memoryId', profileController.deleteMemory);

// 6.7 - timeline is included in the full profile response (see 6.1);
// exposed separately too, in case the frontend wants to lazy-load just this section
router.get('/:familyId/people/:personId/timeline', profileController.getTimeline);


// ---------------- Life Stories (Milestone 7) ----------------

// 7.1 / 7.2
router.put('/:familyId/people/:personId/story', blockIfArchived, requireFamilyRole('member'), saveBiographyValidator, validate, storyController.saveBiography);
router.get('/:familyId/people/:personId/story', storyController.getBiography);

// 7.3
router.get('/:familyId/people/:personId/story/history', storyController.getHistory);
router.post('/:familyId/people/:personId/story/versions/:versionId/restore', blockIfArchived, requireFamilyRole('member'), storyController.restoreVersion);

// 7.5 - report a story (any member) / review reports (admin+)
router.post('/:familyId/people/:personId/story/flag', requireFamilyRole('member'), flagValidator, validate, storyController.flagBiography);
router.get('/:familyId/story-flags', requireFamilyRole('admin'), storyController.listPendingFlags);
router.patch('/:familyId/story-flags/:flagId/resolve', requireFamilyRole('admin'), resolveFlagValidator, validate, storyController.resolveFlag);

// ---------------- Family Memory Feed & Moderation (Milestone 8) ----------------

router.post('/:familyId/memories', blockIfArchived, requireFamilyRole('member'), createMemoryValidator, validate, memoryFeedController.createFamilyMemory);
router.get('/:familyId/memories', memoryFeedController.listFamilyMemories); // ?page=&limit=
router.get('/:familyId/memories/:memoryId', memoryFeedController.getMemory);

router.post('/:familyId/memories/:memoryId/flag', requireFamilyRole('member'), flagMemoryValidator, validate, memoryFeedController.flagMemory);
router.get('/:familyId/memory-flags', requireFamilyRole('admin'), memoryFeedController.listPendingFlags);
router.patch('/:familyId/memory-flags/:flagId/resolve', requireFamilyRole('admin'), resolveFlagValidator, validate, memoryFeedController.resolveFlag);

module.exports = router;