const puppeteer = require('puppeteer');
const logger = require('./logger');
const { createStandardProductObject } = require('./featureExtractor');

// --- Amazon anti-bot helpers ---
const USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  // Chrome on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  // Firefox
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0',
  // Edge
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function canonicalizeAmazonUrl(url) {
  // Extract ASIN and build canonical URL
  try {
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i) || url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    if (asinMatch) {
      const asin = asinMatch[1];
      const domainMatch = url.match(/https?:\/\/(www\.)?amazon\.[a-z.]+/i);
      const domain = domainMatch ? domainMatch[0] : 'https://www.amazon.in';
      return `${domain}/dp/${asin}`;
    }
    return url;
  } catch (e) {
    return url;
  }
}

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
      args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for key elements
    await page.waitForSelector('#productTitle, #title', { timeout: 10000 });

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
        '#productTitle',
        '#title',
        'h1.a-size-large'
      ]);

      // Get price
        const priceSelectors = [
          '#priceblock_ourprice',
          '#priceblock_dealprice',
        '#corePrice_feature_div .a-price .a-offscreen',
        '.a-price.a-text-price > .a-offscreen',
        '.priceToPay span.a-offscreen'
      ];
      const price = getText(priceSelectors);

      // Get description
      const description = getText([
        '#productDescription',
        '#feature-bullets',
        '#aplus'
      ]);

      // Get image
      const image = getImage([
        '#landingImage',
          '#imgBlkFront',
        '#main-image'
      ]);

      // Get additional features
      const features = {};
      const featureBullets = document.querySelectorAll('#feature-bullets li');
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

    return createStandardProductObject(data, 'amazon');

    } catch (error) {
    logger.error('Error scraping Amazon product:', error);
    throw error;
    } finally {
    if (browser) await browser.close();
  }
}

