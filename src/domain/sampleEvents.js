/**
 * Demo data shown on first visit. Event names are proper names entered by
 * staff, so they are not translated (just like real user data).
 */
function isoDatePlusDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function sampleEvents(now = new Date()) {
  return [
    {
      id: 'sample_1', name: 'Okafor – Martín Wedding', type: 'wedding', venue: 'ballroom',
      date: isoDatePlusDays(now, 12), time: '17:30', guests: 180, pricePerGuest: 145,
      contact: 'amara.okafor@example.com', status: 'confirmed', notes: 'Vegetarian menu for 30 guests.',
    },
    {
      id: 'sample_2', name: 'Nordic Fintech Summit', type: 'conference', venue: 'harborView',
      date: isoDatePlusDays(now, 5), time: '09:00', guests: 75, pricePerGuest: 68.5,
      contact: 'events@nordicfintech.example', status: 'tentative', notes: 'Projector and 4 wireless mics.',
    },
    {
      id: 'sample_3', name: 'Board Meeting – Coastal Logistics', type: 'meeting', venue: 'boardroom',
      date: isoDatePlusDays(now, 2), time: '14:00', guests: 14, pricePerGuest: 42,
      contact: 'l.chen@coastal.example', status: 'inquiry', notes: '',
    },
  ];
}
