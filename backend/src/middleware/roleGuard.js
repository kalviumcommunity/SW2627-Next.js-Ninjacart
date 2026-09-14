/**
 * Role-based Authorization Middleware
 * @param {string|string[]} roles - Allowed role or array of allowed roles (e.g. 'FARMER', 'RETAILER')
 */
const authorizeRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient permissions',
      });
    }

    next();
  };
};

module.exports = {
  authorizeRole,
};
