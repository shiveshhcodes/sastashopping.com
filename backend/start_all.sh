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

# Function to wait for a service to be ready
wait_for_service() {
    local port=$1
    local service=$2
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}Waiting for $service to be ready on port $port...${NC}"
    while ! curl -s http://localhost:$port/health >/dev/null; do
        if [ $attempt -eq $max_attempts ]; then
            echo -e "${RED}$service failed to start on port $port${NC}"
            return 1
        fi
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    echo -e "\n${GREEN}$service is ready!${NC}"
    return 0
}

# Check for required commands
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js version must be 18 or higher. Current version: $(node -v)${NC}"
    exit 1
fi

# Check if ports are available
if port_in_use 3000; then
    echo -e "${RED}Port 3000 is already in use. Please free up the port and try again.${NC}"
    exit 1
fi

if port_in_use 8000; then
    echo -e "${RED}Port 8000 is already in use. Please free up the port and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}All prerequisites met!${NC}"

# Start Node.js backend
echo -e "${YELLOW}Starting Node.js backend...${NC}"
cd "$(dirname "$0")"  # Ensure we're in the backend directory

# Install Node.js dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install
fi

# Start Node.js backend in the background
npm run dev &
NODE_PID=$!

# Wait for Node.js backend to be ready
if ! wait_for_service 3000 "Node.js backend"; then
    kill $NODE_PID 2>/dev/null
    exit 1
fi

# Start Python comparison service
echo -e "${YELLOW}Starting Python comparison service...${NC}"
cd comparison_service
./start.sh &
PYTHON_PID=$!

# Wait for Python service to be ready
if ! wait_for_service 8000 "Python comparison service"; then
    kill $NODE_PID 2>/dev/null
    kill $PYTHON_PID 2>/dev/null
    exit 1
fi

# Function to handle script termination
cleanup() {
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $NODE_PID 2>/dev/null
    kill $PYTHON_PID 2>/dev/null
    exit 0
}

# Set up trap for cleanup on script termination
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}Both services are running!${NC}"
echo -e "${GREEN}Node.js backend: http://localhost:3000${NC}"
echo -e "${GREEN}Python comparison service: http://localhost:8000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"

# Keep script running
wait 