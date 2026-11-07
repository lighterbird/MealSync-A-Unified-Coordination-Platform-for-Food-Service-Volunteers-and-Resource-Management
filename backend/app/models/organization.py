from app.extensions import db


class Organization(db.Model):
    __tablename__ = "organizations"

    organization_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, nullable=True)
    organization_type = db.Column(db.String(50), nullable=True)
    address = db.Column(db.Text, nullable=True)
    latitude = db.Column(db.Numeric(9, 6), nullable=True)
    longitude = db.Column(db.Numeric(9, 6), nullable=True)
    phone = db.Column(db.String(30), nullable=True)
    email = db.Column(db.String(255), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )

    members = db.relationship(
        "OrganizationMember",
        back_populates="organization",
        cascade="all, delete-orphan",
    )
