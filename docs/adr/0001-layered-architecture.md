# ADR 0001 — Layered architecture with a composition root

- **Status:** Accepted
- **Date:** 2026-11-08
- **Quality attribute:** Modifiability (supports testability)

## Context
The app must let hotel staff create, edit and list events, show them in several languages and keep the data in the browser. The main quality attribute is **modifiability**: the course requires that a new language can be added without changing components. Even in a small React app, mixing storage, validation, text and rendering in components would make every change touch many files.

## Options considered
1. **Everything in React components** (state, localStorage calls, validation, text). Fastest to write, but every change spreads across components, and nothing can be tested without rendering.
2. **Layers: UI → service → repository, plus separate domain and i18n modules** wired together in one composition root (`main.jsx`).
3. **A state-management library (Redux/Zustand) with slices.** Gives structure but adds a dependency and ceremony the app does not need, and does nothing for i18n by itself.

## Decision
Option 2. The layers and their allowed dependencies:

| Layer | Folder | May depend on |
|---|---|---|
| UI components | `src/components`, `src/App.jsx` | hooks, i18n (via `useI18n`), domain constants |
| Hook adapter | `src/hooks` | service interface |
| Service | `src/services` | repository interface, domain |
| Repository | `src/repository` | browser storage only |
| Domain | `src/domain` | nothing |
| i18n | `src/i18n` | locale data, `Intl` |

Concrete objects are created only in `main.jsx`, and the service gets its repository through **dependency injection**.

## Consequences
- ➕ Each kind of change has one home: a language → `locales/`, a storage engine → `repository/` plus one line in `main.jsx`, a business rule → `domain/`.
- ➕ The service and domain are tested with an in-memory repository and no DOM (49 tests, 98.8% line coverage).
- ➖ More files than a single-component app; a newcomer must learn where things live (mitigated by the README table).
- ➖ The rule "components don't touch storage" is a convention; only the text rule is enforced automatically (see ADR 0004).
