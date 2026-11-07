from db import db


class DonationRequest(db.Model):
    __tablename__ = "donation_requests"

    request_id = db.Column(
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

    event_id = db.Column(
        db.BigInteger,
        db.ForeignKey("events.event_id")
    )

    title = db.Column(db.String(180), nullable=False)
    description = db.Column(db.Text)
    donation_type = db.Column(db.String(30))

    target_amount = db.Column(db.Numeric(12, 2))
    target_quantity = db.Column(db.Numeric(12, 3))
    unit = db.Column(db.String(40))

    deadline = db.Column(db.DateTime)
    status = db.Column(db.String(20))

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


class Donation(db.Model):
    __tablename__ = "donations"

    donation_id = db.Column(
        db.BigInteger,
        primary_key=True,
        autoincrement=True
    )

    request_id = db.Column(
        db.BigInteger,
        db.ForeignKey("donation_requests.request_id"),
        nullable=False
    )

    donor_user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    amount = db.Column(db.Numeric(12, 2))
    quantity = db.Column(db.Numeric(12, 3))
    unit = db.Column(db.String(40))

    donated_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )

    status = db.Column(db.String(20))