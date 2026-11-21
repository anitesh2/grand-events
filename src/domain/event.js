/**
 * Domain layer: hotel event model, reference data and validation.
 *
 * This module contains NO user-visible text. Everything that the user sees
 * is expressed as a code (e.g. type 'wedding', error 'errors.capacityExceeded')
 * and translated by the i18n layer. That is what lets a new language be added
 * without touching the domain or the UI components.
 */

export const EVENT_TYPES = ['wedding', 'conference', 'banquet', 'meeting', 'gala'];

export const STATUSES = ['inquiry', 'tentative', 'confirmed', 'cancelled'];

/** Function rooms of the hotel, with seated capacity. */
export const VENUES = [
  { id: 'ballroom', capacity: 300 },
  { id: 'terrace', capacity: 120 },
  { id: 'harborView', capacity: 80 },
  { id: 'boardroom', capacity: 20 },
];

/** Currency the hotel bills in. Formatting follows the chosen language. */
export const HOTEL_CURRENCY = 'USD';

export function venueCapacity(venueId) {
  const venue = VENUES.find((v) => v.id === venueId);
  return venue ? venue.capacity : 0;
}

export function emptyEvent() {
  return {
    id: null,
    name: '',
    type: 'wedding',
    venue: 'ballroom',
    date: '',
    time: '18:00',
    guests: 50,
    pricePerGuest: 85,
    contact: '',
    status: 'inquiry',
    notes: '',
  };
}

/**
 * Validates an event. Returns an object mapping field -> { key, params }
 * where key is a translation key. Empty object means valid.
 */
export function validateEvent(event) {
  const errors = {};
  if (!event.name || !event.name.trim()) {
    errors.name = { key: 'errors.nameRequired' };
  }
  if (!event.date || Number.isNaN(Date.parse(event.date))) {
    errors.date = { key: 'errors.dateRequired' };
  }
  const guests = Number(event.guests);
  if (!Number.isInteger(guests) || guests < 1) {
    errors.guests = { key: 'errors.guestsInvalid' };
  } else if (guests > venueCapacity(event.venue)) {
    errors.guests = {
      key: 'errors.capacityExceeded',
      params: { capacity: venueCapacity(event.venue) },
    };
  }
  const price = Number(event.pricePerGuest);
  if (Number.isNaN(price) || price < 0) {
    errors.pricePerGuest = { key: 'errors.priceInvalid' };
  }
  if (!EVENT_TYPES.includes(event.type)) errors.type = { key: 'errors.invalid' };
  if (!STATUSES.includes(event.status)) errors.status = { key: 'errors.invalid' };
  return errors;
}

/** Estimated revenue of an event (guests × price per guest). */
export function estimatedRevenue(event) {
  return Number(event.guests) * Number(event.pricePerGuest);
}

/** Combines date + time into a Date object (local time). */
export function eventDateTime(event) {
  return new Date(`${event.date}T${event.time || '00:00'}`);
}
