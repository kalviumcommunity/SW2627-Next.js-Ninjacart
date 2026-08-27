const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/roleGuard');

// Create a new order (Retailers and Admins only)
router.post('/', authenticate, authorizeRole(['RETAILER', 'ADMIN']), orderController.createOrder);

module.exports = router;
