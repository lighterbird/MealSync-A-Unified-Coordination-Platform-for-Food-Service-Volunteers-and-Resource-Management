from app import create_app
from db import db
from models import *

app = create_app()

with app.app_context():
    db.create_all()
    print("Database tables created successfully!")