import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { sidebarRoles, defaultSidebarRoles } from '../sidebarRoles';

export default function SideBar({ roles = defaultSidebarRoles, onLogout }) {
  const navigate = useNavigate();
  const [signOutError, setSignOutError] = useState('');

  const handleSignOut = async () => {
    setSignOutError('');
    try {
      await onLogout();
      navigate('/');
    } catch {
      setSignOutError('Could not sign out. Please try again.');
    }
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">MealSync</h2>
      
      <nav className="sidebar-nav" aria-label="Main navigation">
        <NavLink to="/dashboard">For You</NavLink>
        {sidebarRoles.filter(role => roles.includes(role.id)).map(role => (
          <NavLink key={role.id} to={role.path}>{role.label}</NavLink>
        ))}
        <NavLink to="/profile">Profile</NavLink>
      </nav>

      <button onClick={handleSignOut} className="signout-btn">
        Sign Out
      </button>
      {signOutError && <p className="error" role="alert">{signOutError}</p>}
    </aside>
  );
}
