const supabase = require('../config/database');

async function create({ familyId, email, role, tokenHash, invitedBy, expiresAt }) {
  const { data, error } = await supabase
    .from('family_invitations')
    .insert({
      family_id: familyId,
      email: email.toLowerCase(),
      role,
      token_hash: tokenHash,
      invited_by: invitedBy,
      expires_at: expiresAt,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function findByTokenHash(tokenHash) {
  const { data, error } = await supabase
    .from('family_invitations')
    .select('*, families(*)')
    .eq('token_hash', tokenHash)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findPendingByFamily(familyId) {
  const { data, error } = await supabase
    .from('family_invitations')
    .select('*')
    .eq('family_id', familyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function findPendingByEmail(email) {
  const { data, error } = await supabase
    .from('family_invitations')
    .select('*, families(id, name, description)')
    .eq('email', email.toLowerCase())
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function findActivePendingForFamilyEmail(familyId, email) {
  const { data, error } = await supabase
    .from('family_invitations')
    .select('*')
    .eq('family_id', familyId)
    .eq('email', email.toLowerCase())
    .eq('status', 'pending')
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateStatus(id, status) {
  const { data, error } = await supabase
    .from('family_invitations')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('family_invitations').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = {
  create,
  findByTokenHash,
  findPendingByFamily,
  findPendingByEmail,
  findActivePendingForFamilyEmail,
  updateStatus,
  findById,
};