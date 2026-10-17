import { AppProvider, useMealSync } from './context/AppContext';
import AppLayout from './layouts/AppLayout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import VolunteerPage from './pages/VolunteerPage';
import DonorPage from './pages/DonorPage';
import OrganizationPage from './pages/OrganizationPage';
import KitchensPage from './pages/KitchensPage';
import InventoryPage from './pages/InventoryPage';
import RecipesPage from './pages/RecipesPage';
import MealPlannerPage from './pages/MealPlannerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import EventsPage from './pages/EventsPage';
import ProfilePage from './pages/ProfilePage';
import ModalHost from './components/ModalHost';
import ToastHost from './components/ToastHost';

function RoutedApp() {
  const { view, page, modal, closeModal, toast, closeToast } = useMealSync();
  const pages = {
    dashboard: <DashboardPage />, volunteer: <VolunteerPage />, donor: <DonorPage />, organizer: <OrganizationPage />, kitchens: <KitchensPage />,
    inventory: <InventoryPage />, recipes: <RecipesPage />, 'meal-planner': <MealPlannerPage />, analytics: <AnalyticsPage />,
    opportunities: <OpportunitiesPage />, events: <EventsPage />, profile: <ProfilePage />
  };
  return <>
    {view === 'landing' ? <LandingPage /> : view === 'auth' ? <AuthPage /> : <AppLayout>{pages[page] || pages.dashboard}</AppLayout>}
    <ModalHost modal={modal} closeModal={closeModal} />
    <ToastHost toast={toast} closeToast={closeToast} />
  </>;
}

export default function App() {
  return <AppProvider><RoutedApp /></AppProvider>;
}
