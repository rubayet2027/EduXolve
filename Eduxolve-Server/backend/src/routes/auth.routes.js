/**
 * Auth Routes
 * 
 * Handles authentication including:
 * - Admin login with hardcoded credentials
 * - Token verification
 * 
 * ⚠️ Admin credentials are demo-only
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { isAdminCredentials, isAdminEmail } = require('../config/admin');
const User = require('../models/User');

// JWT secret for admin tokens (demo only)
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'eduxolve-admin-demo-secret-2026';

/**
 * @route   POST /api/auth/admin/login
 * @desc    Admin login with hardcoded credentials
 * @access  Public
 * 
 * ⚠️ MongoDB is NOT required - admin works standalone
 */
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if credentials match admin
    if (!isAdminCredentials(email, password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate admin JWT token (no MongoDB dependency)
    const adminId = `admin_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    const token = jwt.sign(
      {
        id: adminId,
        email: email.toLowerCase(),
        role: 'admin',
        isAdmin: true
      },
      ADMIN_JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Optionally try to sync with MongoDB (non-blocking)
    try {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        user = await User.create({
          email: email.toLowerCase(),
          firebaseUid: adminId,
          role: 'admin'
        });
        console.log(`📝 Admin user synced to DB: ${email}`);
      } else if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    } catch (dbError) {
      // MongoDB sync is optional - admin still works
      console.warn(`⚠️ MongoDB sync skipped for admin: ${dbError.message}`);
    }

    console.log(`✅ Admin login successful: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token, // Direct token for easier frontend handling
      user: {
        id: adminId,
        email: email.toLowerCase(),
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

/**
 * @route   POST /api/auth/verify
 * @desc    Verify admin token and return user info
 * @access  Protected (Admin token)
 */
router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Try to verify as admin token
    try {
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
      
      if (decoded.isAdmin) {
        return res.status(200).json({
          success: true,
          data: {
            id: decoded.id,
            email: decoded.email,
            role: 'admin'
          }
        });
      }
    } catch (jwtError) {
      // Not an admin token, continue to check if it's a Firebase token
    }

    // If not admin token, return unauthorized
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });

  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
});

module.exports = router;
