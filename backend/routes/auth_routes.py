from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
from db import db
from models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def generate_mealsync_id():
    last_user = User.query.order_by(User.mealsync_id.desc()).first()
    
    if not last_user:
        return "M00001"
    
    last_num = int(last_user.mealsync_id[1:])
    new_num = last_num + 1

    return f"M{new_num:05d}"

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email is already registered"}), 400

    hashed_password = generate_password_hash(password)
    new_mealsync_id = generate_mealsync_id()

    new_user = User(
        mealsync_id=new_mealsync_id,
        name=name,
        email=email,
        password_hash=hashed_password
    )

    try:
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email is already registered"}), 400

    return jsonify({
        "message": "User created successfully",
        "mealsync_id": new_user.mealsync_id,
        "name": new_user.name,
        "email": new_user.email
    }), 201


@auth_bp.route("/signin", methods=["POST"])
def signin():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["mealsync_id"] = user.mealsync_id
    return jsonify({
        "message": "Sign in successful",
        "mealsync_id": user.mealsync_id,
        "name": user.name,
        "email": user.email
    }), 200


@auth_bp.route("/signout", methods=["POST"])
def signout():
    session.pop("mealsync_id", None)
    return "", 204
