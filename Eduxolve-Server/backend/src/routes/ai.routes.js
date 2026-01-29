const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares');
const {
  generate,
  getInfo,
  generateTheory,
  generateLab,
  generateSlides
} = require('../controllers/ai.controller');

/**
 * @route   GET /api/ai/info
 * @desc    Get AI service info (supported types, languages)
 * @access  Protected (Admin + Student)
 */
router.get('/info', authenticate, getInfo);

/**
 * @route   POST /api/ai/generate
 * @desc    Generate AI content (theory, lab, slides)
 * @access  Protected (Admin + Student)
 * @body    { type, topic, language?, context?, options? }
 */
router.post('/generate', authenticate, generate);

/**
 * @route   POST /api/ai/theory
 * @desc    Quick endpoint for theory generation
 * @access  Protected (Admin + Student)
 * @body    { topic, context?, options? }
 */
router.post('/theory', authenticate, generateTheory);

/**
 * @route   POST /api/ai/lab
 * @desc    Quick endpoint for lab code generation
 * @access  Protected (Admin + Student)
 * @body    { topic, language, context?, options? }
 */
router.post('/lab', authenticate, generateLab);

/**
 * @route   POST /api/ai/slides
 * @desc    Quick endpoint for slides generation
 * @access  Protected (Admin + Student)
 * @body    { topic, context?, options? }
 */
router.post('/slides', authenticate, generateSlides);

module.exports = router;
