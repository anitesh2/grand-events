/**
 * React adapter for the i18n layer. Components call useI18n() and never
 * import locale files or Intl directly.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { registry, DEFAULT_LOCALE } from './localeRegistry.js';
import { negotiateLocale } from './registryCore.js';
import { createTranslator } from './translate.js';
import { createFormatters } from './formatters.js';
import { HOTEL_CURRENCY } from '../domain/event.js';

const LOCALE_KEY = 'grand-events.v1.locale';
const I18nContext = createContext(null);

function initialLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved && registry.get(saved)) return saved;
  } catch { /* storage unavailable */ }
  const preferred = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : [];
  return negotiateLocale(preferred, registry.codes(), DEFAULT_LOCALE);
}

export function I18nProvider({ children, initial }) {
  const [locale, setLocale] = useState(() => initial || initialLocale());

  const value = useMemo(() => {
    const current = registry.get(locale) || registry.get(DEFAULT_LOCALE);
    const fallback = registry.get(DEFAULT_LOCALE);
    const formatters = createFormatters(current.intl, HOTEL_CURRENCY);
    const t = createTranslator({
      messages: current.messages,
      fallbackMessages: fallback.messages,
      intlLocale: current.intl,
      formatNumber: formatters.formatNumber,
    });
    return {
      locale: current.code,
      dir: current.dir,
      locales: registry.list().map(({ code, name }) => ({ code, name })),
      setLocale,
      t,
      ...formatters,
    };
  }, [locale]);

  // Keep <html lang dir> in sync for screen readers and RTL layout.
  useEffect(() => {
    document.documentElement.lang = registry.get(value.locale)?.intl || value.locale;
    document.documentElement.dir = value.dir;
    document.title = value.t('app.title');
    try { localStorage.setItem(LOCALE_KEY, value.locale); } catch { /* ignore */ }
  }, [value]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
