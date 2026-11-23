from datetime import date

from sqlalchemy import func

from db import db
from models import Event, KitchenRequest, VolunteerProfile, VolunteerRegistration
from models.location import SAME_CITY_ONLY, SAME_STATE_ONLY

# --- Kitchen matching ---

def get_matching_events(kitchen):
    applied = KitchenRequest.query.filter_by(kitchen_id=kitchen.kitchen_id).filter(
        KitchenRequest.event_id == Event.event_id
    ).exists()
    candidates = Event.query.filter(Event.status == "proposed", ~applied).all()
    max_people = calculate_expected_servings(kitchen) * 3 // 2
    return [
        event for event in candidates
        if event.expected_people <= max_people and kitchen_location_matches(kitchen, event)
    ]


def kitchen_location_matches(kitchen, event):
    same_state = kitchen.state.strip().lower() == event.state.strip().lower()
    same_city = kitchen.city.strip().lower() == event.city.strip().lower()
    return same_state and (same_city or event.kitchen_flexibility == SAME_STATE_ONLY)


def calculate_expected_servings(kitchen):
    stock = {
        item.item_id: int(item.quantity * 100)
        for item in kitchen.inventory if item.quantity.is_finite() and item.quantity > 0
    }
    recipes = []
    for recipe in kitchen.recipes:
        ingredients = recipe.ingredients
        if not ingredients or any(
            ingredient.item_id not in stock
            or not ingredient.quantity_per_serving.is_finite()
            or ingredient.quantity_per_serving <= 0
            for ingredient in ingredients
        ):
            continue
        recipes.append({
            ingredient.item_id: int(ingredient.quantity_per_serving * 100)
            for ingredient in ingredients
        })
    if not recipes:
        return 0

    from scipy.optimize import LinearConstraint, milp

    used_items = sorted(set().union(*recipes))
    amounts = [[recipe.get(item_id, 0) for recipe in recipes] for item_id in used_items]
    upper_bounds = [stock.get(item_id, 0) for item_id in used_items]
    if all(b == 0 for b in upper_bounds):
        return 0

    result = milp(
        c=[-1] * len(recipes),
        integrality=[1] * len(recipes),
        constraints=LinearConstraint(amounts, 0, upper_bounds),
        options={"mip_rel_gap": 0},
    )
    if not result.success:
        raise RuntimeError(f"Could not calculate kitchen capacity: {result.message}")
    return round(-result.fun)

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
