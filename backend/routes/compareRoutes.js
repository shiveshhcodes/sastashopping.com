const express = require('express');
const router = express.Router();
const { scrapeProductData, detectPlatform } = require('../utils/scraper');
const { generateSearchQuery, findBestMatch } = require('../utils/helpers');
const scrapeAmazon = require('../utils/amazonScraper');
const scrapeFlipkart = require('../utils/flipkartScraper');
const scrapeMyntra = require('../utils/myntraScraper');

// Helper to map backend fields to frontend offer card fields
function mapToOffer(platform, match, searchMatch) {
  if (!match) return null;
  // Clean up features: remove empty, overly long, or duplicate entries
  let features = (match.keyFeatures || match.features || []).map(f =>
    typeof f === 'string' ? f.trim() : ''
  ).filter(f => f && f.length < 200);
  features = Array.from(new Set(features)); // Remove duplicates

  // Clean up title and brand
  let title = (match.title || '').replace(/\s+/g, ' ').trim();
  let brand = (match.brand || '').replace(/\s+/g, ' ').trim();
  if (brand && title && !title.toLowerCase().startsWith(brand.toLowerCase())) {
    title = brand + ' ' + title;
  }
  // Clean up category
  let category = (match.category || '').replace(/\s+/g, ' ').trim();
  // Clean up price
  let price = (match.price || '').replace(/\s+/g, ' ').trim();
  // Clean up originalPrice
  let originalPrice = (match.originalPrice || '').replace(/\s+/g, ' ').trim();
  // Clean up rating
  let rating = (match.rating || '').toString().replace(/[^\d.]/g, '');
  // Clean up reviews
  let reviews = (match.reviews || '').toString().replace(/[^\d]/g, '');

  // Always prefer link, fallback to url
  let url = (searchMatch && searchMatch.link) || match.link || match.url || '';
  let imageUrl = (searchMatch && searchMatch.image) || match.image || match.imageUrl || '';
  if (platform === 'amazon' && searchMatch) {
    // Use search result title/price if available
    if (searchMatch.title) title = searchMatch.title;
    if (searchMatch.price) price = searchMatch.price;
  }

  return {
    title: title || 'N/A',
    retailer: platform.charAt(0).toUpperCase() + platform.slice(1),
    price: price || 'Not Available',
    originalPrice: originalPrice,
    category: category,
    imageUrl,
    features,
    rating: rating || undefined,
    reviews: reviews || undefined,
    discount: match.discount,
    url,
  };
}

router.post('/', async (req, res) => {
  console.log('DEBUG /api/v1/compare req.body:', req.body); // Debug log
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Product URL is required' });

    // 1. Detect platform and scrape source product
    const sourcePlatform = detectPlatform(url);
    if (sourcePlatform === 'unknown') return res.status(400).json({ error: 'Unsupported platform' });
    const sourceData = await scrapeProductData(url);

    // 2. Generate search query
    const query = generateSearchQuery(sourceData);

    // 3. Search other platforms
    let matches = {};
    let amazonSearch = null;
    if (sourcePlatform !== 'amazon') {
      const amazonResults = [];
      amazonSearch = await scrapeAmazon.searchAmazon(query);
      if (amazonSearch) amazonResults.push(amazonSearch);
      matches['amazon'] = findBestMatch(sourceData, amazonResults) || null;
    } else {
      matches['amazon'] = { ...sourceData, link: url };
      amazonSearch = null;
    }

    if (sourcePlatform !== 'flipkart') {
      const flipkartResults = [];
      const flipkartSearch = await scrapeFlipkart.searchFlipkart(query);
      if (flipkartSearch) flipkartResults.push(flipkartSearch);
      matches['flipkart'] = findBestMatch(sourceData, flipkartResults) || null;
    } else {
      matches['flipkart'] = { ...sourceData, link: url };
    }

    if (sourcePlatform !== 'myntra') {
      const myntraResults = [];
      const myntraSearch = await scrapeMyntra.searchMyntra(query);
      if (myntraSearch) myntraResults.push(myntraSearch);
      matches['myntra'] = findBestMatch(sourceData, myntraResults) || null;
    } else {
      matches['myntra'] = { ...sourceData, link: url };
    }

    // 4. Map to offers array for frontend
    const offers = ['flipkart', 'amazon', 'myntra']
      .map(platform => {
        const offer = mapToOffer(platform, matches[platform], platform === 'amazon' ? amazonSearch : null);
        if (offer) offer.platform = platform; // Ensure platform field is set
        return offer;
      })
      .filter(Boolean);

    res.json({ offers });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Comparison failed' });
  }
});

module.exports = router; 