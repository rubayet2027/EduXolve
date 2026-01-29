/**
 * Chat Routes
 * 
 * Conversational AI endpoints with tool-based orchestration
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares');
const {
  chat,
  clearSession,
  getHistory,
  executeAction
} = require('../controllers/chat.controller');

/**
 * @route   POST /api/chat
 * @desc    Main chat endpoint - orchestrates AI interactions
 * @access  Protected (Admin + Student)
 * @body    { message: string, history?: Array<{role, content}> }
 * @returns { reply, sources, actions, intent, confidence }
 */
router.post('/', authenticate, chat);

/**
 * @route   POST /api/chat/clear
 * @desc    Clear chat session history
 * @access  Protected
 */
router.post('/clear', authenticate, clearSession);

/**
 * @route   GET /api/chat/history
 * @desc    Get current chat session history
 * @access  Protected
 */
router.get('/history', authenticate, getHistory);

/**
 * @route   POST /api/chat/action
 * @desc    Execute a quick action (generate_notes, show_code, validate, etc.)
 * @access  Protected
 * @body    { action: string, context?: string }
 */
router.post('/action', authenticate, executeAction);

module.exports = router;
