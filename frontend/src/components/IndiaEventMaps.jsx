import { useId } from 'react';
import { geoIdentity, geoPath } from 'd3-geo';
import { states } from 'vardhan-maps/data';

const width = 480;
const height = 480;
const lightGreen = [241, 250, 238];
const darkGreen = [0, 83, 35];

function eventColor(ratio) {
  const channels = lightGreen.map((channel, index) =>
    channel + ratio * (darkGreen[index] - channel));
  return `rgb(${channels.join(', ')})`;
}

// Fit the regional coordinates directly so mixed ring directions cannot expand the map's bounds.
const projection = geoIdentity().reflectY(true).fitExtent([[10, 10], [width - 10, height - 10]], states);
const path = geoPath(projection);
const regions = states.features.map(feature => ({ ...feature.properties, outline: path(feature) }));

function normalizeState(value) {
  return value.toLowerCase().replaceAll('&', ' and ').replace(/[^a-z0-9]/g, '');
}

const regionCodes = new Map(regions.map(({ name, code }) => [normalizeState(name), code]));
for (const [name, code] of Object.entries({
  'New Delhi': 'IN-DL',
  'NCT of Delhi': 'IN-DL',
  Orissa: 'IN-OD',
  Pondicherry: 'IN-PY',
  Uttaranchal: 'IN-UT',
  'Dadra and Nagar Haveli': 'IN-DH',
  'Daman and Diu': 'IN-DH'
})) regionCodes.set(normalizeState(name), code);

function EventMap({ title, description, counts, maxCount }) {
  const headingId = useId();
  const descriptionId = useId();
  const regionCounts = regions.map(region => ({ ...region, count: counts.get(region.code) ?? 0 }));
  const background = maxCount
    ? `linear-gradient(to right in srgb, ${eventColor(0)}, ${eventColor(1)})`
    : eventColor(0);
  return (
    <figure className="card event-map" aria-labelledby={headingId}>
      <figcaption>
        <h3 id={headingId}>{title}</h3>
        <p>{description}</p>
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={headingId}
        aria-describedby={descriptionId}>
        <desc id={descriptionId}>
          {regionCounts.map(({ name, count }) => `${name}: ${count}`).join('; ')}
        </desc>
        {regionCounts.map(({ code, outline, count }) => (
          <path key={code} d={outline} className="event-map-region" fillRule="evenodd"
            fill={eventColor(maxCount ? count / maxCount : 0)} />
        ))}
      </svg>
      <div className="event-map-legend">
        <span>Event count</span>
        <div className="event-map-gradient" style={{ background }} aria-hidden="true" />
        <div className="event-map-scale"><span>0</span>{maxCount > 0 && <span>{maxCount}</span>}</div>
      </div>
    </figure>
  );
}

export default function IndiaEventMaps({ eventCounts }) {
  const active = new Map();
  const lifetime = new Map();
  let unmapped = 0;
  for (const entry of eventCounts) {
    const code = regionCodes.get(normalizeState(entry.state));
    if (code) {
      lifetime.set(code, (lifetime.get(code) ?? 0) + entry.lifetime);
      active.set(code, (active.get(code) ?? 0) + entry.active);
    } else {
      unmapped += entry.lifetime + entry.active;
    }
  }
  const maxCount = Math.max(0, ...lifetime.values(), ...active.values());
  return (
    <>
      <div className="event-maps">
        <EventMap title="Lifetime Events" description="Events with an accepted kitchen before today."
          counts={lifetime} maxCount={maxCount} />
        <EventMap title="Active Events" description="Events with an accepted kitchen today or later."
          counts={active} maxCount={maxCount} />
      </div>
      {unmapped > 0 && <p>{unmapped} {unmapped === 1 ? 'event has' : 'events have'} an unrecognized state and cannot be mapped.</p>}
      <p className="event-map-credit">Boundaries from Vardhan Maps and © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>.</p>
    </>
  );
}
