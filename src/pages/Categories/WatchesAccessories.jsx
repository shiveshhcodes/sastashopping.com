import React, { useState, useEffect } from 'react';
import { trendingDeals } from '../../data/products';
import './Categories.css';

const WatchesAccessories = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Filter products for watches category
    const watchProducts = trendingDeals.filter(product => 
      product.category === 'wearables'
    );
    setProducts(watchProducts);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>Watches & Accessories</h1>
        <p>Luxury Collection</p>
      </div>
      
      <div className="category-content">
        <div className="filters-section">
          {/* Add filters here later */}
        </div>
        
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.title} />
              <div className="product-info">
                <h3>{product.title}</h3>
                <div className="price-info">
                  <span className="discounted-price">{product.discountedPrice}</span>
                  <span className="original-price">{product.originalPrice}</span>
                  <span className="discount">{product.discount} OFF</span>
                </div>
                <div className="savings">{product.savings}</div>
                <div className="rating">
                  {'★'.repeat(Math.floor(product.rating))}
                  {'☆'.repeat(5 - Math.floor(product.rating))}
                  <span className="review-count">({product.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WatchesAccessories; 