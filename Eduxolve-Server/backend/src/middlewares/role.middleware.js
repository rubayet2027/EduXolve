/**
 * Role Guard Middleware
 * 
 * Restricts access to routes based on user roles
 * Must be used AFTER authenticate middleware
 * 
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Single role
 * router.get('/admin', authenticate, requireRole('admin'), handler);
 * 
 * // Multiple roles
 * router.get('/dashboard', authenticate, requireRole('admin', 'student'), handler);
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Check if user's role is in allowed roles
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

/**
 * Admin-only shorthand middleware
 */
const requireAdmin = requireRole('admin');

/**
 * Student-only shorthand middleware  
 */
const requireStudent = requireRole('student');

module.exports = {
  requireRole,
  requireAdmin,
  requireStudent
};
