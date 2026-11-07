from db import db


class Event(db.Model):
    __tablename__ = "events"

    event_id = db.Column(
        db.BigInteger,
        primary_key=True,
        autoincrement=True
    )

    created_by_user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    organization_id = db.Column(
        db.BigInteger,
        db.ForeignKey("organizations.organization_id"),
        nullable=False
    )

    title = db.Column(db.String(180), nullable=False)
    description = db.Column(db.Text)
    event_type = db.Column(db.String(50))

    start_datetime = db.Column(db.DateTime, nullable=False)
    end_datetime = db.Column(db.DateTime, nullable=False)

    location = db.Column(db.String(255))
    latitude = db.Column(db.Numeric(9, 6))
    longitude = db.Column(db.Numeric(9, 6))

    volunteers_required = db.Column(db.Integer)
    status = db.Column(db.String(20))

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


class EventVolunteer(db.Model):
    __tablename__ = "event_volunteers"

    event_id = db.Column(
        db.BigInteger,
        db.ForeignKey("events.event_id"),
        primary_key=True
    )

    volunteer_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id"),
        primary_key=True
    )

    status = db.Column(db.String(20))

    registered_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp()
    )


class EventRequiredSkill(db.Model):
    __tablename__ = "event_required_skills"

    event_id = db.Column(
        db.BigInteger,
        db.ForeignKey("events.event_id"),
        primary_key=True
    )

    skill_id = db.Column(
        db.BigInteger,
        db.ForeignKey("skills.skill_id"),
        primary_key=True
    )