#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=================================================="
echo "    ATTI — Dementia Memory Assistant"
echo "    Department of Computer Science & Engineering"
echo "    Delhi Technical Campus, Greater Noida"
echo "=================================================="
echo ""

# Check python virtualenv
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# Check frontend node_modules
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "Starting FastAPI Backend on http://127.0.0.1:8000 ..."
./backend/venv/bin/python backend/run.py &
BACKEND_PID=$!

echo "Starting Frontend on http://127.0.0.1:5173 ..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "🚀 ATTI is running live!"
echo "   • Patient & Caregiver App: http://127.0.0.1:5173"
echo "   • Backend API Docs (Swagger): http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
