#!/bin/bash

# Function to check if a port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Kill any existing processes on ports 5050 and 5051
echo "Checking for existing processes..."
if check_port 5050; then
    echo "Killing process on port 5050..."
    lsof -ti :5050 | xargs kill -9
fi

if check_port 5051; then
    echo "Killing process on port 5051..."
    lsof -ti :5051 | xargs kill -9
fi

# Start the main backend server
echo "Starting main backend server..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!

# Wait for the backend server to start
sleep 5

# Start the comparison service
echo "Starting comparison service..."
cd backend/comparison_service
pip install -e .  # Install the package in development mode
python run.py &
COMPARISON_PID=$!

# Wait for both servers to start
sleep 5

# Check if both servers are running
if check_port 5050 && check_port 5051; then
    echo "Both servers are running!"
    echo "Main backend server is running on http://localhost:5050"
    echo "Comparison service is running on http://localhost:5051"
else
    echo "Error: One or both servers failed to start"
    if ! check_port 5050; then
        echo "Main backend server is not running"
    fi
    if ! check_port 5051; then
        echo "Comparison service is not running"
    fi
fi

# Keep the script running and handle Ctrl+C
trap "kill $BACKEND_PID $COMPARISON_PID; exit" INT
wait 