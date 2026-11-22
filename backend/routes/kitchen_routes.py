from flask import Blueprint, request, jsonify
from db import db
from models import CommunityKitchen, Event, KitchenRequest, Inventory, Recipe, RecipeIngredient
from logic.matching import get_matching_events, calculate_expected_servings

kitchen_bp = Blueprint("kitchen", __name__, url_prefix="/api/kitchens")

def generate_kitchen_id():
    last = CommunityKitchen.query.order_by(CommunityKitchen.kitchen_id.desc()).first()
    if not last:
        return "K00001"
    return f"K{int(last.kitchen_id[1:]) + 1:05d}"

def generate_request_id():
    last = KitchenRequest.query.order_by(KitchenRequest.request_id.desc()).first()
    if not last:
        return "R00001"
    return f"R{int(last.request_id[1:]) + 1:05d}"

def generate_item_id():
    last = Inventory.query.order_by(Inventory.item_id.desc()).first()
    if not last:
        return "I00001"
    return f"I{int(last.item_id[1:]) + 1:05d}"

def generate_recipe_id():
    last = Recipe.query.order_by(Recipe.recipe_id.desc()).first()
    if not last:
        return "RC00001"
    return f"RC{int(last.recipe_id[2:]) + 1:05d}"

# --- Kitchen CRUD ---

@kitchen_bp.route("", methods=["GET"])
def get_my_kitchens():
    mid = request.args.get("mealsync_id")
    if not mid:
        return jsonify({"error": "mealsync_id required"}), 400
    kitchens = CommunityKitchen.query.filter_by(admin_mealsync_id=mid).all()
    return jsonify([{"kitchen_id": k.kitchen_id, "name": k.name, "description": k.description,
                     "city": k.city, "state": k.state} for k in kitchens])

@kitchen_bp.route("", methods=["POST"])
def create_kitchen():
    data = request.get_json()
    mid = data.get("admin_mealsync_id")
    if not mid or not data.get("name") or not data.get("city") or not data.get("state"):
        return jsonify({"error": "Missing required fields"}), 400
    k = CommunityKitchen(
        kitchen_id=generate_kitchen_id(),
        admin_mealsync_id=mid,
        name=data["name"],
        description=data.get("description", ""),
        city=data["city"],
        state=data["state"]
    )
    db.session.add(k)
    db.session.commit()
    return jsonify({"kitchen_id": k.kitchen_id}), 201

@kitchen_bp.route("/<kitchen_id>", methods=["PUT"])
def update_kitchen(kitchen_id):
    k = CommunityKitchen.query.get(kitchen_id)
    if not k:
        return jsonify({"error": "Not found"}), 404
    data = request.get_json()
    k.name = data.get("name", k.name)
    k.description = data.get("description", k.description)
    k.city = data.get("city", k.city)
    k.state = data.get("state", k.state)
    db.session.commit()
    return jsonify({"message": "Updated"})

@kitchen_bp.route("/<kitchen_id>", methods=["DELETE"])
def delete_kitchen(kitchen_id):
    k = CommunityKitchen.query.get(kitchen_id)
    if not k:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(k)
    db.session.commit()
    return jsonify({"message": "Deleted"})

# --- Events ---

@kitchen_bp.route("/<kitchen_id>/all-events", methods=["GET"])
def all_proposed_events(kitchen_id):
    events = Event.query.filter_by(status="proposed").all()
    applied = {r.event_id for r in KitchenRequest.query.filter_by(kitchen_id=kitchen_id).all()}
    return jsonify([{
        "event_id": e.event_id,
        "org_name": e.organization.name,
        "city": e.city,
        "state": e.state,
        "event_date": e.event_date.isoformat(),
        "expected_people": e.expected_people,
        "already_applied": e.event_id in applied
    } for e in events])

@kitchen_bp.route("/<kitchen_id>/events-for-you", methods=["GET"])
def events_for_you(kitchen_id):
    k = CommunityKitchen.query.get(kitchen_id)
    events = get_matching_events(k)
    return jsonify([{
        "event_id": e.event_id,
        "org_name": e.organization.name,
        "city": e.city,
        "state": e.state,
        "event_date": e.event_date.isoformat(),
        "expected_people": e.expected_people
    } for e in events])

