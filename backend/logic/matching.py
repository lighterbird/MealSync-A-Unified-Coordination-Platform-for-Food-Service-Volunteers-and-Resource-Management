from models import Event, KitchenRequest, VolunteerRegistration

# --- Kitchen matching ---

def get_matching_events(kitchen):
    # Placeholder: returns first 3 proposed events not yet applied to.
    events = Event.query.filter_by(status="proposed").limit(3).all()
    filtered = []
    for e in events:
        existing = KitchenRequest.query.filter_by(event_id=e.event_id, kitchen_id=kitchen.kitchen_id).first()
        if not existing:
            filtered.append(e)
    return filtered

def calculate_expected_servings(kitchen):
    # Placeholder: returns a fixed value for now.
    return 50

# --- Volunteer matching ---

def get_matching_events_for_volunteer(volunteer_mealsync_id):
    # Placeholder: returns first 3 floated events not yet applied to.
    events = Event.query.filter_by(status="floated").limit(3).all()
    filtered = []
    for e in events:
        existing = VolunteerRegistration.query.filter_by(
            event_id=e.event_id, volunteer_mealsync_id=volunteer_mealsync_id
        ).first()
        if not existing:
            filtered.append(e)
    return filtered