# ADR 0003 — Browser Intl API for formatting; domain stores codes, not text

- **Status:** Accepted
- **Date:** 2026-11-14
- **Quality attribute:** Modifiability (main), correctness of localisation

## Context
The project must format dates and numbers for the chosen language (e.g. `$26,100.00` vs `26.100,00 US$` vs `٢٦٬١٠٠٫٠٠ US$`). Business data also has words in it: event types, venue names, statuses and validation errors. If those were stored as English text, every new language would need data migrations or code changes.

## Options considered
1. **Hand-written format patterns per language in the locale files** (`"dateFormat": "DD/MM/YYYY"`). Every new language must define and test its own patterns, and it is easy to get wrong.
2. **A library such as date-fns/locale or Moment.** Adds size, and still needs one locale import per language in code.
3. **The built-in `Intl` API** (`DateTimeFormat`, `NumberFormat`, `PluralRules`, `RelativeTimeFormat`), configured by the `_meta.intl` tag of each locale; the domain stores **codes** (`wedding`, `ballroom`, `errors.capacityExceeded`) that are translated only at the edge.

## Decision
Option 3. Formatters are created per locale and **cached** (`formatters.js`). Validation returns `{ key, params }` objects instead of messages. Money is always billed in the hotel currency (USD); only its *presentation* changes with language.

## Consequences
- ➕ A new language gets correct dates, numbers, currency, relative dates ("pasado mañana") and plural rules from one `intl` tag, with no code.
- ➕ Because errors are keys, an error already on screen is re-translated when the user switches language (tested).
- ➕ Saved data is language-neutral: an event created in Arabic shows correctly in French.
- ➖ Output varies slightly between browsers/ICU versions (e.g. es-ES does not group 4-digit numbers: `5137,50`); tests check patterns, not exact strings, where that matters.
- ➖ Free-text fields (event name, notes) are user data and are deliberately not translated.
