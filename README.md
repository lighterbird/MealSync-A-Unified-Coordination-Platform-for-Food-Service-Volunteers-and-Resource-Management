# MealSync

MealSync helps NGOs, community kitchens, volunteers, and donors organize community meals and reduce food waste. Organizations plan events, kitchens track ingredients and estimate how many meals they can serve, volunteers apply for events, and donors can record simulated donations.

## Tech stack

- Backend: Python, Flask, SQLAlchemy, PostgreSQL, and SciPy for serving estimates.
- Frontend: React, Vite, React Router, and D3 Geo for event maps.

## Run locally

### 1. Set up PostgreSQL

Install and start PostgreSQL. Open `psql -U postgres` and run:

```sql
CREATE USER mealsync WITH PASSWORD 'mealsync_local';
CREATE DATABASE mealsync OWNER mealsync;
```

### 2. Start the backend

From the project root:

```sh
conda create -n mealsync_backend python=3.10 -y
conda activate mealsync_backend
cd backend
python -m pip install flask flask-sqlalchemy python-dotenv psycopg2-binary flask-cors flask-migrate "scipy>=1.9"
python -c "import secrets; print(secrets.token_hex(32))"
```

Set these values in `backend/.env`, using the generated key:

```env
DATABASE_URL=postgresql://mealsync:mealsync_local@localhost:5432/mealsync
SECRET_KEY=your_generated_key
```

With PostgreSQL running, create the tables and start Flask on port 5000:

```sh
python init_db.py
python app.py
```

### 3. Start the frontend

In a second terminal, from the project root:

```sh
conda create -n mealsync_frontend -c conda-forge "nodejs>=22.13,<23" -y
conda activate mealsync_frontend
cd frontend
npm ci
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.
