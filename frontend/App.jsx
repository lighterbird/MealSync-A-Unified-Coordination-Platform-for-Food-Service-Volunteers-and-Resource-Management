// Import the Sidebar component
import SideBar from './components/SideBar.jsx'
// Import all our pages
import LandingPage from './pages/LandingPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CommunityKitchenPage from './pages/CommunityKitchenPage.jsx'
import InventoryPage from './pages/InventoryPage.jsx'
import DonorPage from './pages/DonorPage.jsx'
import OrganizationPage from './pages/OrganizationPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import VolunteerPage from './pages/VolunteerPage.jsx'

// This is the main App component
export default function App() {
  // Get the current URL path from the browser (e.g. "/kitchen")
  const path = window.location.pathname

  // This function returns the correct page component based on the URL
  const renderPage = () => {
    // If the URL is the root "/", show the Landing Page
    if (path === '/') return <LandingPage />
    // If the URL is /dashboard, show Dashboard
    if (path === '/dashboard') return <DashboardPage />
    // If the URL is /kitchen, show the Community Kitchen Page
    if (path === '/kitchen') return <CommunityKitchenPage />
    // If the URL is /inventory, show Inventory
    if (path === '/inventory') return <InventoryPage />
    // If the URL is /donor, show Donor
    if (path === '/donor') return <DonorPage />
    // If the URL is /organization, show Organization
    if (path === '/organization') return <OrganizationPage />
    // If the URL is /profile, show Profile
    if (path === '/profile') return <ProfilePage />
    // If the URL is /signin, show Sign In
    if (path === '/signin') return <SignInPage />
    // If the URL is /volunteer, show Volunteer
    if (path === '/volunteer') return <VolunteerPage />
    
    // If no match, just show Landing Page as a fallback
    return <LandingPage />
  }

  // Return the layout: Sidebar on the left, Main Content on the right
  return (
    <div className="app-container">
      {/* The Sidebar is always visible on the left */}
      <SideBar />
      {/* The main content area changes based on the URL */}
      <main className="main-content">
        {/* Call the function to render the correct page */}
        {renderPage()}
      </main>
    </div>
  )
}