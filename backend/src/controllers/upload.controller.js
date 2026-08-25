const cloudinary = require('../config/cloudinary');

/**
 * Generate a secure cryptographic signature for direct client-to-Cloudinary uploads
 * GET /api/upload/signature
 */
const getUploadSignature = async (req, res, next) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = req.query.folder || 'ninjacart/produce';

    // Parameters to sign
    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        folder,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload an image file directly via server buffer to Cloudinary
 * POST /api/upload/image
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided in request (expected multipart field "image")',
      });
    }

    const folder = req.body.folder || 'ninjacart/produce';

    // Upload file buffer using Cloudinary upload stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    return res.status(200).json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an image from Cloudinary by public ID
 * DELETE /api/upload/image
 */
const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'publicId is required to delete an image',
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return res.status(200).json({
      success: true,
      data: {
        result: result.result,
        message: 'Image deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUploadSignature,
  uploadImage,
  deleteImage,
};
