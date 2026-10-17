// Organization event CRUD, kitchen partner requests and donation request creation.
// DEMO DATA BOUNDARY: reads/writes use AppContext's in-memory seeded records. Replace these calls with the agreed Flask API; see docs/FRONTEND_TASKS_BY_PERSON.md.
import { useMemo, useState } from 'react';
import Button from '../components/Button';
import { DemoBanner, PageHeading, Pill, SectionCard, SimpleTable } from '../components/Shared';
import { useMealSync } from '../context/AppContext';
import { eventModalFields, normalizeEvent } from '../components/helpers';

export default function OrganizationPage() {
  const { data, addItem, updateItem, addActivity, showToast, openModal, navigate, globalSearch } = useMealSync();
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const createEvent = (existing) => openModal({ title: existing ? 'Edit event' : 'Create an event', subtitle: 'Publish volunteer requirements and planned meal details.', wide: true, fields: eventModalFields(existing), submitLabel: existing ? 'Save changes' : 'Create event', onSubmit: (values) => {
    if (values.end24 <= values.start24) { showToast('Check event times', 'The end time must be after the start time.'); return false; }
    const id = existing?.id || Math.max(0, ...data.events.map((event) => event.id)) + 1;
    const event = normalizeEvent(values, existing || {}, id);
    if (existing) updateItem('events', existing.id, event); else addItem('events', { ...event, org: data.user.fullName + ' / MealSync', volunteers: 0, score: 75 });
    addActivity(`${existing ? 'Updated' : 'Created'} event: ${event.title}`); showToast(existing ? 'Event updated' : 'Event created', 'The event is now visible in the local demo listings.');
  }});
  const createDonationRequest = () => openModal({ title: 'Create donation request', subtitle: 'Publish a need for ingredients, food, equipment or money.', fields: [
    { name: 'title', label: 'Request title', value: '', required: true, full: true },
    { name: 'recipient', label: 'Recipient kitchen', type: 'select', value: data.kitchens[0]?.name || '', options: data.kitchens.map((kitchen) => kitchen.name), required: true, full: true },
    { name: 'type', label: 'Donation type', type: 'select', value: 'Ingredients', options: ['Money', 'Ingredients', 'Food', 'Equipment', 'Other'], required: true },
    { name: 'need', label: 'Quantity / target', value: '', required: true },
    { name: 'deadline', label: 'Deadline', type: 'date', value: new Date().toLocaleDateString('en-CA'), required: true },
    { name: 'description', label: 'Description', type: 'textarea', value: '', required: false, full: true }
  ], onSubmit: (values) => {
    const kitchen = data.kitchens.find((item) => item.name === values.recipient) || data.kitchens[0];
    addItem('donationRequests', { title: values.title, recipient: values.recipient, place: kitchen?.place || data.user.city, type: values.type, need: values.need, progress: 0, deadline: new Date(`${values.deadline}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), icon: values.type === 'Money' ? '💚' : '🌾', tone: values.type === 'Money' ? 'blue' : 'green', description: values.description });
    addActivity(`Published donation request: ${values.title}`); showToast('Donation request published', 'It is now visible in the donor workspace.');
  }});
  const requestKitchen = (kitchen) => openModal({ title: `Request ${kitchen.name}`, subtitle: `Capacity: ${kitchen.capacity} meals/day · ${kitchen.place}`, fields: [
    { name: 'eventId', label: 'Event to coordinate', type: 'select', value: String(data.events[0]?.id || ''), options: data.events.map((event) => ({ value: String(event.id), label: `${event.title} (${event.date})` })), required: true, full: true },
    { name: 'message', label: 'Request details', type: 'textarea', value: 'Please let us know whether your kitchen can support this event.', required: true, full: true }
  ], onSubmit: (values) => {
    const event = data.events.find((item) => item.id === Number(values.eventId));
    if (!event) { showToast('Choose an event', 'Kitchen requests must be linked to an event.'); return false; }
    addItem('kitchenRequests', { eventId: event.id, kitchenId: kitchen.id, requester: data.user.fullName, date: event.date, status: 'Pending', note: values.message });
    addActivity(`Requested kitchen support from ${kitchen.name}`); showToast('Kitchen request sent', 'It now appears in the kitchen workspace.');
  }});
  const events = useMemo(() => data.events.filter((event) => (statusFilter === 'all' || event.status === statusFilter) && [event.title, event.place, event.org, event.status].join(' ').toLowerCase().includes(`${query} ${globalSearch}`.trim().toLowerCase())), [data.events, statusFilter, query, globalSearch]);
  return <><DemoBanner/><PageHeading title="Organization workspace" subtitle="Create food-service events, discover kitchen partners and manage volunteer capacity." actions={<><Button onClick={createDonationRequest}>＋ Donation request</Button><Button variant="primary" onClick={() => createEvent(null)}>＋ Create an event</Button></>}/><div className="grid-3" style={{ marginBottom: 18 }}><div className="card metric-card"><span className="metric-label">Published events</span><div className="metric-value">{data.events.filter((event) => event.status === 'Published').length}</div><div className="metric-foot">Visible to volunteers</div></div><div className="card metric-card"><span className="metric-label">Registrations</span><div className="metric-value">{data.registeredEventIds.length}</div><div className="metric-foot">Demo account sign-ups</div></div><div className="card metric-card"><span className="metric-label">Kitchen partners</span><div className="metric-value">{data.kitchens.length}</div><div className="metric-foot">Sample nearby kitchens</div></div></div>
    <SectionCard title="Your events" subtitle="Manage upcoming listings and see volunteer capacity."><div className="filter-row"><input className="search-input" placeholder="Search event, location or status..." value={query} onChange={(event) => setQuery(event.target.value)}/><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="Published">Published</option><option value="Draft">Draft</option><option value="Completed">Completed</option></select><span className="muted small">{events.length} events</span></div><SimpleTable columns={[{ key: 'title', label: 'Event', render: (event) => <div className="table-primary"><span className={`event-symbol ${event.tone}`} style={{ width: 34, height: 34, fontSize: 16, borderRadius: 9 }}>{event.icon}</span><span><strong>{event.title}</strong><small>{event.category}</small></span></div> }, { key: 'place', label: 'Date / location', render: (event) => <><strong>{event.date}</strong><small>{event.place}</small></> }, { key: 'volunteers', label: 'Volunteers', render: (event) => `${event.volunteers}/${event.needed}` }, { key: 'meals', label: 'Meals planned' }, { key: 'status', label: 'Status', render: (event) => <Pill tone={event.status === 'Published' ? 'green' : 'amber'}>{event.status}</Pill> }, { key: 'actions', label: '', render: (event) => <Button size="sm" onClick={() => createEvent(event)}>Edit</Button> }]} rows={events}/></SectionCard>
    <div className="section-spacer"><SectionCard title="Kitchens for you" subtitle="Use location and capacity to identify potential partners."><div className="grid-3">{data.kitchens.map((kitchen) => <article className="card kitchen-card" key={kitchen.id} style={{ boxShadow: 'none' }}><div className={`kitchen-banner ${kitchen.tone}`}>{kitchen.icon}</div><Pill tone={kitchen.status === 'Verified' ? 'green' : 'amber'}>{kitchen.status}</Pill><h3 style={{ marginTop: 10 }}>{kitchen.name}</h3><p>{kitchen.org}<br/>{kitchen.place}</p><div className="kitchen-facts"><span>Capacity {kitchen.capacity}/day</span><span>{kitchen.hours}</span></div><Button variant="secondary" className="btn-block" style={{ marginTop: 12 }} onClick={() => requestKitchen(kitchen)}>Request availability</Button></article>)}</div></SectionCard></div>
    <div className="section-spacer"><SectionCard title="Kitchen request overview" subtitle="Requests are linked to events and kitchens."><SimpleTable columns={[{ key: 'requester', label: 'Requested by' }, { key: 'date', label: 'Event date' }, { key: 'eventId', label: 'Event', render: (row) => data.events.find((event) => event.id === row.eventId)?.title || `Event ${row.eventId}` }, { key: 'kitchenId', label: 'Kitchen', render: (row) => data.kitchens.find((kitchen) => kitchen.id === row.kitchenId)?.name || 'Kitchen' }, { key: 'status', label: 'Status', render: (row) => <Pill tone={row.status === 'Accepted' ? 'green' : row.status === 'Rejected' ? 'red' : 'amber'}>{row.status}</Pill> }]} rows={data.kitchenRequests}/></SectionCard></div>
  </>;
}
