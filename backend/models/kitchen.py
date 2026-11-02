from db import db

class CommunityKitchen(db.Model):
    __tablename__ = "community_kitchens"

    kitchen_id = db.Column(db.Integer, primary_key=True)
    kitchen_name = db.Column(db.String(160), nullable=False)
    kitchen_description = db.Column(db.Text)
    locality = db.Column(db.String(150), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    kitchen_admin_mealsync_id = db.Column(db.String(50), db.ForeignKey("user.mealsync_id"), nullable=False)
    average_feeding_capacity = db.Column(db.Integer, default=0)

    admin = db.relationship("User", foreign_keys=[kitchen_admin_mealsync_id])

    def to_dict(self):
        return {
            "kitchen_id": self.kitchen_id,
            "kitchen_name": self.kitchen_name,
            "kitchen_description": self.kitchen_description,
            "kitchen_address": [self.locality, self.city, self.state],
            "kitchen_admin_mealsync_id": self.kitchen_admin_mealsync_id,
            "average_feeding_capacity": self.average_feeding_capacity
        }