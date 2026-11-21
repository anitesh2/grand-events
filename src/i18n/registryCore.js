/**
 * Pure helpers for the locale registry (kept apart from import.meta.glob so
 * they can be unit-tested with fake modules).
 */

/** Turns { './locales/es.json': { default: {...} } } into a registry. */
export function buildRegistry(modules) {
  const locales = {};
  for (const [path, mod] of Object.entries(modules)) {
    const code = path.split('/').pop().replace(/\.json$/, '');
    const messages = mod.default ?? mod;
    const meta = messages._meta || {};
    locales[code] = {
      code,
      name: meta.name || code,
      intl: meta.intl || code,
      dir: meta.dir === 'rtl' ? 'rtl' : 'ltr',
      messages,
    };
  }
  return {
    codes: () => Object.keys(locales).sort(),
    get: (code) => locales[code] || null,
    list: () => Object.values(locales).sort((a, b) => a.code.localeCompare(b.code)),
  };
}

/** Picks the best supported locale for a list of browser preferences. */
export function negotiateLocale(preferred, supportedCodes, fallback) {
  for (const tag of preferred || []) {
    if (!tag) continue;
    const lower = tag.toLowerCase();
    if (supportedCodes.includes(lower)) return lower;
    const base = lower.split('-')[0];
    if (supportedCodes.includes(base)) return base;
  }
  return fallback;
}
