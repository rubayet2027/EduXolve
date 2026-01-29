/**
 * Vercel Serverless Entry Point
 * 
 * This file is the entry point for Vercel serverless functions.
 * It imports the Express app and exports it for Vercel to handle.
 */

require('dotenv').config();

const connectDB = require('../src/config/db');

// Initialize Firebase (must happen before app import)
require('../src/config/firebase');

const app = require('../src/app');

// Connect to MongoDB on cold start
let isConnected = false;

const handler = async (req, res) => {
  // Connect to MongoDB if not already connected
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  
  return app(req, res);
};

module.exports = handler;
