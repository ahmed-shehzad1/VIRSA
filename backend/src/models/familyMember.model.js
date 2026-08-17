const supabase = require('../config/database');

async function listByFamily(familyId) {
  const { data, error } = await supabase
    .from('family_members')
    .select('id, role, joined_at, user_id, users(id, email, full_name, avatar_url)')
    .eq('family_id', familyId)
    .order('joined_at', { ascending: true });
  if (error) throw error;
  return data;
}

async function findOne(familyId, userId) {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function add({ familyId, userId, role, invitedBy }) {
  const { data, error } = await supabase
    .from('family_members')
    .insert({ family_id: familyId, user_id: userId, role, invited_by: invitedBy || null })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function updateRole(familyId, userId, role) {
  const { data, error } = await supabase
    .from('family_members')
    .update({ role })
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function remove(familyId, userId) {
  const { error } = await supabase.from('family_members').delete().eq('family_id', familyId).eq('user_id', userId);
  if (error) throw error;
}

module.exports = { listByFamily, findOne, add, updateRole, remove };