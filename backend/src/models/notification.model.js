const supabase = require('../config/database');

async function create(fields) {
  const { data, error } = await supabase.from('notifications').insert(fields).select('*').single();
  if (error) throw error;
  return data;
}

async function listForUser(userId, { unreadOnly, page, limit }) {
  let query = supabase.from('notifications').select('*', { count: 'exact' }).eq('user_id', userId);
  if (unreadOnly) query = query.eq('is_read', false);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  return { notifications: data, total: count };
}

async function countUnread(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  return count || 0;
}

async function findById(id) {
  const { data, error } = await supabase.from('notifications').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function markRead(id) {
  const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

async function markAllRead(userId) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  if (error) throw error;
}

module.exports = { create, listForUser, countUnread, findById, markRead, markAllRead };