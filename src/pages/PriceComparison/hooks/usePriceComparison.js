import { useState, useEffect } from 'react';

const usePriceComparison = (initialUrl = '') => {
  const [productUrl, setProductUrl] = useState(initialUrl);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateProductUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return {
        isValid: false,
        error: 'Please enter a product link.'
      };
    }
    // Accept any non-empty string as a valid product link
    return { isValid: true };
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

      const response = await fetch('http://localhost:5050/api/v1/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch comparison results');
      }
      const data = await response.json();
      setResults({ offers: data.offers });
    } catch (err) {
      setError(err.message || 'Failed to compare prices. Please try again.');
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