const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/roleGuard');

// Farmer protected route
router.get('/farmer', authenticate, authorizeRole('FARMER'), (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Farmer access granted',
      user: req.user,
    },
  });
});

// Retailer protected route
router.get('/retailer', authenticate, authorizeRole('RETAILER'), (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Retailer access granted',
      user: req.user,
    },
  });
});

module.exports = router;
