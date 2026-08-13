const ROLES = ['viewer', 'member', 'admin', 'owner'];
const ROLE_RANK = ROLES.reduce((acc, role, i) => ({ ...acc, [role]: i + 1 }), {});

function roleAtLeast(role, minRole) {
  return (ROLE_RANK[role] || 0) >= (ROLE_RANK[minRole] || 0);
}

function roleOutranks(roleA, roleB) {
  return (ROLE_RANK[roleA] || 0) > (ROLE_RANK[roleB] || 0);
}

module.exports = { ROLES, ROLE_RANK, roleAtLeast, roleOutranks };