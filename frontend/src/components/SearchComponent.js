import React, { useState } from 'react';
import ProductComparison from './ProductComparison';
import './SearchComponent.css';

const SearchComponent = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [rawApiResponse, setRawApiResponse] = useState(null); // For debug
  const [compareClicked, setCompareClicked] = useState(false); // For debug

  const detectPlatform = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('amazon')) return 'amazon';
      if (urlObj.hostname.includes('flipkart')) return 'flipkart';
      if (urlObj.hostname.includes('myntra')) return 'myntra';
      return null;
    } catch (e) {
      return null;
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setComparisonData(null);
    setRawApiResponse(null);
    setCompareClicked(true);

    try {
      // POST to the correct backend endpoint
      const response = await fetch('/api/v1/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch comparison results');
      }

      const data = await response.json();
      setRawApiResponse(data);

      // Convert offers array to object keyed by platform
      const offersByPlatform = { amazon: null, flipkart: null, myntra: null };
      if (Array.isArray(data.offers)) {
        data.offers.forEach(offer => {
          if (offer.platform) offersByPlatform[offer.platform.toLowerCase()] = offer;
        });
      }

      // Find the source platform
      const platform = detectPlatform(url);

      setComparisonData({
        sourceProduct: {
          ...(offersByPlatform[platform] || {}),
          platform,
        },
        matchedProducts: offersByPlatform,
      });
    } catch (err) {
      setError(err.message || 'An error occurred while searching for products');
      // Fallback: always show three dummy blocks for debug
      const dummyProduct = {
        title: 'Sample Product',
        brand: 'Sample Brand',
        price: '9999',
        image: 'https://via.placeholder.com/300x300?text=Sample+Image',
        keyFeatures: ['Feature 1', 'Feature 2'],
        category: 'Sample Category',
        url: '#'
      };
      setComparisonData({
        sourceProduct: { ...dummyProduct, platform: 'amazon' },
        matchedProducts: {
          amazon: dummyProduct,
          flipkart: dummyProduct,
          myntra: dummyProduct,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && url) {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Paste Amazon, Flipkart, or Myntra product URL"
          className="search-input"
          disabled={loading}
        />
        <button 
          onClick={handleSearch}
          disabled={loading || !url}
          className="search-button"
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Searching for products...</p>
        </div>
      )}

      {comparisonData && !loading && (
        <>
          <ProductComparison
            sourceProduct={comparisonData.sourceProduct}
            matchedProducts={comparisonData.matchedProducts}
          />
          {/* Debug info */}
          <div style={{marginTop: 20, color: '#888', fontSize: 12}}>
            <strong>Debug Info:</strong>
            <pre>{JSON.stringify(rawApiResponse, null, 2)}</pre>
          </div>
        </>
      )}
      {/* If compare was clicked but no data, show a message */}
      {compareClicked && !comparisonData && !loading && (
        <div style={{color: 'red', marginTop: 20}}>
          No comparison data available. Please check your backend/API.
        </div>
      )}
    </div>
  );
};

export default SearchComponent; 