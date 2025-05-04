import React, { useState } from 'react';
import PriceComparisonHeader from './components/PriceComparisonHeader';
import PriceComparisonFilters from './components/PriceComparisonFilters';
import PriceComparisonResults from './components/PriceComparisonResults';
import usePriceComparison from './hooks/usePriceComparison';
import './styles/PriceComparisonStyles.css';

function PriceComparisonPage() {
  const {
    productUrl,
    setProductUrl,
    results,
    loading,
    error,
    comparePrices,
  } = usePriceComparison('');

  const handleCompareClick = () => {
    if (productUrl) {
      comparePrices(productUrl);
    } else {
      console.warn("Please enter a product URL.");
    }
  };

  return (
    <>
      <section className="container container-lg my-5 py-4">
        <PriceComparisonHeader
          productUrl={productUrl}
          setProductUrl={setProductUrl}
          handleCompareClick={handleCompareClick}
          loading={loading}
        />

        <PriceComparisonFilters />

        <PriceComparisonResults
          results={results}
          loading={loading}
          error={error}
        />
      </section>
    </>
  );
}

export default PriceComparisonPage; 