from datetime import date

from sqlalchemy import func

from db import db
from models import Event, KitchenRequest, VolunteerProfile, VolunteerRegistration
from models.user import SAME_CITY_ONLY

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
    profile = db.session.get(VolunteerProfile, volunteer_mealsync_id)
    if not profile or not profile.available_dates:
        return []

    try:
        start, end = (
            date.fromisoformat(value.strip())
            for value in profile.available_dates.replace(" to ", ",").split(",")
        )
    except ValueError:
        return []

    state = (profile.state or "").strip().lower()
    city = (profile.city or "").strip().lower()
    if start > end or not state or (profile.matching_flexibility == SAME_CITY_ONLY and not city):
        return []

    applied = VolunteerRegistration.query.filter_by(
        volunteer_mealsync_id=volunteer_mealsync_id
    ).filter(VolunteerRegistration.event_id == Event.event_id).exists()
    matches = Event.query.filter(
        Event.status == "floated",
        Event.event_date.between(start, end),
        func.lower(func.trim(Event.state)) == state,
        ~applied,
    )
    if profile.matching_flexibility == SAME_CITY_ONLY:
        matches = matches.filter(func.lower(func.trim(Event.city)) == city)
    return matches.order_by(Event.event_date, Event.event_id).all()
