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

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'); // Updated Chrome version
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8', // Added Hindi as an example of broader acceptance
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"'
    });

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500)); // Slightly increased base delay

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }); // Increased timeout further

    await page.evaluate(() => {
      window.scrollTo(0, Math.random() * 150);
      setTimeout(() => window.scrollTo(0, Math.random() * 300 + 50), 600 + Math.random() * 400);
    });

    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('Enter the characters you see below') ||
      bodyText.includes('Sorry, we just need to make sure you\'re not a robot') ||
      bodyText.includes('api-services-support@amazon.com') ||
      bodyText.includes('Robot Check') ||
      bodyText.includes('CAPTCHA')) { // Added generic CAPTCHA check
      throw new Error('Amazon is showing a robot check, CAPTCHA, or an error page. Please try again later or use a different product link.');
    }

    const productTitleSelector = [
      '#productTitle',
      '.a-size-large.product-title-word-break',
      'h1.a-size-large',
      'span#title', // Common ID for title span
      '#title_feature_div #title', // More specific path for title
      '.titletext' // Generic class sometimes used
    ];
    let titleFound = false;
    for (const selector of productTitleSelector) {
      try {
        await page.waitForSelector(selector, { timeout: 20000, visible: true }); // Increased timeout, wait for visible
        titleFound = true;
        break;
      } catch (e) { /* Selector not found, try next */ }
    }

    if (!titleFound) {
       // Try to get body text one more time to see if it's a different kind of block
        const finalBodyText = await page.evaluate(() => document.body.innerText);
        if (finalBodyText.includes('currently unavailable') || finalBodyText.includes('Page Not Found') || finalBodyText.includes('Looking for something?')) {
             throw new Error('Product is unavailable or page not found.');
        }
      throw new Error('Could not extract product title from Amazon. The page structure might have changed, the product is unavailable, or it is heavily protected.');
    }

    const data = await page.evaluate(() => {
      const getText = (selectors, context = document) => {
        for (const selector of selectors) {
          const el = context.querySelector(selector);
          if (el) {
            let textContent;
            // If it's a title field, strip nested anchor text like "Visit the XYZ Store"
            if (selector === '#productTitle' || selector.includes('product-title') || selector.includes('Title') || selector.includes('title_feature_div')) {
              const cloned = el.cloneNode(true);
              
              // Aggressively remove all store-related elements from DOM
              const elementsToRemove = [
                'a[href*="stores"]',
                'a[href*="brand"]',
                'a[href*="seller"]',
                '.a-size-small',
                '.a-color-secondary',
                '.a-link-normal',
                '[class*="store"]',
                '[class*="brand"]',
                '[class*="seller"]',
                '[class*="visit"]',
                '[class*="shop"]'
              ];
              cloned.querySelectorAll(elementsToRemove.join(',')).forEach(subEl => subEl.remove());
              
              // Get the text content
              textContent = cloned.textContent;
              
              if (textContent) {
                // First pass: Remove store-related prefixes
                const storePrefixes = [
                  /^(?:Visit|Shop|Explore|Buy from|Check out|See more from)\s+(?:the\s+)?(?:[A-Za-z0-9\s]+?)(?:\s+(?:Store|Shop|Brand|Product))?\s*/i,
                  /^(?:Brand|Store|Product):\s*/i,
                  /^(?:Official|Authorized)\s+(?:Store|Seller|Dealer|Product)\s*/i,
                  /^(?:From|By)\s+(?:the\s+)?(?:[A-Za-z0-9\s]+?)(?:\s+(?:Store|Shop|Brand|Product))?\s*/i,
                  /^(?:[A-Za-z0-9\s]+?)(?:\s+(?:Store|Shop|Brand|Product))\s+(?:on|at|from)\s+Amazon\s*/i,
                  /^(?:Sponsored|Ad|Promoted)(?:\s*[:-]?\s*)/i
                ];

                // Remove all prefix patterns
                storePrefixes.forEach(pattern => {
                  textContent = textContent.replace(pattern, '');
                });

                // Second pass: Remove any remaining store mentions
                const storeMentions = [
                  /^(?:[A-Za-z0-9\s]+?)(?:\s+(?:Store|Shop|Brand|Product))\s*/i,
                  /^(?:Visit|Shop|Explore|Buy|From|By)\s+(?:the\s+)?(?:[A-Za-z0-9\s]+?)\s*/i,
                  /^(?:Official|Authorized)\s+(?:[A-Za-z0-9\s]+?)\s*/i
                ];

                storeMentions.forEach(pattern => {
                  textContent = textContent.replace(pattern, '');
                });

                // Third pass: Handle duplicate product names
                const words = textContent.split(/\s+/);
                if (words.length > 2) {
                  // Check for repeated words at the start
                  const firstTwoWords = words.slice(0, 2).join(' ').toLowerCase();
                  const restOfText = textContent.toLowerCase();
                  if (restOfText.includes(firstTwoWords, firstTwoWords.length + 1)) {
                    textContent = textContent.substring(textContent.indexOf(' ', textContent.indexOf(' ') + 1) + 1);
                  }
                }

                // Final cleanup
                textContent = textContent
                  // Remove any remaining store-related words at the start
                  .replace(/^(?:Store|Shop|Brand|Product|Visit|Shop|Explore|Buy|From|By|Official|Authorized)\s+/i, '')
                  // Clean up separators and extra spaces
                  .replace(/\s*[-–—|•]\s*/g, ' ')
                  .replace(/\s{2,}/g, ' ')
                  // Remove any leading/trailing separators
                  .replace(/^[-–—|•\s]+|[-–—|•\s]+$/g, '')
                  .trim();

                // Last check: If the title still starts with store-related words, remove them
                const storeWords = ['store', 'shop', 'brand', 'product', 'visit', 'shop', 'explore', 'buy', 'from', 'by', 'official', 'authorized'];
                const firstWord = textContent.toLowerCase().split(/\s+/)[0];
                if (storeWords.includes(firstWord)) {
                  textContent = textContent.substring(textContent.indexOf(' ') + 1).trim();
                }
              }
            } else {
              textContent = el.textContent;
            }
            return textContent ? textContent.replace(/\s\s+/g, ' ').trim() : '';
          }
        }
        return '';
      };

      const getImage = (selectors) => {
        for (const selector of selectors) {
          const imgElement = document.querySelector(selector);
          if (imgElement) {
            let imgSrc = null;
            // Case 1: Amazon's dynamic image loader (often a JSON string in data-a-dynamic-image) - Highest priority
            if (imgElement.dataset && imgElement.dataset.aDynamicImage) {
              try {
                const dynamicImages = JSON.parse(imgElement.dataset.aDynamicImage);
                let largestImageSrc = null;
                let maxDimensions = 0;
                for (const srcKey in dynamicImages) {
                  const dimensions = dynamicImages[srcKey];
                  if (dimensions && dimensions.length === 2) {
                    const currentDimensions = dimensions[0] * dimensions[1];
                    if (currentDimensions > maxDimensions) {
                      maxDimensions = currentDimensions;
                      largestImageSrc = srcKey;
                    }
                  }
                }
                if (largestImageSrc) imgSrc = largestImageSrc;
              } catch (e) { /* console.warn('Failed to parse data-a-dynamic-image JSON', e); */ }
            }
            // Case 2: Direct src attribute (if not a data URI)
            if (!imgSrc && imgElement.src && !imgElement.src.startsWith('data:image')) {
              imgSrc = imgElement.src;
            }
            // Case 3: data-src attribute (lazy loading)
            if (!imgSrc && imgElement.dataset && imgElement.dataset.src && !imgElement.dataset.src.startsWith('data:image')) {
              imgSrc = imgElement.dataset.src;
            }
            // Case 4: Check parent elements for background image (less common for main product image)
            if(!imgSrc){
                const style = window.getComputedStyle(imgElement);
                if (style.backgroundImage && style.backgroundImage !== 'none') {
                    const urlMatch = style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
                    if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:image')) {
                       imgSrc = urlMatch[1];
                    }
                }
            }
            if (imgSrc) {
              try { return new URL(imgSrc, document.baseURI).href; } catch (e) { /*ignore malformed URLs*/ }
            }
          }
        }
        // Fallback: Look for any image within common gallery containers if specific selectors fail
        const galleryImage = document.querySelector('#altImages li.selected img, #imageBlock img, #imgTagWrapperId img, .imgTagWrapper img');
        if (galleryImage && galleryImage.src && !galleryImage.src.startsWith('data:image')) {
            try { return new URL(galleryImage.src, document.baseURI).href; } catch (e) { /*ignore*/ }
        }
        return '';
      };

      const getFeatures = (selectors) => {
        let features = [];
        const minFeatureLength = 10;
        const maxFeatureLength = 300; // Slightly increased max length
        const maxTotalFeatures = 7;
        const commonBoilerplate = [
            'click here', 'details', 'warranty', 'customer service', 'free shipping',
            'shipping information', 'return policy', 'see more', 'product description',
            'technical details', 'additional information', 'manufacturer',
            'asin', 'item model number', 'customer reviews', 'best sellers rank',
            'product dimensions', 'date first available', 'department', 'language', 'country of origin'
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            const listFeatures = Array.from(elements)
              .map(el => el.textContent.replace(/\s\s+/g, ' ').trim())
              .filter(f => f && f.length >= minFeatureLength && f.length <= maxFeatureLength &&
                           !commonBoilerplate.some(bp => f.toLowerCase().includes(bp)))
              .filter((value, index, self) => self.indexOf(value) === index);
            features.push(...listFeatures);
            if (features.length >= maxTotalFeatures) break;
          }
        }
        features = Array.from(new Set(features));

        if (features.length < maxTotalFeatures) {
            const descSelectors = [
                '#productDescription p',
                '#productDescription span',
                '#aplus_feature_div span', // Corrected from aplus_feature_div
                '#feature-bullets .a-list-item',
                '#productDetails_techSpec_section_1 tr', // Technical specs table rows
                '#productDetails_detailBullets_sections1 tr' // Detail bullets table rows
            ];
            let descriptionTextElements = [];
            for(const sel of descSelectors) {
                document.querySelectorAll(sel).forEach(el => {
                    if (el.tagName === 'TR') { // For table rows, combine th and td
                        const th = el.querySelector('th');
                        const td = el.querySelector('td');
                        if (th && td && th.textContent.trim().length > 2 && td.textContent.trim().length > 2) {
                            const featureFromTable = `${th.textContent.trim()}: ${td.textContent.trim()}`;
                             if (featureFromTable.length >= minFeatureLength && featureFromTable.length <= maxFeatureLength &&
                                !commonBoilerplate.some(bp => featureFromTable.toLowerCase().includes(bp))) {
                                descriptionTextElements.push(featureFromTable);
                            }
                        }
                    } else {
                        const text = (el.innerText || el.textContent || "").trim();
                        if (text) descriptionTextElements.push(text);
                    }
                });
            }
            
            if (descriptionTextElements.length > 0) {
                const potentialFeatures = descriptionTextElements
                    .join(' \n ') // Join elements with newline for splitting
                    .split(/\r?\n|\. |; |• /)
                    .map(f => f.replace(/[^a-zA-Z0-9\s.,'%()\-\p{Sc}]/gu, ' ').replace(/\s+/g, ' ').trim()) // Allow currency symbols
                    .filter(f => {
                        const wordCount = f.split(' ').filter(Boolean).length;
                        return f && f.length >= minFeatureLength && f.length <= maxFeatureLength && wordCount >= 3 && wordCount <= 30 &&
                               !commonBoilerplate.some(bp => f.toLowerCase().includes(bp));
                    })
                    .filter((value, index, self) => self.map(s=>s.toLowerCase()).indexOf(value.toLowerCase()) === index);

                features.push(...potentialFeatures);
                features = Array.from(new Set(features.map(f => f.trim()))).filter(Boolean);
            }
        }
        return features.slice(0, maxTotalFeatures);
      };

      const getCategory = (selectors) => {
        for (const selector of selectors) {
          const cat = document.querySelector(selector);
          if (cat) return cat.textContent.replace(/\s\s+/g, ' ').trim();
        }
        // Fallback: try to get category from breadcrumbs, taking the second to last if last is product title
        const breadcrumbs = Array.from(document.querySelectorAll('#wayfinding-breadcrumbs_container ul li a, #nav-breadcrumbs ul li a'));
        if (breadcrumbs.length > 1) {
            return breadcrumbs[breadcrumbs.length - (breadcrumbs.length > 2 ? 2 : 1)].textContent.replace(/\s\s+/g, ' ').trim();
        }
        return '';
      };

      const getPrice = (selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent) {
            let priceText = el.textContent.trim();
             // Handle cases like "₹1,234.56" or "$12.34" correctly
            priceText = priceText.replace(/[₹$€£¥]/g, '').replace(/,/g, '').trim(); // Remove currency symbols and commas
            if (priceText && !isNaN(parseFloat(priceText))) {
                 // Check for a dedicated currency symbol element if primary text was just numbers
                let symbolEl = el.closest('.a-price, [class*="price"]')?.querySelector('.a-price-symbol');
                if(!symbolEl) symbolEl = document.querySelector('.a-price-symbol, #corePrice_feature_div .a-price-symbol, .priceToPay .a-price-symbol');
                const currency = symbolEl ? symbolEl.textContent.trim() : '₹'; // Default to INR or extract
                return { amount: parseFloat(priceText).toFixed(2), currency: currency };
            }
          }
        }
         // Fallback for split price (e.g., .priceToPay span.a-price-whole + .a-price-fraction)
        const wholeEl = document.querySelector('.priceToPay span.a-price-whole, span[data-a-size="xl"] span.a-price-whole');
        if (wholeEl) {
            let priceText = wholeEl.textContent.trim();
            const fractionEl = wholeEl.parentElement.querySelector('.a-price-fraction');
            if (fractionEl) priceText += fractionEl.textContent.trim();
            priceText = priceText.replace(/[₹$€£¥]/g, '').replace(/,/g, '').trim();
            if (priceText && !isNaN(parseFloat(priceText))) {
                const symbolEl = wholeEl.closest('.a-price, [class*="price"]')?.querySelector('.a-price-symbol') || document.querySelector('.a-price-symbol');
                const currency = symbolEl ? symbolEl.textContent.trim() : '₹';
                return { amount: parseFloat(priceText).toFixed(2), currency: currency };
            }
        }
        return { amount: 'N/A', currency: '' };
      };

      const priceSelectors = [
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '#corePrice_feature_div .a-price .a-offscreen', // Primary price display
        '.a-price.a-text-price > .a-offscreen', // Often used for sale prices
        '.priceToPay span.a-offscreen', // Newer price structure
        'span[data-a-strike="true"] .a-offscreen', // Strikethrough price (original price)
        '#attach-base-product-price .a-offscreen', // Price on "add to cart" confirmation/popups
        '.apexPriceToPay .a-offscreen' // Another price variation
      ];

      const priceData = getPrice(priceSelectors);
      const formattedPrice = priceData.amount !== 'N/A' ? `${priceData.currency}${parseFloat(priceData.amount).toFixed(0)}` : 'N/A';


      const imageSelectors = [
        '#imgTagWrapperId img[data-a-dynamic-image]',
        '#landingImage[data-a-dynamic-image]',
        '#imgTagWrapperId img#landingImage', // More specific combination
        '#main-image-container img#main-image',
        '#altImages li.selected img', // If main image fails, use selected thumbnail
        '#ebooksImgBlkFront', // For ebooks
        '.imgTagWrapper img', // Generic wrapper
        '#ivLargeImage img#ivLargeImageDynamicReplacer',
        '#imgBlkFront',
        '.a-dynamic-image.a-stretch-horizontal',
        '.a-dynamic-image.a-stretch-vertical',
      ];
      const productBrandSelectors = [
        '#bylineInfo',
        '#productOverview_feature_div div.po-brand .po-break-word',
        '#productOverview_feature_div tr:has(th:contains("Brand")) td', // More reliable for table
        '#bylineInfo_feature_div a', // Direct link in byline
        'a#brand',
        '#meta-info .author a' // For books
      ];
      const categorySelectors = [
        '#wayfinding-breadcrumbs_container ul li:last-child a',
        '#nav-subnav .nav-a.nav-b', // Sub-navigation category
        '#dp-container .a-link-normal[href*="/b/"]:not([href*="customerReviews"])', // Category links on DP
        '.zg_hrsr_ladder ol li:last-child a', // Best seller rank category
      ];
      const featureSelectors = [
        '#feature-bullets ul li span.a-list-item',
        '#productOverview_feature_div .a-row span.a-list-item',
        '#detailBullets_feature_div ul li span.a-list-item',
        '#productDetails_techSpec_section_1 tr', // For getFeatures to parse
        '#productDetails_detailBullets_sections1 tr', // For getFeatures to parse
        '#aplus3p_feature_div ul li .aplus-pcustom, #aplus_feature_div ul li span', // A+ content features
      ];
      const titleProductSelectorInternal = [ // Renamed to avoid conflict
        '#productTitle',
        '.a-size-large.product-title-word-break',
        'h1.a-size-large.product-title-word-break', // More specific h1
        'span#title',
        '#title_feature_div #title'
      ];
      let title = getText(titleProductSelectorInternal);
      const brandPrefixRegex = /^(Visit|Shop|Explore) the .*? Store\s*/i; // Broader regex
      title = title.replace(brandPrefixRegex, '').replace(/\s\s+/g, ' ').trim();

      const maxTitleLength = 120; // Slightly increased
      if (title.length > maxTitleLength) {
        title = title.substring(0, maxTitleLength).trim() + '...';
      }
      return {
        title: title,
        brand: getText(productBrandSelectors),
        price: formattedPrice, // Already formatted
        image: getImage(imageSelectors),
        keyFeatures: getFeatures(featureSelectors),
        category: getCategory(categorySelectors),
      };
    });

    if (!data.title || data.title === "...") { // Check if title is just ellipsis
      console.warn("Warning: Product title was not found or is invalid. Data might be incomplete.", data);
    }
    return data;
  } catch (error) {
    console.error(`Error in scrapeAmazon for URL ${url}:`, error.message);
    // Optionally, capture a screenshot on error for debugging
    // if (page) await page.screenshot({ path: `error_scrape_${Date.now()}.png` });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
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

module.exports = { scrapeAmazon, searchAmazon };