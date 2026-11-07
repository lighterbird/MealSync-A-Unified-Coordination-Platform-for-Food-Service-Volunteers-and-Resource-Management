from db import db

class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    mealsync_id = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    phone = db.Column(db.String(30), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )

    user_roles = db.relationship(
        "UserRole", back_populates="user", cascade="all, delete-orphan"
    )
    organization_memberships = db.relationship(
        "OrganizationMember", back_populates="user", cascade="all, delete-orphan"
    )

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
