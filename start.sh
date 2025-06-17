#!/bin/bash

# Start Redis if not running
if ! redis-cli ping > /dev/null 2>&1; then
    redis-server &
    sleep 2
fi

# Start backend
cd backend && npm run dev &
BACKEND_PID=$!

# Start frontend
cd .. && npm run dev &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
    echo "Shutting down..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
