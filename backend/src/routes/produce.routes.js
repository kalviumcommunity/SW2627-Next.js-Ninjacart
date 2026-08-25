const express = require('express');
const router = express.Router();
const produceController = require('../controllers/produce.controller');
const { authenticate } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/roleGuard');

// Public catalogue browsing
router.get('/', produceController.getProduces);
router.get('/:id', produceController.getProduceById);

// Farmer only actions
router.post('/', authenticate, authorizeRole(['FARMER', 'ADMIN']), produceController.createProduce);
router.put('/:id', authenticate, authorizeRole(['FARMER', 'ADMIN']), produceController.updateProduce);
router.delete('/:id', authenticate, authorizeRole(['FARMER', 'ADMIN']), produceController.deleteProduce);

module.exports = router;
