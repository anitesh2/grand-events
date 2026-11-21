import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { EVENT_TYPES, STATUSES, VENUES, emptyEvent, estimatedRevenue } from '../domain/event.js';

export function EventForm({ editing, onSave, onCancel }) {
  const { t, formatCurrency } = useI18n();
  const [draft, setDraft] = useState(editing || emptyEvent());
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDraft(editing || emptyEvent());
    setErrors({});
    setMessage('');
  }, [editing]);

  const set = (field) => (e) => setDraft({ ...draft, [field]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const result = onSave(draft);
    if (result.ok) {
      setDraft(emptyEvent());
      setErrors({});
      setMessage(t('form.saved'));
    } else {
      setErrors(result.errors);
      setMessage(t('form.fixErrors'));
    }
  }

  const err = (field) =>
    errors[field] ? (
      <span className="field-error" id={`${field}-error`}>{t(errors[field].key, errors[field].params)}</span>
    ) : null;
  const aria = (field) =>
    errors[field] ? { 'aria-invalid': true, 'aria-describedby': `${field}-error` } : {};

  const total = estimatedRevenue(draft);

  return (
    <form className="card event-form" onSubmit={submit} noValidate>
      <h2>{editing ? t('form.editTitle') : t('form.newTitle')}</h2>

      <label>
        <span>{t('form.name')}</span>
        <input value={draft.name} onChange={set('name')} placeholder={t('form.namePlaceholder')} {...aria('name')} />
        {err('name')}
      </label>

      <div className="row">
        <label>
          <span>{t('form.type')}</span>
          <select value={draft.type} onChange={set('type')}>
            {EVENT_TYPES.map((type) => <option key={type} value={type}>{t(`types.${type}`)}</option>)}
          </select>
        </label>
        <label>
          <span>{t('form.status')}</span>
          <select value={draft.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s} value={s}>{t(`statuses.${s}`)}</option>)}
          </select>
        </label>
      </div>

      <label>
        <span>{t('form.venue')}</span>
        <select value={draft.venue} onChange={set('venue')}>
          {VENUES.map((v) => (
            <option key={v.id} value={v.id}>
              {t('form.venueOption', { venue: t(`venues.${v.id}`), capacity: v.capacity })}
            </option>
          ))}
        </select>
      </label>

      <div className="row">
        <label>
          <span>{t('form.date')}</span>
          <input type="date" value={draft.date} onChange={set('date')} {...aria('date')} />
          {err('date')}
        </label>
        <label>
          <span>{t('form.time')}</span>
          <input type="time" value={draft.time} onChange={set('time')} />
        </label>
      </div>

      <div className="row">
        <label>
          <span>{t('form.guests')}</span>
          <input type="number" min="1" step="1" value={draft.guests} onChange={set('guests')} {...aria('guests')} />
          {err('guests')}
        </label>
        <label>
          <span>{t('form.pricePerGuest')}</span>
          <input type="number" min="0" step="0.5" value={draft.pricePerGuest} onChange={set('pricePerGuest')} {...aria('pricePerGuest')} />
          {err('pricePerGuest')}
        </label>
      </div>

      <label>
        <span>{t('form.contact')}</span>
        <input value={draft.contact} onChange={set('contact')} placeholder={t('form.contactPlaceholder')} />
      </label>

      <label>
        <span>{t('form.notes')}</span>
        <textarea rows="2" value={draft.notes} onChange={set('notes')} />
      </label>

      <p className="estimate">
        {t('form.estimate', { amount: Number.isFinite(total) ? formatCurrency(total) : '—' })}
      </p>

      <div className="actions">
        <button type="submit" className="primary">{editing ? t('form.update') : t('form.save')}</button>
        {editing && <button type="button" onClick={onCancel}>{t('form.cancel')}</button>}
      </div>
      <p className="status-message" role="status" aria-live="polite">{message}</p>
    </form>
  );
}
