import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>Welcome to MealSync</h1>
        <p className="tagline">A Unified Coordination Platform for Food Service, Volunteers, and Resource Management.</p>
        
        <div className="features">
          <div className="feature-card">
            <h3>Volunteer</h3>
            <p>Find events that match your skills and availability.</p>
          </div>
          <div className="feature-card">
            <h3>Donate</h3>
            <p>Support community kitchens and reduce food wastage.</p>
          </div>
          <div className="feature-card">
            <h3>Manage Kitchens</h3>
            <p>Track inventory, recipes, and coordinate with NGOs.</p>
          </div>
        </div>

        <div className="landing-actions">
          <Link to="/signup" className="button primary">Sign Up</Link>
          <Link to="/signin" className="button secondary">Sign In</Link>
        </div>
      </div>
    </div>
  );
}