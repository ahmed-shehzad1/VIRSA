const supabase = require('../config/database');

const SELECT_WITH_AUTHOR = '*, users(id, full_name, avatar_url)';

async function create(fields) {
  const { data, error } = await supabase.from('person_memories').insert(fields).select(SELECT_WITH_AUTHOR).single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('person_memories').select(SELECT_WITH_AUTHOR).eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

// 8.8 - memories directly about one person (as primary subject or tagged)
async function listByPerson(personId, { includeAdminOnly, includeHidden }) {
  let query = supabase
    .from('person_memories')
    .select(SELECT_WITH_AUTHOR)
    .or(`person_id.eq.${personId},tagged_person_ids.cs.{${personId}}`);

  if (!includeAdminOnly) query = query.eq('visibility', 'all_members');
  if (!includeHidden) query = query.neq('moderation_status', 'hidden');

  const { data, error } = await query.order('memory_date', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data;
}

// 8.9 - the whole family's memory feed, paginated
async function listByFamily(familyId, { includeAdminOnly, includeHidden, page, limit }) {
  let query = supabase
    .from('person_memories')
    .select(`${SELECT_WITH_AUTHOR}, people(id, first_name, last_name)`, { count: 'exact' })
    .eq('family_id', familyId);

  if (!includeAdminOnly) query = query.eq('visibility', 'all_members');
  if (!includeHidden) query = query.neq('moderation_status', 'hidden');

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  return { memories: data, total: count };
}

async function updateById(id, fields) {
  const { data, error } = await supabase.from('person_memories').update(fields).eq('id', id).select(SELECT_WITH_AUTHOR).single();
  if (error) throw error;
  return data;
}

async function deleteById(id) {
  const { error } = await supabase.from('person_memories').delete().eq('id', id);
  if (error) throw error;
}
// 14.3 - text search over title/content
async function searchByFamily(familyId, { q, includeAdminOnly, includeHidden, page, limit }) {
  let query = supabase
    .from('person_memories')
    .select(`${SELECT_WITH_AUTHOR}, people(id, first_name, last_name)`, { count: 'exact' })
    .eq('family_id', familyId)
    .or(`title.ilike.%${q}%,content.ilike.%${q}%`);

  if (!includeAdminOnly) query = query.eq('visibility', 'all_members');
  if (!includeHidden) query = query.neq('moderation_status', 'hidden');

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  return { memories: data, total: count };
}

module.exports = { create, findById, listByPerson, listByFamily, updateById, deleteById, searchByFamily };