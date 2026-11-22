from flask import Blueprint, request, jsonify
from db import db
from models import Organization

org_bp = Blueprint("organization", __name__, url_prefix="/api/organizations")

def generate_org_id():
    last_org = Organization.query.order_by(Organization.org_id.desc()).first()
    if not last_org:
        return "O00001"
    last_num = int(last_org.org_id[1:])
    return f"O{(last_num + 1):05d}"

@org_bp.route("", methods=["GET"])
def get_my_orgs():
    mealsync_id = request.args.get("mealsync_id")
    if not mealsync_id:
        return jsonify({"error": "mealsync_id is required"}), 400
    
    orgs = Organization.query.filter_by(admin_mealsync_id=mealsync_id).all()
    return jsonify([{"org_id": o.org_id, "name": o.name, "description": o.description} for o in orgs])

@org_bp.route("", methods=["POST"])
def create_org():
    data = request.get_json()
    admin_id = data.get("admin_mealsync_id")
    name = data.get("name")
    desc = data.get("description", "")

    if not admin_id or not name:
        return jsonify({"error": "admin_mealsync_id and name are required"}), 400

    new_org = Organization(
        org_id=generate_org_id(),
        admin_mealsync_id=admin_id,
        name=name,
        description=desc
    )
    db.session.add(new_org)
    db.session.commit()
    return jsonify({"org_id": new_org.org_id, "name": new_org.name}), 201

@org_bp.route("/<org_id>", methods=["PUT"])
def update_org(org_id):
    data = request.get_json()
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"error": "Organization not found"}), 404
    
    org.name = data.get("name", org.name)
    org.description = data.get("description", org.description)
    db.session.commit()
    return jsonify({"message": "Updated successfully"})

@org_bp.route("/<org_id>", methods=["DELETE"])
def delete_org(org_id):
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"error": "Organization not found"}), 404
    
    db.session.delete(org)
    db.session.commit()
    return jsonify({"message": "Deleted successfully"})