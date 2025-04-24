import React from 'react';
import { PlayCircle, Package, History } from 'lucide-react';
import './FeatureVideoSection.css';

function FeatureVideoSection() {
  return (
    <section className="feature-section">
      <div className="feature-content">
        {/* Left Column */}
        <div className="feature-text">
          <span className="feature-label">Compare</span>
          <h2 className="feature-title">Find the Best Prices Instantly</h2>
        </div>

        {/* Right Column */}
        <div className="feature-details">
          <p className="feature-description">
            Simply paste your product links and let us do the work. Discover the best deals across top e-commerce platforms in seconds.
          </p>

          <div className="feature-boxes">
            <div className="feature-box">
              <Package className="feature-icon" size={24} />
              <div>
                <h3>Instant Savings</h3>
                <p>Get real-time price comparisons and save money effortlessly.</p>
              </div>
            </div>

            <div className="feature-box">
              <History className="feature-icon" size={24} />
              <div>
                <h3>Price History</h3>
                <p>Track price trends to make informed purchasing decisions.</p>
              </div>
            </div>
          </div>

          <div className="feature-buttons">
            <button className="btn-learn">Learn More</button>
            <button className="btn-signup">
              Sign Up <PlayCircle size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="video-container">
        <div className="video-placeholder">
          <PlayCircle size={64} className="play-icon" />
        </div>
      </div>
    </section>
  );
}

export default FeatureVideoSection;
