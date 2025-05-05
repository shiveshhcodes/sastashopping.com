const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  pricesAcrossSites: [
    {
      platform: String,
      price: Number,
      url: String,
      fetchedAt: { type: Date, default: Date.now }
    }
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateCompared: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Comparison', comparisonSchema); 