const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// Generate cryptographic signature for direct Cloudinary client uploads (if needed)
router.get('/signature', authenticate, uploadController.getUploadSignature);

/**
 * POST /api/upload/image
 * Direct produce image upload route:
 * 1. authenticate: Verifies the farmer's Bearer JWT token.
 * 2. uploadMiddleware.single('image'): Multer parses multipart/form-data and holds file in memory buffer.
 * 3. Error interceptor: Catches Multer limits (e.g. file size > 5MB) and returns a clean 400 JSON error.
 * 4. uploadController.uploadImage: Streams the image buffer to Cloudinary and returns the permanent HTTPS URL.
 */
router.post(
  '/image',
  authenticate,
  (req, res, next) => {
    uploadMiddleware.single('image')(req, res, (err) => {
      if (err) {
        // Handle file size exceeding 5MB limit gracefully without crashing
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size exceeds maximum limit of 5MB',
          });
        }
        return res.status(400).json({
          success: false,
          error: err.message || 'Invalid image file upload',
        });
      }
      next();
    });
  },
  uploadController.uploadImage
);

// Delete image from Cloudinary
router.delete('/image', authenticate, uploadController.deleteImage);

module.exports = router;
