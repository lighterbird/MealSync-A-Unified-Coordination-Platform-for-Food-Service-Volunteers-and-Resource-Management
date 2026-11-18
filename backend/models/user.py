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