@kitchen_bp.route("/<kitchen_id>/your-events", methods=["GET"])
def your_events(kitchen_id):
    reqs = KitchenRequest.query.filter_by(kitchen_id=kitchen_id).all()
    result = []
    from datetime import date
    for r in reqs:
        e = r.event
        tags = []
        if r.status == "pending":
            tags.append("requested")
        elif r.status == "accepted":
            tags.append("registered")
        elif r.status == "rejected":
            tags.append("rejected")
        if e.event_date < date.today():
            tags.append("past")
        result.append({
            "event_id": e.event_id,
            "org_name": e.organization.name,
            "city": e.city,
            "state": e.state,
            "event_date": e.event_date.isoformat(),
            "expected_people": e.expected_people,
            "tags": tags
        })
    return jsonify(result)

@kitchen_bp.route("/<kitchen_id>/apply/<event_id>", methods=["POST"])
def apply_for_event(kitchen_id, event_id):
    existing = KitchenRequest.query.filter_by(event_id=event_id, kitchen_id=kitchen_id).first()
    if existing:
        return jsonify({"error": "Already applied"}), 400
    req = KitchenRequest(
        request_id=generate_request_id(),
        event_id=event_id,
        kitchen_id=kitchen_id,
        status="pending"
    )
    db.session.add(req)
    db.session.commit()
    return jsonify({"message": "Applied"}), 201

# --- Inventory ---

@kitchen_bp.route("/<kitchen_id>/inventory", methods=["GET"])
def get_inventory(kitchen_id):
    items = Inventory.query.filter_by(kitchen_id=kitchen_id).all()
    return jsonify([{"item_id": i.item_id, "item_name": i.item_name,
                     "quantity": float(i.quantity), "unit": i.unit} for i in items])

@kitchen_bp.route("/<kitchen_id>/inventory", methods=["POST"])
def add_inventory(kitchen_id):
    data = request.get_json()
    item = Inventory(
        item_id=generate_item_id(),
        kitchen_id=kitchen_id,
        item_name=data["item_name"],
        quantity=data["quantity"],
        unit=data["unit"]
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"item_id": item.item_id}), 201

@kitchen_bp.route("/inventory/<item_id>", methods=["PUT"])
def update_inventory(item_id):
    item = Inventory.query.get(item_id)
    if not item:
        return jsonify({"error": "Not found"}), 404
    data = request.get_json()
    item.item_name = data.get("item_name", item.item_name)
    item.quantity = data.get("quantity", item.quantity)
    item.unit = data.get("unit", item.unit)
    db.session.commit()
    return jsonify({"message": "Updated"})

@kitchen_bp.route("/inventory/<item_id>", methods=["DELETE"])
def delete_inventory(item_id):
    item = Inventory.query.get(item_id)
    if not item:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Deleted"})

# --- Recipes ---

@kitchen_bp.route("/<kitchen_id>/recipes", methods=["GET"])
def get_recipes(kitchen_id):
    recipes = Recipe.query.filter_by(kitchen_id=kitchen_id).all()
    result = []
    for r in recipes:
        ings = [{"item_id": ri.item_id, "item_name": ri.item.item_name,
                 "quantity_per_serving": float(ri.quantity_per_serving)} for ri in r.ingredients]
        result.append({"recipe_id": r.recipe_id, "recipe_name": r.recipe_name, "ingredients": ings})
    return jsonify(result)

@kitchen_bp.route("/<kitchen_id>/recipes", methods=["POST"])
def add_recipe(kitchen_id):
    data = request.get_json()
    recipe = Recipe(recipe_id=generate_recipe_id(), kitchen_id=kitchen_id,
                    recipe_name=data["recipe_name"])
    db.session.add(recipe)
    db.session.flush()
    for ing in data.get("ingredients", []):
        ri = RecipeIngredient(recipe_id=recipe.recipe_id, item_id=ing["item_id"],
                              quantity_per_serving=ing["quantity_per_serving"])
        db.session.add(ri)
    db.session.commit()
    return jsonify({"recipe_id": recipe.recipe_id}), 201

@kitchen_bp.route("/recipes/<recipe_id>", methods=["DELETE"])
def delete_recipe(recipe_id):
    r = Recipe.query.get(recipe_id)
    if not r:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(r)
    db.session.commit()
    return jsonify({"message": "Deleted"})

@kitchen_bp.route("/<kitchen_id>/expected-servings", methods=["GET"])
def expected_servings(kitchen_id):
    k = CommunityKitchen.query.get(kitchen_id)
    val = calculate_expected_servings(k)
    return jsonify({"expected_servings": val})