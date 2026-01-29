const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares');
const User = require('../models/User');

/**
 * @route   GET /me
 * @desc    Get authenticated user's info
 * @access  Protected
 */
router.get('/me', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

/**
 * @route   GET /me/full
 * @desc    Get full user profile from database
 * @access  Protected
 */
router.get('/me/full', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /admin/users
 * @desc    Get all users (admin only)
 * @access  Protected (Admin)
 */
router.get('/admin/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
