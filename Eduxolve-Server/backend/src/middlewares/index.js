const authenticate = require('./auth.middleware');
const { requireRole, requireAdmin, requireStudent } = require('./role.middleware');

module.exports = {
  authenticate,
  requireRole,
  requireAdmin,
  requireStudent
};
