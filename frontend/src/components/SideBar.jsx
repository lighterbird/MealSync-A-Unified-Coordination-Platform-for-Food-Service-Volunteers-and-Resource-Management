import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SideBar({ onLogout }) {
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
      
      <nav className="sidebar-nav">
        <Link to="/dashboard">For You</Link>
        <Link to="/volunteer">Volunteer</Link>
        <Link to="/organization">Organization</Link>
        <Link to="/kitchen">Community Kitchen</Link>
        <Link to="/donor">Donor</Link>
        <Link to="/profile">Profile</Link>
      </nav>

      <button onClick={handleSignOut} className="signout-btn">
        Sign Out
      </button>
      {signOutError && <p className="error" role="alert">{signOutError}</p>}
    </aside>
  );
}
