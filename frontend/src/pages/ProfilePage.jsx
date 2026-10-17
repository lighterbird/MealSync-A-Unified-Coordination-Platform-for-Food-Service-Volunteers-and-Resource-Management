// Personal profile and multi-role preference management.
// DEMO DATA BOUNDARY: reads/writes use AppContext's in-memory seeded records. Replace these calls with the agreed Flask API; see docs/FRONTEND_TASKS_BY_PERSON.md.
import { useEffect, useState } from 'react';
import Button from '../components/Button';
import { DemoBanner, PageHeading, Pill, SectionCard } from '../components/Shared';
import { useMealSync } from '../context/AppContext';
import { roleInfo } from '../data/demoData';
import { initials } from '../components/helpers';

export default function ProfilePage() {
  const { data, updateData, addActivity, showToast, openModal, navigate, setActiveRoleState, activeRole } = useMealSync();
  const [selectedRoles, setSelectedRoles] = useState(data.user.roles);
  useEffect(() => setSelectedRoles(data.user.roles), [data.user.roles]);
  const editProfile = () => openModal({ title: 'Edit personal details', subtitle: 'Changes apply to this browser-only demo session.', wide: true, fields: [
    { name: 'fullName', label: 'Full name', value: data.user.fullName, required: true },
    { name: 'email', label: 'Email address', type: 'email', value: data.user.email, required: true },
    { name: 'phone', label: 'Phone number', value: data.user.phone || '', required: false },
    { name: 'city', label: 'Primary service area', value: data.user.city || '', required: true },
    { name: 'bio', label: 'About you', type: 'textarea', value: data.user.bio || '', required: false, full: true }
  ], onSubmit: (values) => { const mealsyncId = values.fullName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '.'); updateData((previous) => ({ ...previous, user: { ...previous.user, ...values, mealsyncId } })); addActivity('Updated personal profile'); showToast('Profile updated'); }});
  const saveRoles = () => {
    if (!selectedRoles.length) { showToast('Keep at least one role active', 'A MealSync account must have at least one role.'); return; }
    updateData((previous) => ({ ...previous, user: { ...previous.user, roles: selectedRoles } }));
    addActivity(`Updated role preferences: ${selectedRoles.map((role) => roleInfo[role].label).join(', ')}`);
    showToast('Role preferences saved', 'The available role tabs have been updated.');
    if (activeRole !== 'for-you' && !selectedRoles.includes(activeRole)) setActiveRoleState('for-you');
  };
  const kitchen = data.kitchens.find((item) => item.id === data.activeKitchenId) || data.kitchens[0];
  const toggleRole = (role) => setSelectedRoles((current) => current.includes(role) ? current.filter((value) => value !== role) : [...current, role]);
  return <><DemoBanner/><PageHeading title="Your profile" subtitle="Manage personal details, active roles and role-specific information." actions={<Button variant="primary" onClick={editProfile}>Edit personal details</Button>}/>
    <div className="profile-layout"><aside className="card profile-side"><span className="avatar round" style={{ width: 68, height: 68, fontSize: 18 }}>{initials(data.user.fullName)}</span><h2>{data.user.fullName}</h2><p>@{data.user.mealsyncId}</p><Pill tone="green"><i className="status-dot"/> Active demo member</Pill><hr className="divider"/><div style={{ textAlign: 'left' }}><div className="muted tiny" style={{ marginBottom: 8 }}>ACTIVE ROLES</div><div className="inline-actions">{data.user.roles.map((role) => <Pill key={role}>{roleInfo[role].icon} {roleInfo[role].label}</Pill>)}</div></div><Button variant="secondary" className="btn-block" style={{ marginTop: 20 }} onClick={() => document.getElementById('role-preferences')?.scrollIntoView({ behavior: 'smooth' })}>Manage roles</Button></aside>
      <div className="stack"><SectionCard title="Personal information" subtitle="Basic account details visible on your profile."><div className="profile-info-row"><span>Full name</span><strong>{data.user.fullName}</strong></div><div className="profile-info-row"><span>Email</span><strong>{data.user.email}</strong></div><div className="profile-info-row"><span>Phone</span><strong>{data.user.phone || 'Not added'}</strong></div><div className="profile-info-row"><span>MealSync ID</span><strong>@{data.user.mealsyncId}</strong></div><div className="profile-info-row"><span>Primary service area</span><strong>{data.user.city || 'Not added'}</strong></div><div className="profile-info-row"><span>About</span><strong>{data.user.bio || 'No bio yet'}</strong></div></SectionCard>
      <SectionCard title="Role preferences" subtitle="One account can activate multiple roles; organization and kitchen membership should be separately authorized." ><div id="role-preferences" className="check-grid">{Object.entries(roleInfo).map(([key, role]) => <label className="check-option" key={key}><input type="checkbox" checked={selectedRoles.includes(key)} onChange={() => toggleRole(key)}/><span><strong>{role.icon} {role.label}</strong><span>{role.desc}</span></span></label>)}</div><Button variant="primary" style={{ marginTop: 16 }} onClick={saveRoles}>Save role preferences</Button></SectionCard>
      <SectionCard title="Role-specific information" subtitle="These are summaries of the currently selected role workspaces."><div className="list-row"><span className="avatar">🤝</span><div className="grow"><strong>Volunteer</strong><small>{(data.availability || []).length} availability windows · skills: {[...new Set((data.availability || []).flatMap((slot) => slot.skills))].join(', ') || 'not set'}</small></div><Button size="sm" onClick={() => navigate('volunteer')}>Open</Button></div><div className="list-row"><span className="avatar blue">💚</span><div className="grow"><strong>Donor</strong><small>{data.donations.length} recorded contribution(s).</small></div><Button size="sm" onClick={() => navigate('donor')}>Open</Button></div><div className="list-row"><span className="avatar purple">🏢</span><div className="grow"><strong>Organization</strong><small>{data.events.filter((event) => event.org.includes(data.user.fullName) || event.org.includes('demo organizer')).length} demo events associated with this account.</small></div><Button size="sm" onClick={() => navigate('organizer')}>Open</Button></div><div className="list-row"><span className="avatar orange">🍲</span><div className="grow"><strong>Community kitchen</strong><small>{kitchen?.name || 'No kitchen selected'} · {data.inventory.length} ingredient types tracked.</small></div><Button size="sm" onClick={() => navigate('kitchens')}>Open</Button></div></SectionCard>
      <SectionCard title="Privacy & account safety" subtitle="Production account controls belong on the backend."><div className="list-row"><span className="avatar">🔐</span><div className="grow"><strong>Password and sessions</strong><small>Handled only by a real authentication service in the deployed app.</small></div><Button size="sm" onClick={() => showToast('Security note', 'Never store plaintext passwords or trust role flags sent by the browser.')}>Learn more</Button></div><div className="list-row"><span className="avatar blue">♙</span><div className="grow"><strong>Role-based access</strong><small>Organization and kitchen membership should be checked server-side.</small></div><Pill tone="green">Required</Pill></div></SectionCard></div></div>
  </>;
}
