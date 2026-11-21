import { useI18n } from '../i18n/I18nContext.jsx';

export function SummaryBar({ summary }) {
  const { t, formatNumber, formatCurrency } = useI18n();
  const tiles = [
    { label: t('summary.upcoming'), value: formatNumber(summary.upcomingCount) },
    { label: t('summary.guests'), value: formatNumber(summary.totalGuests) },
    { label: t('summary.revenue'), value: formatCurrency(summary.estimatedRevenue) },
  ];
  return (
    <section className="summary" aria-label={t('summary.upcoming')}>
      {tiles.map((tile) => (
        <div className="tile" key={tile.label}>
          <span className="tile-value">{tile.value}</span>
          <span className="tile-label">{tile.label}</span>
        </div>
      ))}
    </section>
  );
}
