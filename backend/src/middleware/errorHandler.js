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

  const isDbConnectionError =
    ['P1001', 'P2024', 'P1017'].includes(err.code) ||
    err.name === 'PrismaClientInitializationError' ||
    (typeof err.message === 'string' &&
      (err.message.includes("Can't reach database server") ||
        err.message.includes('ConnectionReset') ||
        err.message.includes('forcibly closed')));

  if (isDbConnectionError) {
    return res.status(503).json({
      success: false,
      error: 'Database is currently unavailable. Check the backend DATABASE_URL and database status.',
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
