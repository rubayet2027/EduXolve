require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Initialize Firebase (will exit if credentials not found)
require('./config/firebase');

const PORT = process.env.PORT || 5000;

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 EduXolve Server Running                  ║
║                                               ║
║   URL: http://localhost:${PORT}                 ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
║                                               ║
║   Endpoints:                                  ║
║   - GET  /api/health     (public)             ║
║   - GET  /api/me         (protected)          ║
║   - GET  /api/me/full    (protected)          ║
║   - GET  /api/admin/users (admin only)        ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Start the server
startServer();
