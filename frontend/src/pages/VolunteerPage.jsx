import { useState, useEffect } from 'react';
import IndiaLocationFields from '../components/IndiaLocationFields';

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
    description: '', city: '', state: '', flexibility: 1
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availabilityEdited, setAvailabilityEdited] = useState(false);
  const [legacyAvailability, setLegacyAvailability] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/volunteers/profile/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.exists) {
          setForm({
            description: data.description || '',
            city: data.city || '',
            state: data.state || '',
            flexibility: data.flexibility
          });
          const dates = data.available_dates?.match(/^(\d{4}-\d{2}-\d{2})\s*(?:,|to)\s*(\d{4}-\d{2}-\d{2})$/);
          setStartDate(dates?.[1] || '');
          setEndDate(dates?.[2] || '');
          setLegacyAvailability(dates ? '' : data.available_dates || '');
          setAvailabilityEdited(false);
        }
        setLoaded(true);
      });
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const payload = { ...form };
    if (availabilityEdited || startDate || endDate) {
      payload.available_dates = startDate && endDate ? `${startDate},${endDate}` : null;
    }
    try {
      const response = await fetch(`/api/volunteers/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save your profile.');
      if (availabilityEdited) setLegacyAvailability('');
      setMessage('Saved!');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!loaded) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>Volunteer Profile</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} className="stack-form">
        <label className="form-field">Description
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="3" />
        </label>
        <IndiaLocationFields state={form.state} city={form.city}
          onChange={location => setForm(current => ({ ...current, ...location }))} />
        <label className="form-field">Flexibility
          <select value={form.flexibility} onChange={e => setForm({...form, flexibility: Number(e.target.value)})}>
            <option value={1}>Same city only</option>
            <option value={2}>Same state only</option>
          </select>
        </label>
        {legacyAvailability && <p>Previously saved availability: {legacyAvailability}</p>}
        <div className="form-fields">
          <label className="form-field">Availability start date
            <input type="date" value={startDate} max={endDate || undefined}
              required={Boolean(endDate)} onChange={e => { setStartDate(e.target.value); setAvailabilityEdited(true); }} />
          </label>
          <label className="form-field">Availability end date
            <input type="date" value={endDate} min={startDate || undefined}
              required={Boolean(startDate)} onChange={e => { setEndDate(e.target.value); setAvailabilityEdited(true); }} />
          </label>
        </div>
        <div className="form-actions"><button type="submit" className="button primary">Save Profile</button></div>
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
      e.city.toLowerCase().includes(search.toLowerCase()) ||
      e.state.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter === '' || e.event_date === dateFilter;
    return matchSearch && matchDate;
  });

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>All Floated Events</h2>
      <div className="form-fields event-filters">
        <label className="form-field">Search
          <input className="event-search" placeholder="Organization, city, or state" value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <label className="form-field">Event date
          <input className="event-search" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </label>
      </div>
      {filtered.length === 0 ? <p>No events found.</p> : filtered.map(e => (
        <div key={e.event_id} className="card">
          <h3>{e.event_id} | {e.org_name}</h3>
          <p>{e.city}, {e.state} on {e.event_date}</p>
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
          <p>{e.city}, {e.state} on {e.event_date}</p>
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
  const [referError, setReferError] = useState('');
  const [sendingReferral, setSendingReferral] = useState(false);

  useEffect(() => {
    fetch(`/api/volunteers/registered-events/${userId}`)
      .then(r => r.json())
      .then(setEvents);
  }, [userId]);

  const handleRefer = async (event, eventId) => {
    event.preventDefault();
    setReferMsg('');
    setReferError('');
    setSendingReferral(true);
    try {
      const response = await fetch('/api/volunteers/refer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, friend_mealsync_id: friendId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not send the referral.');
      setReferMsg(data.message);
      setReferTarget(null);
      setFriendId('');
    } catch (err) {
      setReferError(err.message);
    } finally {
      setSendingReferral(false);
    }
  };

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>Registered Events</h2>
      {referMsg && <p role="status" style={{ color: 'green' }}>{referMsg}</p>}
      {events.length === 0 ? <p>No events yet.</p> : events.map(e => (
        <div key={e.registration_id} className="card">
          <h3>{e.event_id} | {e.org_name}</h3>
          <p>{e.city}, {e.state} on {e.event_date}</p>
          <div className="card-actions">
            {e.tags.map(t => <span key={t} className={`status-badge ${t}`}>{t.toUpperCase()}</span>)}
          </div>
          {e.tags.includes('registered') && (
            <div style={{ marginTop: '10px' }}>
              {referTarget === e.registration_id ? (
                <form className="stack-form inline-form" onSubmit={event => handleRefer(event, e.event_id)}>
                  {referError && <p className="error" role="alert">{referError}</p>}
                  <label className="form-field">Friend’s MealSync ID
                    <input value={friendId} onChange={ev => setFriendId(ev.target.value)} required disabled={sendingReferral} />
                  </label>
                  <div className="form-actions">
                    <button type="submit" disabled={sendingReferral} className="button primary">Send Referral</button>
                    <button type="button" disabled={sendingReferral} onClick={() => setReferTarget(null)}
                      className="button secondary">Cancel</button>
                  </div>
                </form>
              ) : (
                <button disabled={sendingReferral} onClick={() => {
                  setReferTarget(e.registration_id);
                  setFriendId('');
                  setReferError('');
                  setReferMsg('');
                }} className="button secondary">Refer a Friend</button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
