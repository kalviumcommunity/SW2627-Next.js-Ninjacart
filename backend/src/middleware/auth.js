const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Validates 'Authorization: Bearer <token>' header and attaches decoded user to req.user
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'No token provided',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1].trim()) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }

  const token = parts[1].trim();

  // Ensure JWT_SECRET with fallback for dev/testing
  const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_ninjacart_fallback_2026';
  if (!jwtSecret) {
    console.error('FATAL: JWT_SECRET environment variable is not configured.');
    return res.status(500).json({
      success: false,
      error: 'JWT_SECRET is not configured on server',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

module.exports = {
  authenticate,
};
