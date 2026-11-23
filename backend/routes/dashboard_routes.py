from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, session
from sqlalchemy import case, func, or_

from db import db
from models import CommunityKitchen, Event, KitchenRequest, Organization, VolunteerRegistration

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")
INDIA_TIME = timezone(timedelta(hours=5, minutes=30))


@dashboard_bp.get("/action-items")
def action_items():
    user_id = session.get("mealsync_id")
    if not user_id:
        return jsonify({"error": "Sign in to view your action items."}), 401

    organizer_events = db.session.query(Event.event_id).join(Event.organization).filter(
        Organization.admin_mealsync_id == user_id,
        or_(
            Event.kitchen_requests.any(KitchenRequest.status == "pending"),
            Event.volunteer_registrations.any(VolunteerRegistration.status == "requested"),
        ),
    ).order_by(Event.event_id).all()
    items = [f"Event {event_id} has pending requests." for (event_id,) in organizer_events]

    kitchen_requests = db.session.query(KitchenRequest.event_id, CommunityKitchen.name).join(
        KitchenRequest.kitchen
    ).filter(
        CommunityKitchen.admin_mealsync_id == user_id, KitchenRequest.status == "pending",
    ).order_by(KitchenRequest.event_id, CommunityKitchen.kitchen_id).all()
    items.extend(
        f"The kitchen request for event {event_id} ({name}) is still being processed."
        for event_id, name in kitchen_requests
    )

    volunteer_requests = db.session.query(VolunteerRegistration.event_id).filter_by(
        volunteer_mealsync_id=user_id, status="requested",
    ).distinct().order_by(VolunteerRegistration.event_id).all()
    items.extend(f"Your volunteer request for event {event_id} is still being processed."
                 for (event_id,) in volunteer_requests)

    kitchens = db.session.query(CommunityKitchen.name, CommunityKitchen.expected_servings).filter(
        CommunityKitchen.admin_mealsync_id == user_id, CommunityKitchen.expected_servings < 25,
    ).order_by(CommunityKitchen.kitchen_id).all()
    items.extend(f"{name} has low inventory and can currently serve {servings} people."
                 for name, servings in kitchens)
    return jsonify({"items": items})


@dashboard_bp.get("/event-counts")
def event_counts():
    today = datetime.now(INDIA_TIME).date()
    counts = db.session.query(
        Event.state,
        func.sum(case((Event.event_date < today, 1), else_=0)),
        func.sum(case((Event.event_date >= today, 1), else_=0)),
    ).filter(
        Event.status == "floated", Event.kitchen_id.is_not(None),
    ).group_by(Event.state).all()
    return jsonify([
        {"state": state, "lifetime": lifetime, "active": active}
        for state, lifetime, active in counts
    ])
