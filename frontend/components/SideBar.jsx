// This is the sidebar component
export default function SideBar() {
  return (
    // The aside tag represents content aside from the main content (like a sidebar)
    <aside className="sidebar">
      {/* The app name at the top of the sidebar */}
      <h2 className="sidebar-title">MealSync</h2>
      
      {/* The navigation container */}
      <nav className="sidebar-nav">
        {/* Each link points to a URL. Since we are not using React Router, this does a full page reload. */}
        <a href="/dashboard">Dashboard</a>
        <a href="/kitchen">Community Kitchen</a>
        <a href="/inventory">Inventory</a>
        <a href="/donor">Donor</a>
        <a href="/organization">Organization</a>
        <a href="/profile">Profile</a>
        <a href="/volunteer">Volunteer</a>
        <a href="/signin">Sign In</a>
      </nav>
    </aside>
  )
}