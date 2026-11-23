import { useState, useEffect } from 'react';
import IndiaLocationFields from '../components/IndiaLocationFields';

const donationAmountFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

export default function OrganizationPage({ user }) {
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch orgs on mount
  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      const res = await fetch(`/api/organizations?mealsync_id=${user.mealsync_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrgs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  if (selectedOrg) {
    return <InsideOrg org={selectedOrg} onBack={() => setSelectedOrg(null)} />;
  }

  return (
    <div className="page">
      <h1>Organization Dashboard</h1>
      <p>Select one of your organizations to manage its events, or create a new one.</p>
      {error && <p className="error">{error}</p>}

      <div className="org-grid">
        {orgs.map(org => (
          <OrgCard key={org.org_id} org={org} onSelect={() => setSelectedOrg(org)} onRefresh={fetchOrgs} />
        ))}
        <NewOrgCard userId={user.mealsync_id} onCreated={fetchOrgs} />
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS (Org Selection) ---

function OrgCard({ org, onSelect, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(org.name);
  const [desc, setDesc] = useState(org.description);

  const handleUpdate = async () => {
    await fetch(`/api/organizations/${org.org_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc })
    });
    setIsEditing(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This will delete all events under this org.")) return;
    await fetch(`/api/organizations/${org.org_id}`, { method: 'DELETE' });
    onRefresh();
  };

  if (isEditing) {
    return (
      <div className="card stack-form">
        <label className="form-field">Organization name<input value={name} onChange={e => setName(e.target.value)} /></label>
        <label className="form-field">Description<input value={desc} onChange={e => setDesc(e.target.value)} /></label>
        <div className="form-actions">
          <button onClick={handleUpdate} className="button primary">Save</button>
          <button onClick={() => setIsEditing(false)} className="button secondary">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>{org.name}</h3>
      <p>{org.description || "No description"}</p>
      <div className="card-actions">
        <button onClick={onSelect} className="button primary">Enter</button>
        <button onClick={() => setIsEditing(true)} className="button secondary">Edit</button>
        <button onClick={handleDelete} className="button danger">Delete</button>
      </div>
    </div>
  );
}

function NewOrgCard({ userId, onCreated }) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = async () => {
    await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_mealsync_id: userId, name, description: desc })
    });
    setIsCreating(false);
    onCreated();
  };

  if (isCreating) {
    return (
      <div className="card stack-form">
        <label className="form-field">Organization name<input value={name} onChange={e => setName(e.target.value)} /></label>
        <label className="form-field">Description<input value={desc} onChange={e => setDesc(e.target.value)} /></label>
        <div className="form-actions">
          <button onClick={handleCreate} className="button primary">Create</button>
          <button onClick={() => setIsCreating(false)} className="button secondary">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card new-card" onClick={() => setIsCreating(true)}>
      <h3>+ Create New Org</h3>
    </div>
  );
}

// --- SUB-COMPONENTS (Inside Org) ---

