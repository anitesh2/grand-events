import { useI18n } from '../i18n/I18nContext.jsx';
import { STATUSES } from '../domain/event.js';
import { EventCard } from './EventCard.jsx';

export function EventList({ events, filter, onFilterChange, onEdit, onDelete }) {
  const { t } = useI18n();
  return (
    <section className="card event-list" id="events" aria-labelledby="events-heading">
      <div className="list-header">
        <h2 id="events-heading">{t('list.heading')}</h2>
        <span className="count">{t('list.count', { count: events.length })}</span>
      </div>
      <div className="filters">
        <input
          type="search"
          aria-label={t('list.search')}
          placeholder={t('list.search')}
          value={filter.query}
          onChange={(e) => onFilterChange({ ...filter, query: e.target.value })}
        />
        <select
          aria-label={t('list.filterStatus')}
          value={filter.status}
          onChange={(e) => onFilterChange({ ...filter, status: e.target.value })}
        >
          <option value="all">{t('list.all')}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{t(`statuses.${s}`)}</option>)}
        </select>
      </div>
      {events.length === 0 ? (
        <p className="empty">{t('list.empty')}</p>
      ) : (
        <ul className="events">
          {events.map((e) => <EventCard key={e.id} event={e} onEdit={onEdit} onDelete={onDelete} />)}
        </ul>
      )}
    </section>
  );
}
