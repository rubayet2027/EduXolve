const { auth } = require('../config/firebase');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { isAdminEmail } = require('../config/admin');

// JWT secret for admin tokens (must match auth.routes.js)
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'eduxolve-admin-demo-secret-2026';

/**
 * Authentication Middleware
 * 
 * Supports both:
 * - Firebase ID tokens (for students)
 * - Admin JWT tokens (for hardcoded admin credentials)
 * 
 * - Verifies token from Authorization header
 * - Finds or creates user in MongoDB
 * - Attaches user info to request object
 */
const authenticate = async (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    // First, try to verify as Admin JWT token
    try {
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
      
      if (decoded.isAdmin) {
        // Admin JWT is self-contained - NO MongoDB required
        req.user = {
          id: decoded.id,
          firebaseUid: decoded.id,
          email: decoded.email,
          role: 'admin'
        };
        console.log(`🔐 Admin authenticated via JWT: ${decoded.email}`);
        return next();
      }
    } catch (jwtError) {
      // Not a valid admin JWT, try Firebase token
    }

    // Try Firebase token verification
    const decodedToken = await auth.verifyIdToken(token);
    const { uid, email } = decodedToken;

    if (!uid || !email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Missing user information.'
      });
    }

    // Find user in MongoDB or create new one
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Check if this email should be admin
      const shouldBeAdmin = isAdminEmail(email);
      
      // Auto-create new user
      user = await User.create({
        firebaseUid: uid,
        email: email,
        role: shouldBeAdmin ? 'admin' : 'student'
      });
      console.log(`📝 New user created: ${email} (${shouldBeAdmin ? 'admin' : 'student'})`);
    } else if (isAdminEmail(email) && user.role !== 'admin') {
      // Upgrade to admin if email matches
      user.role = 'admin';
      await user.save();
      console.log(`🔄 User upgraded to admin: ${email}`);
    }

    // Attach user info to request
    req.user = {
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);

    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please sign in again.'
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        message: 'Token revoked. Please sign in again.'
      });
    }

    if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

module.exports = authenticate;
