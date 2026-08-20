const supabase = require('../config/database');

async function create(fields) {
  const { data, error } = await supabase.from('person_media').insert(fields).select('*').single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('person_media').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function listByPerson(personId) {
  const { data, error } = await supabase
    .from('person_media')
    .select('*')
    .eq('person_id', personId)
    .order('taken_date', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data;
}

async function listByMemory(memoryId) {
  const { data, error } = await supabase
    .from('person_media')
    .select('*')
    .eq('memory_id', memoryId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function updateById(id, fields) {
  const { data, error } = await supabase.from('person_media').update(fields).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

async function deleteById(id) {
  const { error } = await supabase.from('person_media').delete().eq('id', id);
  if (error) throw error;
}

module.exports = { create, findById, listByPerson, listByMemory, updateById, deleteById };