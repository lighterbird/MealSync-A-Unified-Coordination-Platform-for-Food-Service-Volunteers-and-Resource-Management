from db import db


class VolunteerProfile(db.Model):
    __tablename__ = "volunteer_profiles"

    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id"),
        primary_key=True
    )

    bio = db.Column(db.Text)
    home_location = db.Column(db.String(255))
    latitude = db.Column(db.Numeric(9, 6))
    longitude = db.Column(db.Numeric(9, 6))


class Skill(db.Model):
    __tablename__ = "skills"

    skill_id = db.Column(
        db.BigInteger,
        primary_key=True,
        autoincrement=True
    )

    skill_name = db.Column(db.String(80), nullable=False, unique=True)


class VolunteerSkill(db.Model):
    __tablename__ = "volunteer_skills"

    volunteer_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id"),
        primary_key=True
    )

    skill_id = db.Column(
        db.BigInteger,
        db.ForeignKey("skills.skill_id"),
        primary_key=True
    )

    proficiency = db.Column(db.String(30))


class VolunteerAvailability(db.Model):
    __tablename__ = "volunteer_availability"

    availability_id = db.Column(
        db.BigInteger,
        primary_key=True,
        autoincrement=True
    )

    volunteer_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    day_of_week = db.Column(db.SmallInteger, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(255))
    notes = db.Column(db.Text)