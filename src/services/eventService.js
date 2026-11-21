/**
 * Service layer: use cases for hotel events.
 * Depends on a repository (injected) and on the domain module.
 * Knows nothing about React, languages or storage technology.
 */
import { validateEvent, estimatedRevenue, eventDateTime } from '../domain/event.js';
import { sampleEvents } from '../domain/sampleEvents.js';

export function createEventService(repository, { idGenerator, now = () => new Date() } = {}) {
  const newId = idGenerator || (() => `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`);

  function load() {
    const stored = repository.getAll();
    if (stored === null) {
      // First visit: seed demo data so the planner is not empty.
      const seeded = sampleEvents(now());
      repository.saveAll(seeded);
      return seeded;
    }
    return stored;
  }

  return {
    /** All events sorted by date, optionally filtered. */
    list({ status = 'all', query = '' } = {}) {
      const q = query.trim().toLowerCase();
      return load()
        .filter((e) => status === 'all' || e.status === status)
        .filter((e) => !q || e.name.toLowerCase().includes(q) || (e.contact || '').toLowerCase().includes(q))
        .sort((a, b) => eventDateTime(a) - eventDateTime(b));
    },

    get(id) {
      return load().find((e) => e.id === id) || null;
    },

    /** Creates or updates. Returns { ok, errors, event }. */
    save(input) {
      const event = {
        ...input,
        name: (input.name || '').trim(),
        guests: Number(input.guests),
        pricePerGuest: Number(input.pricePerGuest),
      };
      const errors = validateEvent(event);
      if (Object.keys(errors).length > 0) return { ok: false, errors, event };

      const events = load();
      if (event.id) {
        const index = events.findIndex((e) => e.id === event.id);
        if (index === -1) return { ok: false, errors: { id: { key: 'errors.notFound' } }, event };
        events[index] = event;
      } else {
        event.id = newId();
        events.push(event);
      }
      repository.saveAll(events);
      return { ok: true, errors: {}, event };
    },

    remove(id) {
      const events = load();
      const next = events.filter((e) => e.id !== id);
      repository.saveAll(next);
      return next.length !== events.length;
    },

    /** Numbers for the summary bar: upcoming non-cancelled events. */
    summary() {
      const today = now();
      today.setHours(0, 0, 0, 0);
      const upcoming = load().filter((e) => e.status !== 'cancelled' && eventDateTime(e) >= today);
      return {
        upcomingCount: upcoming.length,
        totalGuests: upcoming.reduce((sum, e) => sum + Number(e.guests), 0),
        estimatedRevenue: upcoming.reduce((sum, e) => sum + estimatedRevenue(e), 0),
      };
    },
  };
}
