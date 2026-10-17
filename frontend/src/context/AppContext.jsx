import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { initialDemoState, roleInfo } from '../data/demoData';

const AppContext = createContext(null);

const requiredRoleByPage = {
  volunteer: 'volunteer', donor: 'donor', organizer: 'organization', kitchens: 'kitchen',
  inventory: 'kitchen', recipes: 'kitchen', 'meal-planner': 'kitchen', analytics: 'kitchen'
};
const roleHomePage = { 'for-you': 'dashboard', volunteer: 'volunteer', donor: 'donor', organization: 'organizer', kitchen: 'kitchens' };

export function AppProvider({ children }) {
  // Every row here is a seeded browser-only demo record; no information is persisted or sent to a server.
  const [data, setData] = useState(() => {
    const seeded = JSON.parse(JSON.stringify(initialDemoState));
    seeded.availability ||= [
      { day: 'Wednesday', start: '15:00', end: '19:00', place: 'Mumbai', distance: 10, skills: ['Cooking', 'Food packing'] },
      { day: 'Saturday', start: '09:00', end: '14:00', place: 'Mumbai', distance: 10, skills: ['Cooking', 'Food packing', 'Distribution'] }
    ];
    return seeded;
  });
  const dataRef = useRef(data);
  dataRef.current = data;
  const [view, setView] = useState('landing');
  const [page, setPage] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login');
  const [activeRole, setActiveRoleState] = useState('for-you');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const showToast = useCallback((title, message = 'Demo state updated in this page.') => {
    setToast({ title, message, id: Date.now() + Math.random() });
  }, []);
  const closeToast = useCallback(() => setToast(null), []);
  const openModal = useCallback((config) => setModal(config), []);
  const closeModal = useCallback(() => setModal(null), []);

  const updateData = useCallback((updater) => {
    setData((previous) => typeof updater === 'function' ? updater(previous) : { ...previous, ...updater });
  }, []);
  const updateItem = useCallback((collection, id, patch) => {
    updateData((previous) => ({
      ...previous,
      [collection]: (previous[collection] || []).map((item) => String(item.id) === String(id)
        ? { ...item, ...(typeof patch === 'function' ? patch(item) : patch) } : item)
    }));
  }, [updateData]);
  const addItem = useCallback((collection, newItem) => {
    // Compute the record outside the state updater so callers reliably receive it.
    const existing = dataRef.current[collection] || [];
    const numericIds = existing.map((x) => Number(x.id)).filter(Number.isFinite);
    const id = newItem.id ?? (numericIds.length ? Math.max(...numericIds) + 1 : 1);
    const inserted = { ...newItem, id };
    updateData((previous) => ({ ...previous, [collection]: [inserted, ...(previous[collection] || [])] }));
    return inserted;
  }, [updateData]);
  const addActivity = useCallback((message) => {
    updateData((previous) => ({
      ...previous,
      activity: [{ message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...(previous.activity || [])].slice(0, 8)
    }));
  }, [updateData]);

  const navigate = useCallback((nextPage) => {
    const valid = ['dashboard', 'volunteer', 'donor', 'organizer', 'kitchens', 'inventory', 'recipes', 'meal-planner', 'analytics', 'opportunities', 'events', 'profile'];
    const target = valid.includes(nextPage) ? nextPage : 'dashboard';
    const requiredRole = requiredRoleByPage[target];
    if (requiredRole && !data.user.roles.includes(requiredRole)) {
      showToast('Role is not active', `Activate ${roleInfo[requiredRole]?.label || 'this role'} in your profile first.`);
      return;
    }
    setPage(target);
    setView('app');
    const targetRole = {
      dashboard: 'for-you', volunteer: 'volunteer', donor: 'donor', organizer: 'organization', kitchens: 'kitchen',
      inventory: 'kitchen', recipes: 'kitchen', 'meal-planner': 'kitchen', analytics: 'kitchen'
    }[target];
    if (targetRole) setActiveRoleState(targetRole);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [data.user.roles, showToast]);

  const setActiveRole = useCallback((role) => {
    if (role !== 'for-you' && !data.user.roles.includes(role)) {
      showToast('Role is not active', `Activate ${roleInfo[role]?.label || 'this role'} in your profile first.`);
      return;
    }
    setActiveRoleState(role);
    navigate(roleHomePage[role] || 'dashboard');
  }, [data.user.roles, navigate, showToast]);

  const signIn = useCallback(({ fullName, email, roles, city }) => {
    updateData((previous) => ({
      ...previous,
      user: {
        ...previous.user,
        fullName: fullName || previous.user.fullName,
        email: email || previous.user.email,
        roles: roles?.length ? roles : previous.user.roles,
        city: city || previous.user.city,
        mealsyncId: (fullName || previous.user.fullName).toLowerCase().trim().replace(/[^a-z0-9]+/g, '.')
      }
    }));
    setView('app');
    setPage('dashboard');
    setActiveRoleState('for-you');
    showToast('Welcome to MealSync', 'You are using the local demo workspace.');
  }, [showToast, updateData]);

  const signOut = useCallback(() => { setView('landing'); setPage('dashboard'); setActiveRoleState('for-you'); setGlobalSearch(''); setMobileNavOpen(false); showToast('Signed out of demo', 'No real session was created.'); }, [showToast]);

  const registerEvent = useCallback((eventId) => {
    const id = Number(eventId);
    if (data.registeredEventIds.includes(id)) return showToast('Already registered', 'This event is already in your upcoming list.');
    updateData((previous) => ({ ...previous, registeredEventIds: [...previous.registeredEventIds, id] }));
    addActivity(`Registered for ${data.events.find((event) => event.id === id)?.title || 'an event'}`);
    showToast('Registration added', 'This is saved only in the current browser session.');
  }, [addActivity, data.events, data.registeredEventIds, showToast, updateData]);
  const unregisterEvent = useCallback((eventId) => {
    const id = Number(eventId);
    updateData((previous) => ({ ...previous, registeredEventIds: previous.registeredEventIds.filter((x) => x !== id) }));
    addActivity(`Cancelled registration for ${data.events.find((event) => event.id === id)?.title || 'an event'}`);
    showToast('Registration cancelled', 'The demo state has been updated.');
  }, [addActivity, data.events, showToast, updateData]);

  const value = useMemo(() => ({
    data, updateData, updateItem, addItem, addActivity,
    view, setView, page, setPage, authMode, setAuthMode, activeRole, setActiveRoleState,
    navigate, setActiveRole, signIn, signOut, registerEvent, unregisterEvent,
    modal, openModal, closeModal, toast, showToast, closeToast,
    mobileNavOpen, setMobileNavOpen, globalSearch, setGlobalSearch
  }), [data, updateData, updateItem, addItem, addActivity, view, page, authMode, activeRole, navigate, setActiveRole, signIn, signOut, registerEvent, unregisterEvent, modal, openModal, closeModal, toast, showToast, closeToast, mobileNavOpen, globalSearch]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useMealSync() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useMealSync must be used inside AppProvider');
  return context;
}
