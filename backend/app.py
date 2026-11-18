import os
from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS

from db import db

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    db.init_app(app)

    return app

if __name__ == "__main__":
    app = create_app()           
    app.run(host="0.0.0.0", port=5000, debug=True)