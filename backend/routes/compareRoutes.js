const express = require('express');
const router = express.Router();

const { scrapeProductData, detectPlatform } = require('../utils/scraper');
const { generateSearchQuery, findBestMatch } = require('../utils/helpers');
const scrapeAmazon = require('../utils/amazonScraper');
const scrapeFlipkart = require('../utils/flipkartScraper');
const scrapeMyntra = require('../utils/myntraScraper');

// Helper to normalize and clean up offer data
function mapToOffer(platform, match, searchMatch) {
  if (!match) return null;

  let features = (match.keyFeatures || match.features || []).map(f => typeof f === 'string' ? f.trim() : '')
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
    platform // critical for frontend mapping
  };
}

router.post('/', async (req, res) => {
  console.log('DEBUG /api/v1/compare req.body:', req.body);
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Product URL is required' });

    // 1. Detect platform and scrape source product
    const sourcePlatform = detectPlatform(url);
    if (sourcePlatform === 'unknown') return res.status(400).json({ error: 'Unsupported platform' });

    const sourceData = await scrapeProductData(url);
    const query = generateSearchQuery(sourceData);

    // 2. Search and match on other platforms
    let matches = {};

    if (sourcePlatform !== 'amazon') {
      const amazonSearchResults = await scrapeAmazon.searchAmazon(query);
      matches['amazon'] = findBestMatch(sourceData, amazonSearchResults) || null;
    } else {
      matches['amazon'] = { ...sourceData, link: url };
    }

    if (sourcePlatform !== 'flipkart') {
      const flipkartSearchResults = await scrapeFlipkart.searchFlipkart(query);
      matches['flipkart'] = findBestMatch(sourceData, flipkartSearchResults) || null;
    } else {
      matches['flipkart'] = { ...sourceData, link: url };
    }

    if (sourcePlatform !== 'myntra') {
      const myntraSearchResults = await scrapeMyntra.searchMyntra(query);
      matches['myntra'] = findBestMatch(sourceData, myntraSearchResults) || null;
    } else {
      matches['myntra'] = { ...sourceData, link: url };
    }

    // 3. Normalize and return offers for all platforms
    const offers = ['flipkart', 'amazon', 'myntra']
      .map(platform => {
        const matchedProduct = matches[platform];

        const offer = matchedProduct ? mapToOffer(platform, matchedProduct, null) : null;

        // Ensure every block shows up in frontend
        if (!offer) {
          return {
            title: 'No Match Found',
            retailer: platform.charAt(0).toUpperCase() + platform.slice(1),
            price: 'N/A',
            category: 'Unknown',
            image: 'https://via.placeholder.com/300x300?text=No+Match',
            features: [],
            rating: '',
            reviews: '',
            url: '',
            platform
          };
        }

        offer.platform = platform;
        return offer;
      });

    res.json({ offers });
  } catch (err) {
    console.error('Error in /compare route:', err.message);
    res.status(500).json({ error: err.message || 'Comparison failed' });
  }
});

module.exports = router;
