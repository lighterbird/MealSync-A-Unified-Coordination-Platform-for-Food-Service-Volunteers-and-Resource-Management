# MealSync React frontend — ownership and commit plan

The goal is independent, attributable commits from each teammate. Work in a single repository; do not create separate person-specific folders. Each page has a clear owner. The shared state/context, seed data, styles and component primitives have one owner to reduce merge conflicts.

## Person 1 — Application foundation, authentication, organization, profile and integration

### Owned file updates

- `index.html` — document metadata and React root.
- `package.json`, `vite.config.js`, `.gitignore`, `.env.example` — Vite/npm setup and repo hygiene.
- `src/main.jsx`, `src/App.jsx` — React bootstrap and screen/page selection.
- `src/context/AppContext.jsx` — shared state, navigation, generic collection update helpers, modal and toast state, registration actions.
- `src/data/demoData.js` — seeded records, role descriptions, external opportunity placeholder records.
- `src/components/Brand.jsx`, `Button.jsx`, `Shared.jsx`, `ModalHost.jsx`, `ToastHost.jsx`, `helpers.js` — shared presentation primitives and form/modal conventions.
- `src/layouts/AppLayout.jsx` — sidebar, top navigation, role tabs, global search and notification panel.
- Generated `package-lock.json` — Person 1 creates and commits this after the first successful `npm install`; teammates then use `npm ci`.
- `src/styles.css` — global design tokens and responsive rules.
- `src/pages/LandingPage.jsx`, `AuthPage.jsx`, `OrganizationPage.jsx`, `ProfilePage.jsx` — public landing, demo signup/login, organizer workflows, profile/role selection.
- `README.md`, `docs/FRONTEND_TASKS_BY_PERSON.md` — frontend setup and team ownership instructions.

### Responsibilities

1. Keep shared components and API-shaped action conventions stable for the team.
2. Implement/finalize landing, demo auth, multi-role selector, profile, organization event creation/editing, kitchen discovery/request, and donation-request creation.
3. Review pull requests and merge page work to `develop`; do not rewrite other pages in the shared shell.
4. Confirm the prototype includes all route/page names and that role restrictions are consistently enforced in the UI (server authorization comes later).

### Suggested commits

1. `chore(frontend): initialize React and Vite scaffold`
2. `feat(ui): add app shell, landing and demo authentication`
3. `feat(organization): add event and kitchen coordination screens`
4. `docs(frontend): document ownership and run instructions`

## Person 2 — Volunteer, event discovery and donor workflows

### Owned file updates

- `src/pages/VolunteerPage.jsx`
- `src/pages/EventsPage.jsx`
- `src/pages/OpportunitiesPage.jsx`
- `src/pages/DonorPage.jsx`

Do **not** directly edit `AppContext.jsx`, `demoData.js`, `Shared.jsx`, `ModalHost.jsx`, `AppLayout.jsx`, or `styles.css` without coordinating with Person 1. Use exported hooks/components and shared state helpers as they stand.

### Responsibilities

1. Finalize volunteer availability UI, skill selections, suggested events, registration/cancellation, referrals by MealSync ID and history.
2. Finalize event list search/category/location filters and registration details.
3. Keep source opportunities clearly distinguished from first-party MealSync events. Current external examples are synthetic placeholders, not scraped live data.
4. Finalize contribution forms and donation history; make it explicit that this is a demo ledger with no real payment operation.
5. Validate flows against dummy data and list any future API endpoints required.

### Suggested commits

1. `feat(volunteer): add availability and event recommendations`
2. `feat(events): add discovery filters and registration flow`
3. `feat(donations): add contribution records and history`

## Person 3 — Community kitchen operations, inventory, recipes, schedule and analytics

### Owned file updates

- `src/pages/KitchensPage.jsx`
- `src/pages/InventoryPage.jsx`
- `src/pages/RecipesPage.jsx`
- `src/pages/MealPlannerPage.jsx`
- `src/pages/AnalyticsPage.jsx`

Do **not** directly edit `AppContext.jsx`, `demoData.js`, `Shared.jsx`, `ModalHost.jsx`, `AppLayout.jsx`, or `styles.css` without coordinating with Person 1. Use exported hooks/components and shared state helpers as they stand.

### Responsibilities

1. Finalize kitchen switcher, sample kitchen profile, and accept/reject request handling.
2. Finalize ingredient inventory, low-stock warnings, add-stock and stock-movement interactions; prevent negative stock.
3. Finalize recipe list and deterministic per-serving stock estimate.
4. Finalize meal scheduling with multiple chefs, schedule filters, and planned-vs-actual servings.
5. Finalize demand, surplus and wastage logging/dashboard. Clearly label the visual as historical/manual data, not predictive ML.

### Suggested commits

1. `feat(kitchen): add kitchen overview and request handling`
2. `feat(inventory): add stock tracking and threshold alerts`
3. `feat(meal-planning): add recipes, multi-chef schedule and analytics`

## Shared state contract (owned by Person 1)

- Read current demo values from `const { data } = useMealSync()`.
- Append a demo record with `addItem('<collection>', { ...fields })`.
- Update one record with `updateItem('<collection>', id, { ...fields })`.
- Update cross-collection or date-upsert state with `updateData(previous => ({ ...previous, ... }))`.
- Add recent activity with `addActivity(message)`.
- Report validation/status to users with `showToast(title, message)`.
- Open a form with `openModal({ title, subtitle, fields: [...], onSubmit: values => { ... } })`.
- Use `navigate('page-name')` for internal navigation.
- A form handler can return `false` to keep its modal open after validation fails; otherwise the modal closes after submission.

All of this currently updates only client-side memory. These helpers are not a substitute for API calls, transaction handling or server authorization.

## Commit / Git protocol

Each teammate should use their own branch based on the current `develop` branch. Suggested branches:

- Person 1: `feature/app-shell-org-auth`
- Person 2: `feature/volunteer-events-donors`
- Person 3: `feature/kitchen-operations`

Example commands:

```bash
git switch develop
git pull origin develop
git switch -c feature/volunteer-events-donors
# make only the owned-file updates

git status
git add src/pages/VolunteerPage.jsx src/pages/EventsPage.jsx src/pages/OpportunitiesPage.jsx src/pages/DonorPage.jsx
git commit -m "feat(events): add discovery and donor demo flows"
git push -u origin feature/volunteer-events-donors
```

Open a pull request into `develop` (or merge according to the course team's exact process). Person 1 owns integrations and merges. Never commit `node_modules/`, local secrets, generated temporary files, or personal IDE settings.

## Final integration checklist

- `node --version` reports Node 22.12+ (or 20.19+); `npm install` completes and the generated `package-lock.json` is committed by Person 1; teammates then use `npm ci`.
- `npm run dev` starts the app; landing, demo auth and dashboard render.
- Signup accepts 1–4 roles; role tabs update and disabled roles cannot access protected role pages.
- Event create/edit/filter/register/unregister and referrals work with seeded records.
- Donation contribution creates a history row and advances only the displayed sample progress.
- Inventory cannot be driven below zero; ingredient duplicates are handled.
- One schedule can assign multiple chefs; completing it records actual servings separately from planned servings.
- Demand, surplus and waste actions update the relevant tables/metrics.
- Search on pages with local search works; global search narrows the relevant page where implemented.
- Refresh resets the prototype data; the README says this explicitly.
- All work is committed by the right person on their own branch, and `develop` contains integration commits before final packaging.
