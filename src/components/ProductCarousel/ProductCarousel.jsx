import React, { useEffect, useState } from 'react';
import './ProductCarousel.css';

const ProductCarousel = ({ products }) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      setScrollPosition((prevPosition) => {
        const newPosition = prevPosition + 1;
        // Reset position when all products have scrolled
        if (newPosition >= products.length * 320) { // 320px is the width of each product card
          return 0;
        }
        return newPosition;
      });
    }, 30); // Adjust speed by changing interval

    return () => clearInterval(scrollInterval);
  }, [products.length]);

  // Duplicate products array to create seamless loop
  const duplicatedProducts = [...products, ...products];

  return (
    <div className="product-carousel-container">
      <div 
        className="product-carousel-track"
        style={{ 
          transform: `translateX(-${scrollPosition}px)`,
        }}
      >
        {duplicatedProducts.map((product, index) => (
          <div key={`${product.id}-${index}`} className="carousel-product-card">
            <div className="carousel-image-container">
              <img src={product.image} alt={product.title} />
              <span className="carousel-discount-badge">{product.discount}</span>
            </div>
            <div className="carousel-product-info">
              <h3>{product.title}</h3>
              <div className="carousel-price-container">
                <span className="carousel-discounted-price">{product.discountedPrice}</span>
                <span className="carousel-original-price">{product.originalPrice}</span>
              </div>
              <div className="carousel-rating-container">
                <div className="carousel-stars">
                  {'★'.repeat(Math.floor(product.rating))}
                  {'☆'.repeat(5 - Math.floor(product.rating))}
                </div>
                <span className="carousel-review-count">({product.reviews})</span>
              </div>
              <span className="carousel-savings-text">{product.savings}</span>
              <button className="carousel-compare-button">Compare Prices</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel; 