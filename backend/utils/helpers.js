// Utility functions for formatting and cleaning

function formatPrice(price, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

module.exports = { formatPrice, cleanText }; 