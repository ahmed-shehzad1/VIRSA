const supabase = require('../config/database');

const PUBLIC_COLUMNS =
  'id, email, full_name, avatar_url, is_email_verified, is_active, created_at, updated_at';

async function findByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findPublicById(id) {
  const { data, error } = await supabase
    .from('users')
    .select(PUBLIC_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function create({ email, passwordHash, fullName }) {
  const { data, error } = await supabase
    .from('users')
    .insert({ email: email.toLowerCase(), password_hash: passwordHash, full_name: fullName || null })
    .select(PUBLIC_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

async function updateById(id, fields) {
  const { data, error } = await supabase
    .from('users')
    .update(fields)
    .eq('id', id)
    .select(PUBLIC_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

async function deleteById(id) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
}

async function incrementFailedLogin(id, { lockUntil } = {}) {
  // Read-modify-write; fine at this scale, and login attempts are
  // already rate-limited at the route level (see auth.routes.js).
  const current = await findById(id);
  const nextCount = (current?.failed_login_count || 0) + 1;
  const { error } = await supabase
    .from('users')
    .update({ failed_login_count: nextCount, locked_until: lockUntil || null })
    .eq('id', id);
  if (error) throw error;
  return nextCount;
}

async function resetFailedLogin(id) {
  const { error } = await supabase
    .from('users')
    .update({ failed_login_count: 0, locked_until: null })
    .eq('id', id);
  if (error) throw error;
}

module.exports = {
  PUBLIC_COLUMNS,
  findByEmail,
  findById,
  findPublicById,
  create,
  updateById,
  deleteById,
  incrementFailedLogin,
  resetFailedLogin,
};
