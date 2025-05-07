export const formatPrice = (price) => {
  if (!price) return 'Price not available';
  
  // Remove any non-numeric characters except decimal point
  const numericPrice = price.replace(/[^\d.]/g, '');
  
  // Check if it's a valid number
  if (isNaN(numericPrice)) return price;
  
  // Format with Indian currency symbol
  return `₹${parseFloat(numericPrice).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const isValidProductUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return hostname.includes('amazon.') || 
           hostname.includes('flipkart.com') || 
           hostname.includes('myntra.com');
  } catch (e) {
    return false;
  }
};

export const parseProductInfo = (url) => {
  console.log(`Parsing product info from URL: ${url}`);

  if (!isValidProductUrl(url)) {
    return null;
  }

  try {
    const urlObject = new URL(url);
    const hostname = urlObject.hostname.toLowerCase();
    let productName = 'Generic Product';
    let retailer = 'Unknown';

    if (hostname.includes('amazon.')) {
      productName = 'Amazon Product';
      retailer = 'Amazon';
    } else if (hostname.includes('flipkart.com')) {
      productName = 'Flipkart Product';
      retailer = 'Flipkart';
    } else if (hostname.includes('myntra.com')) {
      productName = 'Myntra Product';
      retailer = 'Myntra';
    }

    return {
      name: productName,
      retailer: retailer,
      url: url,
    };
  } catch (e) {
    console.error("Error parsing product info:", e);
    return null;
  }
};

export const formatRating = (rating) => {
  if (!rating) return null;
  
  // Extract numeric rating
  const numericRating = parseFloat(rating);
  if (isNaN(numericRating)) return null;
  
  // Ensure rating is between 0 and 5
  return Math.min(Math.max(numericRating, 0), 5).toFixed(1);
};

export const formatReviews = (reviews) => {
  if (!reviews) return null;
  
  // Extract numeric reviews
  const numericReviews = parseInt(reviews.replace(/[^\d]/g, ''));
  if (isNaN(numericReviews)) return null;
  
  return numericReviews.toLocaleString('en-IN');
}; 