/**
 * Locale-aware formatting built on the browser's Intl API.
 * Formatter objects are cached per locale because constructing
 * Intl.*Format is relatively expensive.
 */
const cache = new Map();

function cached(key, factory) {
  if (!cache.has(key)) cache.set(key, factory());
  return cache.get(key);
}

export function createFormatters(intlLocale, currency) {
  const dateFmt = cached(`d|${intlLocale}`, () =>
    new Intl.DateTimeFormat(intlLocale, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }));
  const timeFmt = cached(`t|${intlLocale}`, () =>
    new Intl.DateTimeFormat(intlLocale, { hour: 'numeric', minute: '2-digit' }));
  const numFmt = cached(`n|${intlLocale}`, () => new Intl.NumberFormat(intlLocale));
  const curFmt = cached(`c|${intlLocale}|${currency}`, () =>
    new Intl.NumberFormat(intlLocale, { style: 'currency', currency }));
  const relFmt = cached(`r|${intlLocale}`, () => new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' }));

  return {
    formatDate: (date) => dateFmt.format(date),
    formatTime: (date) => timeFmt.format(date),
    formatNumber: (n) => numFmt.format(n),
    formatCurrency: (n) => curFmt.format(n),
    /** "in 3 days", "tomorrow", "dentro de 3 días" ... */
    formatRelativeDays: (date, now = new Date()) => {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const target = new Date(date);
      target.setHours(0, 0, 0, 0);
      const days = Math.round((target - start) / 86400000);
      return relFmt.format(days, 'day');
    },
  };
}
