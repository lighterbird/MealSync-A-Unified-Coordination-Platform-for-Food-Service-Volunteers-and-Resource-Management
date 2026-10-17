import Brand from '../components/Brand';
import Button from '../components/Button';
import { useMealSync } from '../context/AppContext';
import { pageLabels, roleInfo } from '../data/demoData';

const baseNavigation = [
  { label: 'Overview', items: [{ page: 'dashboard', label: 'For you', icon: '⌂' }] },
  { label: 'Discover & contribute', items: [
    { page: 'opportunities', label: 'Opportunities', icon: '⌕' }, { page: 'events', label: 'Events', icon: '▦' },
    { page: 'volunteer', role: 'volunteer', label: 'Volunteer workspace', icon: '♧' }, { page: 'donor', role: 'donor', label: 'Donor workspace', icon: '♡' }
  ] },
  { label: 'Coordinate & prepare', items: [
    { page: 'organizer', role: 'organization', label: 'Organization', icon: '▣' }, { page: 'kitchens', role: 'kitchen', label: 'Kitchens', icon: '♨' },
    { page: 'inventory', role: 'kitchen', label: 'Inventory', icon: '▤' }, { page: 'recipes', role: 'kitchen', label: 'Recipes', icon: '▧' },
    { page: 'meal-planner', role: 'kitchen', label: 'Meal planner', icon: '◷' }, { page: 'analytics', role: 'kitchen', label: 'Analytics', icon: '▥' }
  ] },
  { label: 'Account', items: [{ page: 'profile', label: 'Your profile', icon: '◉' }] }
];

export default function AppLayout({ children }) {
  const { data, page, activeRole, setActiveRole, navigate, signOut, mobileNavOpen, setMobileNavOpen, globalSearch, setGlobalSearch, openModal } = useMealSync();
  const roles = data.user.roles;
  const activeLabel = activeRole === 'for-you' ? 'For you' : roleInfo[activeRole]?.label || 'For you';
  const navGroups = baseNavigation.map((group) => ({ ...group, items: group.items.filter((item) => !item.role || roles.includes(item.role)) })).filter((group) => group.items.length);

  const openNotifications = () => openModal({ title: 'Notifications', subtitle: 'Recent activity in this local demo session.', message: data.activity.length ? undefined : 'You are all caught up. New referrals, approvals and contribution updates will appear here.', content: data.activity.length ? <div className="stack">{data.activity.map((activity, index) => <div className="list-row" key={`${activity.time}-${index}`}><span className="avatar">♧</span><div className="grow"><strong>{activity.message}</strong><small>{activity.time}</small></div></div>)}</div> : null, submitLabel: 'Done' });
  const signOutDemo = () => {
    if (signOut) signOut();
    else { navigate('dashboard'); window.location.hash = 'home'; }
  };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNavOpen ? 'open' : ''}`} id="sidebar">
      <Brand onClick={() => navigate('dashboard')} />
      <div className="nav-label">Your workspace</div>
      {navGroups.map((group) => <div key={group.label}><div className="nav-label">{group.label}</div><nav className="side-nav">{group.items.map((item) => <button type="button" key={item.page} className={`nav-item ${page === item.page ? 'active' : ''}`} onClick={() => navigate(item.page)}><span className="nav-icon">{item.icon}</span>{item.label}{item.page === 'events' && <span className="nav-count">{data.events.filter((event) => event.status === 'Published').length}</span>}</button>)}</nav></div>)}
      <div className="sidebar-spacer" />
      <div className="sidebar-callout"><strong>Small actions add up.</strong><p>Every volunteer hour, ingredient and meal helps your community coordinate better.</p><button type="button" onClick={() => openModal({ title: 'How MealSync fits together', subtitle: 'Four roles sharing connected event and resource data.', message: 'Volunteer: availability, skills, suggestions, registrations and referrals. Donor: browse requests and track contributions. Organization: publish events, manage sign-ups and discover kitchen partners. Community kitchen: requests, inventory, recipes, chefs, meal plans and waste tracking. A real deployment needs backend authentication, authorization and persistent storage.', submitLabel: 'Got it' })}>How it works ↗</button></div>
      <div className="sidebar-user"><span className="avatar">{data.user.fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div className="user-mini"><strong>{data.user.fullName}</strong><small>@{data.user.mealsyncId}</small></div><button type="button" title="Sign out" onClick={signOutDemo}>↪</button></div>
    </aside>
    <div className="main-column">
      <header className="topbar"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><button type="button" className="icon-btn mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(!mobileNavOpen)}>☰</button><div><div className="breadcrumbs">MealSync / {activeLabel}</div><div className="topbar-title">{pageLabels[page] || 'MealSync'}</div></div></div>
        <div className="topbar-right"><label className="global-search"><span className="search-glyph">⌕</span><input value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Search this workspace..." aria-label="Search this workspace" /></label><button type="button" className="icon-btn" onClick={openNotifications} aria-label="Notifications">♧<span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--orange)', position: 'absolute', right: 7, top: 7 }} /></button><button type="button" className="topbar-profile" onClick={() => navigate('profile')}><span className="avatar round">{data.user.fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><span><strong>{data.user.fullName}</strong><small>MealSync member</small></span><span className="muted">⌄</span></button></div>
      </header>
      <div className="role-tabs" role="tablist" aria-label="Switch workspace">{['for-you', ...roles].map((role) => <button key={role} role="tab" type="button" aria-selected={activeRole === role} className={`role-tab ${activeRole === role ? 'active' : ''}`} onClick={() => setActiveRole(role)}><span className="role-dot" />{role === 'for-you' ? 'For you' : roleInfo[role]?.label}</button>)}<span style={{ flex: 1, minWidth: 4 }} /><button className={`role-tab ${page === 'profile' ? 'active' : ''}`} type="button" onClick={() => navigate('profile')}>⚙ Profile</button><button className="role-tab" type="button" onClick={signOut}>Sign out ↗</button></div>
      <main className="page-content">{children}</main>
    </div>
  </div>;
}
