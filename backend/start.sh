#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill process on a port
kill_port() {
    if port_in_use $1; then
        echo -e "${YELLOW}Port $1 is in use. Attempting to kill the process...${NC}"
        lsof -ti :$1 | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

# Check for required commands
echo -e "${GREEN}Checking requirements...${NC}"

if ! command_exists node; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3 first.${NC}"
    exit 1
fi

# Kill any existing processes on the ports we'll use
kill_port 5050  # Node.js backend port
kill_port 8000  # Python comparison service port

# Create logs directory if it doesn't exist
mkdir -p logs

# Start Node.js backend
echo -e "${GREEN}Starting Node.js backend...${NC}"
cd "$(dirname "$0")"
npm install
NODE_ENV=development node index.js > logs/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 5

# Start Python comparison service
echo -e "${GREEN}Starting Python comparison service...${NC}"
cd comparison_service

# Create and activate virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements.txt

# Start the comparison service
python run.py > ../logs/comparison_service.log 2>&1 &
COMPARISON_PID=$!

# Function to handle script termination
cleanup() {
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $COMPARISON_PID 2>/dev/null
    exit 0
}

# Set up trap for cleanup on script termination
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}All services are running!${NC}"
echo -e "${YELLOW}Backend running on port 5050${NC}"
echo -e "${YELLOW}Comparison service running on port 8000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep script running
wait 