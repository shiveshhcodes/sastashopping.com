const puppeteer = require('puppeteer');

/**
 * Scrapes product data from a given Flipkart product URL.
 * @param {string} url - The URL of the Flipkart product page.
 * @returns {Promise<object>} - A promise that resolves to an object containing product data.
 */
async function scrapeFlipkart(url) {
  let browser;
  let page;

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

    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,en-IN;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const blockList = ['google-analytics.com', 'googletagmanager.com', 'facebook.net', 'flipkartads.com'];
      if (
        blockList.some(domain => req.url().includes(domain)) ||
        ['font', 'media'].includes(req.resourceType())
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 80000 });

    const closeButtonSelector = 'button._2KpZ6l._2doB4z';
    if (await page.$(closeButtonSelector)) {
      try {
        await page.click(closeButtonSelector);
        await new Promise(resolve => setTimeout(resolve, 2000));
;
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
        await new Promise(resolve => setTimeout(resolve, 2000));
;
      } catch (e) {
        console.warn("Popup close failed, continuing...");
      }
    }

    // --- Wait for key product elements to be present ---
    const essentialSelectors = [
      'div[class*="_30jeq3"]', // Price
      '._2WkVRV',              // Brand
      '._2418kt li',           // Features
      'div._3LWZlK'            // Rating
    ];
    for (const sel of essentialSelectors) {
      try {
        await page.waitForSelector(sel, { timeout: 10000 });
      } catch (_) {}
    }

    // --- Scrape data from the page ---
    const data = await page.evaluate(() => {
      // Helper for multiple selectors
      const getText = (selectors) => {
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el && el.textContent && el.offsetHeight > 0 && el.offsetWidth > 0) {
            return el.textContent.trim();
          }
        }
        return '';
      };

      // --- JSON-LD Extraction ---
      const getJsonLdData = () => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        for (const script of scripts) {
          try {
            let jsonData = JSON.parse(script.textContent);
            if (Array.isArray(jsonData)) {
              const productGraph = jsonData.find(item => item['@graph'] && Array.isArray(item['@graph']));
              if (productGraph) {
                const productInGraph = productGraph['@graph'].find(item => item['@type'] === 'Product');
                if(productInGraph) return productInGraph;
              }
              const productDirect = jsonData.find(item => item['@type'] === 'Product');
              if (productDirect) return productDirect;
            } else if (jsonData['@type'] === 'Product') {
              return jsonData;
            } else if (jsonData['@graph'] && Array.isArray(jsonData['@graph'])) {
              const productInGraph = jsonData['@graph'].find(item => item['@type'] === 'Product');
              if(productInGraph) return productInGraph;
            }
          } catch (e) { /* Ignore parsing errors */ }
        }
        return null;
      };
      const jsonLd = getJsonLdData();

      // --- Brand ---
      const brandSelectors = [
        '._2WkVRV',
        '._1rcHFq',
        '._3yka2h',
        'meta[itemprop="brand"]',
        '.B_NuCI span',
        '.aMaAEs ._2whKao',
      ];
      let brand = '';
      if (jsonLd && jsonLd.brand && jsonLd.brand.name) {
        brand = jsonLd.brand.name.replace(/\s\s+/g, ' ').trim();
      }
      if (!brand) {
        brand = getText(brandSelectors);
      }
      if (!brand) {
        const metaBrand = document.querySelector('meta[itemprop="brand"]');
        if (metaBrand && metaBrand.content) brand = metaBrand.content.trim();
      }
      if (!brand) brand = '';

      // --- Title ---
      const titleSelectors = [
        'span.B_NuCI',
        '._35KyD6',
        '._3eAQiD',
        '._2FEgIe span',
        'h1._3qQ9m1',
        '._1YokD2 h1',
        '._7eCyvZ',
        '._2whKao',
        '._2J4zcy',
        '._1YokD2 .B_NuCI',
        'meta[property="og:title"]',
      ];
      let rawTitle = '';
      if (jsonLd && jsonLd.name) {
        rawTitle = jsonLd.name.replace(/\s\s+/g, ' ').trim();
      }
      if (!rawTitle) {
        for (const sel of titleSelectors) {
          let t = '';
          if (sel.startsWith('meta')) {
            const el = document.querySelector(sel);
            if (el && el.content) t = el.content.trim();
          } else {
            const el = document.querySelector(sel);
            if (el && el.textContent) t = el.textContent.trim();
          }
          if (t) {
            rawTitle = t;
            break;
          }
        }
      }
      if (!rawTitle) rawTitle = '';
      let productName = rawTitle;
      if (productName) {
        productName = productName.replace(/\s*Online at Best Price On Flipkart\.com.*/i, '').trim();
        productName = productName.replace(/\s*\|.*$/i, '').trim();
        productName = productName.replace(/\s*Buy .+? on Flipkart.*/i, '').trim();
      }
      if (brand && productName.toLowerCase().startsWith(brand.toLowerCase())) {
        productName = productName.substring(brand.length).trim();
      }
      let title = brand && productName ? `${brand} ${productName}`.trim() : (productName || brand);
      title = title.trim();
      title = title.split(/\s+/).slice(0, 8).join(' ');

      // --- Price ---
      let price = '';
      if (jsonLd && jsonLd.offers) {
        const offer = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers;
        if (offer && (offer.price || offer.lowPrice)) {
          price = offer.price || offer.lowPrice;
        }
      }
      if (!price) {
        const priceSelectors = [
          'div._30jeq3._16Jk6d',
          'div._30jeq3',
          'div._1vC4OE._3qQ9m1',
          'span._3I9_wc._2p6lqe',
          'div[class*="_30jeq3"]',
          '._16Jk6d',
          '._25b18c ._30jeq3',
          '._1vC4OE',
          'div._3I9_wc',
          'div._2twTWD span',
          'div._1vC4OE._3qQ9m1',
          'div._2Ix0io',
          'meta[itemprop="price"]',
        ];
        for (const sel of priceSelectors) {
          const el = document.querySelector(sel);
          if (el && el.textContent) {
            const match = el.textContent.replace(/,/g, '').match(/\d{3,}/);
            if (match && match[0]) {
              price = match[0];
              break;
            }
          }
        }
        if (!price) {
          const metaPrice = document.querySelector('meta[itemprop="price"]');
          if (metaPrice && metaPrice.content) price = metaPrice.content.replace(/[^\d]/g, '');
        }
      }
      if (price && !isNaN(parseFloat(price))) {
        price = `₹${parseFloat(price).toFixed(0)}`;
      } else {
        price = '';
      }

      // --- Image ---
      let image = '';
      if (jsonLd && jsonLd.image) {
        image = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image;
      }
      if (!image) {
        const mainImg = document.querySelector('img._396cs4._2amPTt._3qGmMb, img._2r_T1I._396cs4');
        if (mainImg && mainImg.src) {
          image = mainImg.src;
        } else {
          const galleryImg = document.querySelector('._2E1FGS img, .q6DClP img');
          if (galleryImg && galleryImg.src) image = galleryImg.src;
          if (!image) {
            const singleImg = document.querySelector('img._396cs4');
            if (singleImg && singleImg.src) image = singleImg.src;
          }
          if (!image) {
            const metaImg = document.querySelector('meta[property="og:image"]');
            if (metaImg && metaImg.content) image = metaImg.content;
          }
        }
      }
      if (image && !image.startsWith('http')) {
        try { image = new URL(image, document.baseURI).href; } catch(e) { image = ''; }
      }
      if (!image) image = '';

      // --- Category ---
      let category = '';
      if (jsonLd && jsonLd.category) {
        category = typeof jsonLd.category === 'string' ? jsonLd.category.split('>').pop().trim() : '';
      }
      if (!category) {
        const categorySelectors = [
          'div._1MR4o5 > div > a:nth-child(3)',
          'div._1MR4o5 > div > a:last-child',
          '.breadcrumb li:nth-child(3)',
          '.row ._21Ahn-',
          'meta[property="og:category"]',
          'a._2whKao',
          '._2whKao',
        ];
        for (const sel of categorySelectors) {
          let el = null;
          if (sel.startsWith('meta')) {
            el = document.querySelector(sel);
            if (el && el.content) {
              category = el.content.trim();
              break;
            }
          } else {
            el = document.querySelector(sel);
            if (el && el.textContent) {
              category = el.textContent.trim();
              break;
            }
          }
        }
      }
      if (!category) category = '';

      // --- Rating & Reviews ---
      let rating = '';
      let reviews = '';
      if (jsonLd && jsonLd.aggregateRating) {
        if (jsonLd.aggregateRating.ratingValue) rating = jsonLd.aggregateRating.ratingValue.toString();
        if (jsonLd.aggregateRating.reviewCount || jsonLd.aggregateRating.ratingCount) {
          reviews = (jsonLd.aggregateRating.reviewCount || jsonLd.aggregateRating.ratingCount).toString();
        }
      }
      if (!rating) {
        const ratingSels = ['div._3LWZlK', 'span._1lRcqv ._3LWZlK', 'div._2d4LTz'];
        rating = getText(ratingSels) || '';
      }
      if (!reviews) {
        const reviewsSels = ['span._2_R_DZ', 'span._13vcmD span:last-child'];
        const reviewsText = getText(reviewsSels);
        if (reviewsText) reviews = reviewsText.replace(/\D/g, '') || '';
      }
      if (rating && !rating.includes('/')) rating = `${parseFloat(rating).toFixed(1)}`;
      if (!rating) rating = '';
      if (!reviews) reviews = '';

      return {
        title,
        brand,
        price,
        category,
        image,
        rating,
        reviews
      };
    });

    return data;

  } catch (error) {
    console.error(`Error scraping Flipkart product: ${error.message}`);
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
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
    
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    const searchResultItemSelector = 'div._1AtVbE, div._2kHMtA, div[data-id], ._1xHGtK._373qXS, ._4ddWXP';
    const searchResultsContainerSelector = 'div._1YokD2._3Mn1Gg, div#container, ._1HmYoV._35HD7C';

    try {
      await page.waitForSelector(searchResultsContainerSelector, { timeout: 15000, visible: true });
      await page.waitForSelector(searchResultItemSelector, { timeout: 10000, visible: true });
    } catch (e) {
      const bodyContent = await page.content();
      if (bodyContent.toLowerCase().includes("no results found for") || bodyContent.toLowerCase().includes("couldn't find any products")) {
          console.log(`No search results found on Flipkart for query: "${query}"`);
          return [];
      }
      throw new Error(`Could not find search results container or items on Flipkart for query "${query}".`);
    }

    const results = await page.evaluate((itemSelector) => {
      const items = Array.from(document.querySelectorAll(itemSelector)).slice(0, 5);
      return items.map(item => {
        const titleEl = item.querySelector('a.s1Q9rs, div._4rR01T, a.IRpwTa');
        const title = titleEl?.title || titleEl?.textContent.trim() || '';

        const linkEl = item.querySelector('a[href*="/p/"]');
        const link = linkEl ? new URL(linkEl.href, document.baseURI).href : '';

        const priceEl = item.querySelector('div._30jeq3, div._1vC4OE');
        const price = priceEl ? priceEl.textContent.replace(/[^\d]/g, '') : '';

        const imgEl = item.querySelector('img._396cs4, ._2r_T1I, .CXW8mj img');
        const image = imgEl ? new URL(imgEl.src, document.baseURI).href : '';

        return { title, price, image, link };
      }).filter(item => item.title && item.link);
    }, searchResultItemSelector);
    
    return Array.isArray(results) ? results : [];

  } catch (error) {
    console.error(`Flipkart search error for query "${query}":`, error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeFlipkart, searchFlipkart };