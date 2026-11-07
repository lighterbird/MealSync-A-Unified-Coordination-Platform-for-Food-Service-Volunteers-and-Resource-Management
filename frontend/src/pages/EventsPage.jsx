// Published event search/filter, details and volunteer registration.
// DEMO DATA BOUNDARY: reads/writes use AppContext's in-memory seeded records. Replace these calls with the agreed Flask API; see docs/FRONTEND_TASKS_BY_PERSON.md.
import { useMemo, useState } from 'react';
import Button from '../components/Button';
import { DemoBanner, EventCard, PageHeading, SearchFilterRow } from '../components/Shared';
import { useMealSync } from '../context/AppContext';

export default function EventsPage() {
  const { data, globalSearch, navigate, registerEvent, unregisterEvent, openModal } = useMealSync();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const categories = ['Meal service', 'Meal preparation', 'Food packing', 'Food distribution', 'Community meal'];
  const locations = ['Mumbai', 'Thane'];
  const filtered = useMemo(() => data.events.filter((event) => {
    if (event.status === 'Cancelled') return false;
    const text = [event.title, event.org, event.category, event.place, (event.skills || []).join(' ')].join(' ').toLowerCase();
    const q = `${query} ${globalSearch}`.trim().toLowerCase();
    return (!q || text.includes(q)) && (category === 'all' || event.category.toLowerCase() === category.toLowerCase()) && (location === 'all' || event.place.toLowerCase().includes(location.toLowerCase()));
  }), [data.events, query, globalSearch, category, location]);
  const details = (event) => openModal({ title: event.title, subtitle: `${event.org} · ${event.place}`, message: `${event.description}\n\nDate: ${event.date}\nTime: ${event.start}–${event.end}\nRequired skills: ${(event.skills || []).join(', ')}\nVolunteers: ${event.volunteers}/${event.needed}\nPlanned meals: ${event.meals}`, submitLabel: 'Close' });
  return <><DemoBanner/><PageHeading title="Events & registrations" subtitle="Browse published community food events and register for opportunities that fit." actions={<Button onClick={() => navigate('opportunities')}>Browse all opportunities ↗</Button>}/>
    <section className="card card-pad"><SearchFilterRow search={query} onSearch={setQuery} filters={[{ label: 'Categories', value: category, onChange: setCategory, options: categories }, { label: 'Locations', value: location, onChange: setLocation, options: locations }]} resultCount={filtered.length}/><div className="event-list section-spacer">{filtered.length ? filtered.map((event) => <EventCard key={event.id} event={event} onDetails={details} registered={data.registeredEventIds.includes(event.id)} onRegister={(selected) => data.registeredEventIds.includes(selected.id) ? unregisterEvent(selected.id) : registerEvent(selected.id)}/>) : <div className="empty-note"><strong>No events found</strong><span>Change the filters or publish an event from the Organization workspace.</span></div>}</div></section>
  </>;
}
