import React from 'react';
import { FileText, Lightbulb, LineChart } from 'lucide-react';
import '../styles/PriceComparisonStyles.css';

function PriceComparisonFilters() {
  return (
    <div className="row gx-4 gy-4 mb-5 pb-4">
      <div className="col-12 col-md-4">
        <div className="price-comparison-feature-box border rounded-3 shadow-sm p-4 text-center h-100 transition-shadow">
          <div className="icon-wrapper mb-3">
            <FileText size={48} className="text-primary" />
          </div>
          <h5 className="fw-bold mb-2">Find Identical Matches</h5>
          <p className="text-muted mb-0">
            Compare prices of same product from different stores
          </p>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="price-comparison-feature-box border rounded-3 shadow-sm p-4 text-center h-100 transition-shadow">
          <div className="icon-wrapper mb-3">
            <Lightbulb size={48} className="text-warning" />
          </div>
          <h5 className="fw-bold mb-2">Best Time to Buy</h5>
          <p className="text-muted mb-0">
            AI recommendation if you should wait or purchase now
          </p>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="price-comparison-feature-box border rounded-3 shadow-sm p-4 text-center h-100 transition-shadow">
          <div className="icon-wrapper mb-3">
            <LineChart size={48} className="text-info" />
          </div>
          <h5 className="fw-bold mb-2">Price History</h5>
          <p className="text-muted mb-0">
            View price trend data for chosen product
          </p>
        </div>
      </div>
    </div>
  );
}

export default PriceComparisonFilters; 