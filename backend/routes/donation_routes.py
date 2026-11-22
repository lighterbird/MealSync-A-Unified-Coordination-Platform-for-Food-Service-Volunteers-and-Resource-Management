from flask import Blueprint, request, jsonify
from db import db
from models import Event, Donation

donation_bp = Blueprint("donation", __name__, url_prefix="/api/donations")

def generate_donation_id():
    last = Donation.query.order_by(Donation.donation_id.desc()).first()
    if not last:
        return "D00001"
    return f"D{int(last.donation_id[1:]) + 1:05d}"

@donation_bp.route("/all-events", methods=["GET"])
def get_floated_events():
    events = Event.query.filter_by(status="floated").all()
    return jsonify([{
        "event_id": e.event_id,
        "org_name": e.organization.name,
        "kitchen_name": e.kitchen.name if e.kitchen else None,
        "city": e.city,
        "state": e.state,
        "event_date": e.event_date.isoformat(),
        "expected_people": e.expected_people
    } for e in events])

@donation_bp.route("", methods=["POST"])
def make_donation():
    data = request.get_json()
    print("RECEIVED DATA:", data)
    event_id = data.get("event_id")
    donor_mealsync_id = data.get("donor_mealsync_id")
    amount = data.get("amount")

    if not all([event_id, donor_mealsync_id, amount]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "Amount must be a positive number"}), 400

    donation = Donation(
        donation_id=generate_donation_id(),
        event_id=event_id,
        donor_mealsync_id=donor_mealsync_id,
        amount=amount
    )
    db.session.add(donation)
    db.session.commit()
    return jsonify({"message": "Donation successful", "donation_id": donation.donation_id}), 201

@donation_bp.route("/<mealsync_id>", methods=["GET"])
def get_my_donations(mealsync_id):
    from datetime import date
    donations = Donation.query.filter_by(donor_mealsync_id=mealsync_id).all()
    result = []
    for d in donations:
        e = d.event
        status = "past" if e.event_date < date.today() else "upcoming"
        result.append({
            "donation_id": d.donation_id,
            "event_id": e.event_id,
            "org_name": e.organization.name,
            "city": e.city,
            "state": e.state,
            "event_date": e.event_date.isoformat(),
            "amount": float(d.amount),
            "status": status
        })
    return jsonify(result)