import React from 'react';
import './ProductComparison.css';

const ALL_PLATFORMS = ['amazon', 'flipkart', 'myntra'];

const ProductComparison = ({ sourceProduct, matchedProducts }) => {
  // Always show all three platforms, with the source first
  const getPlatformOrder = (sourcePlatform) => {
    const lowerSource = sourcePlatform.toLowerCase();
    return [
      lowerSource,
      ...ALL_PLATFORMS.filter((p) => p !== lowerSource)
    ];
  };

  const platformOrder = getPlatformOrder(sourceProduct.platform);

  // Get platform logo URL
  const getPlatformLogo = (platform) => {
    switch (platform.toLowerCase()) {
      case 'amazon':
        return 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg';
      case 'flipkart':
        return 'https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/flipkart-plus_8d85f4.png';
      case 'myntra':
        return 'https://constant.myntassets.com/web/assets/img/80cc455a-92d2-4b5c-a038-7da0d92af33f1539674178924-google_play.png';
      default:
        return null;
    }
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image+Available';
  };

  return (
    <div className="comparison-container">
      <div className="comparison-grid">
        {platformOrder.map((platform) => {
          // Use sourceProduct for the source platform, matchedProducts for others
          const product = platform === sourceProduct.platform.toLowerCase()
            ? sourceProduct
            : matchedProducts[platform];

          return (
            <div key={platform} className="product-block">
              <div className="platform-header">
                <img 
                  src={getPlatformLogo(platform)}
                  alt={`${platform} logo`} 
                  className="platform-logo"
                  onError={handleImageError}
                />
                <h3>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
              </div>
              
              {product ? (
                <>
                  <div className="product-image">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      onError={handleImageError}
                    />
                  </div>
                  
                  <div className="product-details">
                    <h4 className="product-title">{product.title}</h4>
                    {product.brand && (
                      <p className="product-brand">{product.brand}</p>
                    )}
                    <p className="product-price">₹{product.price}</p>
                    
                    {product.keyFeatures && product.keyFeatures.length > 0 && (
                      <div className="product-features">
                        <h5>Key Features:</h5>
                        <ul>
                          {product.keyFeatures.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {product.category && (
                      <div className="product-category">
                        <span>Category: {product.category}</span>
                      </div>
                    )}
                    
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-product-btn"
                    >
                      View on {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  </div>
                </>
              ) : (
                <div className="no-product">
                  <p>No matching product found</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductComparison; 