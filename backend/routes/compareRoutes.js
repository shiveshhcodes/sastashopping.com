const express = require('express');
const router = express.Router();
const { scrapeAmazonProductByUrl } = require('../utils/amazonScraper');
const { detectPlatform } = require('../utils/scraper');
const { ValidationError } = require('../middlewares/errorHandler');

const validateCompareRequest = (req, res, next) => {
  const { url } = req.body;
  if (!url) throw new ValidationError('Product URL is required');
  if (typeof url !== 'string') throw new ValidationError('Product URL must be a string');
  try { new URL(url); } catch (error) { throw new ValidationError('Invalid URL format'); }
  const platform = detectPlatform(url);
  if (platform !== 'amazon') throw new ValidationError('Only Amazon product URLs are supported right now.');
  next();
};

router.post('/', validateCompareRequest, async (req, res) => {
  const { url } = req.body;
  try {
    const data = await scrapeAmazonProductByUrl(url);
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ success: false, error: 'No product data found.' });
    }
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Amazon scraping failed.' });
  }
});

module.exports = router;