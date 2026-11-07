from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    mealsync_id = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    phone = db.Column(db.String(30), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )

    user_roles = db.relationship(
        "UserRole", back_populates="user", cascade="all, delete-orphan"
    )
    organization_memberships = db.relationship(
        "OrganizationMember", back_populates="user", cascade="all, delete-orphan"
    )
