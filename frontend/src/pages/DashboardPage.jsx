import { lazy, Suspense, useEffect, useState } from 'react';

const IndiaEventMaps = lazy(() => import('../components/IndiaEventMaps'));

async function fetchDashboardData(path, signal) {
  const response = await fetch(`/api/dashboard/${path}`, { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The dashboard data could not be loaded.');
  return data;
}

export default function DashboardPage({ user }) {
  const [items, setItems] = useState(null);
  const [eventCounts, setEventCounts] = useState(null);
  const [actionError, setActionError] = useState('');
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData('action-items', controller.signal)
      .then(data => setItems(data.items))
      .catch(error => {
        if (!controller.signal.aborted) setActionError(error.message);
      });
    fetchDashboardData('event-counts', controller.signal)
      .then(setEventCounts)
      .catch(() => {
        if (!controller.signal.aborted) setMapError('Event counts could not be loaded.');
      });
    return () => controller.abort();
  }, [user.mealsync_id]);

  return (
    <div className="page for-you-page">
      <h1>For You</h1>
      <section aria-labelledby="action-items-heading" className="card dashboard-actions">
        <h2 id="action-items-heading">Action Items</h2>
        {actionError && <p className="error" role="alert">{actionError}</p>}
        {!actionError && items === null && <p role="status">Loading action items…</p>}
        {items?.length === 0 && <p>You’re all caught up.</p>}
        {items?.length > 0 && (
          <ul>{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
        )}
      </section>
      <section aria-labelledby="event-maps-heading">
        <h2 id="event-maps-heading">Events Across India</h2>
        {mapError && <p className="error" role="alert">{mapError}</p>}
        {!mapError && eventCounts === null && <p role="status">Loading event maps…</p>}
        {eventCounts && (
          <Suspense fallback={<p role="status">Loading event maps…</p>}>
            <IndiaEventMaps eventCounts={eventCounts} />
          </Suspense>
        )}
      </section>
    </div>
  );
}
