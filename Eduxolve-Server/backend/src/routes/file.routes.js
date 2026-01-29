/**
 * File Routes
 * 
 * Routes for file upload and context management
 * All routes are protected (require authentication)
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const { 
  uploadMiddleware, 
  uploadFile, 
  getFileContext,
  deleteFileContext,
  getSupportedFileTypes 
} = require('../controllers/file.controller');

/**
 * @route   GET /api/files/supported-types
 * @desc    Get list of supported file types
 * @access  Public
 */
router.get('/supported-types', getSupportedFileTypes);

/**
 * @route   POST /api/files/upload
 * @desc    Upload and process a file for AI context
 * @access  Protected
 */
router.post('/upload', authenticate, uploadMiddleware, uploadFile);

/**
 * @route   GET /api/files/:fileId/context
 * @desc    Get processed file context by ID
 * @access  Protected
 */
router.get('/:fileId/context', authenticate, getFileContext);

/**
 * @route   DELETE /api/files/:fileId
 * @desc    Delete file context
 * @access  Protected
 */
router.delete('/:fileId', authenticate, deleteFileContext);

module.exports = router;
