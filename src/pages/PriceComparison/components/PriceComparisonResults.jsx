import React, { useMemo } from 'react';
import AIRecommendation from './AIRecommendation';
import PriceHistoryChart from './PriceHistoryChart';
import { ThumbsUp, ExternalLink, Star, ShoppingBag } from 'lucide-react';
import '../styles/PriceComparisonStyles.css';

function PriceComparisonResults({ results, loading, error, productUrl }) {
  // Use productUrl as a key to force pie chart to update on new product
  const pieKey = useMemo(() => productUrl || Math.random(), [productUrl]);

  if (loading) {
    return (
      <div className="row text-center my-5">
        <div className="col-12">
          <div className="modern-spinner-container">
            <div className="modern-spinner"></div>
          </div>
          <p className="mt-3 loading-message">Fetching the best deals for you…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="row my-5">
        <div className="col-12">
          <div className="modern-error-box">
            <strong>Oops!</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  if (!results || !results.offers || results.offers.length === 0) {
    return (
      <div className="row text-center my-5">
        <div className="col-12">
          <div className="modern-error-box">
            <strong>No results found.</strong>
            <div className="mt-2">We couldn't find any offers for this product. Please check the link or try another product.</div>
          </div>
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
      {/* Product Comparison Grid */}
      <div className="row justify-content-center mb-5">
        <div className="col-12">
          <div className="comparison-grid">
            {offers.map((offer, index) => (
              <div key={index} className="comparison-card improved-card" data-offer-card>
                {/* Top Badge Area: Discount above, Retailer centered below */}
                <div className="card-badge-column">
                  {offer.discount && (
                    <div className="discount-badge improved-discount" data-discount>{offer.discount}% OFF</div>
                  )}
                  {/* Brand/Retailer */}
                  <div className={`retailer-badge improved-retailer`} data-brand>{offer.retailer}</div>
                </div>
                {/* Product Image */}
                <div className="product-image-container improved-image-container">
                  <img
                    src={offer.imageUrl || ''} // backend will set imageUrl
                    alt={offer.title || 'Product Image'}
                    className="product-image improved-image"
                    data-image
                  />
                </div>
                <div className="product-details improved-details">
                  {/* Product Title */}
                  <h3 className="product-title improved-title" data-title>{offer.title}</h3>
                  {/* Category (optional, backend to fill) */}
                  {offer.category && (
                    <div className="product-category" data-category>{offer.category}</div>
                  )}
                  {/* Price Section */}
                  <div className="price-tag improved-price-tag">
                    <span className="current-price improved-current-price" data-price>{offer.price}</span>
                    {offer.originalPrice && (
                      <span className="original-price improved-original-price" data-original-price>{offer.originalPrice}</span>
                    )}
                  </div>
                  {/* Ratings and Reviews */}
                  <div className="product-meta improved-meta">
                    {offer.rating && (
                      <div className="rating improved-rating" data-rating>
                        <Star size={16} className="star-icon" />
                        <span>{offer.rating}</span>
                      </div>
                    )}
                    {offer.reviews && (
                      <div className="reviews improved-reviews" data-reviews>
                        ({offer.reviews} reviews)
                      </div>
                    )}
                  </div>
                  {/* Features/Description */}
                  <div className="product-features improved-features" data-features>
                    {offer.features?.map((feature, idx) => (
                      <div key={idx} className="feature-item improved-feature-item">
                        <ThumbsUp size={14} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  {/* View Deal Button */}
                  <a
                    href={offer.url}
                    className="view-deal-btn improved-view-deal-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-view-deal-btn
                  >
                    <ShoppingBag size={18} />
                    <span>View Deal</span>
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendation Section */}
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
            <div className="big-price-chart-container">
              <h4 className="fw-bold mb-3">Price History</h4>
              <PriceHistoryChart data={results.chartData} />
            </div>
          </div>
        </div>
      )}

      {/* Sign Up Section */}
      <div className="row align-items-center mb-5 justify-content-center">
        <div className="col-12 col-md-8">
          <h5 className="fw-bold mb-1">Get Personalized Price Alerts</h5>
          <p className="text-muted mb-0">
            Sign up to receive notifications when prices drop for your favorite products.
          </p>
        </div>
        <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
          <button className="btn btn-primary btn-lg price-comparison-signup-button">
            Sign Up Now
          </button>
        </div>
      </div>
    </>
  );
}

export default PriceComparisonResults; 