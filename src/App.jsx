import { useState } from 'react';
import { useI18n } from './i18n/I18nContext.jsx';
import { useEvents } from './hooks/useEvents.js';
import { LanguageSwitcher } from './components/LanguageSwitcher.jsx';
import { SummaryBar } from './components/SummaryBar.jsx';
import { EventForm } from './components/EventForm.jsx';
import { EventList } from './components/EventList.jsx';

export default function App({ service }) {
  const { t } = useI18n();
  const { events, summary, filter, setFilter, save, remove } = useEvents(service);
  const [editing, setEditing] = useState(null);

  const handleSave = (event) => {
    const result = save(event);
    if (result.ok) setEditing(null);
    return result;
  };

  const handleEdit = (event) => {
    setEditing(event);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <a className="skip-link" href="#events">{t('app.skip')}</a>
      <header className="app-header">
        <div className="brand">
          <span className="logo" aria-hidden="true">🛎️</span>
          <div>
            <h1>{t('app.title')}</h1>
            <p>{t('app.subtitle')}</p>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      <main>
        <SummaryBar summary={summary} />
        <div className="layout">
          <EventForm editing={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
          <EventList
            events={events}
            filter={filter}
            onFilterChange={setFilter}
            onEdit={handleEdit}
            onDelete={(id) => { remove(id); if (editing?.id === id) setEditing(null); }}
          />
        </div>
      </main>

      <footer className="app-footer">
        <span>{t('footer.storage')}</span>
        <span>{t('footer.version', { version: __APP_VERSION__ })}</span>
      </footer>
    </>
  );
}
