"""Flask application factory; Person 1 owns shared app integration."""
from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate, jwt

def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Shared extensions are initialized once through the application factory.
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config.get("FRONTEND_ORIGIN", "http://localhost:5173")}})

    # Import domain models here once implemented so migrations can discover metadata.
    # Register route blueprints here as each feature is merged.
    @app.get("/api/health")
    def health_check():
        return {"status": "ok", "service": "mealsync-api"}, 200

    return app
