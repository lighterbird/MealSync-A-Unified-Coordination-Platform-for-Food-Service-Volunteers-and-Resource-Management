// Import the Link component (though we are using plain <a> for now)
export default function LandingPage() {
  return (
    <div className="page">
      <h1>Welcome to MealSync</h1>
      <p>This is the landing page.</p>
      {/* A simple button to go to the kitchen page */}
      <a href="/kitchen" className="button">Go to Community Kitchen</a>
    </div>
  )
}