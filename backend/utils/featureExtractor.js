const logger = require('./logger');

// Known brands for better matching
const KNOWN_BRANDS = [
    // Electronics
    'apple', 'samsung', 'xiaomi', 'oneplus', 'google', 'sony', 'lg', 'motorola', 'nokia', 'asus',
    // Fashion
    'levis', 'nike', 'adidas', 'puma', 'reebok', 'zara', 'h&m', 'gucci', 'prada', 'versace',
    // Add more brands as needed
];

// Storage patterns
const STORAGE_PATTERNS = [
    /(\d+\s*(GB|TB))/i,
    /(\d+)\s*(MB|GB|TB)/i,
    /(\d+)(?:GB|TB)/i
];

// Color patterns
const COLOR_PATTERNS = [
    /(black|white|blue|red|green|yellow|purple|pink|gray|silver|gold|midnight|space gray|starlight)/i,
    /(navy|beige|brown|orange|violet|indigo|maroon|olive|teal|cyan)/i
];

// Size patterns
const SIZE_PATTERNS = [
    /(XS|S|M|L|XL|XXL|XXXL)/i,
    /(\d+)\s*(inch|inches|"|')/i
];

function extractFeatures(title, description = '', additionalData = {}) {
    const features = {};
    const textToSearch = `${title} ${description}`.toLowerCase();

    // Extract brand
    for (const brand of KNOWN_BRANDS) {
        if (textToSearch.includes(brand)) {
            features.brand = brand.charAt(0).toUpperCase() + brand.slice(1);
            break;
        }
    }

    // Extract storage
    for (const pattern of STORAGE_PATTERNS) {
        const match = textToSearch.match(pattern);
        if (match) {
            features.storage = match[0].toUpperCase();
            break;
        }
    }

    // Extract color
    for (const pattern of COLOR_PATTERNS) {
        const match = textToSearch.match(pattern);
        if (match) {
            features.color = match[1].charAt(0).toUpperCase() + match[1].slice(1);
            break;
        }
    }

    // Extract size
    for (const pattern of SIZE_PATTERNS) {
        const match = textToSearch.match(pattern);
        if (match) {
            features.size = match[0].toUpperCase();
            break;
        }
    }

    // Extract model number/identifier
    const modelPatterns = [
        /[A-Z]{2,3}-\d{3,4}/,  // Common model number pattern
        /[A-Z]{2,3}\d{3,4}/,   // Model number without hyphen
        /[A-Z]\d{3,4}[A-Z]?/,  // Alternative pattern
        /[A-Z]{2,3}\d{2,3}[A-Z]?/  // Another common pattern
    ];

    for (const pattern of modelPatterns) {
        const match = title.match(pattern);
        if (match) {
            features.identifier = match[0];
            break;
        }
    }

    // Extract RAM if present
    const ramMatch = textToSearch.match(/(\d+)\s*(GB|MB)\s*RAM/i);
    if (ramMatch) {
        features.ram = ramMatch[0].toUpperCase();
    }

    // Add any additional features from the platform-specific data
    if (additionalData) {
        Object.assign(features, additionalData);
    }

    // Log the extracted features for debugging
    logger.debug('Extracted features:', { title, features });

    return features;
}

function normalizePrice(priceStr) {
    if (!priceStr) return null;
    
    // Remove currency symbols and commas
    const numericStr = priceStr.replace(/[₹$€£,]/g, '');
    
    // Extract the first number found
    const match = numericStr.match(/\d+(\.\d+)?/);
    if (match) {
        return parseFloat(match[0]);
    }
    
    return null;
}

function createStandardProductObject(rawData, platform) {
    const {
        title,
        price,
        url,
        imageUrl,
        description,
        additionalFeatures = {}
    } = rawData;

    return {
        title: title || '',
        price: normalizePrice(price),
        url: url || '',
        imageUrl: imageUrl || '',
        platform: platform,
        features: extractFeatures(title, description, additionalFeatures)
    };
}

module.exports = {
    extractFeatures,
    normalizePrice,
    createStandardProductObject,
    KNOWN_BRANDS,
    STORAGE_PATTERNS,
    COLOR_PATTERNS,
    SIZE_PATTERNS
}; 