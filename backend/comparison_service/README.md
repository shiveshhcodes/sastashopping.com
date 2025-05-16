# Product Comparison Service

This is a FastAPI-based microservice that handles real-time product comparison across multiple e-commerce platforms.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the service:
```bash
python run.py
```

The service will be available at `http://localhost:8000`

## API Endpoints

### POST /compare

Compares a product across multiple platforms.

Request body:
```json
{
  "product": {
    "title": "Product Title",
    "platform": "amazon",
    "price": "₹1,999",
    "url": "https://amazon.in/product",
    "category": "Electronics",
    "brand": "Brand Name"
  },
  "platforms": ["amazon", "flipkart", "myntra"]
}
```

Response:
```json
{
  "best_platform": "flipkart",
  "products": [
    {
      "platform": "flipkart",
      "title": "Product Title",
      "price": "₹1,899",
      "match_score": 95.5,
      "product_url": "https://flipkart.com/product",
      "image_url": "https://flipkart.com/image.jpg"
    }
  ],
  "timestamp": "2024-02-20T12:00:00Z"
}
```

## Features

- Real-time product comparison across Amazon, Flipkart, and Myntra
- Fuzzy string matching for accurate product matching
- Caching to improve performance
- Async HTTP requests for better scalability
- Error handling and retry mechanisms 