/**
 * Validation Routes
 * 
 * Content validation and evaluation endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares');
const {
  validate,
  quickValidateEndpoint,
  checkCorrectness,
  getValidationStats
} = require('../controllers/validation.controller');

/**
 * @route   POST /api/validate
 * @desc    Full validation with all layers (grounding, structure, AI eval)
 * @access  Protected (Admin + Student)
 * @body    { type: 'theory'|'lab'|'slides', content: string, context?: string[], options?: object }
 */
router.post('/', authenticate, validate);

/**
 * @route   POST /api/validate/quick
 * @desc    Quick validation without AI evaluation
 * @access  Protected (Admin + Student)
 * @body    { type: 'theory'|'lab'|'slides', content: string }
 */
router.post('/quick', authenticate, quickValidateEndpoint);

/**
 * @route   POST /api/validate/correctness
 * @desc    Check content correctness for a specific topic
 * @access  Protected (Admin + Student)
 * @body    { content: string, topic: string }
 */
router.post('/correctness', authenticate, checkCorrectness);

/**
 * @route   GET /api/validate/stats
 * @desc    Get validation statistics (admin dashboard)
 * @access  Protected (Admin only)
 */
router.get('/stats', authenticate, requireRole('admin'), getValidationStats);

module.exports = router;
