const supabase = require('../config/database');

async function create(fields) {
  const { data, error } = await supabase.from('timeline_events').insert(fields).select('*').single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('timeline_events').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

// 10.2 / 10.8 - sorted chronologically
async function listByPerson(personId, order = 'asc') {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('person_id', personId)
    .order('event_date', { ascending: order !== 'desc' });
  if (error) throw error;
  return data;
}

async function updateById(id, fields) {
  const { data, error } = await supabase.from('timeline_events').update(fields).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

async function deleteById(id) {
  const { error } = await supabase.from('timeline_events').delete().eq('id', id);
  if (error) throw error;
}

module.exports = { create, findById, listByPerson, updateById, deleteById };