import { describe, it, expect } from 'vitest';
import { createEventService } from '../src/services/eventService.js';
import { createMemoryEventRepository, createLocalStorageEventRepository } from '../src/repository/localStorageEventRepository.js';
import { validateEvent, emptyEvent, estimatedRevenue } from '../src/domain/event.js';

const NOW = () => new Date(2026, 10, 21, 12);
let n = 0;
const make = (initial = []) => createEventService(createMemoryEventRepository(initial), { now: NOW, idGenerator: () => `id${++n}` });
const valid = (over = {}) => ({ ...emptyEvent(), name: 'Gala', date: '2026-12-01', ...over });

describe('domain validation', () => {
  it('returns translation keys, not text', () => {
    const errors = validateEvent({ ...emptyEvent(), guests: 0, pricePerGuest: -1 });
    expect(errors.name.key).toBe('errors.nameRequired');
    expect(errors.date.key).toBe('errors.dateRequired');
    expect(errors.guests.key).toBe('errors.guestsInvalid');
    expect(errors.pricePerGuest.key).toBe('errors.priceInvalid');
  });
  it('enforces venue capacity', () => {
    expect(validateEvent(valid({ venue: 'boardroom', guests: 21 })).guests)
      .toEqual({ key: 'errors.capacityExceeded', params: { capacity: 20 } });
    expect(validateEvent(valid({ venue: 'boardroom', guests: 20 }))).toEqual({});
  });
  it('rejects unknown codes', () => {
    expect(validateEvent(valid({ type: 'rave', status: 'x' }))).toMatchObject({ type: {}, status: {} });
  });
  it('computes revenue', () => expect(estimatedRevenue({ guests: 10, pricePerGuest: 12.5 })).toBe(125));
});

describe('event service', () => {
  it('seeds sample events on first visit only', () => {
    const repo = createMemoryEventRepository(null);
    const s = createEventService(repo, { now: NOW });
    expect(s.list()).toHaveLength(3);
    s.remove('sample_1');
    expect(createEventService(repo, { now: NOW }).list()).toHaveLength(2);
  });
  it('creates, updates, gets and deletes', () => {
    const s = make();
    const { ok, event } = s.save(valid({ guests: '40' }));
    expect(ok).toBe(true);
    expect(event.guests).toBe(40);
    expect(s.save({ ...event, name: '  Gala 2  ' }).ok).toBe(true);
    expect(s.get(event.id).name).toBe('Gala 2');
    expect(s.remove(event.id)).toBe(true);
    expect(s.get(event.id)).toBeNull();
    expect(s.remove('nope')).toBe(false);
  });
  it('does not save invalid events', () => {
    const s = make();
    expect(s.save(valid({ name: '' })).ok).toBe(false);
    expect(s.list()).toHaveLength(0);
    expect(s.save(valid({ id: 'ghost' })).errors.id.key).toBe('errors.notFound');
  });
  it('sorts by date and filters by status and text', () => {
    const s = make();
    s.save(valid({ name: 'Late', date: '2026-12-20', status: 'confirmed' }));
    s.save(valid({ name: 'Early', date: '2026-11-25', contact: 'ana@x.com' }));
    expect(s.list().map((e) => e.name)).toEqual(['Early', 'Late']);
    expect(s.list({ status: 'confirmed' }).map((e) => e.name)).toEqual(['Late']);
    expect(s.list({ query: 'ANA@' }).map((e) => e.name)).toEqual(['Early']);
  });
  it('summarises upcoming, non-cancelled events', () => {
    const s = make();
    s.save(valid({ date: '2026-12-01', guests: 10, pricePerGuest: 100 }));
    s.save(valid({ date: '2026-12-02', guests: 5, pricePerGuest: 10, status: 'cancelled' }));
    s.save(valid({ date: '2026-01-01', guests: 7, pricePerGuest: 10 }));
    expect(s.summary()).toEqual({ upcomingCount: 1, totalGuests: 10, estimatedRevenue: 1000 });
  });
});

describe('localStorage repository', () => {
  it('round-trips and survives corrupt data', () => {
    const store = {};
    const storage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; } };
    const repo = createLocalStorageEventRepository(storage);
    expect(repo.getAll()).toBeNull();
    repo.saveAll([{ id: 1 }]);
    expect(repo.getAll()).toEqual([{ id: 1 }]);
    store['grand-events.v1.events'] = '{bad json';
    expect(repo.getAll()).toEqual([]);
    store['grand-events.v1.events'] = '{"a":1}';
    expect(repo.getAll()).toEqual([]);
  });
});
