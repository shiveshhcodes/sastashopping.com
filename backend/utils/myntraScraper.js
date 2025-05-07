const puppeteer = require('puppeteer');

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
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ]
    });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Upgrade-Insecure-Requests': '1'
    });
    
    await page.goto(url, {
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    // Check for error or bot protection page
    const bodyText = await page.evaluate(() => document.body.innerText);
    const pageTitle = await page.title();

    if (bodyText.toLowerCase().includes('something went wrong') || bodyText.toLowerCase().includes('unavailable') || pageTitle.toLowerCase().includes('oops') || pageTitle.toLowerCase().includes('error')) {
      throw new Error('Myntra is showing an error page, "something went wrong", or the product is unavailable.');
    }
    if (bodyText.toLowerCase().includes('verify you are human') || bodyText.toLowerCase().includes('security check')) {
        throw new Error('Myntra is showing a security check or human verification step.');
    }

    // Wait for product title to load with multiple possible selectors
    const titleSelectors = [
        'h1.pdp-title',         
        'h1.pdp-name',          
        '.pdp-title',           
        'h1[class*="title"]'    
    ];
    let titleFound = false;
    for (const selector of titleSelectors) {
        try {
            await page.waitForSelector(selector, { timeout: 10000 }); // Increased timeout slightly
            titleFound = true;
            break;
        } catch (e) { /* Selector not found, try next */ }
    }

    if (!titleFound) {
        throw new Error(`Could not extract product title from Myntra (URL: ${url}). All known selectors failed. The page may be protected, unavailable, or its structure has significantly changed.`);
    }

    const data = await page.evaluate(() => {
      const getText = (selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el) return el.textContent.trim();
        }
        return '';
      };

      const getPrice = (selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent) {
            return el.textContent.trim().replace(/[₹,Rs.\s]/gi, ''); // Clean price string
          }
        }
        return '';
      };
      
      const getImage = (selectors) => {
          for (const selector of selectors) {
              const img = document.querySelector(selector);
              if (img && img.src && !img.src.startsWith('data:image')) {
                  return img.src;
              }
              const divWithBg = document.querySelector(selector);
              if (divWithBg) {
                  const style = window.getComputedStyle(divWithBg);
                  const bgImage = style.getPropertyValue('background-image');
                  if (bgImage && bgImage !== 'none') {
                      const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
                      if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:image')) {
                          return urlMatch[1];
                      }
                  }
              }
          }
          const pictureSource = document.querySelector('.image-grid-image picture source[type="image/webp"], .image-grid-image picture source');
          if (pictureSource && pictureSource.srcset) {
              const sources = pictureSource.srcset.split(',').map(s => s.trim().split(' ')[0]);
              if (sources.length > 0 && !sources[0].startsWith('data:image')) return sources[0];
          }
          const pictureImg = document.querySelector('.image-grid-image picture img');
          if (pictureImg && pictureImg.src && !pictureImg.src.startsWith('data:image')) return pictureImg.src;
          return '';
      };

      const getFeatures = (selectors) => {
         let features = [];
         for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                features = Array.from(elements)
                    .map(el => el.textContent.trim())
                    .filter(f => f && f.length < 200 && f.length > 3); 
                if (features.length > 0) break;
            }
         }
         return Array.from(new Set(features)); 
      };

      const brandText = getText(['h1.pdp-title']); 
      const nameText = getText(['h1.pdp-name']);  

      let productTitle = nameText;
      let productBrand = brandText;

      if (!productTitle && brandText) { 
          const titleParts = brandText.split(' ');
          if (titleParts.length > 1) {
              productBrand = titleParts[0];
              productTitle = titleParts.slice(1).join(' ');
          } else {
              productTitle = brandText; 
          }
      } else if (productTitle && productBrand && productTitle.toLowerCase().startsWith(productBrand.toLowerCase())) {
          productTitle = productTitle.substring(productBrand.length).trim();
      }

      const priceSels = ['.pdp-price strong', '.pdp-discountedPrice', 'span[class*="price"] strong', 'span.price-value', '.priceDetail-sellingPrice .price-value'];
      const imageSels = [
          '.image-grid-image', 
          'div.image-grid-container img', 
          'picture img', 
          'img.product-image',
          '.image-grid-col .image-grid-image' // More specific for Myntra's grid
      ];
      const featureSels = [
          '.pdp-product-description-content .pdp-list li', 
          '.pdp-keyFeatures li',
          'ul.index-tableContainer li .index-row', 
          'div[class*="product-details"] li',
          '.meta-description-餑Myntra' // Myntra specific meta description class
      ];
      const categorySels = ['.breadcrumbs-container a', '.breadcrumbs-item a', '.breadcrumbs-link']; 
      const ratingSels = ['.index-overallRating .index-value', '.rating-value', 'div[class*="ratingsContainer"] span[class*="value"]', '.pdp-ratings-overallRatingValue'];
      const reviewsSels = ['.index-ratingsCount', '.reviews-count', 'span[class*="ratingsContainer"] span[class*="count"]', '.pdp-ratings-totalRatings'];
      
      let categoryText = '';
      const catElements = document.querySelectorAll(categorySels.join(', '));
      if (catElements.length > 0) {
          categoryText = Array.from(catElements).map(el => el.textContent.trim()).filter(Boolean).join(' > ');
      }

      return {
        title: productTitle || "N/A", // Ensure title is not empty
        brand: productBrand || "N/A",   // Ensure brand is not empty
        price: getPrice(priceSels),
        image: getImage(imageSels),
        keyFeatures: getFeatures(featureSels),
        category: categoryText,
        rating: getText(ratingSels),
        reviews: getText(reviewsSels).replace(/\D/g, ''), 
      };
    });

    if (!data.title || data.title === "N/A") {
        console.warn(`Warning: Product title was not found for Myntra URL: ${url}. Data might be incomplete.`, data);
    }
    return data;

  } catch (error) {
    console.error(`Error in scrapeMyntra for URL ${url}:`, error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
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
    const searchUrl = `https://www.myntra.com/search/${encodeURIComponent(cleanQuery)}`; // Using search path

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
        if (link && !link.startsWith('http') && typeof document !== 'undefined') { // Check for document for baseURI
            link = new URL(link, document.baseURI).href;
        }

        const priceEl = item.querySelector('.product-discountedPrice, span.product-strike > span'); // Adjusted selector for strike price
        let price = priceEl ? priceEl.textContent.trim().replace(/[₹,Rs.\s]/gi, '') : '';
        if (!price) { 
            const originalPriceEl = item.querySelector('.product-price'); // Fallback for non-discounted
            if (originalPriceEl) price = originalPriceEl.textContent.trim().replace(/[₹,Rs.\s]/gi, '');
        }

        const imageEl = item.querySelector('picture img, .product-image img'); 
        let image = '';
        if (imageEl) {
            image = imageEl.src || (imageEl.dataset && imageEl.dataset.src); 
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

module.exports = { scrapeMyntra, searchMyntra }; 