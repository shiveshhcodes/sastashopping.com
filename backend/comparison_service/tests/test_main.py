import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from app.main import app, Product, ComparisonRequest

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "timestamp" in response.json()

def test_compare_products_minimum_products():
    # Test with less than 2 products
    request_data = {
        "products": [
            {
                "id": "1",
                "title": "Test Product",
                "price": 100.0,
                "currency": "INR",
                "platform": "amazon",
                "url": "https://amazon.com/test",
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
        ],
        "searchQuery": "test product"
    }
    response = client.post("/compare", json=request_data)
    assert response.status_code == 400
    assert "At least 2 products required" in response.json()["detail"]

def test_compare_products_similar():
    # Test with similar products
    request_data = {
        "products": [
            {
                "id": "1",
                "title": "iPhone 13 Pro Max 256GB",
                "price": 129900.0,
                "currency": "INR",
                "platform": "amazon",
                "url": "https://amazon.com/iphone13",
                "imageUrl": "https://amazon.com/iphone13.jpg",
                "description": "Latest iPhone with A15 Bionic chip",
                "brand": "Apple",
                "category": "Electronics",
                "features": {
                    "color": "Graphite",
                    "storage": "256GB",
                    "ram": "6GB"
                },
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            },
            {
                "id": "2",
                "title": "Apple iPhone 13 Pro Max 256GB Graphite",
                "price": 129999.0,
                "currency": "INR",
                "platform": "flipkart",
                "url": "https://flipkart.com/iphone13",
                "imageUrl": "https://flipkart.com/iphone13.jpg",
                "description": "Apple iPhone 13 Pro Max with A15 Bionic",
                "brand": "Apple",
                "category": "Electronics",
                "features": {
                    "color": "Graphite",
                    "storage": "256GB",
                    "ram": "6GB"
                },
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
        ],
        "searchQuery": "iphone 13 pro max"
    }
    response = client.post("/compare", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert len(data["matches"]) > 0
    assert data["matches"][0]["similarity"] > 0.7
    assert "1" in data["scores"]
    assert "2" in data["scores"]
    assert "totalProducts" in data["metadata"]
    assert "totalMatches" in data["metadata"]
    assert "averageSimilarity" in data["metadata"]

def test_compare_products_different():
    # Test with different products
    request_data = {
        "products": [
            {
                "id": "1",
                "title": "iPhone 13 Pro Max",
                "price": 129900.0,
                "currency": "INR",
                "platform": "amazon",
                "url": "https://amazon.com/iphone13",
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            },
            {
                "id": "2",
                "title": "Samsung Galaxy S21",
                "price": 89900.0,
                "currency": "INR",
                "platform": "flipkart",
                "url": "https://flipkart.com/s21",
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
        ],
        "searchQuery": "smartphones"
    }
    response = client.post("/compare", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert len(data["matches"]) == 0
    assert "1" in data["scores"]
    assert "2" in data["scores"]
    assert data["metadata"]["totalMatches"] == 0

def test_compare_products_invalid_data():
    # Test with invalid product data
    request_data = {
        "products": [
            {
                "id": "1",
                "title": "Test Product",
                "price": "invalid",  # Invalid price type
                "currency": "INR",
                "platform": "amazon",
                "url": "https://amazon.com/test",
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            },
            {
                "id": "2",
                "title": "Test Product 2",
                "price": 100.0,
                "currency": "INR",
                "platform": "flipkart",
                "url": "https://flipkart.com/test",
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
        ]
    }
    response = client.post("/compare", json=request_data)
    assert response.status_code == 422  # Validation error 