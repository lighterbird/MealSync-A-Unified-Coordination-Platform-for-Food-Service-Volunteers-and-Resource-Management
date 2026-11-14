// Import React hooks to manage state and side effects
import { useState, useEffect } from 'react'

// This is the Community Kitchen Page component
export default function CommunityKitchenPage() {
  // State to hold the list of kitchens fetched from the database
  const [kitchens, setKitchens] = useState([])
  // State to hold the new kitchen name typed by the user
  const [newKitchenName, setNewKitchenName] = useState('')
  // State to hold any error message
  const [error, setError] = useState('')
  // State to hold a loading indicator
  const [loading, setLoading] = useState(true)

  // This function fetches the list of kitchens from Flask
  const fetchKitchens = async () => {
    try {
      // Make a GET request to the Flask backend
      const response = await fetch('http://localhost:5000/api/kitchens')
      // If the response is not OK, throw an error
      if (!response.ok) throw new Error('Failed to fetch')
      // Parse the JSON response
      const data = await response.json()
      // Update the state with the fetched data
      setKitchens(data)
    } catch (err) {
      // If there is an error, save it to state
      setError('Could not load kitchens. Is Flask running?')
    } finally {
      // Turn off loading regardless of success or failure
      setLoading(false)
    }
  }

  // useEffect runs once when the component mounts
  useEffect(() => {
    // Call the fetch function
    fetchKitchens()
  }, []) // The empty array means it only runs once

  // This function handles submitting the form to create a new kitchen
  const handleCreateKitchen = async (e) => {
    // Prevent the default form submission (which would reload the page)
    e.preventDefault()
    // Clear any previous errors
    setError('')

    // Check if the name is empty
    if (!newKitchenName.trim()) {
      setError('Kitchen name cannot be empty')
      return
    }

    try {
      // Make a POST request to Flask to create the kitchen
      const response = await fetch('http://localhost:5000/api/kitchens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Send the kitchen name in the request body
        body: JSON.stringify({ name: newKitchenName })
      })

      // If Flask returns an error, handle it
      if (!response.ok) throw new Error('Failed to create kitchen')

      // Clear the input field
      setNewKitchenName('')
      // Refetch the list to show the new kitchen
      fetchKitchens()
    } catch (err) {
      // Save error message
      setError('Could not create kitchen.')
    }
  }

  // If we are still loading, show a simple message
  if (loading) return <div className="page">Loading kitchens...</div>

  // Return the UI
  return (
    <div className="page">
      {/* Page Title */}
      <h1>Community Kitchens</h1>
      
      {/* Show error message if exists */}
      {error && <p className="error">{error}</p>}

      {/* Section to create a new kitchen */}
      <section className="section">
        <h2>Create a New Kitchen</h2>
        {/* Form submission is handled by handleCreateKitchen */}
        <form onSubmit={handleCreateKitchen}>
          {/* Label and Input for the kitchen name */}
          <label>
            Kitchen Name:
            {/* The value is controlled by React state */}
            <input 
              type="text" 
              value={newKitchenName} 
              onChange={(e) => setNewKitchenName(e.target.value)} 
              placeholder="e.g. Main Street Kitchen"
            />
          </label>
          {/* Submit button */}
          <button type="submit" className="button">Create Kitchen</button>
        </form>
      </section>

      {/* Section to list existing kitchens */}
      <section className="section">
        <h2>Existing Kitchens</h2>
        {/* If no kitchens, show a message */}
        {kitchens.length === 0 ? (
          <p>No kitchens found. Create one above.</p>
        ) : (
          // Otherwise, loop through the list and show each kitchen
          <ul className="kitchen-list">
            {kitchens.map((kitchen) => (
              <li key={kitchen.id}>
                <strong>{kitchen.name}</strong> (ID: {kitchen.id})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}