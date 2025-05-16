// Utility functions for formatting and cleaning

/**
 * Formats a number into a currency string.
 * @param {number|string} price - The price to format.
 * @param {string} currency - The currency code (e.g., 'INR').
 * @returns {string} - Formatted currency string or 'N/A' if price is invalid.
 */
function formatPrice(price, currency = 'INR') {
  try {
    // Handle null, undefined, or empty string
    if (!price && price !== 0) return 'N/A';
    
    // Convert to string and clean price
    const priceStr = String(price).trim();
    if (!priceStr) return 'N/A';
    
    // Remove currency symbols and commas
    const numericPrice = parseFloat(priceStr.replace(/[₹$,]/g, ''));
    if (isNaN(numericPrice) || numericPrice < 0) {
      return 'N/A';
    }

    // Format with Indian locale
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericPrice);
  } catch (error) {
    console.error('Error formatting price:', error);
    return 'N/A';
  }
}

/**
 * Cleans text by removing extra whitespace and normalizing.
 * @param {string} text - The text to clean.
 * @returns {string} - Cleaned text.
 */
function cleanText(text) {
  try {
    if (!text) return '';
    if (typeof text !== 'string') {
      text = String(text);
    }
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
      .replace(/[^\S\r\n]+/g, ' ') // Normalize all whitespace
      .trim();
  } catch (error) {
    console.error('Error cleaning text:', error);
    return '';
  }
}

// Extended list of stop words and common terms to filter out
const STOP_WORDS = new Set([
  // Basic stop words
  'the', 'with', 'for', 'and', 'or', 'to', 'of', 'in', 'on', 'by', 'from', 'at', 'a', 'an', 'is', 'it', 'as', 'this', 'that', 'these', 'those',
  
  // Product descriptors
  'new', 'latest', 'best', 'buy', 'online', 'original', 'genuine', 'imported', 'pack', 'set', 'edition', 'model', 'series', 'version', 'type',
  
  // Colors
  'black', 'white', 'grey', 'gray', 'blue', 'red', 'green', 'yellow', 'pink', 'gold', 'silver', 'brown', 'purple', 'orange',
  
  // Product features
  'wireless', 'bluetooth', 'portable', 'smart', 'pro', 'plus', 'max', 'mini', 'ultra', 'lite', 'classic', 'advanced', 'premium', 'combo', 'kit', 'bundle',
  
  // Demographics
  'unisex', 'men', 'women', 'kids', 'child', 'children', 'boy', 'girl', 'boys', 'girls',
  "men's", "women's", "kid's", "child's", "boy's", "girl's",
  
  // Shopping terms
  'free', 'shipping', 'delivery', 'offer', 'sale', 'discount', 'deal', 'price', 'shop', 'store',
  'review', 'rating', 'top', 'quality', 'official', 'limited', 'collection',
  
  // Units and measurements
  'gb', 'mb', 'tb', 'hz', 'mah', 'kg', 'gm', 'ml', 'ltr', 'cm', 'mm', 'inch', 'hd', '4k', 'led', 'lcd', 'amoled',
  
  // Additional common terms
  'with', 'without', 'includes', 'included', 'exclusive', 'exclusively', 'only', 'just', 'very', 'much', 'many',
  'more', 'less', 'most', 'least', 'all', 'some', 'any', 'none', 'both', 'either', 'neither',
  'each', 'every', 'other', 'another', 'such', 'same', 'similar', 'different', 'various',
  'several', 'few', 'little', 'lot', 'lots', 'plenty', 'enough', 'too', 'also', 'well',
  'good', 'better', 'best', 'bad', 'worse', 'worst', 'high', 'higher', 'highest', 'low',
  'lower', 'lowest', 'big', 'bigger', 'biggest', 'small', 'smaller', 'smallest'
]);

/**
 * Generates a search query from product details, cleaning it by removing stop words.
 * @param {object} productDetails - Object containing title, brand, model.
 * @param {string} productDetails.title
 * @param {string} [productDetails.brand]
 * @param {string} [productDetails.model]
 * @returns {string} - Generated and cleaned search query.
 */
function generateSearchQuery({ title, brand, model }) {
  try {
    if (!title && !brand && !model) {
      return '';
    }

    let queryParts = [];
    
    // Add brand first if available
    if (brand) {
      queryParts.push(cleanText(brand));
    }
    
    // Add title, removing brand if it's at the start
    if (title) {
      let cleanTitle = cleanText(title);
      if (brand && cleanTitle.toLowerCase().startsWith(brand.toLowerCase())) {
        cleanTitle = cleanTitle.substring(brand.length).trim();
      }
      queryParts.push(cleanTitle);
    }
    
    // Add model if it's distinct from title
    if (model) {
      const cleanModel = cleanText(model);
      if (title && !title.toLowerCase().includes(cleanModel.toLowerCase())) {
        queryParts.push(cleanModel);
      } else if (!title) {
        queryParts.push(cleanModel);
      }
    }

    let query = queryParts.join(' ');

    // Remove specific patterns
    query = query
      .replace(/pack of \d+/gi, '')
      .replace(/\([^)]+\)/g, '') // Remove content in parentheses
      .replace(/\b\d+\s*(?:pack|piece|set|unit)s?\b/gi, '') // Remove quantity indicators
      .replace(/\b(?:for|with|without|includes|included)\b/gi, '') // Remove common connecting words
      .replace(/\b(?:free|shipping|delivery)\b/gi, ''); // Remove shipping terms

    // Remove stop words
    const queryWords = query.toLowerCase().split(/\s+/);
    const filteredWords = queryWords.filter(word => {
      const cleanedWord = word.replace(/[^\w]/g, '');
      return cleanedWord.length > 1 && !STOP_WORDS.has(cleanedWord);
    });
    
    query = filteredWords.join(' ');
    return cleanText(query.substring(0, 150)); // Limit query length
  } catch (error) {
    console.error('Error generating search query:', error);
    return '';
  }
}

