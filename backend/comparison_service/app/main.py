from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
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

app = FastAPI(
    title="Product Comparison Service",
    description="A microservice for comparing product prices across multiple e-commerce platforms",
    version="1.0.0"
)

class ProductInfo(BaseModel):
    title: str
    platform: str
    price: str
    url: str
    category: Optional[str] = None
    brand: Optional[str] = None

class ComparisonRequest(BaseModel):
    product: ProductInfo
    platforms: List[str]

class ComparisonProduct(BaseModel):
    platform: str
    title: str
    price: str
    match_score: float
    product_url: str
    image_url: Optional[str] = None
    model_number: Optional[str] = None
    brand: Optional[str] = None

class ComparisonResponse(BaseModel):
    best_platform: str
    products: List[ComparisonProduct]
    timestamp: str

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

async def search_platform(platform: str, query: str) -> List[ComparisonProduct]:
    try:
        # Get search URL
        search_url = get_search_url(platform, query)
        if not search_url:
            print(f"Invalid platform: {platform}")
            return []

        # Fetch the page
        html_content = await fetch_page(search_url)
        if not html_content:
            print(f"Failed to fetch content from {platform}")
            return []

        # Parse the page
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Platform-specific parsing
        products = []
        if platform.lower() == 'amazon':
            product_elements = soup.select('div[data-component-type="s-search-result"]')
            for element in product_elements[:MAX_PRODUCTS_PER_PLATFORM]:
                try:
                    title_elem = element.select_one('h2 a span')
                    price_elem = element.select_one('span.a-price-whole')
                    url_elem = element.select_one('h2 a')
                    
                    if not all([title_elem, price_elem, url_elem]):
                        continue
                        
                    title = title_elem.text.strip()
                    price = f"₹{price_elem.text.strip()}"
                    url = f"https://www.amazon.in{url_elem['href']}"
                    
                    # Calculate match score
                    match_score = fuzz.token_sort_ratio(query.lower(), title.lower())
                    
                    products.append(ComparisonProduct(
                        platform=platform,
                        title=title,
                        price=price,
                        match_score=match_score,
                        product_url=url
                    ))
                except Exception as e:
                    print(f"Error parsing Amazon product: {str(e)}")
                    continue
                    
        elif platform.lower() == 'flipkart':
            product_elements = soup.select('div._1AtVbE')
            for element in product_elements[:MAX_PRODUCTS_PER_PLATFORM]:
                try:
                    title_elem = element.select_one('div._4rR01T')
                    price_elem = element.select_one('div._30jeq3')
                    url_elem = element.select_one('a._1fQZEK')
                    
                    if not all([title_elem, price_elem, url_elem]):
                        continue
                        
                    title = title_elem.text.strip()
                    price = price_elem.text.strip()
                    url = f"https://www.flipkart.com{url_elem['href']}"
                    
                    # Calculate match score
                    match_score = fuzz.token_sort_ratio(query.lower(), title.lower())
                    
                    products.append(ComparisonProduct(
                        platform=platform,
                        title=title,
                        price=price,
                        match_score=match_score,
                        product_url=url
                    ))
                except Exception as e:
                    print(f"Error parsing Flipkart product: {str(e)}")
                    continue
                    
        elif platform.lower() == 'myntra':
            product_elements = soup.select('li.product-base')
            for element in product_elements[:MAX_PRODUCTS_PER_PLATFORM]:
                try:
                    title_elem = element.select_one('h3.product-brand')
                    price_elem = element.select_one('span.product-discountedPrice')
                    url_elem = element.select_one('a.product-base-link')
                    
                    if not all([title_elem, price_elem, url_elem]):
                        continue
                        
                    title = title_elem.text.strip()
                    price = price_elem.text.strip()
                    url = f"https://www.myntra.com{url_elem['href']}"
                    
                    # Calculate match score
                    match_score = fuzz.token_sort_ratio(query.lower(), title.lower())
                    
                    products.append(ComparisonProduct(
                        platform=platform,
                        title=title,
                        price=price,
                        match_score=match_score,
                        product_url=url
                    ))
                except Exception as e:
                    print(f"Error parsing Myntra product: {str(e)}")
                    continue

        # Filter products by match score
        filtered_products = [p for p in products if p.match_score >= MIN_MATCH_SCORE]
        
        # Sort by price
        filtered_products.sort(key=lambda x: extract_price(x.price)['amount'])
        
        return filtered_products

    except Exception as e:
        print(f"Error in search_platform for {platform}: {str(e)}")
        return []

@app.post("/compare", response_model=ComparisonResponse)
async def compare_products(request: ComparisonRequest):
    try:
        # Validate platforms
        invalid_platforms = [p for p in request.platforms if p.lower() not in SUPPORTED_PLATFORMS]
        if invalid_platforms:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported platforms: {', '.join(invalid_platforms)}"
            )

        # Create cache key
        cache_key = f"{request.product.title}_{','.join(sorted(request.platforms))}"
        
        # Check cache
        if cache_key in comparison_cache:
            cache_entry = comparison_cache[cache_key]
            if datetime.now() - cache_entry['timestamp'] < CACHE_DURATION:
                return cache_entry['response']

        # Search all platforms concurrently
        search_tasks = [
            search_platform(platform, request.product.title)
            for platform in request.platforms
        ]
        
        results = await asyncio.gather(*search_tasks, return_exceptions=True)
        
        # Process results and handle errors
        all_products = []
        for platform_result in results:
            if isinstance(platform_result, Exception):
                print(f"Error searching platform: {str(platform_result)}")
                continue
            all_products.extend(platform_result)

        if not all_products:
            raise HTTPException(
                status_code=404,
                detail="No matching products found on any platform"
            )

        # Find best match
        best_product = min(all_products, key=lambda x: x.price)
        
        # Create response
        response = ComparisonResponse(
            best_platform=best_product.platform,
            products=all_products,
            timestamp=datetime.now().isoformat()
        )

        # Update cache
        comparison_cache[cache_key] = {
            'response': response,
            'timestamp': datetime.now()
        }

        return response

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error in compare_products: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch comparison results: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=SERVICE_HOST,
        port=SERVICE_PORT,
        reload=True
    ) 