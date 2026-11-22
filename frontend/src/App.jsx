import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SideBar from './components/SideBar';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import VolunteerPage from './pages/VolunteerPage';
import OrganizationPage from './pages/OrganizationPage';
import CommunityKitchenPage from './pages/CommunityKitchenPage';
import DonorPage from './pages/DonorPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  // Auth state: reads from localStorage so it survives page refreshes
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mealsync_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Wrapper to save user to state AND localStorage on login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('mealsync_user', JSON.stringify(userData));
  };

  // Wrapper to clear user on logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mealsync_user');
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Only show sidebar if logged in */}
        {user && <SideBar onLogout={handleLogout} />}
        
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/signin" element={user ? <Navigate to="/dashboard" /> : <SignInPage onLogin={handleLogin} />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUpPage />} />

            {/* Protected Routes (Redirect to signin if not logged in) */}
            <Route path="/dashboard" element={user ? <DashboardPage user={user} /> : <Navigate to="/signin" />} />
            <Route path="/volunteer" element={user ? <VolunteerPage /> : <Navigate to="/signin" />} />
            <Route path="/organization" element={user ? <OrganizationPage user={user} /> : <Navigate to="/signin" />} />
            <Route path="/kitchen" element={user ? <CommunityKitchenPage /> : <Navigate to="/signin" />} />
            <Route path="/donor" element={user ? <DonorPage /> : <Navigate to="/signin" />} />
            <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/signin" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}