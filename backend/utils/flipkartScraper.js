const puppeteer = require('puppeteer');

/**
 * Scrapes product data from a given Flipkart product URL.
 * @param {string} url - The URL of the Flipkart product page.
 * @returns {Promise<object>} - A promise that resolves to an object containing product data.
 * @throws {Error} - If scraping fails.
 */
async function scrapeFlipkart(url) {
  let browser;
  let page; // Define page here to access it in finally block for debugging if needed

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080', 
      ]
    });
    page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'); // Using a slightly older but common UA
    await page.setViewport({ width: 1920, height: 1080 });

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,en-IN;q=0.8', // Added en-IN
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'no-cache', // Try to avoid cached versions
      'Pragma': 'no-cache',
    });
    
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const resourceType = req.resourceType();
        // Block common analytics, ads, and some heavy scripts that might interfere or are not needed
        const blockList = ['google-analytics.com', 'googletagmanager.com', 'facebook.net', 'fbcdn.net', 'flipkartads.com', 'youtube.com', 'doubleclick.net'];
        if (blockList.some(domain => req.url().includes(domain)) || ['font', 'image', 'media'].includes(resourceType) && !req.url().includes('flixcart.com')) { // Allow images from flixcart
             req.abort();
        } else {
            req.continue();
        }
    });

    await page.goto(url, {
      waitUntil: 'networkidle2', // Changed to networkidle2 for better loading state
      timeout: 75000 // Slightly increased timeout
    });

    const bodyHTML = await page.content();
    if (bodyHTML.toLowerCase().includes('something went wrong') || bodyHTML.toLowerCase().includes('err=404') || bodyHTML.toLowerCase().includes('are you a human?') || bodyHTML.toLowerCase().includes('request timed out')) {
        throw new Error('Flipkart page shows an error, "Something went wrong", 404, human verification, or timed out.');
    }
    
    const closeButtonSelector = 'button._2KpZ6l._2doB4z, ._2KpZ6l._2doB4z'; // Common close button for popups
    if (await page.$(closeButtonSelector)) {
        try {
            await page.click(closeButtonSelector);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for popup to actually close
        } catch (e) {
            console.warn("Could not click close button for potential popup, continuing...");
        }
    }

    // More robust and varied title selectors
    const titleSelectors = [
        'span.B_NuCI',                 // Original primary title span
        'h1 span.yhB1nd',              // Title within h1, another common structure
        'h1 span._35KyD6',             // Another title variant
        '.VU-ZEz',                     // New potential title class
        '._1_RJAe',                    // Sometimes title is in this class
        'h1[class*="title"]',          // Generic title in h1
        '.product-title',              // Generic product title class
        'span[class*="product-title"]', // Span with product-title in class
        '._4rR01T'                     // Common for search results, sometimes on product pages
    ];
    let titleFound = false;
    let productTitleText = '';

    for (const selector of titleSelectors) {
        try {
            // Wait for selector with a shorter timeout, then attempt to get text
            await page.waitForSelector(selector, { timeout: 5000, visible: true });
            productTitleText = await page.$eval(selector, el => el.textContent.trim());
            if (productTitleText) {
                titleFound = true;
                break;
            }
        } catch (e) {
            // console.log(`Selector ${selector} not found or not visible, trying next...`);
        }
    }

    if (!titleFound || !productTitleText) {
        throw new Error(`Could not extract product title from Flipkart (URL: ${url}). All known selectors failed. The page may be protected, unavailable, or its structure has significantly changed.`);
    }

    const data = await page.evaluate((extractedTitle) => {
      const getText = (selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent) return el.textContent.trim();
        }
        return '';
      };
      const getImage = (selectors) => {
        for (const selector of selectors) {
          const img = document.querySelector(selector);
          if (img) {
            if (img.src && !img.src.startsWith('data:image')) return img.src;
            if (img.srcset) {
                const sources = img.srcset.split(',').map(s => s.trim().split(' ')[0]);
                if (sources.length > 0 && !sources[0].startsWith('data:image')) return new URL(sources[0], document.baseURI).href; // Get the first one and ensure absolute
            }
          }
        }
        // Fallback for images in different structures or main image carousels
        const mainImage = document.querySelector('._396cs4._2amPTt._3qGmMb, ._2r_T1I._396cs4, .q6DClP'); // Added .q6DClP
        if (mainImage && mainImage.src && !mainImage.src.startsWith('data:image')) return new URL(mainImage.src, document.baseURI).href;
        
        const slickSlideImage = document.querySelector('.slick-active img._396cs4, ._3kidJX img, .CXW8mj img'); // Image in active slider, added .CXW8mj img
        if (slickSlideImage && slickSlideImage.src && !slickSlideImage.src.startsWith('data:image')) return new URL(slickSlideImage.src, document.baseURI).href;
        
        // Try to find image from a div with background-image style
        const divWithBg = document.querySelector('div._312yBx div'); // Common pattern for main image
        if (divWithBg) {
            const style = window.getComputedStyle(divWithBg);
            const bgImage = style.getPropertyValue('background-image');
            if (bgImage && bgImage !== 'none') {
                const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
                if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:image')) {
                    return new URL(urlMatch[1], document.baseURI).href;
                }
            }
        }
        return '';
      };
      const getFeatures = (selectors) => {
        for (const selector of selectors) {
            const featureElements = document.querySelectorAll(selector);
            if (featureElements.length > 0) {
                return Array.from(featureElements).map(el => el.textContent.trim()).filter(f => f && f.length > 2 && f.length < 250); // Filter short/long strings
            }
        }
        // Try to get features from a specific div if list items fail
        const detailsContainer = document.querySelector('div._2418kt');
        if (detailsContainer) {
            return Array.from(detailsContainer.querySelectorAll('li')).map(li => li.textContent.trim()).filter(f => f && f.length > 2 && f.length < 250);
        }
        return [];
      };
      const getPrice = (selectors) => {
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent) {
                return el.textContent.trim().replace(/[₹,MRP\s]/gi, ''); // More aggressive cleaning
            }
        }
        return '';
      };
      const getBrandFromTitle = (titleText) => {
          if (!titleText) return '';
          // Common pattern: "BrandName ProductName..."
          // This is a heuristic and might not always be accurate.
          const words = titleText.split(' ');
          if (words.length > 0 && words[0].length > 1 && words[0] === words[0].toUpperCase()) { // All caps might be brand
              return words[0];
          }
          // Look for known brand indicators or if a specific brand element exists
          const brandEl = document.querySelector('._2WkVRV, .G6XhRU'); // Common brand name holders
          if (brandEl && brandEl.textContent) return brandEl.textContent.trim();
          
          // If title is like "Brand Model Name", take first word.
          // This is very basic, ideally scrape brand from a dedicated element.
          if (words.length > 1) return words[0];
          return '';
      };


      // Define selectors here as arrays to try them in order
      // Title is already extracted and passed as `extractedTitle`
      const brandSels = ['a._2whKao:first-child', 'div.aMaAEs ._2whKao', 'span._2J4LW6', 'a[href*="/brands/"]', 'div._1r02el span:first-child', '._2WkVRV', '.G6XhRU'];
      const priceSels = ['div._30jeq3._16Jk6d', 'div._30jeq3', 'div._1vC4OE._3qQ9m1', 'div[class*="price"]', '._12_1kI > div:first-child']; // Added ._12_1kI
      const imageSels = ['img._396cs4._2amPTt._3qGmMb', 'img._2r_T1I._396cs4', '.slick-active img._396cs4', 'div._3kidJX img', 'img[class*="product-image"]', '.CXW8mj img', '.q6DClP', 'div._312yBx div'];
      const featureSels = ['div._2418kt ul li._21Ahn-', 'div.row ._3_6Uyw', 'div[class*="features"] li', 'div[class*="description"] li', '._1zH6iH ._21lJbe']; // Added ._1zH6iH ._21lJbe for highlights
      const categorySels = ['a._2whKao', 'div._1MR4o5 > div > a:last-child', 'a[href*="/lc/"]', '._1zH6iH:first-child a']; // Breadcrumb links
      const ratingSels = ['div._3LWZlK', 'div._2d4LTz', 'span._1lRcqv ._3LWZlK', '._13_PHN ._3LWZlK'];
      const reviewsSels = ['span._2_R_DZ', 'span._13vcmD span:last-child', 'span[class*="reviews-count"]', '._13_PHN ._2_R_DZ > span'];

      let brandText = getText(brandSels);
      if (!brandText) {
          brandText = getBrandFromTitle(extractedTitle);
      }
      
      // Clean title if brand is at the beginning
      let finalTitle = extractedTitle;
      if (brandText && extractedTitle.toLowerCase().startsWith(brandText.toLowerCase())) {
          finalTitle = extractedTitle.substring(brandText.length).trim();
      }

      // --- Title Post-processing ---
      // Shorten the title to brand + model or up to first dash/parenthesis/colon
      let shortTitle = finalTitle || extractedTitle;
      // Remove everything after the first dash, parenthesis, or colon
      shortTitle = shortTitle.split(' - ')[0].split('(')[0].split(':')[0].trim();
      // If brand is present and at the start, keep brand + next word (model)
      if (brandText && shortTitle.toLowerCase().startsWith(brandText.toLowerCase())) {
        const words = shortTitle.split(' ');
        if (words.length > 1) shortTitle = words.slice(0, 2).join(' ');
        else shortTitle = brandText;
      }

      // --- Image Fallback ---
      let imageUrl = getImage(imageSels);
      if (!imageUrl || imageUrl.length < 10) {
        // Try meta og:image as a fallback
        const ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg && ogImg.content) imageUrl = ogImg.content;
      }
      if (!imageUrl || imageUrl.length < 10) {
        // Try to find any img with a src containing 'flipkart'
        const anyImg = Array.from(document.querySelectorAll('img')).find(img => img.src && img.src.includes('flipkart'));
        if (anyImg) imageUrl = anyImg.src;
      }

      // --- Price Fallback ---
      let priceValue = getPrice(priceSels);
      if (!priceValue) {
        // Try meta og:price:amount
        const ogPrice = document.querySelector('meta[property="product:price:amount"]');
        if (ogPrice && ogPrice.content) priceValue = ogPrice.content;
      }
      // Remove any non-numeric characters except dot
      priceValue = priceValue ? priceValue.replace(/[^\d.]/g, '') : '';

      return {
        title: shortTitle,
        brand: brandText,
        price: priceValue,
        image: imageUrl,
        keyFeatures: getFeatures(featureSels),
        category: getText(categorySels),
        rating: getText(ratingSels),
        reviews: getText(reviewsSels).replace(/\D/g, ''),
      };
    }, productTitleText); // Pass the extracted title to page.evaluate

    if (!data.title && !data.brand) { // If both are missing, it's a critical failure
        throw new Error(`Failed to extract critical product title and brand from Flipkart (URL: ${url}) even after initial checks.`);
    }
    return data;

  } catch (error) {
    console.error(`Error in scrapeFlipkart for URL ${url}:`, error.message);
    throw error; // Re-throw
  } finally {
    if (browser) {
      await browser.close();
    }
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
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
    
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off`; // Added more params
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for search results with updated selectors
    const searchResultItemSelector = 'div._1AtVbE, div._2kHMtA, div[data-id], ._1xHGtK._373qXS, ._4ddWXP'; // Added ._1xHGtK._373qXS, ._4ddWXP (common item containers)
    const searchResultsContainerSelector = 'div._1YokD2._3Mn1Gg, div#container, ._1HmYoV._35HD7C'; // Overall container for results

    try {
      await page.waitForSelector(searchResultsContainerSelector, { timeout: 15000, visible: true });
      await page.waitForSelector(searchResultItemSelector, { timeout: 10000, visible: true });
    } catch (e) {
      const bodyContent = await page.content();
      if (bodyContent.toLowerCase().includes("no results found for") || bodyContent.toLowerCase().includes("couldn't find any products")) {
          console.log(`No search results found on Flipkart for query: "${query}"`);
          return null;
      }
      throw new Error(`Could not find search results container or items on Flipkart for query "${query}". The page may be protected, unavailable or structure changed.`);
    }

    const results = await page.evaluate((itemSelector) => {
      const items = Array.from(document.querySelectorAll(itemSelector)).slice(0, 5);
      return items.map(item => {
        let title = '';
        const titleSelectors = ['a.s1Q9rs', 'div._4rR01T', 'a.IRpwTa', 'div.col-7-12 ._3wU53n', 'div.col-7-12 ._2B_p4E', '.s1Q9rs', '.IRpwTa', '._4rR01T']; // Added more general title classes
        for (const sel of titleSelectors) {
            const el = item.querySelector(sel);
            if (el) {
                title = el.title || el.textContent.trim();
                if (title) break;
            }
        }
        if (!title) title = item.querySelector('div[class*="title"], div[class*="name"], a[title]')?.getAttribute('title') || item.querySelector('div[class*="title"], div[class*="name"]')?.textContent.trim() || '';


        let link = '';
        const linkSelectors = ['a.s1Q9rs', 'a._1fQZEK', 'a.IRpwTa', 'a._2UzuFa', 'a._2rpwqI', 'a[href*="/p/"]']; // Added ._2rpwqI
         for (const sel of linkSelectors) {
            const el = item.querySelector(sel);
            if (el && el.href) {
                link = el.href;
                if (link) break;
            }
        }
        if (link && !link.startsWith('http') && typeof document !== 'undefined') {
            link = new URL(link, document.baseURI).href;
        }


        let price = '';
        const priceSelectors = ['div._30jeq3._1_WHN1', 'div._30jeq3', 'div._1vC4OE', 'div[class*="price"]', '._25b18c ._30jeq3']; // Added ._25b18c ._30jeq3
         for (const sel of priceSelectors) {
            const el = item.querySelector(sel);
            if (el) {
                price = el.textContent.trim().replace(/[₹,MRP\s]/gi, '');
                if (price) break;
            }
        }

        let image = '';
        const imageSelectors = ['img._396cs4', 'img.product-image', 'img[src*="flixcart.com"]', '._396cs4', '._2r_T1I', '.CXW8mj img']; // Added ._2r_T1I
         for (const sel of imageSelectors) {
            const el = item.querySelector(sel);
            if (el && el.src && !el.src.startsWith('data:image')) {
                image = new URL(el.src, document.baseURI).href;
                if (image) break;
            }
         }
        return { title, price, image, link };
      }).filter(item => item.title && item.link); 
    }, searchResultItemSelector);
    
    return results.length > 0 ? results[0] : null;

  } catch (error) {
    console.error(`Flipkart search error for query "${query}":`, error.message);
    return null; 
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeFlipkart, searchFlipkart }; 
module.exports = { scrapeFlipkart, searchFlipkart }; 