# Product Comparison Service

A FastAPI-based service that compares products across different e-commerce platforms and provides similarity scores and matches.

## Features

- Standardized product data format across platforms
- Intelligent product matching using multiple similarity metrics:
  - Title similarity using TF-IDF and cosine similarity
  - Price similarity based on percentage difference
  - Feature similarity using text analysis
  - Category matching
- Weighted scoring system for overall similarity
- RESTful API endpoints for product comparison
- Comprehensive test suite

## API Endpoints

### POST /compare
Compare multiple products and find matches.

Request body:
```json
{
  "products": [
    {
      "id": "string",
      "title": "string",
      "price": number,
      "currency": "string",
      "platform": "string",
      "url": "string",
      "imageUrl": "string (optional)",
      "description": "string (optional)",
      "brand": "string (optional)",
      "category": "string (optional)",
      "features": {
        "key": "value"
      },
      "metadata": {
        "key": "value"
      },
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "searchQuery": "string (optional)"
}
```

Response:
```json
{
  "matches": [
    {
      "product1": "string",
      "product2": "string",
      "similarity": number
    }
  ],
  "scores": {
    "product_id": number
  },
  "metadata": {
    "totalProducts": number,
    "totalMatches": number,
    "averageSimilarity": number,
    "timestamp": "datetime"
  }
}
```

### GET /health
Health check endpoint.

Response:
```json
{
  "status": "healthy",
  "timestamp": "datetime"
}
```

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
uvicorn app.main:app --reload
```

The service will be available at `http://localhost:8000`

## Testing

Run the test suite:
```bash
pytest tests/
```

## Similarity Calculation

The service uses a weighted scoring system to calculate product similarity:

- Title similarity (40%): Uses TF-IDF and cosine similarity to compare product titles
- Price similarity (30%): Calculates price difference as a percentage
- Feature similarity (20%): Compares product features using text analysis
- Category matching (10%): Exact match for product categories

Products with an overall similarity score > 0.7 are considered matches.

## Error Handling

The service includes comprehensive error handling for:
- Invalid input data
- Missing required fields
- Invalid URLs
- Server errors

All errors return appropriate HTTP status codes and descriptive error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 