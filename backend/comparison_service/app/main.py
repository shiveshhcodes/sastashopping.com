from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
import httpx
from bs4 import BeautifulSoup
from rapidfuzz import fuzz
import asyncio
from functools import lru_cache
import re
from datetime import datetime, timedelta
from .config import (
    SERVICE_HOST,
    SERVICE_PORT,
    SCRAPING_TIMEOUT,
    MAX_RETRIES,
    CACHE_DURATION_MINUTES,
    SUPPORTED_PLATFORMS,
    MIN_MATCH_SCORE,
    MAX_PRODUCTS_PER_PLATFORM,
    DEFAULT_HEADERS,
    RESPECT_ROBOTS_TXT,
    ROBOTS_CACHE_DURATION,
    USE_PROXIES,
    PROXY_LIST
)
import random
from urllib.robotparser import RobotFileParser
from urllib.parse import urlparse
import time
import logging
import json
from difflib import SequenceMatcher
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Product Comparison Service",
    description="A microservice for comparing product prices across multiple e-commerce platforms",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Product(BaseModel):
    id: str
    title: str
    price: float
    currency: str
    platform: str
    url: HttpUrl
    imageUrl: Optional[HttpUrl] = None
    description: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    features: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    createdAt: datetime
    updatedAt: datetime

class ComparisonRequest(BaseModel):
    products: List[Product]
    searchQuery: Optional[str] = None

class ComparisonResponse(BaseModel):
    matches: List[Dict[str, Any]]
    scores: Dict[str, float]
    metadata: Dict[str, Any]

# Cache for storing recent comparisons
comparison_cache = {}
CACHE_DURATION = timedelta(minutes=CACHE_DURATION_MINUTES)

# Cache for robots.txt files
robots_cache = {}
last_robots_check = {}

def can_fetch_url(url: str) -> bool:
    if not RESPECT_ROBOTS_TXT:
        return True
        
    parsed_url = urlparse(url)
    domain = f"{parsed_url.scheme}://{parsed_url.netloc}"
    
    # Check if we need to refresh the robots.txt cache
    current_time = time.time()
    if domain in last_robots_check:
        if current_time - last_robots_check[domain] > ROBOTS_CACHE_DURATION:
            del robots_cache[domain]
            del last_robots_check[domain]
    
    # Get or create robots.txt parser
    if domain not in robots_cache:
        rp = RobotFileParser()
        rp.set_url(f"{domain}/robots.txt")
        try:
            rp.read()
            robots_cache[domain] = rp
            last_robots_check[domain] = current_time
        except Exception as e:
            print(f"Error reading robots.txt for {domain}: {str(e)}")
            return True  # Allow fetching if robots.txt is not accessible
    
    return robots_cache[domain].can_fetch(DEFAULT_HEADERS['User-Agent'], url)

def get_proxy() -> dict:
    if not USE_PROXIES or not PROXY_LIST:
        return {}
    
    proxy = random.choice(PROXY_LIST)
    return {
        'http': proxy,
        'https': proxy
    }

async def fetch_page(url: str, headers: dict = None) -> str:
    if headers is None:
        headers = DEFAULT_HEADERS
    
    # Check robots.txt
    if not can_fetch_url(url):
        print(f"URL {url} is not allowed by robots.txt")
        return ""
    
    # Get proxy if enabled
    proxies = get_proxy()
    
    async with httpx.AsyncClient(proxies=proxies) as client:
        for attempt in range(MAX_RETRIES):
            try:
                response = await client.get(url, headers=headers, timeout=SCRAPING_TIMEOUT)
                response.raise_for_status()
                return response.text
            except Exception as e:
                if attempt == MAX_RETRIES - 1:
                    print(f"Error fetching {url} after {MAX_RETRIES} attempts: {str(e)}")
                    return ""
                await asyncio.sleep(2 ** attempt)  # Exponential backoff

