const express = require('express');
const router = express.Router();

// GET /api/v1/products/fake - return dummy product data
router.get('/fake', (req, res) => {
  res.json({
    title: 'Sample Product',
    images: ['https://placehold.co/400x400'],
    platform: 'Amazon',
    price: 499,
    productUrl: 'https://amazon.com/sample-product',
    lastFetched: new Date(),
  });
});

module.exports = router;