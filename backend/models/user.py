from db import db

class VolunteerProfile(db.Model):
    __tablename__ = "volunteer_profiles"

    mealsync_id = db.Column(db.String(50), db.ForeignKey("users.mealsync_id"), primary_key=True)
    description = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    flexibility = db.Column(db.Integer, default=3)
    expertise = db.Column(db.Integer, default=1)
    available_dates = db.Column(db.String(255), nullable=True)

    # Relationships
    user = db.relationship("User", back_populates="volunteer_profile")

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
