import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { eventDateTime, estimatedRevenue } from '../domain/event.js';

export function EventCard({ event, onEdit, onDelete }) {
  const { t, formatDate, formatTime, formatCurrency, formatRelativeDays } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const when = eventDateTime(event);

  return (
    <li className={`event-card status-${event.status}`}>
      <div className="event-date">
        <span className="event-day">{formatDate(when)}</span>
        <span className="event-time">{formatTime(when)} · {formatRelativeDays(when)}</span>
      </div>
      <div className="event-body">
        <h3>{event.name}</h3>
        <p className="event-meta">
          {t(`types.${event.type}`)} · {t(`venues.${event.venue}`)}
        </p>
        <p className="event-meta">
          {t('list.guests', { count: event.guests })} · {t('list.perGuest', { price: formatCurrency(event.pricePerGuest) })}
          {' · '}<strong>{formatCurrency(estimatedRevenue(event))}</strong>
        </p>
        {event.contact && <p className="event-contact">{event.contact}</p>}
        {event.notes && <p className="event-notes">{event.notes}</p>}
      </div>
      <div className="event-side">
        <span className={`badge badge-${event.status}`}>{t(`statuses.${event.status}`)}</span>
        {confirming ? (
          <div className="confirm" role="group" aria-label={t('list.confirmDelete')}>
            <span>{t('list.confirmDelete')}</span>
            <button className="danger" onClick={() => onDelete(event.id)}>{t('list.yes')}</button>
            <button onClick={() => setConfirming(false)}>{t('list.no')}</button>
          </div>
        ) : (
          <div className="card-actions">
            <button onClick={() => onEdit(event)}>{t('list.edit')}</button>
            <button className="danger-outline" onClick={() => setConfirming(true)}>{t('list.delete')}</button>
          </div>
        )}
      </div>
    </li>
  );
}
