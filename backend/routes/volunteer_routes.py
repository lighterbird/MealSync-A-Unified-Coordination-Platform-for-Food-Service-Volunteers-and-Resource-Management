from datetime import date

from flask import Blueprint, request, jsonify, session
from db import db
from models import Event, VolunteerRegistration, VolunteerProfile, User
from models.user import SAME_CITY_ONLY, SAME_STATE_ONLY
from logic.matching import get_matching_events_for_volunteer

volunteer_bp = Blueprint("volunteer", __name__, url_prefix="/api/volunteers")

def generate_registration_id():
    last = VolunteerRegistration.query.order_by(VolunteerRegistration.registration_id.desc()).first()
    if not last:
        return "VR00001"
    return f"VR{int(last.registration_id[2:]) + 1:05d}"

# --- Profile ---

@volunteer_bp.route("/profile/<mealsync_id>", methods=["GET"])
def get_profile(mealsync_id):
    p = VolunteerProfile.query.get(mealsync_id)
    if not p:
        return jsonify({"exists": False})
    return jsonify({
        "exists": True,
        "description": p.description,
        "city": p.city,
        "state": p.state,
        "flexibility": p.matching_flexibility,
        "available_dates": p.available_dates
    })

@volunteer_bp.route("/profile/<mealsync_id>", methods=["POST", "PUT"])
def save_profile(mealsync_id):
    data = request.get_json()
    if "flexibility" in data:
        flexibility = data["flexibility"]
        if type(flexibility) is not int or flexibility not in (SAME_CITY_ONLY, SAME_STATE_ONLY):
            return jsonify({"error": "Choose Same city only or Same state only."}), 400

    available_dates = data.get("available_dates")
    if available_dates is not None:
        try:
            start, end = map(date.fromisoformat, available_dates.split(","))
            if start > end or available_dates != f"{start.isoformat()},{end.isoformat()}":
                raise ValueError
        except (AttributeError, ValueError):
            return jsonify({"error": "Enter a valid availability start and end date in order."}), 400

    p = VolunteerProfile.query.get(mealsync_id)
    if not p:
        p = VolunteerProfile(mealsync_id=mealsync_id)
        db.session.add(p)
    p.description = data.get("description", p.description)
    p.city = data.get("city", p.city)
    p.state = data.get("state", p.state)
    p.flexibility = data.get("flexibility", p.flexibility)
    if "available_dates" in data:
        p.available_dates = available_dates
    db.session.commit()
    return jsonify({"message": "Profile saved"}), 200

# --- Events ---

@volunteer_bp.route("/all-events/<mealsync_id>", methods=["GET"])
def all_events(mealsync_id):
    events = Event.query.filter_by(status="floated").all()
    applied = {r.event_id for r in VolunteerRegistration.query.filter_by(volunteer_mealsync_id=mealsync_id).all()}
    return jsonify([{
        "event_id": e.event_id,
        "org_name": e.organization.name,
        "kitchen_name": e.kitchen.name if e.kitchen else None,
        "city": e.city,
        "state": e.state,
        "event_date": e.event_date.isoformat(),
        "expected_people": e.expected_people,
        "already_applied": e.event_id in applied
    } for e in events])

@volunteer_bp.route("/events-for-you/<mealsync_id>", methods=["GET"])
def events_for_you(mealsync_id):
    events = get_matching_events_for_volunteer(mealsync_id)
    return jsonify([{
        "event_id": e.event_id,
        "org_name": e.organization.name,
        "kitchen_name": e.kitchen.name if e.kitchen else None,
        "city": e.city,
        "state": e.state,
        "event_date": e.event_date.isoformat(),
        "expected_people": e.expected_people
    } for e in events])

@volunteer_bp.route("/apply/<event_id>/<mealsync_id>", methods=["POST"])
def apply_for_event(event_id, mealsync_id):
    existing = VolunteerRegistration.query.filter_by(
        event_id=event_id, volunteer_mealsync_id=mealsync_id
    ).first()
    if existing:
        return jsonify({"error": "Already applied"}), 400
    reg = VolunteerRegistration(
        registration_id=generate_registration_id(),
        event_id=event_id,
        volunteer_mealsync_id=mealsync_id,
        status="requested"
    )
    db.session.add(reg)
    db.session.commit()
    return jsonify({"message": "Applied"}), 201

@volunteer_bp.route("/registered-events/<mealsync_id>", methods=["GET"])
def registered_events(mealsync_id):
    regs = VolunteerRegistration.query.filter_by(volunteer_mealsync_id=mealsync_id).all()
    result = []
    for r in regs:
        e = r.event
        tags = []
        if r.status == "requested":
            tags.append("requested")
        elif r.status == "registered":
            tags.append("registered")
        elif r.status == "rejected":
            tags.append("rejected")
        if e.event_date < date.today():
            tags.append("past")
        result.append({
            "registration_id": r.registration_id,
            "event_id": e.event_id,
            "org_name": e.organization.name,
            "kitchen_name": e.kitchen.name if e.kitchen else None,
            "city": e.city,
            "state": e.state,
            "event_date": e.event_date.isoformat(),
            "expected_people": e.expected_people,
            "tags": tags
        })
    return jsonify(result)

# --- Refer a Friend ---

@volunteer_bp.route("/refer", methods=["POST"])
def refer_friend():
    referrer_id = session.get("mealsync_id")
    if not referrer_id:
        return jsonify({"error": "Sign in to send a referral."}), 401

    data = request.get_json()
    friend_id = data.get("friend_mealsync_id")
    event_id = data.get("event_id")
    if not isinstance(friend_id, str) or not User.query.get(friend_id.strip()):
        return jsonify({"error": "Invalid MealSync ID."}), 404
    friend_id = friend_id.strip()

    if not isinstance(event_id, str) or not VolunteerRegistration.query.filter_by(
        event_id=event_id, volunteer_mealsync_id=referrer_id, status="registered"
    ).first():
        return jsonify({"error": "You must be registered for this event to refer a friend."}), 403

    friend_registration = VolunteerRegistration.query.filter_by(
        event_id=event_id, volunteer_mealsync_id=friend_id
    ).first()
    if not friend_registration:
        return jsonify({"error": "This volunteer has not applied for this event."}), 404
    if friend_id == referrer_id:
        return jsonify({"error": "You cannot refer yourself."}), 400

    friend_registration.referred_by_mealsync_id = referrer_id
    db.session.commit()
    return jsonify({"message": "Referral saved."})
