import React, { useMemo } from 'react';
import ComparisonCard from './ComparisonCard';
import './ComparisonResults.css';

const PLATFORMS = ['amazon', 'flipkart', 'myntra'];

function getPlatform(source = '') {
  const s = source?.toLowerCase?.() || '';
  if (s.includes('amazon')) return 'amazon';
  if (s.includes('flipkart')) return 'flipkart';
  if (s.includes('myntra')) return 'myntra';
  return null;
}

function getCheapestPlatform(results) {
  let cheapest = null;
  let min = Infinity;
  results.forEach(item => {
    const price = parseInt((item.price || '').replace(/[^\d]/g, ''));
    if (!isNaN(price) && price < min) {
      min = price;
      cheapest = getPlatform(item.source);
    }
  });
  return cheapest;
}

const ComparisonResults = ({ results = [], loading, error, warning }) => {
  // Normalize results to per-platform
  const grouped = useMemo(() => {
    const obj = {};
    results.forEach(item => {
      const platform = getPlatform(item.source);
      if (platform) obj[platform] = item;
    });
    return obj;
  }, [results]);

  const cheapestPlatform = useMemo(() => getCheapestPlatform(results), [results]);

  // Per-card loading/error: if global loading, all cards loading; if error, all cards error
  return (
    <div className="comparison-results-container">
      {warning && <div className="comparison-warning">{warning}</div>}
      <div className="comparison-3blocks">
        {PLATFORMS.map(platform => (
          <ComparisonCard
            key={platform}
            platform={platform}
            loading={loading}
            data={grouped[platform]}
            isCheapest={cheapestPlatform === platform}
            error={error}
          />
        ))}
      </div>
    </div>
  );
};

export default ComparisonResults; 