const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// GET /api/v1/users/profile - return fake user object after auth
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    uid: req.user.uid || 'fake-uid',
    email: req.user.email || 'fakeuser@example.com',
    savedComparisons: [],
    preferences: { theme: 'dark' },
  });
});

module.exports = router; 