const supabase = require('../config/database');

const DEFAULTS = {
  email_on_invitation: true,
  email_on_change_request: true,
  email_on_moderation: true,
  in_app_enabled: true,
};

async function findByUserId(userId) {
  const { data, error } = await supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

async function upsert(userId, fields) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

module.exports = { DEFAULTS, findByUserId, upsert };