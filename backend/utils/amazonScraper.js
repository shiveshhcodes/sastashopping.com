const axios = require("axios");

const APIFY_TOKEN = "apify_api_VQ81CA6UpewLZ2nMfJI5NZmwkUy3JF00Ez4i";

/**
 * Scrape Amazon product data using a direct URL via Apify
 * @param {string} productUrl - Full Amazon product link (IN domain recommended)
 * @returns {object[]} - List of scraped product data
 */
async function scrapeAmazonProductByUrl(productUrl) {
  try {
    // 1. Start the Apify Amazon Scraper actor with input URL
    const startRunResponse = await axios.post(
      `https://api.apify.com/v2/acts/epctex~amazon-scraper/runs?token=${APIFY_TOKEN}`,
      {
        directUrls: [productUrl],
        maxItems: 1,
        country: "IN",
        proxy: {
          useApifyProxy: true
        }
      }
    );

    const runId = startRunResponse.data.data.id;

    // 2. Poll until run completes
    let runStatus = "RUNNING";
    while (runStatus === "RUNNING" || runStatus === "READY") {
      await new Promise((r) => setTimeout(r, 3000)); // Wait 3 sec
      const runStatusCheck = await axios.get(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
      );
      runStatus = runStatusCheck.data.data.status;
    }

    // 3. Fetch dataset result
    const result = await axios.get(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`
    );

    return result.data;
  } catch (error) {
    console.error("Apify Amazon Scraper failed:", error.message);
    return null;
  }
}

module.exports = {
  scrapeAmazonProductByUrl
};