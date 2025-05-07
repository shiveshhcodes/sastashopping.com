// Main scraper orchestrator
// Note: The module paths assume these files are in the same directory.
// Adjust if your file structure is different.
const { scrapeAmazon, searchAmazon } = require('./amazonScraper');
const { scrapeFlipkart, searchFlipkart } = require('./flipkartScraper');
const { scrapeMyntra, searchMyntra } = require('./myntraScraper');
const { generateSearchQuery, findBestMatch, structureComparisonOutput } = require('./helpers');

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
 * Scrapes product data from a given URL.
 * This function primarily extracts data from the provided URL.
 * @param {string} url - The product URL.
 * @returns {Promise<object>} - Product data including platform and URL.
 * @throws {Error} - If URL is invalid, platform unsupported, or scraping fails.
 */
async function scrapeProductData(url) {
  if (!url) {
    throw new Error('URL is required for scraping.');
  }

  const platform = detectPlatform(url);
  if (platform === 'unknown') {
    throw new Error('Unsupported or invalid URL. Please provide a valid Amazon, Flipkart, or Myntra product URL.');
  }

  let data;
  console.log(`Attempting to scrape ${platform} URL: ${url}`);
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
        // This case should ideally not be reached due to the 'unknown' check above.
        throw new Error(`Internal error: Platform detection yielded '${platform}', which is not handled in scrape switch.`);
    }

    if (!data || (!data.title && !data.brand)) { // Check if essential data is missing
      throw new Error(`Failed to extract essential product data (title/brand) from ${platform}. The page structure might have changed, or the product is unavailable.`);
    }

    data.platform = platform;
    data.url = url;
    data.scraped_at = new Date().toISOString(); // Add timestamp

    console.log(`Successfully scraped data from ${platform} for: ${data.title || 'Unknown Title'}`);
    return data;

  } catch (error) {
    console.error(`Error during scrapeProductData for ${platform} URL (${url}): ${error.message}`);
    // Construct a more informative error message to bubble up
    const specificError = error.message.startsWith('Failed to scrape') || error.message.startsWith('Could not extract') || error.message.includes('robot check') || error.message.includes('CAPTHCA');
    if (specificError) {
        throw error; // Re-throw specific, informative errors from scrapers
    }
    throw new Error(`Failed to scrape ${platform} due to: ${error.message}. Check logs for details.`);
  }
}

/**
 * Main function to get product data from a URL and then find similar products on other platforms.
 * @param {string} initialUrl - The URL of the product to start with.
 * @returns {Promise<object>} - Structured comparison data.
 */
async function getComparisonData(initialUrl) {
  if (!initialUrl) {
    throw new Error('An initial product URL is required to start the comparison.');
  }

  const sourcePlatform = detectPlatform(initialUrl);
  if (sourcePlatform === 'unknown') {
    throw new Error('Invalid or unsupported URL for comparison. Must be Amazon, Flipkart, or Myntra.');
  }

  console.log(`Starting comparison for URL: ${initialUrl} (Platform: ${sourcePlatform})`);
  const sourceProductData = await scrapeProductData(initialUrl);

  if (!sourceProductData || !sourceProductData.title) {
    throw new Error(`Could not retrieve source product data from ${initialUrl}. Cannot proceed with comparison.`);
  }
  
  console.log(`Source product: ${sourceProductData.title}`);

  // Generate a search query based on the source product's details
  const searchQuery = generateSearchQuery({
    title: sourceProductData.title,
    brand: sourceProductData.brand,
    // model: sourceProductData.model // if you add model to your scraped data
  });
  console.log(`Generated search query: "${searchQuery}"`);

  if (!searchQuery) {
      console.warn("Generated search query is empty. Comparison might be ineffective.");
      // Fallback: use only title if query is empty
      // searchQuery = sourceProductData.title; 
  }

  const matches = {
    amazon: null,
    flipkart: null,
    myntra: null,
  };

  // Set the source product data directly for its platform
  matches[sourcePlatform] = {
      title: sourceProductData.title,
      price: sourceProductData.price, // Assuming price is already cleaned or will be by formatPrice
      link: sourceProductData.url,
      image: sourceProductData.image,
      brand: sourceProductData.brand,
      category: sourceProductData.category,
      keyFeatures: sourceProductData.keyFeatures,
  };

  // Search on other platforms
  const platformsToSearch = ['amazon', 'flipkart', 'myntra'].filter(p => p !== sourcePlatform);

  for (const platform of platformsToSearch) {
    if (!searchQuery) { // Skip search if query is empty
        console.log(`Skipping search on ${platform} due to empty search query.`);
        continue;
    }
    console.log(`Searching on ${platform} for: "${searchQuery}"`);
    let searchResult = null;
    try {
      switch (platform) {
        case 'amazon':
          searchResult = await searchAmazon(searchQuery);
          break;
        case 'flipkart':
          searchResult = await searchFlipkart(searchQuery);
          break;
        case 'myntra':
          searchResult = await searchMyntra(searchQuery);
          break;
      }

      if (searchResult && searchResult.link) {
        console.log(`Found potential match on ${platform}: ${searchResult.title}. Fetching full details...`);
        // To get full details, scrape the product page from the search result link
        // Be mindful of rate limits and potential for getting blocked if you do this too aggressively.
        // For now, we will use the search result directly, which has limited info.
        // If you need more details, you'd call scrapeProductData(searchResult.link) here.
        // const detailedMatch = await scrapeProductData(searchResult.link);
        // matches[platform] = detailedMatch;
        
        // Using search result directly for now:
        matches[platform] = {
            title: searchResult.title,
            price: searchResult.price,
            link: searchResult.link,
            image: searchResult.image,
            // brand, category, keyFeatures would be missing or N/A if just from search
        };
        console.log(`Match on ${platform}: Title: ${searchResult.title}, Price: ${searchResult.price}`);

      } else {
        console.log(`No direct match found on ${platform} for "${searchQuery}".`);
      }
    } catch (searchError) {
        console.error(`Error searching on ${platform}: ${searchError.message}`);
        matches[platform] = null; // Ensure it's null if search fails
    }
    // Add a small delay between searches to be less aggressive
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
  }
  
  // Optionally, use findBestMatch if you have multiple candidates from search (not implemented in current search functions)
  // For example, if search functions returned an array of results:
  // if (amazonResults && amazonResults.length > 0) {
  //   matches.amazon = findBestMatch(sourceProductData, amazonResults);
  // }

  return structureComparisonOutput({
    productName: sourceProductData.title || 'Product',
    sourcePlatform: sourcePlatform,
    matches: matches,
  });
}

module.exports = { scrapeProductData, detectPlatform, getComparisonData }; 