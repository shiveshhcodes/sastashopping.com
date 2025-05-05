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
        product: { name: 'Example Product Name', imageUrl: 'https://placehold.co/100x100' },
        offers: [
          { retailer: 'Amazon', price: '$499', url: '#' },
          { retailer: 'Flipkart', price: '$489', url: '#' },
          { retailer: 'Myntra', price: '$495', url: '#' },
        ],
        recommendation: 'Based on current data, this is a favorable time to purchase.',
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