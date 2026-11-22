import { Link, useNavigate } from 'react-router-dom';

export default function SideBar({ onLogout }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    onLogout();
    navigate('/');
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
    </aside>
  );
}