const puppeteer = require('puppeteer');
const logger = require('./logger');
const { createStandardProductObject } = require('./featureExtractor');

/**
 * Scrapes product data from a given Myntra product URL.
 * @param {string} url - The URL of the Myntra product page.
 * @returns {Promise<object>} - A promise that resolves to an object containing product data.
 * @throws {Error} - If scraping fails.
 */
async function scrapeMyntra(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for key elements
    await page.waitForSelector('h1.pdp-name, h1.pdp-title', { timeout: 10000 });

    const data = await page.evaluate(() => {
      const getText = (selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent) return el.textContent.trim();
        }
        return '';
      };

      const getImage = (selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && el.src) return el.src;
                      }
          return '';
      };

      // Get title
      const title = getText([
        'h1.pdp-name',
        'h1.pdp-title',
        'h1.pdp-product-title'
      ]);

      // Get price
      const price = getText([
        'span.pdp-price',
        'span.pdp-discount-price',
        'span.pdp-final-price'
      ]);

      // Get description
      const description = getText([
        'div.pdp-product-description',
        'div.pdp-product-details',
        'div.pdp-product-info'
      ]);

      // Get image
      const image = getImage([
        'img.pdp-image',
        'img.pdp-product-image',
        'img.pdp-main-image'
      ]);

      // Get additional features
      const features = {};
      const featureBullets = document.querySelectorAll('div.pdp-product-details li, div.pdp-product-info li');
      if (featureBullets.length > 0) {
        features.bulletPoints = Array.from(featureBullets)
          .map(li => li.textContent.trim())
          .filter(text => text && !text.includes('Click here'));
      }
      
      return {
        title,
        price,
        description,
        imageUrl: image,
        additionalFeatures: features
      };
    });

    return createStandardProductObject(data, 'myntra');

  } catch (error) {
    logger.error('Error scraping Myntra product:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Searches Myntra for a query and returns the first relevant product.
 * @param {string} query - The search query.
 * @returns {Promise<object|null>} - A promise that resolves to the first product data or null.
 */
async function searchMyntra(query) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');

    const cleanQuery = query.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '-'); 
    const searchUrl = `https://www.myntra.com/search/${encodeURIComponent(cleanQuery)}`; 

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const searchResultItemSelector = 'li.product-base'; 
    const searchResultsContainerSelector = 'ul.results-base'; 

    try {
      await page.waitForSelector(searchResultsContainerSelector, { timeout: 15000 });
      await page.waitForSelector(searchResultItemSelector, { timeout: 10000 });
    } catch (e) {
      const bodyContent = await page.content();
      if (bodyContent.includes("We couldn't find any matches!") || bodyContent.includes("No results found")) {
          console.log(`No search results found on Myntra for query: "${query}" (URL: ${searchUrl})`);
          return null;
      }
      // For debugging:
      // const screenshotPath = `myntra_search_fail_${Date.now()}.png`;
      // await page.screenshot({ path: screenshotPath });
      // console.error(`Debug screenshot for Myntra search failure saved to ${screenshotPath}. URL: ${searchUrl}`);
      throw new Error(`Could not find search results on Myntra for query "${query}". Page structure may have changed or no results. URL: ${searchUrl}`);
    }

    const results = await page.evaluate((itemSelector) => {
      const items = Array.from(document.querySelectorAll(itemSelector)).slice(0, 5);
      return items.map(item => {
        const brandEl = item.querySelector('.product-brand');
        const nameEl = item.querySelector('.product-product');
        const title = `${brandEl ? brandEl.textContent.trim() : ''} ${nameEl ? nameEl.textContent.trim() : ''}`.trim();
        
        const linkEl = item.querySelector('a');
        let link = linkEl ? linkEl.href : '';
        if (link && !link.startsWith('http') && typeof document !== 'undefined') { 
            link = new URL(link, document.baseURI).href;
        }

        // Price extraction for search results
        let price = '';
        const priceSelectors = ['.product-discountedPrice', '.product-price span.product-strike + span', '.product-price']; // Prioritize discounted
        for (const sel of priceSelectors) {
            const priceEl = item.querySelector(sel);
            if (priceEl && priceEl.textContent) {
                const priceMatch = priceEl.textContent.match(/([0-9,]+\.?[0-9]*)/);
                if (priceMatch && priceMatch[1]) {
                    price = priceMatch[1].replace(/,/g, '');
                    if (!isNaN(parseFloat(price))) break; // Found a valid price
                }
            }
        }
        
        const imageEl = item.querySelector('picture img, .product-image img'); 
        let image = '';
        if (imageEl) {
            image = imageEl.src || (imageEl.dataset && imageEl.dataset.src); 
            if (image && !image.startsWith('http') && typeof document !== 'undefined') {
                 image = new URL(image, document.baseURI).href;
            }
        }
        
        return { title, price, image, link };
      }).filter(item => item.title && item.link);
    }, searchResultItemSelector);

    return results.length > 0 ? results[0] : null;

  } catch (error) {
    console.error(`Myntra search error for query "${query}":`, error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function searchAndScrapeList(searchQuery) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to search results
    const searchUrl = `https://www.myntra.com/${encodeURIComponent(searchQuery)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for search results
    await page.waitForSelector('li.product-base', { timeout: 10000 });

    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li.product-base')).slice(0, 5);
      
      return items.map(item => {
        const titleEl = item.querySelector('h3.product-brand, h4.product-product');
        const priceEl = item.querySelector('span.product-discountedPrice, span.product-price');
        const imageEl = item.querySelector('img.product-image');
        const linkEl = item.querySelector('a.product-base');

        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          price: priceEl ? priceEl.textContent.trim() : '',
          imageUrl: imageEl ? imageEl.src : '',
          url: linkEl ? `https://www.myntra.com${linkEl.href}` : '',
          description: '' // Search results don't have descriptions
        };
      }).filter(item => item.title && item.price);
    });

    return products.map(product => createStandardProductObject(product, 'myntra'));

  } catch (error) {
    logger.error('Error searching Myntra:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeMyntra, searchMyntra, searchAndScrapeList };
