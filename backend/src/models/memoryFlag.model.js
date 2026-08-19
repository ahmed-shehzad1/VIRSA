const supabase = require('../config/database');

async function create({ memoryId, familyId, flaggedBy, reason }) {
  const { data, error } = await supabase
    .from('memory_flags')
    .insert({ memory_id: memoryId, family_id: familyId, flagged_by: flaggedBy, reason })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('memory_flags').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function listPendingByFamily(familyId) {
  const { data, error } = await supabase
    .from('memory_flags')
    .select('*, person_memories(id, title)')
    .eq('family_id', familyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function resolve(id, status, resolvedBy, resolutionNote) {
  const { data, error } = await supabase
    .from('memory_flags')
    .update({ status, resolved_by: resolvedBy, resolved_at: new Date().toISOString(), resolution_note: resolutionNote || null })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

module.exports = { create, findById, listPendingByFamily, resolve };