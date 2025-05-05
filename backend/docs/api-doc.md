# SastaShopping Backend API Documentation

## Products

### GET /api/v1/products/fake
- **Protected:** false
- **Description:** Returns dummy product data for testing.
- **Sample Response:**
```json
{
  "title": "Sample Product",
  "images": ["https://placehold.co/400x400"],
  "platform": "Amazon",
  "price": 499,
  "productUrl": "https://amazon.com/sample-product",
  "lastFetched": "2024-05-05T12:00:00.000Z"
}
```

---

## Users

### GET /api/v1/users/profile
- **Protected:** true (Firebase Auth)
- **Description:** Returns a fake user object (requires valid Firebase token in Authorization header).
- **Sample Request Header:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```
- **Sample Response:**
```json
{
  "uid": "fake-uid",
  "email": "fakeuser@example.com",
  "savedComparisons": [],
  "preferences": { "theme": "dark" }
}
```

---

## Root

### GET /
- **Protected:** false
- **Description:** Health check for server status.
- **Sample Response:**
```json
{
  "message": "Server is up and running"
}
``` 