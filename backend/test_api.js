const axios = require('axios');
const logger = require('./utils/logger');

const API_BASE_URL = 'http://localhost:5050/api/v1';
const COMPARISON_SERVICE_URL = 'http://localhost:8000';

// Sample product data
const sampleProduct = {
    title: "Apple iPhone 13 (128GB) - Midnight",
    platform: "amazon",
    price: "₹59,900",
    url: "https://www.amazon.in/dp/B0B4N6JQK5",
    category: "Electronics",
    brand: "Apple"
};

// Test payloads
const testPayloads = {
    valid: {
        product: sampleProduct,
        platforms: ["amazon", "flipkart", "myntra"]
    },
    invalid: {
        product: {
            title: "Test Product",
            // Missing required fields
        },
        platforms: []
    }
};

async function testHealthEndpoints() {
    try {
        // Test Node.js backend health
        const nodeHealth = await axios.get(`${API_BASE_URL}/health`);
        logger.info('Node.js backend health:', nodeHealth.data);

        // Test Python service health
        const pythonHealth = await axios.get(`${COMPARISON_SERVICE_URL}/health`);
        logger.info('Python service health:', pythonHealth.data);
    } catch (error) {
        logger.error('Health check failed:', error.message);
    }
}

async function testComparisonEndpoint() {
    try {
        // Test valid request
        logger.info('Testing valid comparison request...');
        const validResponse = await axios.post(`${API_BASE_URL}/compare`, testPayloads.valid);
        logger.info('Valid request response:', validResponse.data);

        // Test invalid request
        logger.info('Testing invalid comparison request...');
        try {
            await axios.post(`${API_BASE_URL}/compare`, testPayloads.invalid);
        } catch (error) {
            logger.info('Invalid request handled correctly:', error.response.data);
        }
    } catch (error) {
        logger.error('Comparison endpoint test failed:', error.message);
    }
}

// Run tests
async function runApiTests() {
    await testHealthEndpoints();
    await testComparisonEndpoint();
}

runApiTests().catch(error => {
    logger.error('API test suite failed:', error);
    process.exit(1);
}); 