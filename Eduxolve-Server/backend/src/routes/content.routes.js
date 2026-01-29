const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares');
const { upload } = require('../services/upload.service');
const {
  uploadContent,
  listContent,
  getContent,
  deleteContent,
  updateContent
} = require('../controllers/content.controller');

/**
 * Multer error handler middleware
 */
const handleUploadError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field. Use "file" as the field name.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  next();
};

/**
 * @route   POST /api/content
 * @desc    Upload new content
 * @access  Protected (Admin only)
 */
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  upload.single('file'),
  handleUploadError,
  uploadContent
);

/**
 * @route   GET /api/content
 * @desc    List all content with filters
 * @access  Protected (Admin + Student)
 * @query   type, week, topic, tags, page, limit
 */
router.get(
  '/',
  authenticate,
  listContent
);

/**
 * @route   GET /api/content/:id
 * @desc    Get single content by ID
 * @access  Protected (Admin + Student)
 */
router.get(
  '/:id',
  authenticate,
  getContent
);

/**
 * @route   PATCH /api/content/:id
 * @desc    Update content metadata
 * @access  Protected (Admin only)
 */
router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  updateContent
);

/**
 * @route   DELETE /api/content/:id
 * @desc    Delete content
 * @access  Protected (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  deleteContent
);

module.exports = router;
