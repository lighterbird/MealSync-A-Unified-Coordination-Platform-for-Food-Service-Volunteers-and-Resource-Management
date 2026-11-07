from db import db


class VolunteerReferral(db.Model):
    __tablename__ = "volunteer_referrals"

    referral_id = db.Column(
        db.BigInteger,
        primary_key=True,
        autoincrement=True
    )

    event_id = db.Column(
        db.BigInteger,
        db.ForeignKey("events.event_id"),
        nullable=False
    )

    referrer_user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    referred_user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    status = db.Column(db.String(20))

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )