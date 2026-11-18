from db import db

class Donation(db.Model):
    __tablename__ = "donations"

    donation_id = db.Column(db.String(50), primary_key=True)
    event_id = db.Column(db.String(50), db.ForeignKey("events.event_id"), nullable=False)
    donor_mealsync_id = db.Column(db.String(50), db.ForeignKey("users.mealsync_id"), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)

    # Relationships
    event = db.relationship("Event")
    donor = db.relationship("User")