import { useState, useEffect } from 'react';

const usePriceComparison = (initialUrl = '') => {
  const [productUrl, setProductUrl] = useState(initialUrl);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const comparePrices = async (url) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log(`Attempting to compare prices for: ${url}`);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const simulatedResults = {
        product: { name: 'Example Product Name', imageUrl: 'https://placehold.co/100x100' },
        offers: [
          { retailer: 'Amazon', price: '$499', url: '#' },
          { retailer: 'Flipkart', price: '$510', url: '#' },
          { retailer: 'Walmart', price: '$489', url: '#' },
        ],
        recommendation: 'Based on current data, this is a favorable time to purchase.',
        chartData: [
          { month: 'Aug', price: 450 }, { month: 'Sep', price: 550 }, { month: 'Oct', price: 520 },
          { month: 'Nov', price: 480 }, { month: 'Dec', price: 490 }, { month: 'Jan', price: 510 },
          { month: 'Feb', price: 530 }, { month: 'Mar', price: 500 }, { month: 'April', price: 600 }
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