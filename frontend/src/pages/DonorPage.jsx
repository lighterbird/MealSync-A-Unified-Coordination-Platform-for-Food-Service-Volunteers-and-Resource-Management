import { useState, useEffect } from 'react';

export default function DonorPage({ user }) {
  const [view, setView] = useState('menu');

  if (view === 'menu') {
    return (
      <div className="page">
        <h1>Donor Dashboard</h1>
        <p>Select an option below.</p>
        <div className="card-actions" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <button onClick={() => setView('all-events')} className="button primary">All Events</button>
          <button onClick={() => setView('your-events')} className="button primary">Your Events</button>
        </div>
      </div>
    );
  }

  if (view === 'all-events') return <AllEvents onBack={() => setView('menu')} />;
  if (view === 'your-events') return <YourEvents user={user} onBack={() => setView('menu')} />;
}

function AllEvents({ onBack }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [donatingEvent, setDonatingEvent] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/donations/all-events')
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load donation events.');
        setEvents(data);
      })
      .catch(err => setError(err.message));
  }, []);

  const handleDonate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    setSending(true);
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: donatingEvent, amount })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not complete the donation.');
      setMessage(`Thank you for donating ₹${amount}!`);
      setDonatingEvent(null);
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const filtered = events.filter(e =>
    e.org_name.toLowerCase().includes(search.toLowerCase()) ||
    (e.kitchen_name && e.kitchen_name.toLowerCase().includes(search.toLowerCase())) ||
    e.city.toLowerCase().includes(search.toLowerCase()) ||
    e.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>All Events</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <input
        placeholder="Search by org, kitchen, city, state..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '20px', padding: '8px', width: '100%' }}
      />
      {filtered.length === 0 ? <p>No events found.</p> : filtered.map(e => (
        <div key={e.event_id} className="card">
          <h3>{e.event_id} | {e.org_name}</h3>
          <p>Kitchen: {e.kitchen_name || "N/A"} | {e.city}, {e.state} on {e.event_date}</p>
          <p>Expected: {e.expected_people} people</p>
          {donatingEvent === e.event_id ? (
            <form onSubmit={handleDonate} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input
                type="number"
                min="1"
                placeholder="Amount (₹)"
                value={amount}
                disabled={sending}
                onChange={ev => setAmount(ev.target.value)}
                style={{ padding: '6px', width: '150px' }}
              />
              <button type="submit" disabled={sending} className="button primary">Confirm Donation</button>
              <button type="button" disabled={sending} onClick={() => { setDonatingEvent(null); setAmount(''); }} className="button secondary">Cancel</button>
            </form>
          ) : (
            <button disabled={sending} onClick={() => setDonatingEvent(e.event_id)} className="button primary">Donate</button>
          )}
        </div>
      ))}
    </div>
  );
}

function YourEvents({ user, onBack }) {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetch(`/api/donations/${user.mealsync_id}`)
      .then(r => r.json())
      .then(setDonations);
  }, [user]);

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>Your Donations</h2>
      {donations.length === 0 ? <p>You haven't donated yet.</p> : donations.map(d => (
        <div key={d.donation_id} className="card">
          <h3>{d.event_id} | {d.org_name}</h3>
          <p>{d.city}, {d.state} on {d.event_date}</p>
          <p><strong>Amount: ₹{d.amount}</strong></p>
          <span className={`status-badge ${d.status}`}>{d.status.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}
