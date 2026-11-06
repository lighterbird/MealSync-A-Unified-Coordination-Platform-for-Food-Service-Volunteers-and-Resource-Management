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

class KitchenMembership(db.Model):
    __tablename__ = "kitchen_memberships"

    kitchen_id = db.Column(db.Integer, db.ForeignKey("community_kitchens.kitchen_id"), primary_key=True)
    mealsync_id = db.Column(db.String(50), db.ForeignKey("user.mealsync_id"), primary_key=True)
    membership_role = db.Column(db.String(40), nullable=False)
    status = db.Column(db.String(20), default="active")
    joining_date = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "kitchen_id": self.kitchen_id,
            "mealsync_id": self.mealsync_id,
            "membership_role": self.membership_role,
            "status": self.status,
            "joining_date": self.joining_date.isoformat() if self.joining_date else None
        }

