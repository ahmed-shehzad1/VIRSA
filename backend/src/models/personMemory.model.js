const supabase = require('../config/database');

async function create(fields) {
  const { data, error } = await supabase.from('person_memories').insert(fields).select('*').single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('person_memories').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function listByPerson(personId, { includeAdminOnly }) {
  let query = supabase.from('person_memories').select('*, users(id, full_name)').eq('person_id', personId);
  if (!includeAdminOnly) query = query.eq('visibility', 'all_members');
  const { data, error } = await query.order('memory_date', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data;
}

async function updateById(id, fields) {
  const { data, error } = await supabase.from('person_memories').update(fields).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

async function deleteById(id) {
  const { error } = await supabase.from('person_memories').delete().eq('id', id);
  if (error) throw error;
}

module.exports = { create, findById, listByPerson, updateById, deleteById };