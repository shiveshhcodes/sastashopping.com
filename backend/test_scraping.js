const { scrapeProductData, getComparisonData } = require('./utils/scraper');
const logger = require('./utils/logger');

// Test URLs for each platform
const testUrls = {
    amazon: 'https://www.amazon.in/dp/B0B4N6JQK5', // Example: iPhone 13
    flipkart: 'https://www.flipkart.com/apple-iphone-13-midnight-128-gb/p/itmca361aab1c5cb', // Example: iPhone 13
    myntra: 'https://www.myntra.com/shirts/levis/levis-men-blue-slim-fit-solid-casual-shirt/10371290/buy' // Example: Levi's shirt
};

async function testScraping() {
    logger.info('Starting scraping tests...');

    for (const [platform, url] of Object.entries(testUrls)) {
        try {
            logger.info(`Testing ${platform} scraping with URL: ${url}`);
            const result = await scrapeProductData(url);
            logger.info(`${platform} scraping result:`, result);
        } catch (error) {
            logger.error(`Error scraping ${platform}:`, error);
        }
    }
}

async function testComparison() {
    try {
        // Test with Amazon URL
        const amazonUrl = testUrls.amazon;
        logger.info('Testing comparison with Amazon URL:', amazonUrl);
        
        const comparisonResult = await getComparisonData(amazonUrl);
        logger.info('Comparison result:', comparisonResult);
    } catch (error) {
        logger.error('Error in comparison test:', error);
    }
}

// Run tests
async function runTests() {
    await testScraping();
    await testComparison();
}

runTests().catch(error => {
    logger.error('Test suite failed:', error);
    process.exit(1);
}); 