const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/send-otp', authController.sendOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.patch('/profile', authenticate, authController.updateProfile);

module.exports = router;
