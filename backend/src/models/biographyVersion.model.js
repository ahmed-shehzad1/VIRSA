const supabase = require('../config/database');

async function create({ personId, familyId, content, editedBy }) {
  const { data, error } = await supabase
    .from('person_biography_versions')
    .insert({ person_id: personId, family_id: familyId, content, edited_by: editedBy })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function listByPerson(personId) {
  const { data, error } = await supabase
    .from('person_biography_versions')
    .select('*, users(id, full_name)')
    .eq('person_id', personId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('person_biography_versions').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = { create, listByPerson, findById };