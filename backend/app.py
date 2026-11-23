import os
from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from flask_migrate import Migrate

from db import db
from routes.auth_routes import auth_bp 
from routes.organization_routes import org_bp
from routes.event_routes import event_bp     
from routes.kitchen_routes import kitchen_bp 
from routes.volunteer_routes import volunteer_bp
from routes.donation_routes import donation_bp

load_dotenv()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    db.init_app(app)
    migrate.init_app(app, db)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(org_bp)  
    app.register_blueprint(event_bp)
    app.register_blueprint(kitchen_bp)
    app.register_blueprint(volunteer_bp)
    app.register_blueprint(donation_bp)

    return app

if __name__ == "__main__":
    app = create_app()           
    app.run(host="0.0.0.0", port=5000, debug=True)
