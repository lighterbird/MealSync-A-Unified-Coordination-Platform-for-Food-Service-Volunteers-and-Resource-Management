from app.extensions import db


class OrganizationMember(db.Model):
    __tablename__ = "organization_members"
    __table_args__ = (
        db.CheckConstraint(
            "status IN ('pending', 'active', 'inactive')",
            name="ck_organization_members_status",
        ),
    )

    organization_id = db.Column(
        db.BigInteger,
        db.ForeignKey("organizations.organization_id", ondelete="CASCADE"),
        primary_key=True,
    )
    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        primary_key=True,
    )
    organization_role = db.Column(
        db.String(40), nullable=False, default="member", server_default="member"
    )
    status = db.Column(
        db.String(20), nullable=False, default="active", server_default="active"
    )
    joined_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )

    organization = db.relationship("Organization", back_populates="members")
    user = db.relationship("User", back_populates="organization_memberships")
