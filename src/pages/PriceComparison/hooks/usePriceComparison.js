import { useState, useEffect } from 'react';

const usePriceComparison = (initialUrl = '') => {
  const [productUrl, setProductUrl] = useState(initialUrl);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateProductUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Check if the URL is from supported retailers
      if (!hostname.includes('amazon.') && 
          !hostname.includes('flipkart.com') && 
          !hostname.includes('myntra.com')) {
        return {
          isValid: false,
          error: 'Currently we only support Amazon, Flipkart, and Myntra products for price comparison.'
        };
      }

      // Validate Amazon URL
      if (hostname.includes('amazon.')) {
        if (!urlObj.pathname.includes('/dp/') && !urlObj.pathname.includes('/gp/product/')) {
          return {
            isValid: false,
            error: 'Please enter a valid Amazon product URL'
          };
        }
      }

      // Validate Flipkart URL
      if (hostname.includes('flipkart.com')) {
        if (!urlObj.pathname.includes('/p/')) {
          return {
            isValid: false,
            error: 'Please enter a valid Flipkart product URL'
          };
        }
      }

      // Validate Myntra URL
      if (hostname.includes('myntra.com')) {
        if (!urlObj.pathname.includes('/buy')) {
          return {
            isValid: false,
            error: 'Please enter a valid Myntra product URL'
          };
        }
      }

      return { isValid: true };
    } catch (err) {
      return {
        isValid: false,
        error: 'Please enter a valid URL'
      };
    }
  };

  const comparePrices = async (url) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Validate URL before proceeding
      const validation = validateProductUrl(url);
      if (!validation.isValid) {
        setError(validation.error);
        setLoading(false);
        return;
      }

      console.log(`Attempting to compare prices for: ${url}`);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const simulatedResults = {
        product: { 
          name: 'Example Product Name', 
          imageUrl: 'https://placehold.co/100x100' 
        },
        offers: [
          {
            retailer: 'Amazon',
            title: 'Premium Wireless Headphones with Noise Cancellation',
            price: '$499',
            originalPrice: '$599',
            discount: 17,
            imageUrl: 'https://placehold.co/400x400',
            url: '#',
            rating: 4.5,
            reviews: 1280,
            features: [
              'Active Noise Cancellation',
              '40-hour battery life',
              'Bluetooth 5.0',
              'Built-in microphone'
            ]
          },
          {
            retailer: 'Flipkart',
            title: 'Premium Wireless Headphones with Noise Cancellation',
            price: '$489',
            originalPrice: '$599',
            discount: 18,
            imageUrl: 'https://placehold.co/400x400',
            url: '#',
            rating: 4.3,
            reviews: 856,
            features: [
              'Active Noise Cancellation',
              '35-hour battery life',
              'Bluetooth 5.0',
              'Built-in microphone'
            ]
          },
          {
            retailer: 'Myntra',
            title: 'Premium Wireless Headphones with Noise Cancellation',
            price: '$495',
            originalPrice: '$599',
            discount: 17,
            imageUrl: 'https://placehold.co/400x400',
            url: '#',
            rating: 4.4,
            reviews: 642,
            features: [
              'Active Noise Cancellation',
              '38-hour battery life',
              'Bluetooth 5.0',
              'Built-in microphone'
            ]
          }
        ],
        recommendation: 'Based on current data, this is a favorable time to purchase. The price is at its lowest in the last 3 months.',
        chartData: [
          { month: 'Aug', price: 450 }, { month: 'Sep', price: 550 }, { month: 'Oct', price: 520 },
          { month: 'Nov', price: 480 }, { month: 'Dec', price: 490 }, { month: 'Jan', price: 510 },
          { month: 'Feb', price: 499 }
        ],
      };

      setResults(simulatedResults);

    } catch (err) {
      console.error("Price comparison error:", err);
      setError(err.message || "Failed to compare prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    productUrl,
    setProductUrl,
    results,
    loading,
    error,
    comparePrices,
  };
};

export default usePriceComparison; 