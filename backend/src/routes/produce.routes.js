const express = require('express');
const router = express.Router();
const produceController = require('../controllers/produce.controller');
const { authenticate } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/roleGuard');

// Farmer routes for produce management
router.post('/', authenticate, authorizeRole('FARMER'), produceController.createProduce);
router.patch('/:id', authenticate, authorizeRole('FARMER'), produceController.updateProduce);

module.exports = router;
