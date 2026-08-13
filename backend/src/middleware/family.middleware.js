const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { roleAtLeast } = require('../utils/roles');

const loadFamilyContext = catchAsync(async (req, res, next) => {
  const { familyId } = req.params;

  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .maybeSingle();

  if (familyError) throw ApiError.internal('Failed to load family');
  if (!family) throw ApiError.notFound('Family not found', 'FAMILY_NOT_FOUND');

  const { data: membership, error: memberError } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (memberError) throw ApiError.internal('Failed to load membership');
  if (!membership) throw ApiError.forbidden('You are not a member of this family', 'NOT_FAMILY_MEMBER');

  req.family = family;
  req.membership = membership;
  next();
});

function requireFamilyRole(minRole) {
  return (req, res, next) => {
    if (!roleAtLeast(req.membership.role, minRole)) {
      return next(ApiError.forbidden(`This action requires the '${minRole}' role or higher`, 'INSUFFICIENT_ROLE'));
    }
    next();
  };
}

function blockIfArchived(req, res, next) {
  if (req.family?.is_archived) {
    return next(ApiError.forbidden('This family is archived', 'FAMILY_ARCHIVED'));
  }
  next();
}

module.exports = { loadFamilyContext, requireFamilyRole, blockIfArchived };