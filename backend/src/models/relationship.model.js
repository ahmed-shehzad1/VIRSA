const supabase = require('../config/database');

async function create(fields) {
  const { data, error } = await supabase.from('relationships').insert(fields).select('*').single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('relationships').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function deleteById(id) {
  const { error } = await supabase.from('relationships').delete().eq('id', id);
  if (error) throw error;
}

// any relationship connecting these two people, regardless of direction/type
async function findBetween(familyId, personAId, personBId) {
  const { data, error } = await supabase
    .from('relationships')
    .select('*')
    .eq('family_id', familyId)
    .or(
      `and(person_a_id.eq.${personAId},person_b_id.eq.${personBId}),and(person_a_id.eq.${personBId},person_b_id.eq.${personAId})`
    );
  if (error) throw error;
  return data;
}

async function findParentsOf(childId) {
  const { data, error } = await supabase.from('relationships').select('person_a_id').eq('type', 'parent').eq('person_b_id', childId);
  if (error) throw error;
  return data.map((r) => r.person_a_id);
}

async function findChildrenOf(parentId) {
  const { data, error } = await supabase.from('relationships').select('person_b_id').eq('type', 'parent').eq('person_a_id', parentId);
  if (error) throw error;
  return data.map((r) => r.person_b_id);
}

async function findAllForPerson(personId) {
  const { data, error } = await supabase
    .from('relationships')
    .select('*')
    .or(`person_a_id.eq.${personId},person_b_id.eq.${personId}`);
  if (error) throw error;
  return data;
}

async function findAllForFamily(familyId) {
  const { data, error } = await supabase.from('relationships').select('*').eq('family_id', familyId);
  if (error) throw error;
  return data;
}

module.exports = { create, findById, deleteById, findBetween, findParentsOf, findChildrenOf, findAllForPerson, findAllForFamily };