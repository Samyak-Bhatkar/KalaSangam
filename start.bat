@echo off
echo Starting KalaSangam Backend...
start cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting KalaSangam Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting in new windows!
