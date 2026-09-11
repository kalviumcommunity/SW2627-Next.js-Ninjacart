const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// Generate cryptographic signature for direct Cloudinary client uploads
router.get('/signature', authenticate, uploadController.getUploadSignature);

// Direct image upload endpoint (accepts 'image' file in multipart/form-data)
router.post(
  '/image',
  authenticate,
  (req, res, next) => {
    uploadMiddleware.single('image')(req, res, (err) => {
      if (err) {
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
