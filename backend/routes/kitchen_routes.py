from flask import Blueprint, jsonify, request
from models import *
from db import db


kitchen_bp = Blueprint("kitchen", __name__, url_prefix="/api/kitchens")

@kitchen_bp.route("", methods=["GET"])
def list_kitchens():
    kitchens = CommunityKitchen.query.all()
    return jsonify([k.to_dict() for k in kitchens])

@kitchen_bp.route("", methods=["POST"])
def create_kitchen():
    data = request.get_json()

    required_fields = [
        "kitchen_name",
        "locality",
        "city",
        "state",
        "kitchen_admin_mealsync_id",
    ]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    new_kitchen = CommunityKitchen(
        kitchen_name=data["kitchen_name"],
        kitchen_description=data.get("kitchen_description"),
        locality=data["locality"],
        city=data["city"],
        state=data["state"],
        kitchen_admin_mealsync_id=data["kitchen_admin_mealsync_id"],
        average_feeding_capacity=data.get("average_feeding_capacity", 0),
    )

    db.session.add(new_kitchen)
    db.session.commit()

    return jsonify(new_kitchen.to_dict()), 201