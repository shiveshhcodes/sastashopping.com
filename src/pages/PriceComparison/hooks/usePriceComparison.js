import { useState } from 'react';

const SORRY_MOCK_RESULTS = [
  {
    title: "Sorry, couldn't fetch data",
    price: '-',
    link: 'https://www.amazon.in/',
    source: 'amazon',
    thumbnail: ''
  },
  {
    title: "Sorry, couldn't fetch data",
    price: '-',
    link: 'https://www.flipkart.com/',
    source: 'flipkart',
    thumbnail: ''
  },
  {
    title: "Sorry, couldn't fetch data",
    price: '-',
    link: 'https://www.myntra.com/',
    source: 'myntra',
    thumbnail: ''
  }
];

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

      // Set up a 13 second timeout for the fetch
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 13000);
      let data;
      try {
        const response = await fetch('http://localhost:5050/api/compare-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ url }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Failed to fetch comparison results.');
          setResults(SORRY_MOCK_RESULTS);
          setLoading(false);
          return;
        }
      } catch (err) {
        clearTimeout(timeout);
        setError('Sorry, couldn\'t fetch data, please try again.');
        setResults(SORRY_MOCK_RESULTS);
        setLoading(false);
        return;
      }
      setResults(data.results || SORRY_MOCK_RESULTS);
      setError(null);
    } catch (err) {
      setError('Sorry, couldn\'t fetch data, please try again.');
      setResults(SORRY_MOCK_RESULTS);
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