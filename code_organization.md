Directory overview

backend/ - Flask app and database setup
  routes/ - API routes
  models/ - Database models
  logic/ - Event matching
  migrations/ - Database changes
frontend/src/ - React app
  pages/ - App screens
  components/ - Shared UI

Main files

backend/
  app.py - Sets up Flask and registers routes.
  db.py - Provides the shared database object.
  init_db.py - Creates database tables.

backend/routes/
  auth_routes.py - Sign-up, sign-in, and profile updates.
  dashboard_routes.py - Dashboard tasks and event counts.
  donation_routes.py - Donations and donation history.
  event_routes.py - Events and approval of requests.
  kitchen_routes.py - Kitchens, inventory, recipes, and event requests.
  organization_routes.py - Creates and manages organizations.
  volunteer_routes.py - Volunteer profiles and event applications.

backend/models/
  user.py - Users and volunteer profiles.
  organization.py - Organizations and community kitchens.
  event.py - Events, kitchen requests, and volunteer registrations.
  inventory.py - Inventory, recipes, and donations.

backend/logic/
  matching.py - Matches kitchens and volunteers to events and estimates servings.

frontend/src/
  main.jsx - Starts the React app.
  App.jsx - Sets up page routes and tracks sign-in state.

frontend/src/pages/
  LandingPage.jsx - Home page.
  SignInPage.jsx - Sign-in form.
  SignUpPage.jsx - Sign-up form.
  DashboardPage.jsx - Pending tasks and event maps.
  ProfilePage.jsx - Edits account details.
  OrganizationPage.jsx - Manages events and requests.
  CommunityKitchenPage.jsx - Manages kitchens, stock, and recipes.
  VolunteerPage.jsx - Edits volunteer profiles and finds events.
  DonorPage.jsx - Makes donations and shows donation history.

frontend/src/components/
  SideBar.jsx - Page navigation.
  IndiaLocationFields.jsx - State and city fields.
  IndiaEventMaps.jsx - Maps event counts across India.
