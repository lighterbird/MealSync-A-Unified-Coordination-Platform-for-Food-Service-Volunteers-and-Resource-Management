import Button from './Button';

export function DemoBanner({ children = 'Prototype mode: records below are synthetic demo data held in memory. Refreshing the page resets changes.' }) {
  return <div className="demo-banner"><strong>DEMO DATA</strong> · {children}</div>;
}

export function PageHeading({ eyebrow = 'MealSync workspace', title, subtitle, actions }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{actions && <div className="heading-actions">{actions}</div>}</div>;
}

export function MetricCard({ icon, label, value, foot, tone = '' }) {
  return <div className="card metric-card"><div className="metric-top"><span className="metric-label">{label}</span><span className={`metric-icon ${tone}`}>{icon}</span></div><div className="metric-value">{value}</div><div className="metric-foot">{foot}</div></div>;
}

export function Pill({ children, tone = '' }) { return <span className={`pill ${tone}`}>{children}</span>; }

export function EmptyState({ title, text }) { return <div className="empty-note"><strong>{title}</strong><span>{text}</span></div>; }

export function SectionCard({ title, subtitle, actions, children, className = '' }) {
  return <section className={`card ${className}`}><div className="card-pad"><div className="card-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{actions && <div className="button-row">{actions}</div>}</div>{children}</div></section>;
}

export function EventCard({ event, onDetails, onRegister, registered = false, match = true }) {
  return <article className="event-row">
    <div className={`event-symbol ${event.tone || 'green'}`}>{event.icon || '🥘'}</div>
    <div className="event-main"><h3>{event.title}</h3><p>{event.org} · {event.place}</p><div className="event-meta"><span>◷ {event.date}</span><span className="pill">{event.category}</span><span>♧ {event.volunteers ?? 0}/{event.needed ?? 0} volunteers</span></div><p className="small muted">{event.description}</p></div>
    <div className="event-actions">{match && <span className="match-score">✦ {event.score ?? 80}% fit</span>}<Button size="sm" onClick={() => onDetails(event)}>Details</Button>{onRegister && <Button size="sm" variant={registered ? 'secondary' : 'primary'} onClick={() => onRegister(event)}>{registered ? 'Registered ✓' : 'Join event'}</Button>}</div>
  </article>;
}

export function SearchFilterRow({ search, onSearch, filters = [], resultCount }) {
  return <div className="filter-row"><input className="search-input" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search title, organizer, skill or location..." aria-label="Search" />{filters.map((filter) => <select key={filter.label} value={filter.value} onChange={(event) => filter.onChange(event.target.value)} aria-label={filter.label}><option value="all">All {filter.label.toLowerCase()}</option>{filter.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>)}{resultCount !== undefined && <span className="muted small">{resultCount} results</span>}</div>;
}

export function SimpleTable({ columns, rows, emptyTitle = 'Nothing to show', emptyText = 'Try changing your filters.' }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={row.id ?? index}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>) : <tr><td colSpan={columns.length}><EmptyState title={emptyTitle} text={emptyText} /></td></tr>}</tbody></table></div>;
}