/**
 * Calculates Jaccard similarity between two strings.
 * @param {string} str1
 * @param {string} str2
 * @returns {number} - Jaccard similarity score (0 to 1).
 */
function jaccardSimilarity(str1, str2) {
  try {
    if (!str1 || !str2) return 0;
    
    // Clean and normalize strings
    const cleanStr1 = cleanText(str1).toLowerCase();
    const cleanStr2 = cleanText(str2).toLowerCase();
    
    // Split into words and filter out empty strings
    const words1 = cleanStr1.split(/\W+/).filter(s => s.length > 0);
    const words2 = cleanStr2.split(/\W+/).filter(s => s.length > 0);
    
    if (words1.length === 0 || words2.length === 0) return 0;

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  } catch (error) {
    console.error('Error calculating Jaccard similarity:', error);
    return 0;
  }
}

/**
 * Finds the best match for an original product among a list of candidate products.
 * @param {object} original - The original product data (must have title, optionally brand, category).
 * @param {Array<object>} candidates - Array of candidate product data objects.
 * @returns {object|null} - The best matching candidate or null.
 */
function findBestMatch(original, candidates) {
  try {
    if (!original || !candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return null;
    }

    let bestScore = -1;
    let bestMatch = null;

    const originalTitle = cleanText(original.title || '').toLowerCase();
    const originalBrand = cleanText(original.brand || '').toLowerCase();
    const originalPrice = parseFloat(String(original.price || '').replace(/[^\d.]/g, ''));

    for (const candidate of candidates) {
      if (!candidate || !candidate.title) continue;

      const candidateTitle = cleanText(candidate.title).toLowerCase();
      const candidateBrand = candidate.brand ? cleanText(candidate.brand).toLowerCase() : candidateTitle.split(' ')[0];
      const candidatePrice = parseFloat(String(candidate.price || '').replace(/[^\d.]/g, ''));

      let score = 0;

      // Title similarity (weighted heavily)
      const titleSimilarity = jaccardSimilarity(originalTitle, candidateTitle);
      score += titleSimilarity * 0.6;

      // Brand matching
      if (originalBrand) {
        if (candidateTitle.includes(originalBrand)) {
          score += 0.2; // Bonus if brand is in title
        }
        const brandSimilarity = jaccardSimilarity(originalBrand, candidateBrand);
        score += brandSimilarity * 0.2;
      }

      // Price comparison (only if both prices are valid)
      if (!isNaN(originalPrice) && !isNaN(candidatePrice) && originalPrice > 0) {
        const priceDiff = Math.abs(originalPrice - candidatePrice) / originalPrice;
        if (priceDiff < 0.3) { // Within 30% price difference
          score += 0.1;
        } else if (priceDiff < 0.5) { // Within 50% price difference
          score += 0.05;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    // Only return a match if the score is above threshold
    return bestScore > 0.4 ? bestMatch : null;
  } catch (error) {
    console.error('Error finding best match:', error);
    return null;
  }
}

/**
 * Structures the comparison output.
 * @param {object} params
 * @param {string} params.productName - The name of the product being compared.
 * @param {string} params.sourcePlatform - The platform the original product URL was from.
 * @param {object} params.matches - Object keyed by platform name with matched product data.
 * @returns {object} - Structured comparison data.
 */
function structureComparisonOutput({ productName, sourcePlatform, matches }) {
  try {
    const platforms = ['amazon', 'flipkart', 'myntra'];
    const comparison = platforms.map(platform => {
      const match = matches[platform];
      // Ensure image URL is properly formatted and validated
      let imageUrl = match?.image || '';
      if (imageUrl) {
        try {
          // Ensure URL is absolute
          if (!imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, 'https://' + platform + '.com').href;
          }
          // Validate URL
          new URL(imageUrl);
        } catch (e) {
          imageUrl = 'https://placehold.co/100x100/eee/ccc?text=No+Image';
        }
      } else {
        imageUrl = 'https://placehold.co/100x100/eee/ccc?text=No+Image';
      }

      return {
        platform,
        price: match?.price ? formatPrice(match.price) : 'Not Available',
        title: match?.title ? cleanText(match.title) : 'N/A',
        link: match?.link || 'N/A',
        image: imageUrl,
        brand: match?.brand ? cleanText(match.brand) : 'N/A',
        rating: match?.rating || 'N/A',
        reviews: match?.reviews || 'N/A'
      };
    });

    return {
      product_name: cleanText(productName),
      source_platform: sourcePlatform,
      comparison,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error structuring comparison output:', error);
    return {
      product_name: 'Error',
      source_platform: sourcePlatform || 'unknown',
      comparison: [],
      error: 'Failed to structure comparison data'
    };
  }
}

module.exports = {
  formatPrice,
  cleanText,
  generateSearchQuery,
  jaccardSimilarity,
  findBestMatch,
  structureComparisonOutput
}; 