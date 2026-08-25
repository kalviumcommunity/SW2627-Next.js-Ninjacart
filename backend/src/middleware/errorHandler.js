/**
 * Global Error Handler Middleware
 * Formats all unhandled errors into a standardized response:
 * { "success": false, "error": "Error message" }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[Error caught by global handler]:', err);

  // Handle body-parser / express.json malformed JSON error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON payload in request body',
    });
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;
