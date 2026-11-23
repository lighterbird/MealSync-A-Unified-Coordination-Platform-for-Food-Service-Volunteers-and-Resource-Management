import { useState } from 'react';
import { sidebarRoles, defaultSidebarRoles } from '../sidebarRoles';

export default function ProfilePage({ user, onSave }) {
  const [name, setName] = useState(user.name);
  const [roles, setRoles] = useState(user.sidebar_roles ?? defaultSidebarRoles);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleRole = roleId => {
    setRoles(current => current.includes(roleId)
      ? current.filter(role => role !== roleId)
      : [...current, roleId]);
    setMessage('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sidebar_roles: roles })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save your profile.');
      setName(data.name);
      setRoles(data.sidebar_roles);
      onSave(data);
      setMessage('Profile saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h1>Profile</h1>
      <p>MealSync ID <strong>{user.mealsync_id}</strong></p>
      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="form-field">Username
          <input value={name} required maxLength={120} disabled={saving}
            onChange={event => { setName(event.target.value); setMessage(''); }} />
        </label>
        <fieldset className="profile-roles" disabled={saving} aria-describedby="profile-roles-help">
          <legend>Roles interested in</legend>
          <p id="profile-roles-help">Choose at least one role to show in the sidebar.</p>
          {sidebarRoles.map(role => (
            <label key={role.id}>
              <input type="checkbox" checked={roles.includes(role.id)}
                disabled={roles.length === 1 && roles.includes(role.id)} onChange={() => toggleRole(role.id)} />
              {role.label}
            </label>
          ))}
        </fieldset>
        <div className="form-actions">
          <button type="submit" className="button primary" disabled={saving}>Save Profile</button>
        </div>
        {message && <p role="status">{message}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </form>
    </div>
  );
}
