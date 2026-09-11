const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendRegistrationOtp);
router.post('/verify-otp', authController.verifyRegistrationOtp);

// Protected routes
router.get('/me', authenticate, authController.getMe);

module.exports = router;
