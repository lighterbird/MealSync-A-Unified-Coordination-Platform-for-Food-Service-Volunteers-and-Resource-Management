from db import db

class CommunityKitchen(db.Model):
    __tablename__ = "community_kitchens"

    kitchen_id = db.Column(db.String(50), primary_key=True)
    admin_mealsync_id = db.Column(db.String(50), db.ForeignKey("users.mealsync_id"), nullable=False)
    name = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)

    # Relationships
    admin = db.relationship("User", back_populates="kitchens")
    events = db.relationship("Event", back_populates="kitchen")
    inventory = db.relationship("Inventory", back_populates="kitchen", cascade="all, delete-orphan")
    recipes = db.relationship("Recipe", back_populates="kitchen", cascade="all, delete-orphan")