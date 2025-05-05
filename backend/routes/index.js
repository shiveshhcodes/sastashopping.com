const express = require('express');
const router = express.Router();

// Import sub-routes
const productRoutes = require('./productRoutes');
const userRoutes = require('./userRoutes');

// Register sub-routes
router.use('/products', productRoutes);
router.use('/users', userRoutes);

module.exports = router; 