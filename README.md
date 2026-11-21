# 🛎️ Grand Harbor Events: multilingual hotel event planner

CMPS 570 Software Architecture, Final Individual Project.
Catalogue project **#12 Multilingual Event Planner**, set in a hotel banquet and events office.
**Main quality attribute: modifiability.** A new language can be added without changing any component.

- **Live app:** `https://<your-username>.github.io/grand-events-planner/` *(replace after deploying)*
- **Report:** *(link)*  ·  **Demo video:** *(link)*

## What the app does
Event coordinators at a hotel plan weddings, conferences, banquets, business meetings and gala dinners:

- **Create, edit, delete and list events**: name, type, venue, date and time, guests, price per guest, client contact, status and notes.
- **Venue capacity check** (e.g. the Executive Boardroom seats 20) and a live **estimated total**.
- **Schedule** sorted by date, with **search** and a **status filter** (inquiry, tentative, confirmed, cancelled).
- **Summary tiles**: upcoming events, expected guests and estimated revenue.
- **4 languages**: English, Español, Français and العربية (right-to-left). You can switch at any time; the choice is remembered, and the first visit follows the browser language.
- **Locale-aware formatting** of dates, times, numbers, currency, relative dates ("in 5 days" / "dentro de 5 días") and plurals.
- **Data saved in the browser** (localStorage). Sample events are added on the first visit.
- Responsive (desktop and phone) and keyboard accessible: skip link, visible focus, labelled fields, and errors announced to screen readers.

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 49 tests: unit, integration, architecture fitness
npm run coverage   # coverage report in ./coverage
npm run build      # production build in ./dist
```

## Architecture in one paragraph
The app is a React SPA split into **layers**. **UI components** render data and call `useI18n()` for every piece of text and formatting. A **hook adapter** (`useEvents`) connects them to the **service layer** (`eventService`), which holds the use cases (list, filter, save, delete, summary). The service talks to a **repository interface** whose localStorage implementation is the only code that knows where data is stored. A pure **domain module** holds event rules and stores codes (`wedding`, `errors.capacityExceeded`) rather than text. The **i18n layer** finds languages at build time from `src/i18n/locales/*.json` through a **locale registry**. It translates with plural rules and English fallback, and formats with the browser's `Intl` API. Everything is wired in one **composition root** (`main.jsx`). **Fitness tests** in the CI pipeline block deployment if a component contains hard-coded text or a language file is missing keys. The app is deployed as static files to GitHub Pages by GitHub Actions.

| Folder | Responsibility |
|---|---|
| `src/components`, `src/App.jsx` | UI (no literal text, no storage) |
| `src/hooks` | React ↔ service adapter |
| `src/services` | Use cases |
| `src/repository` | localStorage persistence (plus an in-memory version for tests) |
| `src/domain` | Event model, venues, validation and sample data |
| `src/i18n` | Locale registry, translator, `Intl` formatters, React provider |
| `src/i18n/locales` | **One JSON file per language** |
| `tests` | Unit, integration and fitness tests |
| `docs/adr` | Architecture Decision Records |

## Adding a language (the modifiability scenario)
1. Copy `src/i18n/locales/en.json` to `src/i18n/locales/<code>.json` (e.g. `de.json`).
2. Set `_meta`: `{ "name": "Deutsch", "intl": "de-DE", "dir": "ltr" }` (`"rtl"` for Arabic, Hebrew and so on).
3. Translate the values. For plural entries, provide every form the language uses (the test tells you which).
4. Run `npm test`. If keys or plural forms are missing, the test names them.
5. Commit and push. The pipeline tests, builds and deploys, and the new language appears in the switcher.

No component, service or configuration file changes. See commits *"Add French"* and *"Add Arabic"*, each of which changes exactly one file.

## Deploy (GitHub Pages)
1. Push this repository to GitHub as **public**.
2. Go to **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` (test → build → deploy).

`base: './'` in `vite.config.js` means the same build also works on Netlify or Vercel (build command `npm run build`, output folder `dist`).

## Architecture decisions
- [ADR 0001: Layered architecture with a composition root](docs/adr/0001-layered-architecture.md)
- [ADR 0002: Languages as data files discovered by a locale registry](docs/adr/0002-i18n-locale-registry.md)
- [ADR 0003: Browser Intl API for formatting; domain stores codes, not text](docs/adr/0003-intl-formatting-and-codes.md)
- [ADR 0004: Architecture fitness tests gate every deployment](docs/adr/0004-fitness-functions-ci.md)

## Tools, libraries and AI assistance
- React 18, Vite 5, Vitest 2, Testing Library, jsdom, @babel/parser (in the fitness test) and @vitest/coverage-v8.
- GitHub Actions and GitHub Pages.
- **AI assistant:** Claude (Anthropic) was used to scaffold the code, tests, ADRs and report draft, and to draft the French and Arabic translations. *(Edit this to describe exactly how you used it. Translations should ideally be checked by a native speaker.)*
