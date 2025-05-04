export const formatPrice = (price, currency = 'USD') => {
  if (typeof price !== 'number') {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export const isValidProductUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    new URL(url);
    return true;
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
    const hostname = urlObject.hostname;
    let productName = 'Generic Product';

    if (hostname.includes('amazon.com')) {
      productName = 'Amazon Product';
    } else if (hostname.includes('flipkart.com')) {
      productName = 'Flipkart Product';
    }

    return {
      name: productName,
      retailer: hostname,
      url: url,
    };
  } catch (e) {
    console.error("Error parsing product info:", e);
    return null;
  }
}; 