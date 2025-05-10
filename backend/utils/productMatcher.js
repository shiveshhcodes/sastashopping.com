const { scrapeAmazon } = require('./amazonScraper');
const { scrapeFlipkart } = require('./flipkartScraper');
const { scrapeMyntra } = require('./myntraScraper');

/**
 * Extracts keywords from a product title
 * @param {string} title - The product title
 * @returns {string[]} - Array of keywords
 */
function extractKeywords(title) {
  // Remove common words and special characters
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'through', 'over', 'before', 'between', 'after', 'since', 'without', 'under', 'within', 'along', 'following', 'across', 'behind', 'beyond', 'plus', 'except', 'but', 'up', 'out', 'around', 'down', 'off', 'above', 'near']);
  
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
}

/**
 * Calculates similarity score between two product titles
 * @param {string} title1 - First product title
 * @param {string} title2 - Second product title
 * @returns {number} - Similarity score (0-1)
 */
function calculateTitleSimilarity(title1, title2) {
  const keywords1 = new Set(extractKeywords(title1));
  const keywords2 = new Set(extractKeywords(title2));
  
  const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
  const union = new Set([...keywords1, ...keywords2]);
  
  return intersection.size / union.size;
}

/**
 * Matches a product across different platforms
 * @param {Object} sourceProduct - The source product object
 * @param {string} sourcePlatform - The platform of the source product
 * @returns {Promise<Object>} - Object containing matched products
 */
async function matchProductsAcrossPlatforms(sourceProduct, sourcePlatform) {
  const matchedProducts = {};
  const platforms = ['amazon', 'flipkart', 'myntra'];
  const otherPlatforms = platforms.filter(p => p !== sourcePlatform);

  // Extract keywords from source product
  const sourceKeywords = extractKeywords(sourceProduct.title);
  const searchQuery = sourceKeywords.join(' ');

  // Search on other platforms
  for (const platform of otherPlatforms) {
    try {
      let searchResults;
      switch (platform) {
        case 'amazon':
          searchResults = await scrapeAmazon(searchQuery);
          break;
        case 'flipkart':
          searchResults = await scrapeFlipkart(searchQuery);
          break;
        case 'myntra':
          searchResults = await scrapeMyntra(searchQuery);
          break;
      }

      if (searchResults && searchResults.length > 0) {
        // First try to find exact match by brand and title
        const exactMatch = searchResults.find(product => 
          product.brand.toLowerCase() === sourceProduct.brand.toLowerCase() &&
          calculateTitleSimilarity(product.title, sourceProduct.title) > 0.8
        );

        if (exactMatch) {
          matchedProducts[platform] = exactMatch;
          continue;
        }

        // If no exact match, try to find same brand
        const sameBrandMatch = searchResults.find(product =>
          product.brand.toLowerCase() === sourceProduct.brand.toLowerCase()
        );

        if (sameBrandMatch) {
          matchedProducts[platform] = sameBrandMatch;
          continue;
        }

        // If no same brand, find most similar product
        const bestMatch = searchResults.reduce((best, current) => {
          const currentSimilarity = calculateTitleSimilarity(current.title, sourceProduct.title);
          const bestSimilarity = calculateTitleSimilarity(best.title, sourceProduct.title);
          return currentSimilarity > bestSimilarity ? current : best;
        });

        matchedProducts[platform] = bestMatch;
      }
    } catch (error) {
      console.error(`Error matching products on ${platform}:`, error);
      matchedProducts[platform] = null;
    }
  }

  return matchedProducts;
}

module.exports = {
  matchProductsAcrossPlatforms,
  extractKeywords,
  calculateTitleSimilarity
}; 