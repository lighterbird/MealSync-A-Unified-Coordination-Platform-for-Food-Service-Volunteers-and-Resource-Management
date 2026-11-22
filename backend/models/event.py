from db import db

class Event(db.Model):
    __tablename__ = "events"

    event_id = db.Column(db.String(50), primary_key=True)
    org_id = db.Column(db.String(50), db.ForeignKey("organizations.org_id"), nullable=False)
    kitchen_id = db.Column(db.String(50), db.ForeignKey("community_kitchens.kitchen_id"), nullable=True)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    expected_people = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default="proposed")

    # Relationships
    organization = db.relationship("Organization", back_populates="events")
    kitchen = db.relationship("CommunityKitchen", back_populates="events")
    kitchen_requests = db.relationship("KitchenRequest", back_populates="event", cascade="all, delete-orphan")
    volunteer_registrations = db.relationship("VolunteerRegistration", back_populates="event", cascade="all, delete-orphan")


class KitchenRequest(db.Model):
    __tablename__ = "kitchen_requests"

    request_id = db.Column(db.String(50), primary_key=True)
    event_id = db.Column(db.String(50), db.ForeignKey("events.event_id"), nullable=False)
    kitchen_id = db.Column(db.String(50), db.ForeignKey("community_kitchens.kitchen_id"), nullable=False)
    status = db.Column(db.String(20), default="pending")

    # Relationships
    event = db.relationship("Event", back_populates="kitchen_requests")
    kitchen = db.relationship("CommunityKitchen")


class VolunteerRegistration(db.Model):
    __tablename__ = "volunteer_registrations"

    registration_id = db.Column(db.String(50), primary_key=True)
    event_id = db.Column(db.String(50), db.ForeignKey("events.event_id"), nullable=False)
    volunteer_mealsync_id = db.Column(db.String(50), db.ForeignKey("users.mealsync_id"), nullable=False)
    status = db.Column(db.String(20), default="requested")
    referred_by_mealsync_id = db.Column(db.String(50), db.ForeignKey("users.mealsync_id"), nullable=True)

    # Relationships
    event = db.relationship("Event", back_populates="volunteer_registrations")
    volunteer = db.relationship("User", foreign_keys=[volunteer_mealsync_id])
    referrer = db.relationship("User", foreign_keys=[referred_by_mealsync_id])