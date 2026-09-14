const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// Generate cryptographic signature for direct Cloudinary client uploads
router.get('/signature', authenticate, uploadController.getUploadSignature);

// Direct image upload endpoint (accepts 'image' file in multipart/form-data)
router.post('/image', authenticate, uploadMiddleware.single('image'), uploadController.uploadImage);

// Delete image from Cloudinary
router.delete('/image', authenticate, uploadController.deleteImage);

module.exports = router;