def extract_price(price_str: str) -> dict:
    if not price_str:
        return {'amount': float('inf'), 'currency': 'INR'}
    
    # Extract currency symbol
    currency_symbols = {
        '₹': 'INR',
        '$': 'USD',
        '€': 'EUR',
        '£': 'GBP'
    }
    
    currency = 'INR'  # Default currency
    for symbol, curr in currency_symbols.items():
        if symbol in price_str:
            currency = curr
            break
    
    # Remove currency symbols and commas
    price_str = re.sub(r'[^\d.]', '', price_str)
    try:
        amount = float(price_str)
        return {'amount': amount, 'currency': currency}
    except ValueError:
        return {'amount': float('inf'), 'currency': currency}

def convert_currency(amount: float, from_currency: str, to_currency: str) -> float:
    # This is a simplified version. In production, you should use a proper currency conversion API
    conversion_rates = {
        'INR': {'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0095},
        'USD': {'INR': 83.0, 'EUR': 0.92, 'GBP': 0.79},
        'EUR': {'INR': 90.0, 'USD': 1.09, 'GBP': 0.86},
        'GBP': {'INR': 105.0, 'USD': 1.27, 'EUR': 1.16}
    }
    
    if from_currency == to_currency:
        return amount
    
    if from_currency in conversion_rates and to_currency in conversion_rates[from_currency]:
        return amount * conversion_rates[from_currency][to_currency]
    
    return amount  # Return original amount if conversion not possible

def extract_shipping_cost(platform: str, price_str: str) -> float:
    # Extract shipping cost if mentioned in the price string
    shipping_patterns = {
        'flipkart': r'\+₹(\d+) shipping',
        'amazon': r'\+₹(\d+) shipping',
        'myntra': r'\+₹(\d+) shipping'
    }
    
    pattern = shipping_patterns.get(platform.lower())
    if pattern:
        match = re.search(pattern, price_str)
        if match:
            return float(match.group(1))
    
    return 0.0

def get_search_url(platform: str, query: str) -> str:
    base_urls = {
        "flipkart": f"https://www.flipkart.com/search?q={query}",
        "amazon": f"https://www.amazon.in/s?k={query}",
        "myntra": f"https://www.myntra.com/{query}"
    }
    return base_urls.get(platform.lower(), "")

def normalize_product_name(title: str) -> str:
    # Remove extra spaces
    title = ' '.join(title.split())
    # Remove special characters except alphanumeric and spaces
    title = re.sub(r'[^a-zA-Z0-9\s]', '', title)
    return title.lower()

def extract_identifiers(title: str) -> dict:
    # Extract model numbers (common patterns)
    model_patterns = [
        r'[A-Z]{2,3}-\d{3,4}',  # Common model number pattern
        r'[A-Z]{2,3}\d{3,4}',   # Model number without hyphen
        r'\d{4}[A-Z]{2,3}',     # Alternative pattern
    ]
    
    model_number = None
    for pattern in model_patterns:
        match = re.search(pattern, title)
        if match:
            model_number = match.group()
            break
    
    # Extract brand (assuming it's at the start of the title)
    brand = None
    common_brands = ['samsung', 'apple', 'sony', 'lg', 'nike', 'adidas', 'puma']
    title_lower = title.lower()
    for brand_name in common_brands:
        if title_lower.startswith(brand_name):
            brand = brand_name
            break
    
    return {
        'model_number': model_number,
        'brand': brand
    }

async def search_platform(platform: str, query: str) -> List[Product]:
    """Search for products on a specific platform."""
    try:
        search_url = get_search_url(platform, query)
        if not search_url:
            logger.error(f"Invalid platform: {platform}")
            return []

        async with httpx.AsyncClient() as client:
            response = await client.get(search_url, headers=DEFAULT_HEADERS, timeout=SCRAPING_TIMEOUT)
            response.raise_for_status()
            html_content = response.text

        soup = BeautifulSoup(html_content, 'html.parser')
        products = []

        if platform.lower() == 'amazon':
            product_elements = soup.select('div[data-component-type="s-search-result"]')
            for element in product_elements[:MAX_PRODUCTS_PER_PLATFORM]:
                try:
                    title_elem = element.select_one('h2 a span')
                    price_elem = element.select_one('span.a-price-whole')
                    url_elem = element.select_one('h2 a')
                    image_elem = element.select_one('img.s-image')
                    
                    if not all([title_elem, price_elem, url_elem]):
                        continue
                        
                    title = title_elem.text.strip()
                    price = float(price_elem.text.strip().replace(',', ''))
                    url = f"https://www.amazon.in{url_elem['href']}"
                    image_url = image_elem['src'] if image_elem else None
                    
                    products.append(Product(
                        id=f"amazon-{len(products)}",
                        title=title,
                        price=price,
                        currency="INR",
                        platform="amazon",
                        url=url,
                        imageUrl=image_url,
                        createdAt=datetime.utcnow(),
                        updatedAt=datetime.utcnow()
                    ))
                except Exception as e:
                    logger.error(f"Error parsing Amazon product: {str(e)}")
                    continue
                    
        elif platform.lower() == 'flipkart':
            product_elements = soup.select('div._1AtVbE')
            for element in product_elements[:MAX_PRODUCTS_PER_PLATFORM]:
                try:
                    title_elem = element.select_one('div._4rR01T')
                    price_elem = element.select_one('div._30jeq3')
                    url_elem = element.select_one('a._1fQZEK')
                    image_elem = element.select_one('img._396cs4')
                    
                    if not all([title_elem, price_elem, url_elem]):
                        continue
                        
                    title = title_elem.text.strip()
                    price = float(price_elem.text.strip().replace('₹', '').replace(',', ''))
                    url = f"https://www.flipkart.com{url_elem['href']}"
                    image_url = image_elem['src'] if image_elem else None
                    
                    products.append(Product(
                        id=f"flipkart-{len(products)}",
                        title=title,
                        price=price,
                        currency="INR",
                        platform="flipkart",
                        url=url,
                        imageUrl=image_url,
                        createdAt=datetime.utcnow(),
                        updatedAt=datetime.utcnow()
                    ))
                except Exception as e:
                    logger.error(f"Error parsing Flipkart product: {str(e)}")
                    continue
                    
        elif platform.lower() == 'myntra':
            product_elements = soup.select('li.product-base')
            for element in product_elements[:MAX_PRODUCTS_PER_PLATFORM]:
                try:
                    title_elem = element.select_one('h3.product-brand')
                    price_elem = element.select_one('span.product-discountedPrice')
                    url_elem = element.select_one('a.product-base-link')
                    image_elem = element.select_one('img.product-image')
                    
                    if not all([title_elem, price_elem, url_elem]):
                        continue
                        
                    title = title_elem.text.strip()
                    price = float(price_elem.text.strip().replace('₹', '').replace(',', ''))
                    url = f"https://www.myntra.com{url_elem['href']}"
                    image_url = image_elem['src'] if image_elem else None
                    
                    products.append(Product(
                        id=f"myntra-{len(products)}",
                        title=title,
                        price=price,
                        currency="INR",
                        platform="myntra",
                        url=url,
                        imageUrl=image_url,
                        createdAt=datetime.utcnow(),
                        updatedAt=datetime.utcnow()
                    ))
                except Exception as e:
                    logger.error(f"Error parsing Myntra product: {str(e)}")
                    continue

        return products

    except Exception as e:
        logger.error(f"Error in search_platform for {platform}: {str(e)}")
        return []

def preprocess_text(text: str) -> str:
    """Clean and normalize text for comparison."""
    if not text:
        return ""
    # Convert to lowercase
    text = text.lower()
    # Remove special characters and extra spaces
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def calculate_title_similarity(title1: str, title2: str) -> float:
    """Calculate similarity between two product titles."""
    title1 = preprocess_text(title1)
    title2 = preprocess_text(title2)
    
    # Use TF-IDF and cosine similarity for better matching
    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([title1, title2])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    except:
        # Fallback to sequence matcher if TF-IDF fails
        similarity = SequenceMatcher(None, title1, title2).ratio()
    
    return float(similarity)

def calculate_price_similarity(price1: float, price2: float) -> float:
    """Calculate similarity between two prices."""
    if price1 <= 0 or price2 <= 0:
        return 0.0
    
    # Calculate price difference as a percentage
    max_price = max(price1, price2)
    price_diff = abs(price1 - price2) / max_price
    
    # Convert to similarity score (1 - difference)
    return 1.0 - price_diff

def calculate_feature_similarity(features1: Dict, features2: Dict) -> float:
    """Calculate similarity between product features."""
    if not features1 or not features2:
        return 0.0
    
    # Combine all feature text
    text1 = " ".join(str(v) for v in features1.values())
    text2 = " ".join(str(v) for v in features2.values())
    
    # Use TF-IDF and cosine similarity
    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    except:
        similarity = 0.0
    
    return float(similarity)

def calculate_overall_similarity(product1: Product, product2: Product) -> float:
    """Calculate overall similarity between two products."""
    # Weights for different components
    weights = {
        'title': 0.4,
        'price': 0.3,
        'features': 0.2,
        'category': 0.1
    }
    
    # Calculate individual similarities
    title_sim = calculate_title_similarity(product1.title, product2.title)
    price_sim = calculate_price_similarity(product1.price, product2.price)
    feature_sim = calculate_feature_similarity(product1.features or {}, product2.features or {})
    category_sim = 1.0 if product1.category == product2.category else 0.0
    
    # Calculate weighted average
    overall_sim = (
        weights['title'] * title_sim +
        weights['price'] * price_sim +
        weights['features'] * feature_sim +
        weights['category'] * category_sim
    )
    
    return float(overall_sim)

@app.post("/compare", response_model=ComparisonResponse)
async def compare_products(request: ComparisonRequest):
    """Compare products and find matches."""
    try:
        products = request.products
        search_query = request.searchQuery

        # If only one product is provided, search for similar products on other platforms
        if len(products) == 1:
            source_product = products[0]
            all_products = [source_product]
            
            # Search on other platforms
            other_platforms = [p for p in SUPPORTED_PLATFORMS if p != source_product.platform]
            for platform in other_platforms:
                try:
                    platform_products = await search_platform(platform, search_query or source_product.title)
                    if platform_products:
                        # Find the best match
                        best_match = max(platform_products, key=lambda p: calculate_overall_similarity(source_product, p))
                        all_products.append(best_match)
                except Exception as e:
                    logger.error(f"Error searching on {platform}: {str(e)}")
                    continue
            
            products = all_products

        if len(products) < 2:
            raise HTTPException(status_code=400, detail="Could not find enough similar products for comparison")
        
        # Calculate similarity matrix
        n = len(products)
        similarity_matrix = np.zeros((n, n))
        for i in range(n):
            for j in range(i + 1, n):
                similarity = calculate_overall_similarity(products[i], products[j])
                similarity_matrix[i][j] = similarity
                similarity_matrix[j][i] = similarity
        
        # Find matches (products with similarity > 0.7)
        matches = []
        for i in range(n):
            for j in range(i + 1, n):
                if similarity_matrix[i][j] > 0.7:
                    matches.append({
                        "product1": products[i].id,
                        "product2": products[j].id,
                        "similarity": float(similarity_matrix[i][j])
                    })
        
        # Calculate average similarity scores for each product
        scores = {}
        for i, product in enumerate(products):
            avg_similarity = np.mean(similarity_matrix[i])
            scores[product.id] = float(avg_similarity)
        
        # Prepare metadata
        metadata = {
            "totalProducts": n,
            "totalMatches": len(matches),
            "averageSimilarity": float(np.mean(similarity_matrix)),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return ComparisonResponse(
            matches=matches,
            scores=scores,
            metadata=metadata
        )
    
    except Exception as e:
        logger.error(f"Error in compare_products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=SERVICE_HOST,
        port=SERVICE_PORT,
        reload=True
    ) 