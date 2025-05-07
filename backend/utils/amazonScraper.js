const puppeteer = require('puppeteer');

/**
 * Scrapes product data from a given Amazon product URL.
 * @param {string} url - The URL of the Amazon product page.
 * @returns {Promise<object>} - A promise that resolves to an object containing product data.
 * @throws {Error} - If scraping fails or CAPTCHA is detected.
 */
async function scrapeAmazon(url) {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Add extra headers to appear more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1'
    });

    // Add a small delay before navigation
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Increased timeout

    // Add random scrolling behavior
    await page.evaluate(() => {
      window.scrollTo(0, Math.random() * 100);
      setTimeout(() => window.scrollTo(0, Math.random() * 200), 500);
    });

    // Check for robot check or error page
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('Enter the characters you see below') || 
        bodyText.includes('Sorry, we just need to make sure you\'re not a robot') || 
        bodyText.includes('api-services-support@amazon.com')) {
      throw new Error('Amazon is showing a robot check, CAPTCHA, or an error page. Please try again later or use a different product link.');
    }

    // Wait for product title to load, or timeout
    // Note: Amazon selectors can change frequently. These are common ones.
    const productTitleSelector = '#productTitle, .a-size-large.product-title-word-break';
    try {
      await page.waitForSelector(productTitleSelector, { timeout: 15000 }); // Increased timeout
    } catch (e) {
      // Try a longer wait or a different selector if the first fails
      console.warn('Initial productTitle selector failed, trying alternative or longer wait...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Additional wait
      if (!await page.$(productTitleSelector)) {
         throw new Error('Could not extract product data from Amazon. The page structure might have changed, the product is unavailable, or it is heavily protected.');
      }
    }

    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : '';
      };
      const getImage = () => {
        // More robust image selection
        const imgSelectors = [
          '#imgTagWrapperId img', 
          '#landingImage', 
          '#comparison-image img', // For comparison pages
          '.imgTagWrapper img', // another common wrapper
          '#main-image-container img' // yet another one
        ];
        for (const selector of imgSelectors) {
          const img = document.querySelector(selector);
          if (img && img.src) return img.src;
        }
        return '';
      };
      const getFeatures = () => {
        // Try multiple selectors for features
        const featureSelectors = [
            '#feature-bullets ul li span.a-list-item', // Common feature bullets
            '#productOverview_feature_div .a-row span.a-list-item', // Overview features
            '#detailBullets_feature_div ul li span.a-list-item' // Detail bullets
        ];
        let features = [];
        for (const selector of featureSelectors) {
            features = Array.from(document.querySelectorAll(selector)).map(el => el.textContent.trim()).filter(Boolean);
            if (features.length > 0) break;
        }
        return features;
      };
      const getCategory = () => {
        // Common category/breadcrumb selectors
        const catSelectors = [
            '#wayfinding-breadcrumbs_container ul li:last-child span.a-list-item a', // Last breadcrumb link
            '#wayfinding-breadcrumbs_feature_div ul li:last-child a',
            '#nav-subnav .nav-a.nav-b', // Sub-navigation category
            '#dp-container .a-link-normal[href*="/b/"]' // Links that often point to categories
        ];
        for (const selector of catSelectors) {
            const cat = document.querySelector(selector);
            if (cat) return cat.textContent.trim();
        }
        return '';
      };
      const getPrice = () => {
          // More robust price selection, including checking for whole and fraction parts
          const priceSelectors = [
              '#priceblock_ourprice',
              '#priceblock_dealprice',
              '#corePrice_feature_div .a-price .a-offscreen',
              '.priceToPay span.a-price-whole', // For prices split into whole and fraction
              'span[data-a-size="xl"] span.a-price-whole', // Another variation
              '.a-button-selected .a-color-price' // Price on some specific layouts
          ];
          for (const selector of priceSelectors) {
              const el = document.querySelector(selector);
              if (el && el.textContent) {
                  let priceText = el.textContent.trim();
                  // If price is split, try to get the fraction too
                  if (selector.includes('a-price-whole')) {
                      const fractionEl = el.parentElement.querySelector('.a-price-fraction');
                      if (fractionEl) priceText += fractionEl.textContent.trim();
                  }
                  // Remove currency symbols if present, as formatting will be handled later
                  priceText = priceText.replace(/[₹$€,]/g, '').trim();
                  if (priceText && !isNaN(parseFloat(priceText))) return priceText;
              }
          }
          return '';
      };

      return {
        title: getText('#productTitle, .a-size-large.product-title-word-break'),
        brand: getText('#bylineInfo, #productOverview_feature_div div.a-row:first-child div.a-span6:last-child span, #centerCol div[data-cy="title-recipe"] div div:nth-child(2) a span'), // Added more brand selectors
        price: getPrice(),
        image: getImage(),
        keyFeatures: getFeatures(),
        category: getCategory(),
      };
    });

    if (!data.title) {
        console.warn("Warning: Product title was not found. Data might be incomplete.", data);
    }
    return data;
  } catch (error) {
    console.error(`Error in scrapeAmazon for URL ${url}:`, error.message);
    throw error; // Re-throw the error to be caught by the caller
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Searches Amazon for a query and returns the first relevant product.
 * @param {string} query - The search query.
 * @returns {Promise<object|null>} - A promise that resolves to the first product data or null.
 */
async function searchAmazon(query) {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Add extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1'
    });
    
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    
    // Add a small delay before navigation
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Increased timeout

    // Add random scrolling behavior
    await page.evaluate(() => {
      window.scrollTo(0, Math.random() * 100);
      setTimeout(() => window.scrollTo(0, Math.random() * 200), 500);
    });

    // Wait for search results container
    // Note: Amazon search result selectors can change frequently.
    const searchResultsSelector = 'div.s-main-slot div[data-component-type="s-search-result"]';
    try {
        await page.waitForSelector(searchResultsSelector, { timeout: 15000 }); // Increased timeout
    } catch (e) {
        // Check for CAPTCHA or no results
        const bodyText = await page.evaluate(() => document.body.innerText);
        if (bodyText.includes('Enter the characters you see below') || bodyText.includes('Sorry, we just need to make sure you\'re not a robot')) {
            throw new Error('Amazon search is showing a CAPTCHA.');
        }
        if (bodyText.includes('No results for') || bodyText.includes('did not match any products')) {
            console.log(`No results found on Amazon for query: "${query}"`);
            return null;
        }
        throw new Error('Could not find search results on Amazon. Page structure may have changed.');
    }
    
    // Scrape first 3–5 results
    const results = await page.evaluate((selector) => {
      const items = Array.from(document.querySelectorAll(selector)).slice(0, 5);
      return items.map(item => {
        const titleEl = item.querySelector('h2 a span');
        const title = titleEl ? titleEl.textContent.trim() : '';
        
        const linkEl = item.querySelector('h2 a');
        let link = linkEl ? linkEl.href : '';
        // Ensure link is absolute
        if (link && !link.startsWith('http')) {
            link = new URL(link, document.baseURI).href;
        }

        const priceEl = item.querySelector('.a-price .a-offscreen');
        const price = priceEl ? priceEl.textContent.trim().replace(/[₹$€,]/g, '').trim() : '';
        
        const imageEl = item.querySelector('img.s-image');
        const image = imageEl ? imageEl.src : '';
        
        return { title, price, image, link };
      }).filter(item => item.title && item.link); // Ensure basic data is present
    }, searchResultsSelector);

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`Error in searchAmazon for query "${query}":`, error.message);
    // Do not re-throw here if you want the main process to continue with other platforms
    return null; 
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeAmazon, searchAmazon }; 