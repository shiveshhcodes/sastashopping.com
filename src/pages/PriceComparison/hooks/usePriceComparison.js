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

  
    setTimeout(() => {
      setError('There is a small error in our server. Please try again later.');
      setLoading(false);
    }, 1200);
    return;

    // The rest of the code is unreachable but kept for reference
    /*
    try {
      // Validate URL before proceeding
      const validation = validateProductUrl(url);
      if (!validation.isValid) {
        setError(validation.error);
        setLoading(false);
        return;
      }

      // First, get the product details from the URL
      const productResponse = await fetch('http://localhost:5050/api/v1/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ url })
      });

      if (!productResponse.ok) {
        const errData = await productResponse.json();
        throw new Error(errData.error || 'Failed to fetch product details');
      }

      const productData = await productResponse.json();
      
      // Now send the product data to the comparison service
      const response = await fetch('http://localhost:5050/api/v1/compare', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          products: [productData],
          searchQuery: productData.title
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch comparison results');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to compare prices. Please try again.');
    } finally {
      setLoading(false);
    }
    */
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