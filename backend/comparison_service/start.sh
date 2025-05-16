#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting SastaShopping Comparison Service...${NC}"

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install/upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip

# Install requirements
echo -e "${YELLOW}Installing requirements...${NC}"
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOL
COMPARISON_SERVICE_HOST=0.0.0.0
COMPARISON_SERVICE_PORT=8000
SCRAPING_TIMEOUT=10
MAX_RETRIES=3
CACHE_DURATION_MINUTES=30
MIN_MATCH_SCORE=80
MAX_PRODUCTS_PER_PLATFORM=5
USE_PROXIES=false
PROXY_LIST=
RESPECT_ROBOTS_TXT=true
ROBOTS_CACHE_DURATION=3600
PORT=5050
EOL
fi

# Start the service
echo -e "${GREEN}Starting the comparison service...${NC}"
python run.py 