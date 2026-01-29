const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health.routes');
const userRoutes = require('./user.routes');

/**
 * Central route registration
 * All routes are registered here for clean separation
 */

// Health check - public
router.use('/', healthRoutes);

// User routes - includes /me (protected)
router.use('/', userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduXolve API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      me: 'GET /me (protected)',
      meFull: 'GET /me/full (protected)',
      adminUsers: 'GET /admin/users (admin only)'
    }
  });
});

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = router;
