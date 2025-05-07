// Mongoose Product model commented out for running without MongoDB
// const mongoose = require('mongoose');
// 
// const productSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   images: [{ type: String }],
//   platform: { type: String, required: true },
//   price: { type: Number, required: true },
//   productUrl: { type: String, required: true },
//   lastFetched: { type: Date, default: Date.now },
// }, { timestamps: true });
// 
// module.exports = mongoose.model('Product', productSchema); 