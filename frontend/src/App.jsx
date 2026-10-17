import { Route, Routes } from "react-router-dom";

// Person 1 owns this route table. Feature pages should be exported from separate files.
export default function App() {
  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 760, margin: "64px auto", padding: 24 }}>
      <h1>MealSync</h1>
      <p>The React route shell is scaffolded for later implementation. For the current interactive UI, open <code>prototype/mealsync_frontend_demo.html</code> directly from the repository root.</p>
      <Routes>
        <Route path="*" element={<p>Feature pages will be added in separate modules by the feature owners.</p>} />
      </Routes>
    </main>
  );
}
