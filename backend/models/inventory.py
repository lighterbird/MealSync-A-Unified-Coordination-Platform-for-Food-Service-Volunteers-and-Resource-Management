from db import db

class Inventory(db.Model):
    __tablename__ = "inventory"

    item_id = db.Column(db.String(50), primary_key=True)
    kitchen_id = db.Column(db.String(50), db.ForeignKey("community_kitchens.kitchen_id"), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Numeric(10, 2), nullable=False)
    unit = db.Column(db.String(20), nullable=False)

    # Relationships
    kitchen = db.relationship("CommunityKitchen", back_populates="inventory")
    recipe_ingredients = db.relationship("RecipeIngredient", back_populates="item")


class Recipe(db.Model):
    __tablename__ = "recipes"

    recipe_id = db.Column(db.String(50), primary_key=True)
    kitchen_id = db.Column(db.String(50), db.ForeignKey("community_kitchens.kitchen_id"), nullable=False)
    recipe_name = db.Column(db.String(150), nullable=False)

    # Relationships
    kitchen = db.relationship("CommunityKitchen", back_populates="recipes")
    ingredients = db.relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")


class RecipeIngredient(db.Model):
    __tablename__ = "recipe_ingredients"

    recipe_id = db.Column(db.String(50), db.ForeignKey("recipes.recipe_id"), primary_key=True)
    item_id = db.Column(db.String(50), db.ForeignKey("inventory.item_id"), primary_key=True)
    quantity_per_serving = db.Column(db.Numeric(10, 2), nullable=False)

    # Relationships
    recipe = db.relationship("Recipe", back_populates="ingredients")
    item = db.relationship("Inventory", back_populates="recipe_ingredients")


class Donation(db.Model):
    __tablename__ = "donations"

    donation_id = db.Column(db.String(50), primary_key=True)
    event_id = db.Column(db.String(50), db.ForeignKey("events.event_id"), nullable=False)
    donor_mealsync_id = db.Column(db.String(50), db.ForeignKey("users.mealsync_id"), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)

    # Relationships
    event = db.relationship("Event")
    donor = db.relationship("User")