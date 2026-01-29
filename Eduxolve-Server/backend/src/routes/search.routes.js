const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares');
const {
  search,
  suggestions,
  related,
  indexSingle,
  indexAll,
  stats,
  getContext
} = require('../controllers/search.controller');

/**
 * @route   POST /api/search
 * @desc    Semantic search for course content
 * @access  Protected (Admin + Student)
 * @body    { query, type?, week?, topic?, limit? }
 */
router.post('/', authenticate, search);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions
 * @access  Protected (Admin + Student)
 * @query   q - partial query string
 */
router.get('/suggestions', authenticate, suggestions);

/**
 * @route   POST /api/search/context
 * @desc    Get RAG context for a topic
 * @access  Protected (Admin + Student)
 * @body    { topic, type?, maxChunks? }
 */
router.post('/context', authenticate, getContext);

/**
 * @route   GET /api/search/related/:contentId
 * @desc    Get related content
 * @access  Protected (Admin + Student)
 * @param   contentId - Content ObjectId
 */
router.get('/related/:contentId', authenticate, related);

/**
 * @route   GET /api/search/stats
 * @desc    Get indexing statistics
 * @access  Protected (Admin only)
 */
router.get('/stats', authenticate, requireRole('admin'), stats);

/**
 * @route   POST /api/search/index/:contentId
 * @desc    Index a specific content item
 * @access  Protected (Admin only)
 */
router.post('/index/:contentId', authenticate, requireRole('admin'), indexSingle);

/**
 * @route   POST /api/search/index-all
 * @desc    Index all unindexed content
 * @access  Protected (Admin only)
 */
router.post('/index-all', authenticate, requireRole('admin'), indexAll);

module.exports = router;
