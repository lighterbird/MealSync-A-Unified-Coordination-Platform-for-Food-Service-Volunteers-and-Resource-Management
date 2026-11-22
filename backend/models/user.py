from db import db

class User(db.Model):
    __tablename__ = "users"

    mealsync_id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # Relationships
    volunteer_profile = db.relationship("VolunteerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    organizations = db.relationship("Organization", back_populates="admin")
    kitchens = db.relationship("CommunityKitchen", back_populates="admin")
