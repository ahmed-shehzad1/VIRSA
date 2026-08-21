const supabase = require('../config/database');

async function create({ personId, familyId, flaggedBy, reason }) {
  const { data, error } = await supabase
    .from('person_biography_flags')
    .insert({ person_id: personId, family_id: familyId, flagged_by: flaggedBy, reason })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('person_biography_flags').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function listPendingByFamily(familyId) {
  const { data, error } = await supabase
    .from('person_biography_flags')
    .select('*, people(id, first_name, last_name), users!person_biography_flags_flagged_by_fkey(id, full_name)')
    .eq('family_id', familyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function resolve(id, status, resolvedBy, resolutionNote) {
  const { data, error } = await supabase
    .from('person_biography_flags')
    .update({ status, resolved_by: resolvedBy, resolved_at: new Date().toISOString(), resolution_note: resolutionNote || null })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function listResolvedByFamily(familyId) {
  const { data, error } = await supabase
    .from('person_biography_flags')
    .select('*')
    .eq('family_id', familyId)
    .neq('status', 'pending')
    .order('resolved_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

module.exports = { create, findById, listPendingByFamily, resolve };