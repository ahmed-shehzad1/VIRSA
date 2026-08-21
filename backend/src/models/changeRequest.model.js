const supabase = require('../config/database');

async function create(fields) {
  const { data, error } = await supabase.from('change_requests').insert(fields).select('*').single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('change_requests').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function listPendingByFamily(familyId) {
  const { data, error } = await supabase
    .from('change_requests')
    .select('*, people(id, first_name, last_name), users!change_requests_submitted_by_fkey(id, full_name)')
    .eq('family_id', familyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function listByPerson(personId) {
  const { data, error } = await supabase
    .from('change_requests')
    .select('*, users!change_requests_submitted_by_fkey(id, full_name), reviewer:users!change_requests_reviewed_by_fkey(id, full_name)')
    .eq('person_id', personId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function listByFamilyHistory(familyId, { page, limit }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await supabase
    .from('change_requests')
    .select('*, people(id, first_name, last_name), users!change_requests_submitted_by_fkey(id, full_name), reviewer:users!change_requests_reviewed_by_fkey(id, full_name)', { count: 'exact' })
    .eq('family_id', familyId)
    .neq('status', 'pending')
    .order('reviewed_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { history: data, total: count };
}

async function updateById(id, fields) {
  const { data, error } = await supabase.from('change_requests').update(fields).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

module.exports = { create, findById, listPendingByFamily, listByPerson, listByFamilyHistory, updateById };