# MealSync — React frontend prototype

MealSync is a coordination platform concept for community food service. It brings together four assignable roles—Volunteer, Donor, Organization, and Community Kitchen—around events, volunteer matching, donation requests, inventory, recipe planning, chef scheduling, meal demand, surplus, and wastage.

This repository is the **frontend-only intermediate-submission prototype**. It is built with React and Vite, and is deliberately disconnected from Flask/PostgreSQL. Interactions update seeded in-memory demo state. Refreshing the browser resets those changes. Sign-in and contributions are simulations: there is no authentication server and no payment processing.

## Quick start

Requirements: Node.js 22.12+ (or Node.js 20.19+) and npm. This uses the current Vite 8 toolchain; check `node --version` before installing. Python, Flask, and PostgreSQL are not required to run the frontend prototype.

```bash
npm install
npm run dev
```

Vite normally prints the local URL. This configuration binds to `http://127.0.0.1:5173` by default. After the first successful install, commit the generated `package-lock.json` so all three teammates resolve the same dependency tree. Create a production static bundle with:

```bash
npm run build
npm run preview
```

Copy `.env.example` to `.env` only when preparing future API integration. `VITE_API_BASE_URL` is currently documentation only and is not read by the demo frontend.

## Project layout

```text
mealsync_react/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── README.md
├── docs/
│   └── FRONTEND_TASKS_BY_PERSON.md
└── src/
    ├── main.jsx                  # React entry point and CSS import
    ├── App.jsx                   # Screen routing and global modal/toast hosts
    ├── styles.css                # Shared design system; owner Person 1
    ├── context/
    │   └── AppContext.jsx        # Shared in-memory state/actions; owner Person 1
    ├── data/
    │   └── demoData.js           # Clearly marked seeded example records; owner Person 1
    ├── components/               # Shared controls, cards, table, modal, toast, format helpers
    ├── layouts/
    │   └── AppLayout.jsx         # Sidebar, global header, role tabs; owner Person 1
    └── pages/                    # Feature pages split by teammate ownership
```

## Screens and interactions

- **Public landing:** mission, feature overview, how-it-works section, signup/sign-in and interactive-demo CTA.
- **Authentication:** demo sign-in/sign-up with one-to-four roles. These forms do not securely authenticate or create a server account.
- **For you dashboard:** summary metrics, suggested events, contribution requests, stock alerts and recent activity.
- **Volunteer:** availability windows (day, time, area, distance, skills), event suggestions, registration/cancellation, referrals by MealSync ID and event history.
- **Opportunity discovery / events:** search and filter by category/location, view event details, register/unregister, and inspect sample external listings. External listings are synthetic placeholders; scraping is not implemented.
- **Donor:** view donation requests, record a mock contribution and inspect the donation history. No money is charged or transferred.
- **Organization:** create/edit event listings, search/filter events, view kitchen partners, request kitchen availability for a selected event and publish donation requests.
- **Community kitchen:** switch between sample kitchens, edit demo kitchen details, accept/reject event requests and navigate to operations modules.
- **Inventory:** search/filter ingredients, add a stock item, receive/use/waste/adjust stock, and view threshold alerts.
- **Recipes:** view sample recipes, add a recipe shell and calculate ingredient totals from per-serving quantities against current sample stock.
- **Meal planner:** schedule a recipe, assign one or more chefs, filter upcoming/all/completed shifts, and record actual servings on completion.
- **Analytics:** manually record daily estimated/actual servings, compare them visually and log food surplus/wastage.
- **Profile:** edit sample personal details, select any combination of four roles and view role-specific summaries.

## State and backend integration boundary

`src/data/demoData.js` is the only source of the seeded records. It reproduces the data from the prior single-file HTML prototype and adds clearly labelled synthetic external-opportunity examples. `src/context/AppContext.jsx` clones the seed into React state and offers shared methods (`updateData`, `updateItem`, `addItem`, `addActivity`, `navigate`, `openModal`, `showToast`, and registration actions). Feature pages should use these shared methods instead of introducing their own global mutable objects.

When the Flask backend is ready:

1. Implement the agreed endpoints and authentication/authorization rules.
2. Add a small API client module using `import.meta.env.VITE_API_BASE_URL`.
3. Replace page reads of `data.<collection>` with API-backed loading/query state.
4. Replace calls to `addItem`, `updateItem`, `registerEvent`, and similar demo-only mutations with POST/PATCH/DELETE requests, refresh from server responses, and display loading/error states.
5. Keep the API response schema aligned with `database/schema.json` and `docs/API.md` in the main project repository.

Do not treat frontend role selection as authorization. The backend must validate the authenticated user and their organization/kitchen memberships. Do not store passwords in frontend state or place payment credentials in this project.

## Shared coding rules

- Keep shared state, demo seed data, design tokens, shell and generic components owned by Person 1. Person 2 and Person 3 should request coordinated changes rather than editing shared files casually.
- Put feature-specific UI and interaction logic in the owner's page files. Extract a shared component only after agreement with Person 1.
- Comments marked `DEMO DATA` identify the boundary to replace with API-backed data later.
- Keep components readable; avoid pasting another page's entire implementation into an existing page.
- Commit in small, descriptive increments. Do not push directly to `main`; use feature branches and pull requests/merges to `develop`.

## Team workflow

See [`docs/FRONTEND_TASKS_BY_PERSON.md`](docs/FRONTEND_TASKS_BY_PERSON.md) for the exact page/file ownership split, suggested commit sequence and integration checklist for Person 1, Person 2 and Person 3.
