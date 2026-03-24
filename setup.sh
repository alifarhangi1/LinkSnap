#!/bin/bash
echo "=== LinkSnap Setup ==="

echo ""
echo "Setting up Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
echo "Backend dependencies installed."

echo ""
echo "Setting up Frontend..."
cd ../frontend
npm install
echo "Frontend dependencies installed."

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "To run the backend:"
echo "  cd backend && source venv/bin/activate && python manage.py runserver"
echo ""
echo "To run the frontend:"
echo "  cd frontend && npm run dev"