/**
 * Searches Amazon for a query and returns the first relevant product's basic info.
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

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
      'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"'
    });

    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}&ref=nb_sb_noss`;

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

    await page.evaluate(() => {
      window.scrollTo(0, Math.random() * 150 + 50);
      setTimeout(() => window.scrollTo(0, Math.random() * 300 + 100), 500 + Math.random()*300);
    });
    
    const searchResultsSelector = 'div.s-main-slot div[data-component-type="s-search-result"]';
    try {
      await page.waitForSelector(searchResultsSelector, { timeout: 25000, visible: true });
    } catch (e) {
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes('Enter the characters you see below') || bodyText.includes('Sorry, we just need to make sure you\'re not a robot') || bodyText.includes('CAPTCHA')) {
        throw new Error('Amazon search is showing a CAPTCHA.');
      }
      if (bodyText.includes('No results for') || bodyText.includes('did not match any products')) {
        console.log(`No results found on Amazon for query: "${query}"`);
        return [];
      }
      throw new Error('Could not find search results on Amazon. Page structure may have changed or CAPTCHA present.');
    }

    const results = await page.evaluate((itemSelector) => {
      const items = Array.from(document.querySelectorAll(itemSelector)).slice(0, 5);
      return items.map(item => {
        let title = '';
        const linkEl = item.querySelector('h2 a.a-link-normal, h2 a.s-link-style, h2 a[class*="s-link-style"]');

        if (linkEl) {
          // Attempt 1: Specific span known for titles
          let titleSpan = linkEl.querySelector('span.a-text-normal');
          if (!titleSpan) { // Attempt 2: Slightly more general span for titles
            titleSpan = linkEl.querySelector('span[class*="a-size-"][class*="a-color-base"][class*="a-text-normal"]');
          }
          if (!titleSpan) { // Attempt 3: Common styling for title text
             titleSpan = linkEl.querySelector('span.a-size-medium.a-color-base');
          }

          // Attempt 4: Iterate direct child spans if specific ones fail
          if (!titleSpan) {
            const spans = Array.from(linkEl.querySelectorAll(':scope > span')); // Only direct child spans
            if (spans.length > 0) {
                // Prefer visible spans with direct text, not just wrappers for other spans
                titleSpan = spans.find(s => s.offsetHeight > 0 && s.textContent.trim() && !s.querySelector('span'));
                if (!titleSpan) { // Fallback: longest text content from direct child spans
                    let bestSpan = null;
                    let maxTextLength = 0;
                    spans.forEach(s => {
                        const text = s.textContent.trim();
                        // Avoid known non-title classes (e.g., badges, "Sponsored")
                        const isNonTitle = s.classList.contains('s-underline-text') || s.classList.contains('a-badge-text') || s.classList.contains('s-sponsored-label-info-icon');
                        if (s.offsetHeight > 0 && text.length > maxTextLength && !isNonTitle && text.length > 5) { // Require some length
                            maxTextLength = text.length;
                            bestSpan = s;
                        }
                    });
                    titleSpan = bestSpan;
                }
            }
          }

          if (titleSpan) {
            title = titleSpan.textContent;
          } else {
            // Fallback 5: Use the link's textContent, but clean it aggressively
            const linkClone = linkEl.cloneNode(true);
            // Remove elements often found inside links that are not part of the title
            linkClone.querySelectorAll('.s-sponsored-label, .a-price, .a-badge, .s-label-popover-default, .s-align-children-center, .s-image, style, script, [aria-hidden="true"], .a-icon').forEach(el => el.remove());
            title = linkClone.textContent;

            // If title still seems too long or complex, try to get the most prominent text part
            if (title.length > 150 || title.includes('\n')) {
                let mainText = "";
                let longestTextSegment = "";
                // Heuristic: Combine text nodes and prominent spans
                Array.from(linkEl.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent.trim();
                        if (text.length > longestTextSegment.length) longestTextSegment = text;
                        mainText += text + " ";
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'span' && node.offsetHeight > 0) {
                        const spanText = node.textContent.trim();
                         // Only consider spans that seem substantial and not just decorative
                        if (spanText.length > 5 && spanText.length > longestTextSegment.length && !node.querySelector('span')) {
                           longestTextSegment = spanText;
                        }
                         mainText += spanText + " ";
                    }
                });
                title = longestTextSegment || mainText; // Prefer the longest segment, fallback to combined
            }
          }
        }
        
        // Clean the extracted title
        if (title) {
          title = title.replace(/\s\s+/g, ' ').trim(); // Normalize whitespace first
          const brandStorePatterns = [
              /^(Visit|Shop|Explore|Buy from|Check out|See more from)\s+(?:the\s+)?(?:[A-Za-z0-9\s]+?)(?:\s+Store)?\s*/i,
              /^(?:Sponsored|Ad|Promoted)(?:\s*[:-]?\s*)/i,
              /^(?:Brand|Store):\s*/i,
              /^(?:Official|Authorized)\s+(?:Store|Seller|Dealer)\s*/i,
              /^(?:From|By)\s+(?:the\s+)?(?:[A-Za-z0-9\s]+?)(?:\s+Store)?\s*/i,
              /^(?:[A-Za-z0-9\s]+?)(?:\s+Store)\s+(?:on|at|from)\s+Amazon\s*/i
          ];
          brandStorePatterns.forEach(regex => {
              title = title.replace(regex, '');
          });
          title = title.replace(/\s\s+/g, ' ').trim(); // Re-trim and normalize after replacements
        }

        const maxTitleLength = 75; // Max length for search result titles
        if (title && title.length > maxTitleLength) {
          title = title.substring(0, maxTitleLength).trim() + '...';
        } else if (title) {
          title = title.trim();
        }


        let link = linkEl ? linkEl.href : '';
        if (link && !link.startsWith('http')) {
          try {
            link = new URL(link, document.baseURI).href;
          } catch(e) { link = ''; }
        }

        let price = '';
        const priceEl = item.querySelector('.a-price .a-offscreen');
        if (priceEl) {
            price = priceEl.textContent.trim().replace(/[₹$€£¥,]/g, '').trim();
        } else { // Fallback for price
            const priceWholeEl = item.querySelector('.a-price-whole');
            const priceFractionEl = item.querySelector('.a-price-fraction');
            if (priceWholeEl) {
                let tempPrice = priceWholeEl.textContent.trim();
                if (priceFractionEl) tempPrice += priceFractionEl.textContent.trim();
                price = tempPrice.replace(/[₹$€£¥,.]/g, '').trim(); // Remove dot for whole numbers
            }
        }
        // Get currency symbol separately
        let currencySymbol = '₹'; // Default
        const currencyEl = item.querySelector('.a-price-symbol');
        if (currencyEl) currencySymbol = currencyEl.textContent.trim();
        const formattedPrice = price ? `${currencySymbol}${parseFloat(price).toFixed(0)}` : 'N/A';


        const imageEl = item.querySelector('img.s-image');
        const image = imageEl ? imageEl.src : '';

        return { title: title || 'N/A', price: formattedPrice, image, link };
      }).filter(item => item.link && item.title && item.title !== 'N/A' && item.title !== '...');
    }, searchResultsSelector);

    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error(`Error in searchAmazon for query "${query}":`, error.message);
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
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for search results
    await page.waitForSelector('div[data-component-type="s-search-result"]', { timeout: 10000 });

    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div[data-component-type="s-search-result"]')).slice(0, 5);
      
      return items.map(item => {
        const titleEl = item.querySelector('h2 a span');
        const priceEl = item.querySelector('span.a-price-whole');
        const imageEl = item.querySelector('img.s-image');
        const linkEl = item.querySelector('h2 a');

        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          price: priceEl ? priceEl.textContent.trim() : '',
          imageUrl: imageEl ? imageEl.src : '',
          url: linkEl ? `https://www.amazon.in${linkEl.href}` : '',
          description: '' // Search results don't have descriptions
        };
      }).filter(item => item.title && item.price);
    });

    return products.map(product => createStandardProductObject(product, 'amazon'));

  } catch (error) {
    logger.error('Error searching Amazon:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeAmazon, searchAndScrapeList };