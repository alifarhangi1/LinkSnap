# LinkSnap

A URL shortener with analytics.

## Setup

```bash
# Install all dependencies and run migrations
bash setup.sh
```

Or manually:

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in your SECRET_KEY
python manage.py migrate

# Frontend
cd frontend
npm install
cp .env.example .env
```

## Running

**Backend** — runs on http://localhost:8000

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Frontend** — runs on http://localhost:5173

```bash
cd frontend
npm run dev
```
