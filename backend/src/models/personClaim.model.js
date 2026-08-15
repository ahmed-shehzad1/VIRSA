// backend/src/models/personClaim.model.js
const supabase = require('../config/database');

async function create({ personId, userId }) {
  const { data, error } = await supabase
    .from('person_claims')
    .insert({ person_id: personId, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('person_claims').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function findPendingByPersonAndUser(personId, userId) {
  const { data, error } = await supabase
    .from('person_claims')
    .select('*')
    .eq('person_id', personId)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listByPerson(personId) {
  const { data, error } = await supabase
    .from('person_claims')
    .select('*, users(id, email, full_name)')
    .eq('person_id', personId)
    .order('requested_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function resolve(id, status, resolvedBy) {
  const { data, error } = await supabase
    .from('person_claims')
    .update({ status, resolved_at: new Date().toISOString(), resolved_by: resolvedBy })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

module.exports = { create, findById, findPendingByPersonAndUser, listByPerson, resolve };