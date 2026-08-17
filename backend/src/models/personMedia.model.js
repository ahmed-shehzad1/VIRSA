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

async function deleteById(id) {
  const { error } = await supabase.from('person_media').delete().eq('id', id);
  if (error) throw error;
}

module.exports = { create, findById, listByPerson, deleteById };