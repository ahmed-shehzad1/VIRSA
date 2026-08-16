const { roleAtLeast } = require('./roles');

// 6.9 - a person's own visibility flag, layered on top of family membership
// (which loadFamilyContext already guarantees before this ever runs)
function canViewFullProfile(membership, person) {
  if (person.profile_visibility === 'admins_only') {
    return roleAtLeast(membership.role, 'admin');
  }
  return true;
}

module.exports = { canViewFullProfile };