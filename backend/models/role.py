from app.extensions import db


class Role(db.Model):
    __tablename__ = "roles"

    role_id = db.Column(db.SmallInteger, primary_key=True, autoincrement=True)
    role_name = db.Column(db.String(40), nullable=False, unique=True)
    description = db.Column(db.String(255), nullable=True)

    user_roles = db.relationship(
        "UserRole", back_populates="role", cascade="all, delete-orphan"
    )
