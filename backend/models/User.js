const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  savedComparisons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comparison' }],
  preferences: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 