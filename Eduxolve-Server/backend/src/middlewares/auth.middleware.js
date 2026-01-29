const { auth } = require('../config/firebase');
const User = require('../models/User');

/**
 * Authentication Middleware
 * 
 * - Verifies Firebase ID token from Authorization header
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

    // Verify token with Firebase Admin SDK
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
      // Auto-create new user with default 'student' role
      user = await User.create({
        firebaseUid: uid,
        email: email,
        role: 'student'
      });
      console.log(`📝 New user created: ${email}`);
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
