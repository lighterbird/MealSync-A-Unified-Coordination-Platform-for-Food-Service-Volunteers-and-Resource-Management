from db import db


class Event(db.Model):
    __tablename__ = "events"
    # Event columns


class EventVolunteer(db.Model):
    __tablename__ = "event_volunteers"
    # EventVolunteer columns


class VolunteerProfile(db.Model):
    __tablename__ = "volunteer_profiles"
    # VolunteerProfile columns


class VolunteerReferral(db.Model):
    __tablename__ = "volunteer_referrals"
    # VolunteerReferral columns


class Skill(db.Model):
    __tablename__ = "skills"
    # Skill columns


class VolunteerSkill(db.Model):
    __tablename__ = "volunteer_skills"
    # VolunteerSkill columns


class EventRequiredSkill(db.Model):
    __tablename__ = "event_required_skills"
    # EventRequiredSkill columns


class VolunteerAvailability(db.Model):
    __tablename__ = "volunteer_availability"
    # VolunteerAvailability columns


class DonationRequest(db.Model):
    __tablename__ = "donation_requests"
    # DonationRequest columns


class Donation(db.Model):
    __tablename__ = "donations"
    # Donation columns