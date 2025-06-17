const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const logger = require('./logger');
const { createStandardProductObject } = require('./featureExtractor');

// Use stealth plugin
puppeteer.use(StealthPlugin());

// Modern user agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

// Helper function to get random user agent
const getRandomUserAgent = () => userAgents[Math.floor(Math.random() * userAgents.length)];

// Helper function to add random delay
const randomDelay = async (min = 1000, max = 3000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Scrapes product data from a given Flipkart product URL.
 * @param {string} url - The URL of the Flipkart product page.
 * @returns {Promise<object>} - A promise that resolves to an object containing product data.
 */
async function scrapeFlipkart(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-size=1920,1080',
        '--incognito',
        '--disable-blink-features=AutomationControlled'
      ],
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    
    // Set modern viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set random user agent
    await page.setUserAgent(getRandomUserAgent());
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1'
    });

    // Enable JavaScript
    await page.setJavaScriptEnabled(true);

    // Navigate to the URL with increased timeout
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });

    // Add random delay to mimic human behavior
    await randomDelay();

    // Wait for key elements with increased timeout and multiple selectors
    const selectors = [
      'span.B_NuCI',
      'h1._2i1QSc',
      'h1._3eAQiD',
      'h1[class*="_2i1QSc"]',
      'span[class*="B_NuCI"]',
      'h1[class*="_3eAQiD"]'
    ];

    let titleElement = null;
    for (const selector of selectors) {
      try {
        titleElement = await page.waitForSelector(selector, { 
          timeout: 30000,
          visible: true 
        });
        if (titleElement) break;
      } catch (e) {
        continue;
      }
    }

    if (!titleElement) {
      throw new Error('Could not find product title element');
    }

    // Add another random delay before scraping
    await randomDelay(500, 1500);

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

      // Get title with multiple selectors
      const title = getText([
        'span.B_NuCI',
        'h1._2i1QSc',
        'h1._3eAQiD',
        'h1[class*="_2i1QSc"]',
        'span[class*="B_NuCI"]',
        'h1[class*="_3eAQiD"]'
      ]);

      // Get price with multiple selectors
      const price = getText([
        'div._30jeq3._16Jk6d',
        'div._1vC4OE._3qQ9m1',
        'div._25b18c',
        'div[class*="_30jeq3"]',
        'div[class*="_1vC4OE"]',
        'div[class*="_25b18c"]'
      ]);

      // Get description with multiple selectors
      const description = getText([
        'div._3ezVUc',
        'div._3la3Fn',
        'div._3khuHA',
        'div[class*="_3ezVUc"]',
        'div[class*="_3la3Fn"]',
        'div[class*="_3khuHA"]'
      ]);

      // Get image with multiple selectors
      const image = getImage([
        'img._396cs4',
        'img._2r_T1I',
        'img._1BweB8',
        'img[class*="_396cs4"]',
        'img[class*="_2r_T1I"]',
        'img[class*="_1BweB8"]'
      ]);

      // Get additional features with multiple selectors
      const features = {};
      const featureSelectors = [
        'div._3ezVUc li',
        'div._3la3Fn li',
        'div._3khuHA li',
        'div[class*="_3ezVUc"] li',
        'div[class*="_3la3Fn"] li',
        'div[class*="_3khuHA"] li'
      ];

      for (const selector of featureSelectors) {
        const featureBullets = document.querySelectorAll(selector);
        if (featureBullets.length > 0) {
          features.bulletPoints = Array.from(featureBullets)
            .map(li => li.textContent.trim())
            .filter(text => text && !text.includes('Click here'));
          break;
        }
      }

      return {
        title,
        price,
        description,
        imageUrl: image,
        additionalFeatures: features
      };
    });

    return createStandardProductObject(data, 'flipkart');

  } catch (error) {
    logger.error('Error scraping Flipkart product:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Searches Flipkart for a query and returns the first relevant product.
 * @param {string} query - The search query.
 * @returns {Promise<object|null>} - A promise that resolves to the first product data or null.
 */
async function searchFlipkart(query) {
  let browser;
  let page;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-size=1920,1080',
        '--incognito',
        '--disable-blink-features=AutomationControlled'
      ],
      ignoreHTTPSErrors: true
    });

    page = await browser.newPage();
    
    // Set modern viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set random user agent
    await page.setUserAgent(getRandomUserAgent());
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1'
    });

    // Enable JavaScript
    await page.setJavaScriptEnabled(true);
    
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search`;
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });

    // Add random delay to mimic human behavior
    await randomDelay();

    const searchResultItemSelectors = [
      'div._1AtVbE',
      'div._2kHMtA',
      'div[data-id]',
      '._1xHGtK._373qXS',
      '._4ddWXP',
      'div[class*="_1AtVbE"]',
      'div[class*="_2kHMtA"]',
      'div[class*="_1xHGtK"]',
      'div[class*="_4ddWXP"]'
    ];

    const searchResultsContainerSelectors = [
      'div._1YokD2._3Mn1Gg',
      'div#container',
      '._1HmYoV._35HD7C',
      'div[class*="_1YokD2"]',
      'div[class*="_3Mn1Gg"]',
      'div[class*="_1HmYoV"]'
    ];

    let containerFound = false;
    for (const selector of searchResultsContainerSelectors) {
      try {
        await page.waitForSelector(selector, { 
          timeout: 30000,
          visible: true 
        });
        containerFound = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!containerFound) {
      const bodyContent = await page.content();
      if (bodyContent.toLowerCase().includes("no results found for") || 
          bodyContent.toLowerCase().includes("couldn't find any products")) {
        logger.info(`No search results found on Flipkart for query: "${query}"`);
        return [];
      }
      throw new Error(`Could not find search results container on Flipkart for query "${query}".`);
    }

    // Add another random delay before scraping
    await randomDelay(500, 1500);

    const results = await page.evaluate((selectors) => {
      const items = [];
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          items.push(...Array.from(elements).slice(0, 5));
          break;
        }
      }

      return items.map(item => {
        const titleSelectors = ['a.s1Q9rs', 'div._4rR01T', 'a.IRpwTa', 'a[class*="s1Q9rs"]', 'div[class*="_4rR01T"]'];
        const linkSelectors = ['a[href*="/p/"]', 'a[href*="flipkart.com"]'];
        const priceSelectors = ['div._30jeq3', 'div._1vC4OE', 'div[class*="_30jeq3"]', 'div[class*="_1vC4OE"]'];
        const imageSelectors = ['img._396cs4', '._2r_T1I', '.CXW8mj img', 'img[class*="_396cs4"]', 'img[class*="_2r_T1I"]'];

        let title = '';
        for (const selector of titleSelectors) {
          const el = item.querySelector(selector);
          if (el) {
            title = el.title || el.textContent.trim();
            break;
          }
        }

        let link = '';
        for (const selector of linkSelectors) {
          const el = item.querySelector(selector);
          if (el) {
            link = new URL(el.href, document.baseURI).href;
            break;
          }
        }

        let price = '';
        for (const selector of priceSelectors) {
          const el = item.querySelector(selector);
          if (el) {
            price = el.textContent.replace(/[^\d]/g, '');
            break;
          }
        }

        let image = '';
        for (const selector of imageSelectors) {
          const el = item.querySelector(selector);
          if (el) {
            image = new URL(el.src, document.baseURI).href;
            break;
          }
        }

        return { title, price, image, link };
      }).filter(item => item.title && item.link);
    }, searchResultItemSelectors);
    
    return Array.isArray(results) ? results : [];

  } catch (error) {
    logger.error(`Flipkart search error for query "${query}":`, error);
    return [];
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
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for search results
    await page.waitForSelector('div._1AtVbE', { timeout: 10000 });

    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div._1AtVbE')).slice(0, 5);
      
      return items.map(item => {
        const titleEl = item.querySelector('div._4rR01T, a.s1Q9rs');
        const priceEl = item.querySelector('div._30jeq3._1_WHN1');
        const imageEl = item.querySelector('img._396cs4');
        const linkEl = item.querySelector('a._1fQZEK, a.s1Q9rs');

        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          price: priceEl ? priceEl.textContent.trim() : '',
          imageUrl: imageEl ? imageEl.src : '',
          url: linkEl ? `https://www.flipkart.com${linkEl.href}` : '',
          description: '' // Search results don't have descriptions
        };
      }).filter(item => item.title && item.price);
    });

    return products.map(product => createStandardProductObject(product, 'flipkart'));

  } catch (error) {
    logger.error('Error searching Flipkart:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeFlipkart, searchFlipkart, searchAndScrapeList };