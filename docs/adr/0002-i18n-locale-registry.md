# ADR 0002 — Languages as data files discovered by a locale registry

- **Status:** Accepted
- **Date:** 2026-11-12
- **Quality attribute:** Modifiability (main)

## Context
The key modifiability scenario is *"a developer adds a new language without changing any component."* We need to decide where translations live, how components get them, and how the app learns which languages exist. Requirements: plurals (Arabic has 6 forms), placeholders (`{capacity}`), a fallback for missing keys, and right-to-left support.

## Options considered
1. **Hard-coded strings with `if (lang === 'es')`** in components. Every new language edits every component. Rejected.
2. **The i18next / react-i18next library.** Mature and feature-rich, but adds ~40 kB, needs its own configuration, and the list of languages is still usually declared in code (`resources: { en, es }`), so a new language still edits a config file. Hides the very tactics this project must show.
3. **Our own small i18n layer: one JSON file per language, discovered at build time with Vite `import.meta.glob('./locales/*.json')`;** a pure `translate()` using `Intl.PluralRules`; components use only `useI18n()`.

## Decision
Option 3. The tactics behind it:
- **Use an intermediary / encapsulate:** components call `t('key')` and `formatDate()` and never import locale files or `Intl` themselves.
- **Defer binding to build time:** the registry finds languages by file name, so no code lists them; the switcher shows whatever the registry found.
- **Abstract common services:** one `translate.js` for lookup, interpolation, plurals and fallback, used everywhere.
- **Self-describing data:** each file has `_meta` (`name`, `intl`, `dir`), so even RTL needs no code change.

## Consequences
- ➕ **Measured:** French and Arabic were each added as a commit that changes **1 file and 0 source-code files** (see report §6).
- ➕ About 120 lines of our own code; no runtime dependency; fully unit-tested.
- ➖ No ICU message syntax (gender/select) or lazy loading of languages; all locales are bundled (≈ 3 kB gzip each). If the app grew to dozens of languages, we would switch to dynamic `import()` behind the same `useI18n()` interface, again with no component changes.
- ➖ Depends on a Vite feature (`import.meta.glob`); moving to another bundler would change one file (`localeRegistry.js`).
