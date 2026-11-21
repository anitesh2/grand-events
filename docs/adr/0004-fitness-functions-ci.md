# ADR 0004 — Architecture fitness tests gate every deployment

- **Status:** Accepted
- **Date:** 2026-11-18
- **Quality attribute:** Modifiability (keeps it true over time), deployability

## Context
The modifiability in ADRs 0002–0003 depends on rules that are easy to break by accident: a developer types `<button>Save</button>` instead of `t('form.save')`, or a translator forgets a key. These errors do not crash the app; they quietly show English or a raw key. We need to find them **before** users do.

## Options considered
1. **Code review only.** Relies on people noticing; nothing is measured.
2. **ESLint plugin (eslint-plugin-i18next).** Good, but needs extra configuration and does not check that locale files match each other.
3. **Our own fitness tests in Vitest, run in the GitHub Actions pipeline before build and deploy.**

## Decision
Option 3, with three automated rules:
1. **No hard-coded text:** `noHardcodedText.test.js` parses every `.jsx` file with `@babel/parser` and fails on any JSX text node or `placeholder/aria-label/title/alt` string that contains letters.
2. **Locale parity:** `locales.test.js` checks that every locale has exactly the same keys as `en.json`, the same `{placeholders}`, valid `_meta`, and every plural form its language needs (taken from `Intl.PluralRules`).
3. **UI in every language:** `app.test.jsx` renders the real app once per discovered locale and checks the title, `dir` and the event list.

The workflow `.github/workflows/deploy.yml` runs `npm test` → `npm run build` → deploy to GitHub Pages; a failing test stops the deploy.

## Consequences
- ➕ Verified: injecting `title="Totals"` into a component, or deleting one key from `fr.json`, makes the build fail (report §6).
- ➕ New locales are tested automatically; the test suite needs no edits when a language is added.
- ➖ The regex-free AST check still cannot catch text built inside JS strings (e.g. `const label = 'Save'`); this is accepted as a known limit.
- ➖ CI adds roughly a minute before each deploy.
