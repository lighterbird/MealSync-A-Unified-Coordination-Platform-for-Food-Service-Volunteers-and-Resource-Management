from flask import Blueprint, request, jsonify
from db import db
from models import Event, VolunteerRegistration, VolunteerProfile, User
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
        "flexibility": p.flexibility,
        "expertise": p.expertise,
        "available_dates": p.available_dates
    })

@volunteer_bp.route("/profile/<mealsync_id>", methods=["POST", "PUT"])
def save_profile(mealsync_id):
    data = request.get_json()
    p = VolunteerProfile.query.get(mealsync_id)
    if not p:
        p = VolunteerProfile(mealsync_id=mealsync_id)
        db.session.add(p)
    p.description = data.get("description", p.description)
    p.city = data.get("city", p.city)
    p.state = data.get("state", p.state)
    p.flexibility = data.get("flexibility", p.flexibility)
    p.expertise = data.get("expertise", p.expertise)
    p.available_dates = data.get("available_dates", p.available_dates)
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
    from datetime import date
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

# --- Refer a Friend (placeholder) ---

@volunteer_bp.route("/refer", methods=["POST"])
def refer_friend():
    # Placeholder: no-op for now.
    return jsonify({"message": "Referral feature coming soon"}), 200