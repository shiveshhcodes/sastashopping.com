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
      bodyText.includes('api-services-support@amazon.com') ||
      bodyText.includes('Robot Check')) {
      throw new Error('Amazon is showing a robot check, CAPTCHA, or an error page. Please try again later or use a different product link.');
    }

    // Wait for product title to load, or timeout
    const productTitleSelector = [
      '#productTitle',
      '.a-size-large.product-title-word-break',
      'h1.a-size-large',
      'span#title'
    ];
    let titleFound = false;
    for (const selector of productTitleSelector) {
      try {
        await page.waitForSelector(selector, { timeout: 15000 }); // Increased timeout
        titleFound = true;
        break;
      } catch (e) { /* Selector not found, try next */ }
    }

    if (!titleFound) {
      throw new Error('Could not extract product title from Amazon. The page structure might have changed, the product is unavailable, or it is heavily protected.');
    }

    const data = await page.evaluate(() => {
      const getText = (selectors, context = document) => {
        for (const selector of selectors) {
          const el = context.querySelector(selector);
          if (el) {
            // If it's a title field, strip nested anchor text like "Visit the XYZ Store"
            if (selector === '#productTitle' || selector.includes('product-title')) {
              // Clone and remove anchor tags (e.g., brand links)
              const cloned = el.cloneNode(true);
              cloned.querySelectorAll('a').forEach(a => a.remove());
              return cloned.textContent.trim();
            }
          return el.textContent.trim();
        }
      }
      return '';
    };
    

      const getImage = (selectors) => {
        for (const selector of selectors) {
          const imgElement = document.querySelector(selector);
          if (imgElement) {
            // Case 1: Direct src attribute
            if (imgElement.src && !imgElement.src.startsWith('data:image')) {
              try { return new URL(imgElement.src, document.baseURI).href; } catch (e) { /*ignore*/ }
            }
            // Case 2: data-src attribute (lazy loading)
            if (imgElement.dataset && imgElement.dataset.src && !imgElement.src.startsWith('data:image')) {
              try { return new URL(imgElement.dataset.src, document.baseURI).href; } catch (e) { /*ignore*/ }
            }
            // Case 3: Amazon's dynamic image loader (often a JSON string)
            if (imgElement.dataset && imgElement.dataset.aDynamicImage) {
              try {
                const dynamicImages = JSON.parse(imgElement.dataset.aDynamicImage);
                // Find the largest image from the dynamic set
                let largestImageSrc = null;
                let maxDimensions = 0;
                for (const srcKey in dynamicImages) {
                  const dimensions = dynamicImages[srcKey]; // [width, height]
                  if (dimensions && dimensions.length === 2) {
                    const currentDimensions = dimensions[0] * dimensions[1];
                    if (currentDimensions > maxDimensions) {
                      maxDimensions = currentDimensions;
                      largestImageSrc = srcKey;
                    }
                  }
                }
                if (largestImageSrc) {
                    try { return new URL(largestImageSrc, document.baseURI).href; } catch (e) { /*ignore*/ }
                }
              } catch (e) {
                // console.warn('Failed to parse data-a-dynamic-image JSON', e);
              }
            }
             // Case 4: Check parent elements for background image (less common for main product image)
            const style = window.getComputedStyle(imgElement);
            if (style.backgroundImage && style.backgroundImage !== 'none') {
                const urlMatch = style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
                if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:image')) {
                    try { return new URL(urlMatch[1], document.baseURI).href; } catch (e) { /*ignore*/ }
                }
            }
          }
        }
        // Fallback: Look for any image within common gallery containers if specific selectors fail
        const galleryImage = document.querySelector('#altImages li.selected img, #imageBlock img, #imgTagWrapperId img');
        if (galleryImage && galleryImage.src && !galleryImage.src.startsWith('data:image')) {
            try { return new URL(galleryImage.src, document.baseURI).href; } catch (e) { /*ignore*/ }
        }
        return ''; // Return empty if no valid image found
      };

      const getFeatures = (selectors) => {
        let features = [];
        const minFeatureLength = 10; // Min character length for a feature
        const maxFeatureLength = 250; // Max character length
        const maxTotalFeatures = 7; // Max number of features to return
        const commonBoilerplate = [
            'click here', 'details', 'warranty', 'customer service', 'free shipping',
            'shipping information', 'return policy', 'see more', 'product description',
            'technical details', 'additional information', 'manufacturer',
            'asin', 'item model number', 'customer reviews', 'best sellers rank'
        ];

        // Attempt 1: Get from dedicated feature bullet lists
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            const listFeatures = Array.from(elements)
              .map(el => el.textContent.trim())
              .filter(f => f && f.length >= minFeatureLength && f.length <= maxFeatureLength &&
                           !commonBoilerplate.some(bp => f.toLowerCase().includes(bp)))
              .filter((value, index, self) => self.indexOf(value) === index); // Unique
            features.push(...listFeatures);
            if (features.length >= maxTotalFeatures) break;
          }
        }
        features = Array.from(new Set(features)); // Ensure uniqueness again

        // Attempt 2: If not enough features, try parsing general description text
        if (features.length < maxTotalFeatures) {
            const descSelectors = [
                '#productDescription p',
                '#productDescription span',
                '#aplus_feature_div span',
                '#feature-bullets .a-list-item' // Re-check feature bullets if primary selectors failed
            ];
            let descriptionText = '';
            for(const sel of descSelectors) {
                const el = document.querySelector(sel);
                if (el) {
                    descriptionText += (el.innerText || el.textContent) + ' \n '; // innerText is often better for visible text
                }
            }
            descriptionText = descriptionText.trim();

            if (descriptionText) {
                const potentialFeatures = descriptionText
                    .split(/\r?\n|\. |; |• /) // Split by newlines, periods, semicolons, bullets
                    .map(f => f.replace(/[^a-zA-Z0-9\s.,'%\-()]/g, ' ').replace(/\s+/g, ' ').trim()) // Sanitize and normalize spaces
                    .filter(f => {
                        const wordCount = f.split(' ').filter(Boolean).length;
                        return f && f.length >= minFeatureLength && f.length <= maxFeatureLength && wordCount >= 3 &&
                               !commonBoilerplate.some(bp => f.toLowerCase().includes(bp));
                    })
                    .filter((value, index, self) => self.indexOf(value.toLowerCase()) === index); // Unique, case-insensitive

                features.push(...potentialFeatures);
                features = Array.from(new Set(features.map(f => f.trim()))).filter(Boolean);
            }
        }
        return features.slice(0, maxTotalFeatures);
      };

      const getCategory = (selectors) => {
        for (const selector of selectors) {
          const cat = document.querySelector(selector);
          if (cat) return cat.textContent.trim();
        }
        return '';
      };

      const getPrice = (selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent) {
            let priceText = el.textContent.trim();
            // Handle cases where price is split into whole and fraction parts (e.g. in .priceToPay span.a-price-whole)
            if (el.classList.contains('a-price-whole') && el.parentElement) {
                const fractionEl = el.parentElement.querySelector('.a-price-fraction');
                if (fractionEl) priceText += fractionEl.textContent.trim();
            }
            priceText = priceText.replace(/[₹$€,]/g, '').trim();
            if (priceText && !isNaN(parseFloat(priceText))) return priceText;
          }
        }
        return '';
      };

      // More robust price selectors
      const priceSelectors = [
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '.a-price.a-text-price > .a-offscreen',
        '.a-price:not(.a-text-price) > .a-offscreen',
        '#corePrice_feature_div .a-price .a-offscreen',
        '.priceToPay span.a-price-whole', // Ensure this is handled by the logic in getPrice
        'span[data-a-size="xl"] span.a-price-whole', // Ensure this is handled
        '.a-button-selected .a-color-price',
        '.offer-price .a-price',
        'span[data-action="show-all-offers-display"] .a-color-price' // Price shown with "all offers"
      ];

      // Refined price extraction logic
      const extractedPrice = getPrice(priceSelectors);
      // Attempt to get currency symbol more reliably
      let currencySymbol = '₹'; // Default
      const priceSymbolElement = document.querySelector('.a-price-symbol, #corePrice_feature_div .a-price-symbol, .priceToPay .a-price-symbol');
      if (priceSymbolElement) currencySymbol = priceSymbolElement.textContent.trim();

      const formattedPrice = extractedPrice ? `${currencySymbol}${parseFloat(extractedPrice).toFixed(0)}` : 'N/A'; // Using toFixed(0) like Myntra

      // Improved image selectors - prioritized and expanded
      const imageSelectors = [
        '#imgTagWrapperId img[data-a-dynamic-image]', // Main dynamic image
        '#landingImage[data-a-dynamic-image]',      // Another dynamic image common location
        '#imgTagWrapperId img',                     // Static image in main wrapper
        '#landingImage',                           // Static landing image
        '#main-image-container #main-image',       // Inside a main image container
        '#ivLargeImage img#ivLargeImageDynamicReplacer', // Image viewer large image
        '#imgBlkFront',                             // Often for books/media
        '.a-dynamic-image.a-stretch-horizontal',   // Common class for dynamic images
        '.a-dynamic-image.a-stretch-vertical',
        '#comparison-image img',
        'img#prodImage',
        '#image-block-0 img',                       // Part of an image block
        '#altImages li.selected img',              // Selected thumbnail
        '#coverArt_feature_div img',               // For media like CDs/DVDs
        '.imageThumb_0 img'                       // First thumbnail if others fail
      ];
      const productBrandSelectors = [
        '#bylineInfo',
        '#productOverview_feature_div div.po-brand .po-break-word', // More specific PO table brand
        '#productOverview_feature_div tr:has(th:contains("Brand")) td',
        '#centerCol div[data-cy="title-recipe"] div div:nth-child(2) a span',
        'a#bylineInfo_feature_div',
        'a#brand', // Generic brand link
        'div.tabular-buybox-text span.a-size-base',
        'span.author'
      ];
      const categorySelectors = [
        '#wayfinding-breadcrumbs_container ul li:last-child a',
        '#wayfinding-breadcrumbs_feature_div ul li:last-child a',
        '#nav-subnav .nav-a.nav-b',
        '#dp-container .a-link-normal[href*="/b/"]:not([href*="customerReviews"])',
        'span.zg-breadcrumb-text:last-child a',
        'div.a-section.a-spacing-micro a.a-link-normal',
        '.a-breadcrumb li:last-child a' // Common breadcrumb pattern
      ];
      // Updated and prioritized feature selectors
      const featureSelectors = [
        '#feature-bullets ul li span.a-list-item',          // Primary feature list
        '#productOverview_feature_div .a-row span.a-list-item', // Overview table features
        '#detailBullets_feature_div ul li span.a-list-item',   // Detail bullets section
        '.a-unordered-list.a-vertical.a-spacing-none:not(#social-media-community-feed) li span.a-list-item', // General unordered lists excluding social feeds
        'div#technical-details-wrapper table tr td.a-size-base', // Technical details table cells
        '#productDescription ul li',                        // Lists within product description
        // Selectors for less structured features if the above fail (handled by getFeatures fallback logic)
      ];
      // Define title selectors within page.evaluate context
      const titleProductSelector = [ // Renamed to avoid conflict if productTitleSelector was accidentally passed
        '#productTitle',
        '.a-size-large.product-title-word-break',
        'h1.a-size-large',
        'span#title'
      ];
      let title = getText(titleProductSelector);
      // Remove "Visit the <Brand> Store" prefix
      const brandPrefixRegex = /Visit the .*? Store\s+/i;
      title = title.replace(brandPrefixRegex, '');

      // Truncate title if it exceeds a maximum length
      const maxTitleLength = 100; // You can adjust this as needed
      if (title.length > maxTitleLength) {
        title = title.substring(0, maxTitleLength).trim() + '...'; // Truncate and add ellipsis
      }
      return {
        title: title,
        brand: getText(productBrandSelectors),
        price: formattedPrice,
        image: getImage(imageSelectors),
        keyFeatures: getFeatures(featureSelectors),
        category: getCategory(categorySelectors),
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
        let title = titleEl ? titleEl.textContent.trim() : '';
        // Remove "Visit the <Brand> Store" prefix
        const brandPrefixRegex = /Visit the .*? Store\s+/i;
        title = title.replace(brandPrefixRegex, '');

        // Truncate title if it exceeds a maximum length
        const maxTitleLength = 50; // You can adjust this as needed
        if (title.length > maxTitleLength) {
          title = title.substring(0, maxTitleLength).trim() + '...'; // Truncate and add ellipsis
        }

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
