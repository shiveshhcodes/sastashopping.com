import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('comparison_service.log')
    ]
)

logger = logging.getLogger(__name__)

# Service configuration
SERVICE_HOST = os.getenv('COMPARISON_SERVICE_HOST', '0.0.0.0')
SERVICE_PORT = int(os.getenv('COMPARISON_SERVICE_PORT', 8000))

# Scraping configuration
SCRAPING_TIMEOUT = int(os.getenv('SCRAPING_TIMEOUT', 15))  # Increased timeout
MAX_RETRIES = int(os.getenv('MAX_RETRIES', 5))  # Increased retries
CACHE_DURATION_MINUTES = int(os.getenv('CACHE_DURATION_MINUTES', 30))

# Platform configuration
SUPPORTED_PLATFORMS = ['amazon', 'flipkart', 'myntra']

# Search configuration
MIN_MATCH_SCORE = int(os.getenv('MIN_MATCH_SCORE', 70))  # Lowered threshold for better results
MAX_PRODUCTS_PER_PLATFORM = int(os.getenv('MAX_PRODUCTS_PER_PLATFORM', 5))

# Headers for requests
DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'DNT': '1',
}

# Proxy configuration
USE_PROXIES = os.getenv('USE_PROXIES', 'false').lower() == 'true'
PROXY_LIST = os.getenv('PROXY_LIST', '').split(',') if os.getenv('PROXY_LIST') else []

# Robots.txt configuration
RESPECT_ROBOTS_TXT = os.getenv('RESPECT_ROBOTS_TXT', 'true').lower() == 'true'
ROBOTS_CACHE_DURATION = int(os.getenv('ROBOTS_CACHE_DURATION', 3600))  # 1 hour

# Error handling configuration
MAX_CONCURRENT_REQUESTS = int(os.getenv('MAX_CONCURRENT_REQUESTS', 10))
REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', 30))
RETRY_DELAY = int(os.getenv('RETRY_DELAY', 2))  # seconds

# Log configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', 'comparison_service.log')

# Update logger level based on environment
logger.setLevel(getattr(logging, LOG_LEVEL.upper())) 