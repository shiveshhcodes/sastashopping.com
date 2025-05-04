import React from 'react';
import '../styles/PriceComparisonStyles.css';

function PriceComparisonHeader({ productUrl, setProductUrl, handleCompareClick, loading }) {
  return (
    <div className="row justify-content-center text-center mb-4 pb-2">
      <div className="col-12 col-lg-10">
        <h1 className="display-3 fw-bold mb-2 compare-title">Compare prices for your product</h1>
        <p className="lead text-muted mx-auto mb-4 compare-subtitle" style={{ maxWidth: '600px' }}>
          Find the best deals for any product with our powerful comparison tool.
        </p>
        <form className="d-flex justify-content-center align-items-center gap-2 flex-wrap" onSubmit={e => { e.preventDefault(); handleCompareClick(); }}>
          <input
            type="text"
            className="form-control form-control-lg rounded-pill input-shadow compare-input"
            placeholder="Enter product URL"
            aria-label="Enter product URL"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            style={{ maxWidth: 400 }}
          />
          <button
            className="btn btn-lg rounded-pill compare-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PriceComparisonHeader; 