import React from 'react';
import { FileText, Lightbulb, LineChart } from 'lucide-react';
import '../styles/PriceComparisonStyles.css';

function PriceComparisonFilters() {
  return (
    <div className="row gx-4 gy-4 mb-5 pb-4">
      <div className="col-12 col-md-4">
        <div className="feature-card price-comparison-feature-box border-0 shadow-sm p-4 text-center h-100 transition-shadow">
          <div className="feature-icon mb-3" style={{ background: 'rgba(108,92,231,0.12)' }}>
            <FileText size={38} style={{ color: '#6c5ce7' }} />
          </div>
          <h5 className="feature-title mb-2">Find Identical Matches</h5>
          <p className="feature-desc mb-0">
            Instantly compare prices for the exact same product across all top stores. Never overpay again!
          </p>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="feature-card price-comparison-feature-box border-0 shadow-sm p-4 text-center h-100 transition-shadow">
          <div className="feature-icon mb-3" style={{ background: 'rgba(255,193,7,0.13)' }}>
            <Lightbulb size={38} style={{ color: '#ffc107' }} />
          </div>
          <h5 className="feature-title mb-2">Best Time to Buy</h5>
          <p className="feature-desc mb-0">
            Get smart AI-powered advice on whether to buy now or wait for a better deal.
          </p>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="feature-card price-comparison-feature-box border-0 shadow-sm p-4 text-center h-100 transition-shadow">
          <div className="feature-icon mb-3" style={{ background: 'rgba(106,110,231,0.13)' }}>
            <LineChart size={38} style={{ color: '#6a6ee7' }} />
          </div>
          <h5 className="feature-title mb-2">Price History</h5>
          <p className="feature-desc mb-0">
            Visualize price trends and spot the best time to buy with our interactive charts.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PriceComparisonFilters; 