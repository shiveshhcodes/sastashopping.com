// Main scraper orchestrator
// Note: The module paths assume these files are in the same directory.
// Adjust if your file structure is different.
const { scrapeAmazon, searchAmazon } = require('./amazonScraper');
const { scrapeFlipkart, searchFlipkart } = require('./flipkartScraper');
const { scrapeMyntra, searchMyntra } = require('./myntraScraper');
const { generateSearchQuery, findBestMatch, structureComparisonOutput } = require('./helpers');
const config = require('../config/config');
const logger = require('./logger');

// Rate limiting configuration
const rateLimits = {
  amazon: { requests: 0, lastReset: Date.now() },
  flipkart: { requests: 0, lastReset: Date.now() },
  myntra: { requests: 0, lastReset: Date.now() }
};

const MAX_REQUESTS_PER_MINUTE = 30;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

// Helper to check and update rate limits
function checkRateLimit(platform) {
  const now = Date.now();
  if (now - rateLimits[platform].lastReset >= RATE_LIMIT_WINDOW) {
    rateLimits[platform].requests = 0;
    rateLimits[platform].lastReset = now;
  }
  
  if (rateLimits[platform].requests >= MAX_REQUESTS_PER_MINUTE) {
    const waitTime = RATE_LIMIT_WINDOW - (now - rateLimits[platform].lastReset);
    throw new Error(`Rate limit exceeded for ${platform}. Please wait ${Math.ceil(waitTime/1000)} seconds.`);
  }
  
  rateLimits[platform].requests++;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Helper for retrying operations
async function withRetry(operation, platform, maxRetries = MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      checkRateLimit(platform);
      return await operation();
    } catch (error) {
      lastError = error;
      logger.warn(`Attempt ${attempt} failed for ${platform}: ${error.message}`);
      
      if (error.message.includes('Rate limit exceeded')) {
        const waitTime = RATE_LIMIT_WINDOW - (Date.now() - rateLimits[platform].lastReset);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Detects the e-commerce platform from a given URL.
 * @param {string} urlString - The URL to detect the platform from.
 * @returns {string} - 'amazon', 'flipkart', 'myntra', or 'unknown'.
 */
function detectPlatform(urlString) {
  if (!urlString || typeof urlString !== 'string') return 'unknown';
  try {
    const urlObj = new URL(urlString); // Validates URL structure
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('amazon.')) return 'amazon'; // Covers amazon.com, amazon.in, etc.
    if (hostname.includes('flipkart.com')) return 'flipkart';
    if (hostname.includes('myntra.com')) return 'myntra';

    return 'unknown';
  } catch (error) {
    // console.error('Invalid URL for platform detection:', urlString, error);
    return 'unknown'; // If URL is invalid
  }
}

/**
 * Scrapes product data from a given URL with retries and rate limiting.
 */
async function scrapeProductData(url) {
  if (!url) {
    throw new Error('URL is required for scraping.');
  }

  const platform = detectPlatform(url);
  if (platform === 'unknown') {
    throw new Error('Unsupported or invalid URL. Please provide a valid Amazon, Flipkart, or Myntra product URL.');
  }

  return withRetry(async () => {
  let data;
    logger.info(`Attempting to scrape ${platform} URL: ${url}`);
    
  try {
    switch (platform) {
      case 'amazon':
        data = await scrapeAmazon(url);
        break;
      case 'flipkart':
        data = await scrapeFlipkart(url);
        break;
      case 'myntra':
        data = await scrapeMyntra(url);
        break;
      default:
        throw new Error(`Internal error: Platform detection yielded '${platform}', which is not handled in scrape switch.`);
    }

      if (!data || (!data.title && !data.brand)) {
      throw new Error(`Failed to extract essential product data (title/brand) from ${platform}. The page structure might have changed, or the product is unavailable.`);
    }

    data.platform = platform;
    data.url = url;
      data.scraped_at = new Date().toISOString();

      logger.info(`Successfully scraped data from ${platform} for: ${data.title || 'Unknown Title'}`);
    return data;

  } catch (error) {
      logger.error(`Error during scrapeProductData for ${platform} URL (${url}): ${error.message}`);
      throw error;
    }
  }, platform);
}

/**
 * Main function to get product data from a URL and then find similar products on other platforms.
 */
async function getComparisonData(initialUrl) {
  if (!initialUrl) {
    throw new Error('An initial product URL is required to start the comparison.');
  }

  const sourcePlatform = detectPlatform(initialUrl);
  if (sourcePlatform === 'unknown') {
    throw new Error('Invalid or unsupported URL for comparison. Must be Amazon, Flipkart, or Myntra.');
  }

  logger.info(`Starting comparison for URL: ${initialUrl} (Platform: ${sourcePlatform})`);
  
  const sourceProductData = await scrapeProductData(initialUrl);

  if (!sourceProductData || !sourceProductData.title) {
    throw new Error(`Could not retrieve source product data from ${initialUrl}. Cannot proceed with comparison.`);
  }
  
  logger.info(`Source product: ${sourceProductData.title}`);

  const searchQuery = generateSearchQuery({
    title: sourceProductData.title,
    brand: sourceProductData.brand,
  });

  if (!searchQuery) {
    logger.warn("Generated search query is empty. Comparison might be ineffective.");
  }

  const matches = {
    amazon: null,
    flipkart: null,
    myntra: null,
  };

  // Set the source product data directly for its platform
  matches[sourcePlatform] = {
      title: sourceProductData.title,
    price: sourceProductData.price,
      link: sourceProductData.url,
      image: sourceProductData.image,
      brand: sourceProductData.brand,
      category: sourceProductData.category,
      keyFeatures: sourceProductData.keyFeatures,
  };

  // Search on other platforms
  const platformsToSearch = ['amazon', 'flipkart', 'myntra'].filter(p => p !== sourcePlatform);

  for (const platform of platformsToSearch) {
    if (!searchQuery) {
      logger.info(`Skipping search on ${platform} due to empty search query.`);
        continue;
    }
    
    try {
      logger.info(`Searching on ${platform} for: "${searchQuery}"`);
      let searchResult = null;
      
      searchResult = await withRetry(async () => {
      switch (platform) {
        case 'amazon':
            return await searchAmazon(searchQuery);
        case 'flipkart':
            return await searchFlipkart(searchQuery);
        case 'myntra':
            return await searchMyntra(searchQuery);
      }
      }, platform);

      if (searchResult && searchResult.link) {
        logger.info(`Found potential match on ${platform}: ${searchResult.title}. Fetching full details...`);
        matches[platform] = {
            title: searchResult.title,
            price: searchResult.price,
            link: searchResult.link,
            image: searchResult.image,
        };
        logger.info(`Match on ${platform}: Title: ${searchResult.title}, Price: ${searchResult.price}`);
      } else {
        logger.info(`No direct match found on ${platform} for "${searchQuery}".`);
      }
    } catch (error) {
      logger.error(`Error searching on ${platform}: ${error.message}`);
      // Continue with other platforms even if one fails
    }
  }

  return structureComparisonOutput(matches, sourceProductData);
}

module.exports = {
  scrapeProductData,
  getComparisonData,
  detectPlatform
}; 