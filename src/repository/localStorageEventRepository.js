/**
 * Repository layer: persistence of events in the browser.
 *
 * Repository interface (used by the service layer):
 *   getAll(): Event[]
 *   saveAll(events: Event[]): void
 *
 * Only this file knows that the data lives in localStorage.
 */

const STORAGE_KEY = 'grand-events.v1.events';

export function createLocalStorageEventRepository(storage = globalThis.localStorage) {
  return {
    getAll() {
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) return null; // null = never saved (first visit)
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // Corrupt data must not crash the app.
        return [];
      }
    },
    saveAll(events) {
      storage.setItem(STORAGE_KEY, JSON.stringify(events));
    },
  };
}

/** In-memory repository, used by tests. Same interface. */
export function createMemoryEventRepository(initial = null) {
  let data = initial;
  return {
    getAll: () => (data === null ? null : [...data]),
    saveAll: (events) => {
      data = [...events];
    },
  };
}
