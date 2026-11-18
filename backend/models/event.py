from db import db

class KitchenRequest(db.Model):
    __tablename__ = "kitchen_requests"

    request_id = db.Column(db.String(50), primary_key=True)
    event_id = db.Column(db.String(50), db.ForeignKey("events.event_id"), nullable=False)
    kitchen_id = db.Column(db.String(50), db.ForeignKey("community_kitchens.kitchen_id"), nullable=False)
    status = db.Column(db.String(20), default="pending")

    # Relationships
    event = db.relationship("Event", back_populates="kitchen_requests")
    kitchen = db.relationship("CommunityKitchen")
