const puppeteer = require('puppeteer');

/**
 * Scrapes product data from a given Myntra product URL.
 * @param {string} url - The URL of the Myntra product page.
 * @returns {Promise<object>} - A promise that resolves to an object containing product data.
 * @throws {Error} - If scraping fails.
 */
async function scrapeMyntra(url) {
  let browser;
  // Define page in a broader scope if needed for debugging in finally block
  // let page; 
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
    const page = await browser.newPage(); // Assign page here

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
      timeout: 120000  // Increased timeout as per user's code
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
            await page.waitForSelector(selector, { timeout: 10000 }); 
            titleFound = true;
            break;
        } catch (e) { /* Selector not found, try next */ }
    }

    if (!titleFound) {
        // For debugging:
        // const screenshotPath = `myntra_title_fail_${Date.now()}.png`;
        // await page.screenshot({ path: screenshotPath });
        // console.error(`Debug screenshot for Myntra title failure (URL: ${url}) saved to ${screenshotPath}.`);
        throw new Error(`Could not extract product title from Myntra (URL: ${url}). All known selectors failed. The page may be protected, unavailable, or its structure has significantly changed.`);
    }

    const data = await page.evaluate(() => {
      const getText = (selectors, context = document) => {
        for (const selector of selectors) {
          const el = context.querySelector(selector);
          if (el) return el.textContent.trim();
        }
        return '';
      };

      const getPrice = (selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el) {
            let textContent = el.textContent || "";
            // Regex to find a sequence of digits, possibly with commas and a decimal point.
            // This aims to extract the primary numerical value.
            const priceMatch = textContent.match(/([0-9,]+\.?[0-9]*)/);
            if (priceMatch && priceMatch[1]) {
              const numericString = priceMatch[1].replace(/,/g, ''); // Remove commas
              if (!isNaN(parseFloat(numericString))) {
                // Assuming prices like ₹2789 are whole numbers as per example.
                // Use toFixed(2) if you expect paisa values (e.g., ₹2789.50).
                return `₹${parseFloat(numericString).toFixed(0)}`; 
              }
            }
          }
        }
        return null; // Return null if no valid price found after checking all selectors
      };

      const getImage = (selectors) => {
          for (const selector of selectors) {
              const img = document.querySelector(selector);
              if (img && img.src && !img.src.startsWith('data:image')) {
                  return new URL(img.src, document.baseURI).href; 
              }
              const divWithBg = document.querySelector(selector);
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
          }
          const pictureSource = document.querySelector('.image-grid-image picture source[type="image/webp"], .image-grid-image picture source');
          if (pictureSource && pictureSource.srcset) {
              const sources = pictureSource.srcset.split(',').map(s => s.trim().split(' ')[0]);
              if (sources.length > 0 && !sources[0].startsWith('data:image')) return new URL(sources[0], document.baseURI).href;
          }
          const pictureImg = document.querySelector('.image-grid-image picture img');
          if (pictureImg && pictureImg.src && !pictureImg.src.startsWith('data:image')) return new URL(pictureImg.src, document.baseURI).href;
          return '';
      };

      const getFeatures = (selectors) => {
         let features = [];
         const descriptionContent = document.querySelector('.pdp-product-description-content');
         if (descriptionContent) {
            let fullText = descriptionContent.innerText || descriptionContent.textContent || "";
            const listItems = descriptionContent.querySelectorAll('li');
            if (listItems.length > 0) {
                features = Array.from(listItems)
                    .map(li => li.textContent.trim())
                    .filter(f => f && f.length > 5 && f.length < 250); 
            } else {
                features = fullText.split(/\r?\n|\. |; /)
                    .map(f => f.trim())
                    .filter(f => f && f.length > 10 && f.length < 300); 
            }
         }

         if (features.length < 2) { 
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    const newFeatures = Array.from(elements)
                        .map(el => el.textContent.trim())
                        .filter(f => f && f.length > 3 && f.length < 200 && !features.includes(f)); 
                    features.push(...newFeatures);
                    if (features.length > 5) break; 
                }
            }
         }
         return Array.from(new Set(features)).slice(0, 10); 
      };
      
      let productBrand = getText(['h1.pdp-title', '.pdp-title']); 
      let actualProductName = getText(['h1.pdp-name', '.pdp-name']); 

      if (!actualProductName && productBrand) { 
        const brandWords = productBrand.split(' ');
        let potentialBrandFromMeta = '';
        const ogBrandMeta = document.querySelector('meta[property="og:brand"]');
        if (ogBrandMeta) potentialBrandFromMeta = ogBrandMeta.content;
        
        if (!potentialBrandFromMeta) {
            const twitterBrandMeta = document.querySelector('meta[name="twitter:d1"]'); // Myntra uses twitter:d1 for brand
            if (twitterBrandMeta) potentialBrandFromMeta = twitterBrandMeta.content;
        }

        if (potentialBrandFromMeta && productBrand.toLowerCase().includes(potentialBrandFromMeta.toLowerCase())) {
            actualProductName = productBrand.replace(new RegExp(potentialBrandFromMeta, 'i'), '').trim();
            productBrand = potentialBrandFromMeta;
        } else if (brandWords.length > 1 && brandWords[0].toUpperCase() === brandWords[0] && brandWords[0].length > 2) { // Heuristic: first word all caps and length > 2
            actualProductName = brandWords.slice(1).join(' ').trim();
            // productBrand remains brandWords[0]
        } else {
             actualProductName = productBrand; 
             productBrand = potentialBrandFromMeta || getText(['.pdp-details .pdp-supplierIntegration-container > span']) || ''; 
        }
      } else if (actualProductName && productBrand && actualProductName.toLowerCase().startsWith(productBrand.toLowerCase())) {
          actualProductName = actualProductName.substring(productBrand.length).trim();
      }
      
      if (productBrand.toLowerCase().includes('more by ')) {
          productBrand = productBrand.substring(productBrand.toLowerCase().indexOf('more by ') + 'more by '.length).trim();
      }

      let displayTitle = actualProductName || "";

      const ratingValueText = getText(['.index-overallRating .index-value', '.rating-value', '.pdp-ratings-overallRatingValue']);
      const reviewCountText = getText(['.index-ratingsCount', '.reviews-count', '.pdp-ratings-totalRatings']).replace(/\D/g, '');
      let reviewDisplay = "N/A";
      if (ratingValueText && reviewCountText) {
        reviewDisplay = `${ratingValueText} ★ (${reviewCountText} reviews)`;
      } else if (ratingValueText) {
        reviewDisplay = `${ratingValueText} ★`;
      } else if (reviewCountText) {
        reviewDisplay = `(${reviewCountText} reviews)`;
      }

      const categorySels = ['.breadcrumbs-container li:not(:last-child) a', '.breadcrumbs-item:not(:last-child) a']; 
      let categoryText = '';
      const catElements = document.querySelectorAll(categorySels.join(', '));
      if (catElements.length > 0) {
          const allCats = Array.from(catElements).map(el => el.textContent.trim()).filter(Boolean);
          // Prefer the last significant category from breadcrumbs
          categoryText = allCats.length > 0 ? allCats[allCats.length-1] : ''; 
      } else {
          categoryText = getText(['.breadcrumbs-container span:last-of-type', '.breadcrumbs-container li:last-child span', '.breadcrumbs-item:last-child span']); 
      }
      if (!categoryText) { 
          const metaKeywords = document.querySelector('meta[name="keywords"]');
          if (metaKeywords && metaKeywords.content) {
              categoryText = metaKeywords.content.split(',')[0].trim(); 
          }
      }
      if (categoryText) categoryText = categoryText.replace(/^>\s*|\s*>$/g, '').trim();


      const featureSelsForEval = [ 
          '.pdp-keyFeatures li', 
          'ul.index-tableContainer li .index-row', 
          'div[class*="product-details"] li',
          '.pdp-product-description-content ul li', 
      ];
      let productFeatures = getFeatures(featureSelsForEval);
      if (!productFeatures || productFeatures.length === 0) {
          const descText = getText(['.pdp-product-description-content', '.meta-description-餑Myntra']); // Myntra specific class for meta description
          if (descText) productFeatures = [descText.substring(0, 300) + (descText.length > 300 ? '...' : '')]; 
      }

      // Price selectors - prioritize those likely to contain the final selling price
      const priceSels = [
          '.pdp-price strong', // Often contains the final price
          '.pdp-discountedPrice', // Specifically for discounted price
          '.priceDetail-sellingPrice .price-value', // From your example structure
          'span.price-value', // Generic value span
          'span[class*="price"] strong' // More general price in a strong tag
        ];
      
      return {
        title: displayTitle,
        brand: productBrand || "",
        price: getPrice(priceSels) || "₹N/A", // Default to ₹N/A if getPrice returns null
        image: getImage([
            '.image-grid-image', 
            '.image-grid-col .image-grid-image div[style*="background-image"]', 
            'div.image-grid-container img',
            'picture img',
            'img.product-image'
        ]),
        keyFeatures: productFeatures, 
        category: categoryText || "",
        ratingReview: reviewDisplay, 
        rating: ratingValueText || "N/A",
        reviews: reviewCountText || "N/A",
      };
    });

    if (!data.title || data.title === "") {
        console.warn(`Warning: Product title was not found for Myntra URL: ${url}. Data might be incomplete.`, data);
    }
    // The price is already formatted as ₹NUMBER or ₹N/A by the getPrice function or the default.

    return data;

  } catch (error) {
    console.error(`Error in scrapeMyntra for URL ${url}:`, error.message);
    // For debugging:
    // if (page) { 
    //   try {
    //      const errorHtml = await page.content();
    //      require('fs').writeFileSync(`myntra_error_${Date.now()}.html`, errorHtml);
    //      console.log("Saved Myntra error page HTML for debugging.");
    //   } catch (htmlError) {
    //      console.error("Could not save error HTML:", htmlError);
    //   }
    // }
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

module.exports = { scrapeMyntra, searchMyntra };
