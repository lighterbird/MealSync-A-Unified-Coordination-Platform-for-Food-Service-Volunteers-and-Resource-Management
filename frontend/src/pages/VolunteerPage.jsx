import { useState, useEffect } from 'react';

export default function VolunteerPage({ user }) {
  const [view, setView] = useState('menu');

  if (view === 'menu') {
    return (
      <div className="page">
        <h1>Volunteer Dashboard</h1>
        <p>Select an option below.</p>
        <div className="card-actions" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <button onClick={() => setView('profile')} className="button primary">Profile</button>
          <button onClick={() => setView('registered-events')} className="button primary">Registered Events</button>
          <button onClick={() => setView('all-events')} className="button primary">All Events</button>
          <button onClick={() => setView('events-for-you')} className="button primary">Events for You</button>
        </div>
      </div>
    );
  }

  if (view === 'profile') return <ProfileTab userId={user.mealsync_id} onBack={() => setView('menu')} />;
  if (view === 'registered-events') return <RegisteredEvents userId={user.mealsync_id} onBack={() => setView('menu')} />;
  if (view === 'all-events') return <AllEvents userId={user.mealsync_id} onBack={() => setView('menu')} />;
  if (view === 'events-for-you') return <EventsForYou userId={user.mealsync_id} onBack={() => setView('menu')} />;
}

function ProfileTab({ userId, onBack }) {
  const [form, setForm] = useState({
    description: '', city: '', state: '', flexibility: 3, expertise: 1,
    available_dates: ''
  });
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/volunteers/profile/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.exists) {
          setForm({
            description: data.description || '',
            city: data.city || '',
            state: data.state || '',
            flexibility: data.flexibility,
            expertise: data.expertise,
            available_dates: data.available_dates || ''
          });
        }
        setLoaded(true);
      });
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`/api/volunteers/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setMessage('Saved!');
    setTimeout(() => setMessage(''), 2000);
  };

  if (!loaded) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>Volunteer Profile</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit} className="stack-form">
        <label>Description</label>
        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="3" />
        <label>City</label>
        <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
        <label>State</label>
        <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
        <label>Flexibility (1-5)</label>
        <select value={form.flexibility} onChange={e => setForm({...form, flexibility: parseInt(e.target.value)})}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <label>Expertise (1-5)</label>
        <select value={form.expertise} onChange={e => setForm({...form, expertise: parseInt(e.target.value)})}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <label>Available Dates (e.g. "2026-12-01 to 2026-12-15")</label>
        <input value={form.available_dates} onChange={e => setForm({...form, available_dates: e.target.value})} />
        <button type="submit" className="button primary">Save Profile</button>
      </form>
    </div>
  );
}

function AllEvents({ userId, onBack }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetch(`/api/volunteers/all-events/${userId}`)
      .then(r => r.json())
      .then(setEvents);
  }, [userId]);

  const handleApply = async (eventId) => {
    await fetch(`/api/volunteers/apply/${eventId}/${userId}`, { method: 'POST' });
    fetch(`/api/volunteers/all-events/${userId}`).then(r => r.json()).then(setEvents);
  };

  const filtered = events.filter(e => {
    const matchSearch = search === '' ||
      e.org_name.toLowerCase().includes(search.toLowerCase()) ||
      (e.kitchen_name && e.kitchen_name.toLowerCase().includes(search.toLowerCase())) ||
      e.city.toLowerCase().includes(search.toLowerCase()) ||
      e.state.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter === '' || e.event_date === dateFilter;
    return matchSearch && matchDate;
  });

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>All Floated Events</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input placeholder="Search by org, kitchen, city, state..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: '8px' }} />
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: '8px' }} />
      </div>
      {filtered.length === 0 ? <p>No events found.</p> : filtered.map(e => (
        <div key={e.event_id} className="card">
          <h3>{e.event_id} | {e.org_name}</h3>
          <p>Kitchen: {e.kitchen_name || "N/A"} | {e.city}, {e.state} on {e.event_date}</p>
          <p>Expected: {e.expected_people} people</p>
          {!e.already_applied && (
            <button onClick={() => handleApply(e.event_id)} className="button primary">Apply</button>
          )}
          {e.already_applied && <span style={{ color: 'green' }}>Already Applied</span>}
        </div>
      ))}
    </div>
  );
}

function EventsForYou({ userId, onBack }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch(`/api/volunteers/events-for-you/${userId}`)
      .then(r => r.json())
      .then(setEvents);
  }, [userId]);

  const handleApply = async (eventId) => {
    await fetch(`/api/volunteers/apply/${eventId}/${userId}`, { method: 'POST' });
    setEvents(events.filter(e => e.event_id !== eventId));
  };

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>Events for You</h2>
      {events.length === 0 ? <p>No matching events.</p> : events.map(e => (
        <div key={e.event_id} className="card">
          <h3>{e.event_id} | {e.org_name}</h3>
          <p>Kitchen: {e.kitchen_name || "N/A"} | {e.city}, {e.state} on {e.event_date}</p>
          <p>Expected: {e.expected_people} people</p>
          <button onClick={() => handleApply(e.event_id)} className="button primary">Apply</button>
        </div>
      ))}
    </div>
  );
}

function RegisteredEvents({ userId, onBack }) {
  const [events, setEvents] = useState([]);
  const [referTarget, setReferTarget] = useState(null);
  const [friendId, setFriendId] = useState('');
  const [referMsg, setReferMsg] = useState('');

  useEffect(() => {
    fetch(`/api/volunteers/registered-events/${userId}`)
      .then(r => r.json())
      .then(setEvents);
  }, [userId]);

  const handleRefer = async () => {
    setReferMsg('Referral feature coming soon');
    setTimeout(() => setReferMsg(''), 3000);
    setReferTarget(null);
    setFriendId('');
  };

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>Registered Events</h2>
      {referMsg && <p style={{ color: 'green' }}>{referMsg}</p>}
      {events.length === 0 ? <p>No events yet.</p> : events.map(e => (
        <div key={e.registration_id} className="card">
          <h3>{e.event_id} | {e.org_name}</h3>
          <p>Kitchen: {e.kitchen_name || "N/A"} | {e.city}, {e.state} on {e.event_date}</p>
          <div className="card-actions">
            {e.tags.map(t => <span key={t} className={`status-badge ${t}`}>{t.toUpperCase()}</span>)}
          </div>
          {e.tags.includes('registered') && (
            <div style={{ marginTop: '10px' }}>
              {referTarget === e.registration_id ? (
                <div>
                  <input placeholder="Friend's MealSync ID" value={friendId} onChange={ev => setFriendId(ev.target.value)} style={{ padding: '6px', marginRight: '10px' }} />
                  <button onClick={handleRefer} className="button primary">Send Referral</button>
                  <button onClick={() => setReferTarget(null)} className="button secondary" style={{ marginLeft: '5px' }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setReferTarget(e.registration_id)} className="button secondary">Refer a Friend</button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}