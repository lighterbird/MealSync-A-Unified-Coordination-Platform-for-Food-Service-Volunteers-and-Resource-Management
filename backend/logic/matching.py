from models import Event, KitchenRequest

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
    # TODO: Compute from inventory and recipes.
    return 50