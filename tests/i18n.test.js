import { describe, it, expect } from 'vitest';
import { createTranslator } from '../src/i18n/translate.js';
import { createFormatters } from '../src/i18n/formatters.js';
import { buildRegistry, negotiateLocale } from '../src/i18n/registryCore.js';

describe('translator', () => {
  const t = createTranslator({
    messages: { a: { b: 'Hola {name}' }, n: { one: '{count} invitado', other: '{count} invitados' } },
    fallbackMessages: { only: 'English only' },
    intlLocale: 'es-ES',
    formatNumber: (n) => new Intl.NumberFormat('es-ES').format(n),
  });
  it('looks up dotted keys and interpolates', () => expect(t('a.b', { name: 'Ana' })).toBe('Hola Ana'));
  it('chooses plural forms', () => {
    expect(t('n', { count: 1 })).toBe('1 invitado');
    expect(t('n', { count: 12000 })).toBe('12.000 invitados');
  });
  it('falls back to default language, then to the key', () => {
    expect(t('only')).toBe('English only');
    expect(t('missing.key')).toBe('missing.key');
  });
  it('handles Arabic plural categories', () => {
    const ar = createTranslator({
      messages: { n: { zero: 'z', one: 'o', two: 't', few: 'f', many: 'm', other: 'x' } },
      intlLocale: 'ar',
    });
    expect([0, 1, 2, 3, 11, 100].map((c) => ar('n', { count: c }))).toEqual(['z', 'o', 't', 'f', 'm', 'x']);
  });
});

describe('formatters', () => {
  const d = new Date(2026, 11, 3, 17, 30);
  it('formats per locale', () => {
    const en = createFormatters('en-US', 'USD');
    const es = createFormatters('es-ES', 'USD');
    expect(en.formatCurrency(26100)).toBe('$26,100.00');
    expect(es.formatCurrency(26100)).toMatch(/26\.100,00\s?US\$/);
    expect(en.formatDate(d)).toContain('December');
    expect(es.formatDate(d)).toContain('diciembre');
    expect(en.formatTime(d)).toMatch(/5:30\sPM/);
    expect(es.formatTime(d)).toBe('17:30');
  });
  it('formats relative days', () => {
    const en = createFormatters('en-US', 'USD');
    expect(en.formatRelativeDays(new Date(2026, 0, 2), new Date(2026, 0, 1, 15))).toBe('tomorrow');
    expect(en.formatRelativeDays(new Date(2026, 0, 6), new Date(2026, 0, 1))).toBe('in 5 days');
  });
});

describe('registry', () => {
  const reg = buildRegistry({
    './locales/en.json': { default: { _meta: { name: 'English', intl: 'en-US' } } },
    './locales/xx.json': { default: { _meta: { name: 'Test', dir: 'rtl' } } },
  });
  it('discovers locales from file names', () => {
    expect(reg.codes()).toEqual(['en', 'xx']);
    expect(reg.get('xx')).toMatchObject({ name: 'Test', dir: 'rtl', intl: 'xx' });
    expect(reg.get('zz')).toBeNull();
  });
  it('negotiates browser preferences', () => {
    expect(negotiateLocale(['es-MX', 'en'], ['en', 'es'], 'en')).toBe('es');
    expect(negotiateLocale(['de-DE'], ['en', 'es'], 'en')).toBe('en');
    expect(negotiateLocale(undefined, ['en'], 'en')).toBe('en');
  });
});
