import React from 'react';
import { Package, History, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FeatureVideoSection.css';

function FeatureVideoSection() {
  const navigate = useNavigate();

  return (
    <section className="feature-section">
      <div className="feature-content">
        {/* Main Content */}
        <div className="feature-text-center">
          <h2 className="feature-title">
            Simply paste your product links and let us do the work.
          </h2>
          <p className="feature-description">
            Discover the best deals across top e-commerce platforms in seconds.
          </p>

          <div className="feature-boxes">
            <div className="feature-box">
              <div className="feature-icon">
                <Package size={24} strokeWidth={2} />
              </div>
              <div className="feature-info">
                <h3>Instant Savings</h3>
                <p>Get real-time price comparisons and save money effortlessly.</p>
              </div>
            </div>

            <div className="feature-box">
              <div className="feature-icon">
                <History size={24} strokeWidth={2} />
              </div>
              <div className="feature-info">
                <h3>Price History</h3>
                <p>Track price trends to make informed purchasing decisions.</p>
              </div>
            </div>
          </div>

          <button className="cta-button" onClick={() => navigate('/compare-prices')}>
            <div className="cta-icon">
              <ArrowRight size={24} strokeWidth={2} />
            </div>
            <div className="cta-text">
              <span className="cta-main">Start Comparing Prices</span>
              <span className="cta-sub">Find the best deals instantly →</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

export default FeatureVideoSection;