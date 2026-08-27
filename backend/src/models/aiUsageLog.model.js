const supabase = require('../config/database');

async function logUsage(userId, familyId, feature) {
  const { error } = await supabase.from('ai_usage_log').insert({ user_id: userId, family_id: familyId, feature });
  if (error) console.error('[aiUsageLog.model] Failed to log AI usage:', error.message);
}

// 15.6 - count this user's AI calls in the last 24 hours
async function countLast24h(userId) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from('ai_usage_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);
  if (error) throw error;
  return count || 0;
}

module.exports = { logUsage, countLast24h };