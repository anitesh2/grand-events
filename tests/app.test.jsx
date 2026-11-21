/** Integration: the real UI in every discovered language. */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import App from '../src/App.jsx';
import { I18nProvider } from '../src/i18n/I18nContext.jsx';
import { registry } from '../src/i18n/localeRegistry.js';
import { createEventService } from '../src/services/eventService.js';
import { createMemoryEventRepository } from '../src/repository/localStorageEventRepository.js';

globalThis.__APP_VERSION__ = 'test';
window.scrollTo = () => {};

function setup(locale = 'en') {
  const service = createEventService(createMemoryEventRepository(null), { now: () => new Date(2026, 10, 21) });
  return render(<I18nProvider initial={locale}><App service={service} /></I18nProvider>);
}

beforeEach(() => { cleanup(); localStorage.clear(); });

describe.each(registry.codes())('UI in %s', (code) => {
  it('renders translated text, sets lang/dir and shows sample events', () => {
    setup(code);
    const { messages, dir } = registry.get(code);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(messages.app.title);
    expect(document.documentElement.dir).toBe(dir);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});

it('creates, edits and deletes an event through the UI', () => {
  setup('en');
  fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Harbor Gala' } });
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-12-31' } });
  fireEvent.click(screen.getByText('Save event'));
  expect(screen.getByText('Harbor Gala')).toBeTruthy();
  expect(screen.getByText('4 events')).toBeTruthy();

  const card = screen.getByText('Harbor Gala').closest('li');
  fireEvent.click(within(card).getByText('Edit'));
  fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'NYE Gala' } });
  fireEvent.click(screen.getByText('Update event'));
  expect(screen.getByText('NYE Gala')).toBeTruthy();

  const card2 = screen.getByText('NYE Gala').closest('li');
  fireEvent.click(within(card2).getByText('Delete'));
  fireEvent.click(within(card2).getByText('Yes, delete'));
  expect(screen.queryByText('NYE Gala')).toBeNull();
});

it('shows translated validation errors and switches language live', () => {
  setup('en');
  fireEvent.click(screen.getByText('Save event'));
  expect(screen.getByText('Enter an event name.')).toBeTruthy();
  fireEvent.change(screen.getByTestId('language-select'), { target: { value: 'es' } });
  // Errors are stored as keys, so an already-shown error is re-translated too.
  expect(screen.getByText('Introduzca un nombre para el evento.')).toBeTruthy();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Eventos Grand Harbor');
  expect(document.documentElement.lang).toBe('es-ES');
});

it('filters by status and search', () => {
  setup('en');
  fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'confirmed' } });
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  fireEvent.change(screen.getByLabelText('Search by name or contact'), { target: { value: 'zzz' } });
  expect(screen.getByText(/No events match/)).toBeTruthy();
});
