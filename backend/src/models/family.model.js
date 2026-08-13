const supabase = require('../config/database');

async function create({ name, description, ownerId, isPrivate }) {
  const { data, error } = await supabase
    .from('families')
    .insert({ name, description: description || null, owner_id: ownerId, is_private: isPrivate ?? true })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('families').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function updateById(id, fields) {
  const { data, error } = await supabase.from('families').update(fields).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

async function archiveById(id) {
  return updateById(id, { is_archived: true, archived_at: new Date().toISOString() });
}

async function restoreById(id) {
  return updateById(id, { is_archived: false, archived_at: null });
}

async function deleteById(id) {
  const { error } = await supabase.from('families').delete().eq('id', id);
  if (error) throw error;
}

async function findAllForUser(userId) {
  const { data, error } = await supabase
    .from('family_members')
    .select('role, joined_at, families(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((row) => ({ ...row.families, myRole: row.role, joinedAt: row.joined_at }));
}

module.exports = { create, findById, updateById, archiveById, restoreById, deleteById, findAllForUser };