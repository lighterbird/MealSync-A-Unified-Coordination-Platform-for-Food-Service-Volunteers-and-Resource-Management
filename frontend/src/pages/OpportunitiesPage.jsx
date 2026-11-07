// Internal event discovery plus synthetic external listing placeholders.
// DEMO DATA BOUNDARY: reads/writes use AppContext's in-memory seeded records. Replace these calls with the agreed Flask API; see docs/FRONTEND_TASKS_BY_PERSON.md.
import { useMemo, useState } from 'react';
import Button from '../components/Button';
import { DemoBanner, EventCard, PageHeading, Pill, SearchFilterRow, SectionCard } from '../components/Shared';
import { useMealSync } from '../context/AppContext';
import { demoExternalOpportunities } from '../data/demoData';

export default function OpportunitiesPage() {
  const { data, globalSearch, openModal, addActivity, showToast, registerEvent, unregisterEvent } = useMealSync();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const cats = ['Food packing', 'Meal preparation', 'Food distribution', 'Cleaning', 'Meal service', 'Community meal'];
  const locations = ['Mumbai', 'Pune', 'Navi Mumbai', 'Thane'];
  const internal = data.events.filter((event) => event.status === 'Published').map((event) => ({ ...event, kind: 'event', source: 'MealSync event' }));
  const combined = [...internal, ...demoExternalOpportunities];
  const filtered = useMemo(() => combined.filter((item) => {
    const text = [item.title, item.org, item.category, item.place, (item.skills || []).join(' '), item.source].join(' ').toLowerCase();
    const q = `${query} ${globalSearch}`.trim().toLowerCase();
    return (!q || text.includes(q)) && (category === 'all' || item.category.toLowerCase().includes(category.toLowerCase())) && (location === 'all' || item.place.toLowerCase().includes(location.toLowerCase()));
  }), [data.events, query, globalSearch, category, location]);
  const details = (event) => openModal({ title: event.title, subtitle: `${event.org} · ${event.place}`, message: event.kind === 'external' ? `This is a seeded example of an external opportunity.\n\nSource label: ${event.source}\nCategory: ${event.category}\nDate: ${event.date}\n\nProduction plan: store a verified public source URL, last-checked timestamp and external identifier; check the source's terms and retain a manual organization-submission fallback.` : `${event.description}\n\nDate: ${event.date}\nTime: ${event.start}–${event.end}\nSkills: ${(event.skills || []).join(', ')}`, submitLabel: 'Close' });
  const info = () => openModal({ title: 'Opportunity aggregation', subtitle: 'How public listings should enter MealSync.', message: '1. Use sources whose pages and site terms permit collection.\n2. Store source, source URL, external ID (if available), and last-checked time.\n3. Normalize title, location, time and skills; deduplicate and expire stale listings.\n4. Keep first-party events separate from imported listings until reviewed.\n5. Keep manual organization submissions as a dependable fallback.\n\nThe displayed external opportunities are synthetic examples; this prototype does not scrape live websites.', submitLabel: 'Got it' });
  return <><DemoBanner/><PageHeading title="Opportunity discovery" subtitle="Search MealSync events alongside illustrative external opportunity listings." actions={<Button variant="primary" onClick={info}>ⓘ Aggregation plan</Button>}/>
    <SectionCard title="All ongoing opportunities" subtitle="A unified view for volunteer discovery. External listings below are placeholders, not live scraped records."><SearchFilterRow search={query} onSearch={setQuery} filters={[{ label: 'Categories', value: category, onChange: setCategory, options: cats }, { label: 'Locations', value: location, onChange: setLocation, options: locations }]} resultCount={filtered.length}/><div className="event-list section-spacer">{filtered.length ? filtered.map((item) => item.kind === 'event' ? <EventCard key={`event-${item.id}`} event={item} onDetails={details} registered={data.registeredEventIds.includes(item.id)} onRegister={(selected) => data.registeredEventIds.includes(selected.id) ? unregisterEvent(selected.id) : registerEvent(selected.id)}/> : <article className="event-row" key={item.id}><div className={`event-symbol ${item.tone}`}>{item.icon}</div><div className="event-main"><h3>{item.title}</h3><p>{item.org} · {item.place}</p><div className="event-meta"><span>◷ {item.date}</span><Pill tone="purple">{item.source}</Pill><Pill>{item.category}</Pill></div></div><div className="event-actions"><Button size="sm" onClick={() => details(item)}>Listing info</Button><Button size="sm" variant="primary" onClick={() => { addActivity(`Saved interest in ${item.title}`); showToast('Interest saved', 'This is a local demo action; no external listing was imported.'); }}>Save interest</Button></div></article>) : <div className="empty-note"><strong>No listings match those filters</strong><span>Try a different search term, category or location.</span></div>}</div></SectionCard>
  </>;
}
