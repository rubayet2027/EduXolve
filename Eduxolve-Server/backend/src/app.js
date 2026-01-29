const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

/**
 * Express Application Configuration
 */
const app = express();

// ===================
// Middleware
// ===================

// CORS - Enable cross-origin requests
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://eduxolve.web.app',
  'https://eduxolve.firebaseapp.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(null, true); // Allow anyway for demo, change to callback(new Error('Not allowed by CORS')) for strict mode
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// ===================
// Routes
// ===================
app.use('/api', routes);

// Root redirect to API
app.get('/', (req, res) => {
  res.redirect('/api');
});

// ===================
// Error Handling
// ===================

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;
