const supabase = require('../config/database');

async function create(fields) {
  const { data, error } = await supabase.from('people').insert(fields).select('*').single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('people').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function updateById(id, fields) {
  const { data, error } = await supabase.from('people').update(fields).eq('id', id).select('*').single();
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
  const { error } = await supabase.from('people').delete().eq('id', id);
  if (error) throw error;
}

// 3.2 / 3.8 / 3.9 / 3.10 - list with search, filters, pagination
async function findMany(familyId, { search, gender, isLiving, isArchived, claimed, page, limit }) {
  let query = supabase
    .from('people')
    .select('*', { count: 'exact' })
    .eq('family_id', familyId)
    .eq('is_archived', isArchived);

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  }
  if (gender) query = query.eq('gender', gender);
  if (isLiving !== undefined) query = query.eq('is_living', isLiving);
  if (claimed === true) query = query.not('claimed_by_user_id', 'is', null);
  if (claimed === false) query = query.is('claimed_by_user_id', null);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { people: data, total: count };
}

module.exports = { create, findById, updateById, archiveById, restoreById, deleteById, findMany };