// Minimal in-memory TTL cache. Fine for a single-instance deployment;
// if you ever scale to multiple server instances, swap this for Redis
// without changing any calling code (same get/set/invalidate interface).
const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

function set(key, value, ttlMs = 30000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function invalidatePrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

module.exports = { get, set, invalidatePrefix };