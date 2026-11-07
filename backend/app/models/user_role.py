from app.extensions import db


class UserRole(db.Model):
    __tablename__ = "user_roles"

    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        primary_key=True,
    )
    role_id = db.Column(
        db.SmallInteger,
        db.ForeignKey("roles.role_id", ondelete="CASCADE"),
        primary_key=True,
    )
    assigned_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )

    user = db.relationship("User", back_populates="user_roles")
    role = db.relationship("Role", back_populates="user_roles")
