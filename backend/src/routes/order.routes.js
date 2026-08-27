const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/roleGuard');

// All order routes require authentication
router.use(authenticate);

// Place a new order (Retailers and Admins only)
router.post('/', authorizeRole(['RETAILER', 'ADMIN']), orderController.createOrder);

// Get all orders (Retailer gets their own orders, Admin gets all)
router.get('/', (req, res, next) => orderController.getOrders(req, res, next));

// Get specific order details by ID
router.get('/:id', (req, res, next) => orderController.getOrderById(req, res, next));

module.exports = router;
