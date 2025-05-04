import React, { useMemo } from 'react';
import AIRecommendation from './AIRecommendation';
import PriceComparisonPieChart from './PriceComparisonPieChart';
import PriceHistoryChart from './PriceHistoryChart';
import { ThumbsUp } from 'lucide-react';
import '../styles/PriceComparisonStyles.css';

function PriceComparisonResults({ results, loading, error, productUrl }) {
  // Use productUrl as a key to force pie chart to update on new product
  const pieKey = useMemo(() => productUrl || Math.random(), [productUrl]);

  if (loading) {
    return (
      <div className="row text-center my-5">
        <div className="col-12">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Comparing prices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="row my-5">
        <div className="col-12">
          <div className="alert alert-danger" role="alert">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="row text-center my-5">
        <div className="col-12">
          <p className="text-muted">Enter a product URL above to see comparison results.</p>
        </div>
      </div>
    );
  }

  const offers = results.offers || [];
  const aiType = results.recommendation?.toLowerCase().includes('wait')
    ? 'wait'
    : results.recommendation?.toLowerCase().includes('avoid')
    ? 'avoid'
    : 'buy';

  return (
    <>
      {/* Product Card with Offers Table - Revamped UI */}
      <div className="row justify-content-center mb-5">
        <div className="col-12 col-lg-8">
          <div className="product-main-card p-0 mb-4 d-flex flex-column flex-md-row align-items-stretch gap-0 shadow-lg border-0" style={{ overflow: 'hidden', background: '#fff', borderRadius: '2rem' }}>
            <div className="d-flex align-items-center justify-content-center bg-light" style={{ minWidth: 200, minHeight: 220, background: '#f6f8fa', borderTopLeftRadius: '2rem', borderBottomLeftRadius: '2rem' }}>
              <img
                src={results.product?.imageUrl || 'https://placehold.co/160x160'}
                alt={results.product?.name || 'Product'}
                className="main-product-image"
                style={{ width: 140, height: 140, objectFit: 'contain', borderRadius: '1.2rem', boxShadow: '0 2px 8px rgba(80,80,80,0.06)' }}
              />
            </div>
            <div className="flex-grow-1 w-100 p-4 p-md-5 d-flex flex-column justify-content-between">
              <h3 className="fw-bold mb-3 text-center text-md-start" style={{ fontSize: '1.7rem', color: '#2d3436' }}>{results.product?.name || 'Product Name'}</h3>
              <div className="offers-table-wrapper mb-2">
                <table className="table table-borderless offers-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ color: '#888', fontWeight: 600 }}>Retailer</th>
                      <th style={{ color: '#888', fontWeight: 600 }}>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                        <td className="fw-semibold" style={{ fontSize: '1.08rem' }}>{offer.retailer}</td>
                        <td className="fw-bold" style={{ color: '#6c5ce7', fontSize: '1.13rem' }}>{offer.price}</td>
                        <td>
                          <a href={offer.url} className="btn btn-primary btn-sm px-3 rounded-pill" style={{ background: '#6c5ce7', border: 'none' }} target="_blank" rel="noopener noreferrer">View Deal</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Section - visually separated */}
      {results.recommendation && (
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-lg-8">
            <AIRecommendation
              type={aiType}
              message={results.recommendation}
              subtext="AI-powered recommendation based on data analysis."
            />
          </div>
        </div>
      )}

      {/* Price History Section */}
      {results.chartData && results.chartData.length > 0 && (
        <div className="row justify-content-center mb-5">
          <div className="col-12 col-lg-10">
            <div className="big-price-chart-container d-flex flex-column flex-md-row align-items-center gap-4 p-4 p-md-5">
              <div className="flex-grow-1 w-100">
                <h4 className="fw-bold mb-2">Price history</h4>
                <PriceHistoryChart data={results.chartData} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Up for More Features Section */}
      <div className="row align-items-center mb-5 justify-content-center">
        <div className="col-12 col-md-8">
          <h5 className="fw-bold mb-1">Sign up for personalized recommendations</h5>
          <p className="text-muted mb-0">
            Create an account for price alerts and tailored suggestions.
          </p>
        </div>
        <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
          <button className="btn btn-primary btn-lg price-comparison-signup-button">Get Started</button>
        </div>
      </div>
    </>
  );
}

export default PriceComparisonResults; 