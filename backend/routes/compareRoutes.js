const express = require('express');
const router = express.Router();

const { scrapeProductData, detectPlatform } = require('../utils/scraper');
const { generateSearchQuery, findBestMatch } = require('../utils/helpers');
const scrapeAmazon = require('../utils/amazonScraper');
const scrapeFlipkart = require('../utils/flipkartScraper');
const scrapeMyntra = require('../utils/myntraScraper');
const logger = require('../utils/logger');
const { ValidationError } = require('../middlewares/errorHandler');

// Helper to normalize and clean up offer data
function mapToOffer(platform, match, searchMatch) {
  if (!match) return null;

  let features = [];
  if (match.keyFeatures && Array.isArray(match.keyFeatures)) {
    features = match.keyFeatures;
  } else if (match.features && Array.isArray(match.features)) {
    features = match.features;
  }
  
  features = features
    .map(f => typeof f === 'string' ? f.trim() : '')
    .filter(f => f && f.length < 200);
  features = Array.from(new Set(features));

  let title = (match.title || '').replace(/\s+/g, ' ').trim();
  let brand = (match.brand || '').replace(/\s+/g, ' ').trim();
  if (brand && title && !title.toLowerCase().startsWith(brand.toLowerCase())) {
    title = brand + ' ' + title;
  }

  let category = (match.category || '').trim();
  let price = (match.price || '').trim();
  let originalPrice = (match.originalPrice || '').trim();
  let rating = (match.rating || '').toString().replace(/[^\d.]/g, '');
  let reviews = (match.reviews || '').toString().replace(/[^\d]/g, '');

  let url = (searchMatch && searchMatch.link) || match.link || match.url || '';
  let imageUrl = (searchMatch && searchMatch.image) || match.image || match.imageUrl || '';

  if (platform === 'amazon' && searchMatch) {
    if (searchMatch.title) title = searchMatch.title;
    if (searchMatch.price) price = searchMatch.price;
  }

  return {
    title: title || 'N/A',
    retailer: platform.charAt(0).toUpperCase() + platform.slice(1),
    price: price || 'Not Available',
    originalPrice,
    category,
    image: imageUrl,
    features,
    rating: rating || undefined,
    reviews: reviews || undefined,
    discount: match.discount,
    url,
    platform
  };
}

// Input validation middleware
const validateCompareRequest = (req, res, next) => {
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
  
  const platform = detectPlatform(url);
  if (platform === 'unknown') {
    throw new ValidationError('Unsupported platform. Please provide a valid Amazon, Flipkart, or Myntra product URL');
  }
  
  next();
};

router.post('/', validateCompareRequest, async (req, res) => {
  const startTime = process.hrtime();
    const { url } = req.body;
  
  try {
    logger.info('Starting product comparison', { url, requestId: req.requestId });

    // 1. Detect platform and scrape source product
    const sourcePlatform = detectPlatform(url);
    const sourceData = await scrapeProductData(url);
    const query = generateSearchQuery(sourceData);

    // 2. Search and match on other platforms
    let matches = {};
    const platforms = ['amazon', 'flipkart', 'myntra'];
    
    // Set source product data
    matches[sourcePlatform] = mapToOffer(sourcePlatform, sourceData);

    // Search on other platforms
    const otherPlatforms = platforms.filter(p => p !== sourcePlatform);
    
    for (const platform of otherPlatforms) {
      try {
        let searchResults;
        switch (platform) {
          case 'amazon':
            searchResults = await scrapeAmazon.searchAmazon(query);
            break;
          case 'flipkart':
            searchResults = await scrapeFlipkart.searchFlipkart(query);
            break;
          case 'myntra':
            searchResults = await scrapeMyntra.searchMyntra(query);
            break;
        }

        if (searchResults && searchResults.length > 0) {
          const bestMatch = findBestMatch(sourceData, searchResults);
          if (bestMatch) {
            matches[platform] = mapToOffer(platform, bestMatch);
    }
        }
      } catch (error) {
        logger.error(`Error searching on ${platform}:`, {
          error: error.message,
          platform,
          requestId: req.requestId
        });
        // Continue with other platforms even if one fails
      }
    }

    // Calculate response time
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const responseTime = seconds * 1000 + nanoseconds / 1000000;

    // Prepare response
    const response = {
      success: true,
      data: {
        source: {
          platform: sourcePlatform,
          product: matches[sourcePlatform]
        },
        comparisons: Object.entries(matches)
          .filter(([platform]) => platform !== sourcePlatform)
          .map(([platform, data]) => ({
            platform,
            product: data
          })),
        metadata: {
          responseTime: `${responseTime.toFixed(2)}ms`,
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      }
    };

    logger.info('Comparison completed successfully', {
      sourcePlatform,
      platformsFound: Object.keys(matches).length,
      responseTime: `${responseTime.toFixed(2)}ms`,
      requestId: req.requestId
      });

    res.json(response);

  } catch (error) {
    logger.error('Comparison failed:', {
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
        error: 'Failed to compare products. Please try again later.',
        requestId: req.requestId
      });
    }
  }
});

module.exports = router;