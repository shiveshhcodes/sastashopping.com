const express = require('express');
const router = express.Router();

// Import sub-routes
const productRoutes = require('./productRoutes');
const userRoutes = require('./userRoutes');
const compareRoutes = require('./compareRoutes');

// Register sub-routes
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/compare', compareRoutes);

module.exports = router; 