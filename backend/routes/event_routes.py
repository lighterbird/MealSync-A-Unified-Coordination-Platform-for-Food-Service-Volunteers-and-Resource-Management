from flask import Blueprint, request, jsonify
from db import db
from models import Donation, Event, KitchenRequest, VolunteerRegistration, User

event_bp = Blueprint("event", __name__, url_prefix="/api/events")

def generate_event_id():
    last_event = Event.query.order_by(Event.event_id.desc()).first()
    if not last_event:
        return "E00001"
    last_num = int(last_event.event_id[1:])
    return f"E{last_num + 1:05d}"


def get_event_donation_totals(org_id):
    rows = (
        db.session.query(Donation.event_id, db.func.sum(Donation.amount))
        .join(Event, Event.event_id == Donation.event_id)
        .filter(Event.org_id == org_id)
        .group_by(Donation.event_id)
        .all()
    )
    return {event_id: total for event_id, total in rows}


@event_bp.route("/<org_id>", methods=["GET"])
def get_org_events(org_id):
    events = Event.query.filter_by(org_id=org_id).all()
    donation_totals = get_event_donation_totals(org_id)
    return jsonify([{
        "event_id": e.event_id,
        "city": e.city,
        "state": e.state,
        "event_date": e.event_date.isoformat(),
        "expected_people": e.expected_people,
        "status": e.status,
        "kitchen_name": e.kitchen.name if e.kitchen else None,
        "total_donations": format(donation_totals.get(e.event_id, 0), ".2f"),
    } for e in events])

@event_bp.route("", methods=["POST"])
def create_event():
    data = request.get_json()
    org_id = data.get("org_id")
    city = data.get("city")
    state = data.get("state")
    event_date = data.get("event_date")
    expected_people = data.get("expected_people")

    if not all([org_id, city, state, event_date, expected_people]):
        return jsonify({"error": "Missing required fields"}), 400

    new_event = Event(
        event_id=generate_event_id(),
        org_id=org_id,
        city=city,
        state=state,
        event_date=event_date,
        expected_people=expected_people,
        status="proposed"
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({"event_id": new_event.event_id}), 201

@event_bp.route("/<event_id>", methods=["DELETE"])
def delete_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted"})

@event_bp.route("/<event_id>/kitchen-requests", methods=["GET"])
def get_kitchen_requests(event_id):
    requests = KitchenRequest.query.filter_by(event_id=event_id).all()
    return jsonify([{
        "request_id": r.request_id,
        "kitchen_name": r.kitchen.name,
        "kitchen_city": r.kitchen.city,
        "kitchen_state": r.kitchen.state,
        "status": r.status
    } for r in requests])

@event_bp.route("/<event_id>/kitchen-requests/<request_id>", methods=["PUT"])
def handle_kitchen_request(event_id, request_id):
    data = request.get_json()
    action = data.get("action") # "accept" or "reject"
    
    req = KitchenRequest.query.get(request_id)
    event = Event.query.get(event_id)
    
    if not req or not event:
        return jsonify({"error": "Request or Event not found"}), 404

    if action == "accept":
        req.status = "accepted"
        event.status = "floated"
        event.kitchen_id = req.kitchen_id
        # Reject all other pending requests for this event
        other_reqs = KitchenRequest.query.filter(KitchenRequest.event_id == event_id, KitchenRequest.request_id != request_id).all()
        for other in other_reqs:
            other.status = "rejected"
    else:
        req.status = "rejected"

    db.session.commit()
    return jsonify({"message": f"Request {action}ed successfully"})

@event_bp.route("/<event_id>/volunteer-requests", methods=["GET"])
def get_volunteer_requests(event_id):
    regs = VolunteerRegistration.query.filter_by(event_id=event_id).all()
    result = []
    for r in regs:
        user = User.query.get(r.volunteer_mealsync_id)
        referrer = User.query.get(r.referred_by_mealsync_id) if r.referred_by_mealsync_id else None
        result.append({
            "registration_id": r.registration_id,
            "volunteer_name": user.name,
            "volunteer_email": user.email,
            "status": r.status,
            "referred_by": referrer.name if referrer else None
        })
    return jsonify(result)

@event_bp.route("/<event_id>/volunteer-requests/<reg_id>", methods=["PUT"])
def handle_volunteer_request(event_id, reg_id):
    data = request.get_json()
    action = data.get("action")
    
    reg = VolunteerRegistration.query.get(reg_id)
    if not reg:
        return jsonify({"error": "Registration not found"}), 404

    reg.status = "registered" if action == "accept" else "rejected"
    db.session.commit()
    return jsonify({"message": f"Volunteer {action}ed successfully"})
