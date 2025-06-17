#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting SastaShopping.com setup...${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check and install Node.js if not present
if ! command_exists node; then
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install node
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo -e "${RED}Unsupported OS. Please install Node.js manually.${NC}"
        exit 1
    fi
fi

# Check and install Redis if not present
if ! command_exists redis-server; then
    echo -e "${YELLOW}Redis not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install redis
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get install redis-server
    else
        echo -e "${RED}Unsupported OS. Please install Redis manually.${NC}"
        exit 1
    fi
fi

# Create necessary directories
echo -e "${GREEN}Creating project directories...${NC}"
mkdir -p backend/logs
mkdir -p logs

# Create backend .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo -e "${GREEN}Creating backend environment file...${NC}"
    cat > backend/.env << EOL
NODE_ENV=development
PORT=5050
JWT_SECRET=sastashopping_secret_key_2024
JWT_EXPIRES_IN=1d
ALLOWED_ORIGINS=http://localhost:3000
REDIS_URL=redis://localhost:6379
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
ENABLE_LOGGING=true
COMPARISON_SERVICE_URL=http://localhost:5051
SCRAPING_TIMEOUT=30000
MAX_RETRIES=3
CACHE_DURATION_MINUTES=60
ENABLE_CACHING=true
ENABLE_RATE_LIMITING=true
ENABLE_METRICS=true
METRICS_PORT=9090
EOL
fi

# Install frontend dependencies
echo -e "${GREEN}Installing frontend dependencies...${NC}"
npm install

# Install backend dependencies
echo -e "${GREEN}Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Start Redis if not running
echo -e "${GREEN}Starting Redis server...${NC}"
if ! redis-cli ping > /dev/null 2>&1; then
    redis-server &
    sleep 2
fi

# Create start script
echo -e "${GREEN}Creating start script...${NC}"
cat > start.sh << EOL
#!/bin/bash

# Start Redis if not running
if ! redis-cli ping > /dev/null 2>&1; then
    redis-server &
    sleep 2
fi

# Start backend
cd backend && npm run dev &
BACKEND_PID=\$!

# Start frontend
cd .. && npm run dev &
FRONTEND_PID=\$!

# Function to handle script termination
cleanup() {
    echo "Shutting down..."
    kill \$BACKEND_PID
    kill \$FRONTEND_PID
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
EOL

# Make scripts executable
chmod +x setup.sh
chmod +x start.sh

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${YELLOW}To start the application, run:${NC}"
echo -e "${GREEN}./start.sh${NC}" 