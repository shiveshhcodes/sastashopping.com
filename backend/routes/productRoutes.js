const express = require('express');
const router = express.Router();
const { scrapeProductData } = require('../utils/scraper');
const { ValidationError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

// Input validation middleware
const validateProductRequest = (req, res, next) => {
  const { url } = req.body;
  
  if (!url) {
    throw new ValidationError('Product URL is required');
  }
  
  if (typeof url !== 'string') {
    throw new ValidationError('Product URL must be a string');
  }
  
  try {
    new URL(url);
  } catch (error) {
    throw new ValidationError('Invalid URL format');
  }
  
  next();
};

// POST /api/v1/products - Get product data from URL
router.post('/', validateProductRequest, async (req, res) => {
  const { url } = req.body;
  
  try {
    logger.info('Fetching product data', { url, requestId: req.requestId });
    
    const productData = await scrapeProductData(url);
    
    // Format the response to match the expected Product model
    const response = {
      id: `${productData.platform}-${Date.now()}`,
      title: productData.title,
      price: typeof productData.price === 'string' ? parseFloat(productData.price.replace(/[^0-9.]/g, '')) : parseFloat(productData.price),
      currency: 'INR',
      platform: productData.platform,
      url: productData.url,
      imageUrl: productData.imageUrl,
      description: productData.description,
      brand: productData.brand,
      category: productData.category,
      features: productData.features || {},
      metadata: {
        scrapedAt: productData.scraped_at,
        source: productData.platform
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json(response);
    
  } catch (error) {
    logger.error('Failed to fetch product data:', {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId
    });

    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: error.message,
        requestId: req.requestId
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product data. Please try again later.',
        requestId: req.requestId
      });
    }
  }
});

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