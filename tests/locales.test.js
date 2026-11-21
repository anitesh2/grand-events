/**
 * Fitness functions for the main quality attribute (modifiability):
 * every language file must offer exactly the same keys as English, and
 * plural entries must cover the forms the language needs.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(__dirname, '../src/i18n/locales');
const load = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const en = load('en.json');

function leafKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    if (k === '_meta') return [];
    const key = prefix ? `${prefix}.${k}` : k;
    const isPlural = v && typeof v === 'object' && 'other' in v;
    return v && typeof v === 'object' && !isPlural ? leafKeys(v, key) : [key];
  });
}

describe.each(files)('locale %s', (file) => {
  const messages = load(file);
  it('has valid _meta', () => {
    expect(messages._meta.name).toBeTruthy();
    expect(() => new Intl.DateTimeFormat(messages._meta.intl)).not.toThrow();
    expect(['ltr', 'rtl']).toContain(messages._meta.dir);
  });
  it('has exactly the same keys as en.json', () => {
    expect(leafKeys(messages).sort()).toEqual(leafKeys(en).sort());
  });
  it('plural entries cover every plural category of the language', () => {
    // Categories reachable by realistic counts (0..10 000). Rare forms such as
    // Spanish 'many' (only for 1 000 000) safely fall back to 'other'.
    const rules = new Intl.PluralRules(messages._meta.intl);
    const categories = [...new Set(Array.from({ length: 10001 }, (_, i) => rules.select(i)))];
    for (const key of leafKeys(messages)) {
      const value = key.split('.').reduce((n, p) => n[p], messages);
      if (typeof value === 'object') for (const c of categories) expect(value, `${key}.${c}`).toHaveProperty(c);
    }
  });
  it('keeps the same {placeholders} as English', () => {
    for (const key of leafKeys(en)) {
      const get = (m) => JSON.stringify(key.split('.').reduce((n, p) => n[p], m));
      const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().filter((v, i, a) => a.indexOf(v) === i);
      expect(ph(get(messages)), key).toEqual(ph(get(en)));
    }
  });
});
