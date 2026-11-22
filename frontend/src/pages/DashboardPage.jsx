export default function DashboardPage({ user }) {
  return (
    <div className="page">
      <h1>Welcome, {user.name}!</h1>
      <p>Your MealSync ID is: <strong>{user.mealsync_id}</strong></p>
      <p>This is the For You dashboard. We will build this out in later stages.</p>
    </div>
  );
}