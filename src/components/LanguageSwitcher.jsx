import { useI18n } from '../i18n/I18nContext.jsx';

/** Lists whatever languages the registry discovered — no hard-coded list. */
export function LanguageSwitcher() {
  const { t, locale, locales, setLocale } = useI18n();
  return (
    <label className="lang-switcher">
      <span>{t('app.language')}</span>
      <select value={locale} onChange={(e) => setLocale(e.target.value)} data-testid="language-select">
        {locales.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>{l.name}</option>
        ))}
      </select>
    </label>
  );
}
