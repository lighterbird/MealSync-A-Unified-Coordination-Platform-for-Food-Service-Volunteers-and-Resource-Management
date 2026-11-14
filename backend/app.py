import os
from flask import Flask
from dotenv import load_dotenv
from db import db
from routes.kitchen_routes import kitchen_bp

load_dotenv()

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    db.init_app(app)

    app.register_blueprint(kitchen_bp)
    
    return app

if __name__ == "__main__":
    app = create_app()           
    app.run(host="0.0.0.0", # accept connections from anywhere on the LAN
            port=5000,       
            debug=True) # auto-reload when we edit Python files