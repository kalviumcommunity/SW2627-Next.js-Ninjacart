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
 *
 * Flow:
 * 1. Multer stores the incoming multipart image in req.file.buffer.
 * 2. Creates a Cloudinary upload stream pointing to folder 'ninjacart/produce'.
 * 3. Applies automated image optimizations:
 *    - width/height limit 1200x1200px
 *    - quality: auto:good (reduces payload without visual degradation)
 *    - fetch_format: auto (serves WebP/AVIF to supported browsers)
 * 4. Streams the buffer to Cloudinary CDN servers.
 * 5. Returns HTTP 200 with permanent secure_url and public_id.
 */
const uploadImage = async (req, res, next) => {
  try {
    // Check if Multer successfully intercepted and parsed the image file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided in request (expected multipart field "image")',
      });
    }

    const folder = req.body.folder || 'ninjacart/produce';

    // Stream file buffer directly to Cloudinary CDN
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

      // Pipe in-memory buffer into the Cloudinary upload stream
      uploadStream.end(req.file.buffer);
    });

    // Return both top-level and data fields so any frontend client works reliably
    return res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
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
    // Return 502 Bad Gateway if the external Cloudinary service fails
    console.error('[UploadController Error]:', error.message || error);
    return res.status(502).json({
      success: false,
      error: error.message || 'Failed to upload image to Cloudinary storage',
    });
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
