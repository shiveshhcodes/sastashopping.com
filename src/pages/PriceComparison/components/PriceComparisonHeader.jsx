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
        <form className="compare-bar d-flex justify-content-center align-items-center gap-3 flex-wrap mb-3" onSubmit={e => { e.preventDefault(); handleCompareClick(); }}>
          <input
            type="text"
            className="compare-bar-input form-control form-control-lg"
            placeholder="Paste your product link here..."
            aria-label="Enter product URL"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            style={{ maxWidth: 480, fontSize: '1.25rem', fontWeight: 500, borderRadius: '2.5rem', boxShadow: '0 4px 24px rgba(108,92,231,0.07)', border: '2.5px solid #ece9fc', padding: '1.1rem 2rem', fontFamily: 'inherit', transition: 'box-shadow 0.2s, border 0.2s' }}
          />
          <button
            className="compare-bar-btn btn btn-lg"
            type="submit"
            disabled={loading}
            style={{ borderRadius: '2.5rem', background: '#6c5ce7', color: '#fff', fontWeight: 700, fontSize: '1.18rem', padding: '1.1rem 2.5rem', boxShadow: '0 4px 24px rgba(108,92,231,0.13)', border: 'none', fontFamily: 'inherit', letterSpacing: '0.02em', transition: 'background 0.18s, box-shadow 0.18s' }}
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PriceComparisonHeader; 