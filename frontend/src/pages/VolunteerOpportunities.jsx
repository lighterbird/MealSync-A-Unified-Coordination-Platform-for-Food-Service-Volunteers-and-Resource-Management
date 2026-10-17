
import { useState } from "react";
import "./styles/opportunities.css";

const opportunities = [
  {
    id: 1,
    title: "Community Lunch Service",
    organization: "Seva Neighbourhood Network",
    category: "Food Distribution",
    location: "Chembur, Mumbai",
    date: "24 October 2026",
    time: "10:00 AM – 2:00 PM",
    volunteersNeeded: 8,
    volunteersJoined: 5,
    skills: ["Food packing", "Distribution"],
    description:
      "Help prepare meal packets and distribute lunch to community members.",
  },
  {
    id: 2,
    title: "Evening Meal Prep",
    organization: "Annapurna Community Trust",
    category: "Cooking",
    location: "Ghatkopar, Mumbai",
    date: "25 October 2026",
    time: "3:00 PM – 7:00 PM",
    volunteersNeeded: 6,
    volunteersJoined: 2,
    skills: ["Cooking", "Food hygiene"],
    description:
      "Assist the kitchen team with preparing and packing evening meals.",
  },
  {
    id: 3,
    title: "Weekend Grocery Sorting",
    organization: "Community Food Collective",
    category: "Inventory",
    location: "Kurla, Mumbai",
    date: "26 October 2026",
    time: "9:00 AM – 12:00 PM",
    volunteersNeeded: 5,
    volunteersJoined: 3,
    skills: ["Sorting", "Organization"],
    description:
      "Sort donated groceries and organise ingredients for upcoming meal services.",
  },
];

export default function VolunteerOpportunities() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [appliedEvents, setAppliedEvents] = useState([]);

  const categories = [
    "All",
    ...new Set(opportunities.map((event) => event.category)),
  ];

  const filteredEvents = opportunities.filter((event) => {
    const searchText = [
      event.title,
      event.organization,
      event.location,
      event.category,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || event.category === category;

    return matchesSearch && matchesCategory;
  });

  function handleApply(eventId) {
    setAppliedEvents((current) =>
      current.includes(eventId)
        ? current
        : [...current, eventId]
    );
  }

  return (
    <div className="opportunities-page">
      <header className="opportunities-header">
        <p className="eyebrow">MEALSYNC / VOLUNTEER</p>
        <h1>Find an opportunity to help</h1>
        <p>
          Discover community food services and find a way to contribute.
        </p>
      </header>

      <section className="opportunities-summary">
        <div>
          <strong>{opportunities.length}</strong>
          <span>Opportunities listed</span>
        </div>
        <div>
          <strong>{appliedEvents.length}</strong>
          <span>Applications in this session</span>
        </div>
      </section>

      <section className="opportunities-filters">
        <input
          type="search"
          placeholder="Search by event, organisation or location"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search opportunities"
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All categories" : item}
            </option>
          ))}
        </select>
      </section>

      <section className="opportunities-list">
        <div className="opportunities-list-heading">
          <h2>Available opportunities</h2>
          <span>{filteredEvents.length} found</span>
        </div>

        {filteredEvents.length === 0 ? (
          <p className="no-opportunities">
            No opportunities match your search. Try another keyword or category.
          </p>
        ) : (
          filteredEvents.map((event) => {
            const hasApplied = appliedEvents.includes(event.id);
            const spotsLeft =
              event.volunteersNeeded - event.volunteersJoined;

            return (
              <article className="opportunity-card" key={event.id}>
                <div className="opportunity-card-top">
                  <span className="category-label">{event.category}</span>
                  <span className="spots-label">
                    {spotsLeft} spots left
                  </span>
                </div>

                <h3>{event.title}</h3>
                <p className="organisation-name">{event.organization}</p>

                <div className="opportunity-meta">
                  <p>📍 {event.location}</p>
                  <p>📅 {event.date}</p>
                  <p>🕒 {event.time}</p>
                </div>

                <p className="opportunity-description">
                  {event.description}
                </p>

                <div className="skill-list">
                  {event.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>

                <div className="opportunity-actions">
                  <button
                    className="secondary-button"
                    onClick={() => setSelectedEvent(event)}
                  >
                    View details
                  </button>

                  <button
                    className="primary-button"
                    disabled={hasApplied || spotsLeft <= 0}
                    onClick={() => handleApply(event.id)}
                  >
                    {hasApplied
                      ? "Applied ✓"
                      : spotsLeft <= 0
                        ? "Full"
                        : "Apply to volunteer"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>

      {selectedEvent && (
        <div
          className="event-modal-backdrop"
          onClick={() => setSelectedEvent(null)}
        >
          <section
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close details"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>

            <span className="category-label">
              {selectedEvent.category}
            </span>
            <h2 id="event-modal-title">{selectedEvent.title}</h2>
            <p>{selectedEvent.organization}</p>
            <p>{selectedEvent.description}</p>
            <p>
              <strong>Location:</strong> {selectedEvent.location}
            </p>
            <p>
              <strong>Date:</strong> {selectedEvent.date}
            </p>
            <p>
              <strong>Time:</strong> {selectedEvent.time}
            </p>
            <p>
              <strong>Skills:</strong> {selectedEvent.skills.join(", ")}
            </p>

            <button
              className="primary-button"
              disabled={
                appliedEvents.includes(selectedEvent.id) ||
                selectedEvent.volunteersJoined >=
                  selectedEvent.volunteersNeeded
              }
              onClick={() => handleApply(selectedEvent.id)}
            >
              {appliedEvents.includes(selectedEvent.id)
                ? "Already applied"
                : "Apply to volunteer"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