function InsideOrg({ org, onBack }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'create', 'manage-kitchen', 'manage-volunteer'
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [org]);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await fetch(`/api/events/${org.org_id}`);
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Delete this event? All requests will be lost.")) return;
    await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    fetchEvents();
  };

  if (loading) return <div className="page">Loading events...</div>;

  if (view === 'create') {
    return <CreateEventForm orgId={org.org_id} onBack={() => setView('list')} onCreated={() => { setView('list'); fetchEvents(); }} />;
  }

  if (view === 'manage-kitchen') {
    return <ManageKitchenRequests event={activeEvent} onBack={() => { setView('list'); fetchEvents(); }} />;
  }

  if (view === 'manage-volunteer') {
    return <ManageVolunteerRequests event={activeEvent} onBack={() => setView('list')} />;
  }

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary" style={{ marginBottom: '20px' }}>&larr; Back to Orgs</button>
      <h1>{org.name} - Events</h1>
      
      <button onClick={() => setView('create')} className="button primary" style={{ marginBottom: '20px' }}>Create Event</button>

      <div className="event-list">
        {events.length === 0 ? <p>No events yet.</p> : events.map(ev => (
          <div key={ev.event_id} className="card">
            <div className="card-heading">
              <h3>{ev.city}, {ev.state} | {ev.event_date}</h3>
              <span className={`status-badge ${ev.status}`}>{ev.status.toUpperCase()}</span>
            </div>
            <p>Expected: {ev.expected_people} people | Kitchen: {ev.kitchen_name || "Not Assigned"}</p>
            {ev.status === 'proposed' && (
              <p>Kitchen matching preference: {ev.kitchen_flexibility === 2 ? 'Same state only' : 'Same city only'}</p>
            )}
            <p>Total donations: {donationAmountFormat.format(ev.total_donations)}</p>
            
            <div className="card-actions">
              {ev.status === 'proposed' && (
                <button onClick={() => { setActiveEvent(ev); setView('manage-kitchen'); }} className="button primary">Manage Kitchen Requests</button>
              )}
              {ev.status === 'floated' && (
                <button onClick={() => { setActiveEvent(ev); setView('manage-volunteer'); }} className="button primary">Manage Volunteer Requests</button>
              )}
              <button onClick={() => handleDeleteEvent(ev.event_id)} className="button danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateEventForm({ orgId, onBack, onCreated }) {
  const [form, setForm] = useState({ city: '', state: '', event_date: '', expected_people: '', kitchen_flexibility: 1 });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, org_id: orgId, expected_people: parseInt(form.expected_people) })
    });
    if (res.ok) {
      onCreated();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>Create New Event</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="stack-form">
        <IndiaLocationFields state={form.state} city={form.city} required
          onChange={location => setForm(current => ({ ...current, ...location }))} />
        <label className="form-field">Kitchen matching preference
          <select value={form.kitchen_flexibility} onChange={e => setForm({ ...form, kitchen_flexibility: Number(e.target.value) })}>
            <option value={1}>Same city only</option>
            <option value={2}>Same state only</option>
          </select>
        </label>
        <div className="form-fields">
          <label className="form-field">Date
            <input type="date" required value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />
          </label>
          <label className="form-field">Expected people
            <input type="number" required min="1" value={form.expected_people} onChange={e => setForm({...form, expected_people: e.target.value})} />
          </label>
        </div>
        <div className="form-actions"><button type="submit" className="button primary">Create Proposed Event</button></div>
      </form>
    </div>
  );
}

function ManageKitchenRequests({ event, onBack }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/events/${event.event_id}/kitchen-requests`)
      .then(res => res.json())
      .then(data => setRequests(data));
  }, [event]);

  const handleAction = async (reqId, action) => {
    setError('');
    try {
      const response = await fetch(`/api/events/${event.event_id}/kitchen-requests/${reqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update the kitchen request.');
      onBack();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back to Events</button>
      <h2>Kitchen Requests for {event.event_id}</h2>
      {error && <p className="error" role="alert">{error}</p>}
      {requests.length === 0 ? <p>No kitchens have applied yet.</p> : requests.map(r => (
        <div key={r.request_id} className="card">
          <h3>{r.kitchen_name} ({r.kitchen_city}, {r.kitchen_state})</h3>
          <p>Status: {r.status}</p>
          {r.status === 'pending' && (
            <div className="card-actions">
              <button onClick={() => handleAction(r.request_id, 'accept')} className="button primary">Accept (Float Event)</button>
              <button onClick={() => handleAction(r.request_id, 'reject')} className="button danger">Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ManageVolunteerRequests({ event, onBack }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch(`/api/events/${event.event_id}/volunteer-requests`)
      .then(res => res.json())
      .then(data => setRequests(data));
  }, [event]);

  const handleAction = async (regId, action) => {
    await fetch(`/api/events/${event.event_id}/volunteer-requests/${regId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    onBack();
  };

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back to Events</button>
      <h2>Volunteer Requests for {event.event_id}</h2>
      {requests.length === 0 ? <p>No volunteers have applied yet.</p> : requests.map(r => (
        <div key={r.registration_id} className="card">
          <h3>{r.volunteer_name} ({r.volunteer_email})</h3>
          {r.referred_by && <span className="status-badge referred">referred by: {r.referred_by}</span>}
          <p>Status: {r.status}</p>
          {r.status === 'requested' && (
            <div className="card-actions">
              <button onClick={() => handleAction(r.registration_id, 'accept')} className="button primary">Accept (Register)</button>
              <button onClick={() => handleAction(r.registration_id, 'reject')} className="button danger">Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
