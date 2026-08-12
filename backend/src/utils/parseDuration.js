const UNITS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Parses simple duration strings like '15m', '30d', '1h' into milliseconds.
 * Falls back to treating the value as raw ms if no unit suffix is found.
 */
function parseDurationToMs(value) {
  if (typeof value === 'number') return value;

  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(String(value).trim());
  if (!match) {
    const asNumber = Number(value);
    if (!Number.isNaN(asNumber)) return asNumber;
    throw new Error(`Invalid duration string: ${value}`);
  }

  const [, amount, unit] = match;
  return Number(amount) * UNITS[unit.toLowerCase()];
}

module.exports = { parseDurationToMs };
