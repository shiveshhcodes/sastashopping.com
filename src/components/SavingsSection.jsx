import React from 'react';
// No Lucide icon needed for the main layout in this version, but keep it for potential future icons in feature boxes
// import { PlayCircle } from 'lucide-react';
import './SavingsSection.css'; // Import the CSS file for styling

function SavingsSection() {
  return (
    <section className="savings">
      <div className="savings__container">
        {/* Main Headline and Description */}
        <div className="savings__header">
          <h1 className="savings__title">Unlock the Best Prices Instantly</h1>
          <p className="savings__description">
            Discover the power of price history data to make informed purchasing decisions. Our platform helps you track price changes and find the best deals effortlessly.
          </p>
        </div>

        {/* Features Grid */}
        <div className="savings__features-grid">
          {/* Feature Box 1 */}
          <div className="savings__feature-item">
            <div className="savings__feature-image">
              <div className="savings__placeholder-image"></div>
            </div>
            <div className="savings__feature-content">
              <h2 className="savings__feature-title">Track Price Trends with Ease</h2>
              <p className="savings__feature-text">View detailed price history data to maximize savings.</p>
            </div>
          </div>

          {/* Feature Box 2 */}
          <div className="savings__feature-item">
            <div className="savings__feature-image">
              <div className="savings__placeholder-image"></div>
            </div>
            <div className="savings__feature-content">
              <h2 className="savings__feature-title">Never Miss a Deal Again</h2>
              <p className="savings__feature-text">Get notifications for price drops on your favorite products.</p>
            </div>
          </div>

          {/* Feature Box 3 */}
          <div className="savings__feature-item">
            <div className="savings__feature-image">
              <div className="savings__placeholder-image"></div>
            </div>
            <div className="savings__feature-content">
              <h2 className="savings__feature-title">Save Your Favorite Links for Quick Access</h2>
              <p className="savings__feature-text">Easily save and revisit your favorite product links.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SavingsSection;
