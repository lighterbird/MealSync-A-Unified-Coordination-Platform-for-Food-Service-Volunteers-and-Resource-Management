"""Development entry point; app implementation is added in the backend milestone."""
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
