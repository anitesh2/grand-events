/**
 * Pure translation function.
 *  - dotted keys: "form.name"
 *  - interpolation: "Max {capacity} guests"
 *  - plurals via Intl.PluralRules: { "one": "...", "other": "..." }
 *    (works for languages with many plural forms, e.g. Arabic)
 *  - fallback: missing key in the chosen language -> default language -> key
 */

function lookup(messages, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), messages);
}

function interpolate(text, params, formatNumber) {
  return text.replace(/\{(\w+)\}/g, (match, name) => {
    if (!(name in params)) return match;
    const value = params[name];
    return typeof value === 'number' && formatNumber ? formatNumber(value) : String(value);
  });
}

export function createTranslator({ messages, fallbackMessages, intlLocale, formatNumber }) {
  const pluralRules = new Intl.PluralRules(intlLocale);

  return function t(key, params = {}) {
    let entry = lookup(messages, key);
    if (entry === undefined && fallbackMessages) entry = lookup(fallbackMessages, key);
    if (entry === undefined) return key;

    if (typeof entry === 'object' && entry !== null) {
      // Plural object: choose the form for params.count.
      const count = Number(params.count ?? 0);
      const category = count === 0 && entry.zero ? 'zero' : pluralRules.select(count);
      entry = entry[category] ?? entry.other ?? key;
    }
    return interpolate(String(entry), params, formatNumber);
  };
}
