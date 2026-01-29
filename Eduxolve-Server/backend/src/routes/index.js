const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health.routes');
const userRoutes = require('./user.routes');
const contentRoutes = require('./content.routes');
const aiRoutes = require('./ai.routes');
const searchRoutes = require('./search.routes');
const validationRoutes = require('./validation.routes');
const chatRoutes = require('./chat.routes');
const fileRoutes = require('./file.routes');

/**
 * Central route registration
 * All routes are registered here for clean separation
 */

// Health check - public
router.use('/', healthRoutes);

// User routes - includes /me (protected)
router.use('/', userRoutes);

// Content routes - CMS
router.use('/content', contentRoutes);

// AI routes - Generation engine
router.use('/ai', aiRoutes);

// Search routes - Semantic search & RAG
router.use('/search', searchRoutes);

// Validation routes - Content evaluation
router.use('/validate', validationRoutes);

// Chat routes - Conversational AI
router.use('/chat', chatRoutes);

// File routes - File upload & context
router.use('/files', fileRoutes);

// DEV TEST: Direct search test endpoint (remove in production)
const { getIndexingStats, indexContent } = require('../services/indexing.service');
const { semanticSearch } = require('../services/search.service');
const { validateTheory, validateCode, validateSlides } = require('../services/validation.service');
const { selfEvaluate } = require('../services/selfEval.service');
const Content = require('../models/Content');

router.get('/test/search-stats', async (req, res) => {
  try {
    const stats = await getIndexingStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/test/search', async (req, res) => {
  try {
    const { query, type, limit } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query required' });
    }
    const results = await semanticSearch(query, { type, limit: limit || 5 });
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DEV TEST: Validation test endpoints
router.post('/test/validate', async (req, res) => {
  try {
    const { type, content, context = [] } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Content required' });
    }
    
    let result;
    switch (type) {
      case 'theory':
        result = await validateTheory(content, context);
        break;
      case 'lab':
        result = validateCode(content, req.body.language || 'python');
        break;
      case 'slides':
        result = validateSlides(content);
        break;
      default:
        result = await validateTheory(content, context);
    }
    
    res.json({ success: true, type: type || 'theory', data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/test/ai-eval', async (req, res) => {
  try {
    const { type = 'theory', content, context = [] } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Content required' });
    }
    
    const result = await selfEvaluate(content, type, context);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DEV TEST: Chat test endpoints
const { detectIntent, getSuggestedActions } = require('../services/intent.service');
const { buildGroundedPrompt, buildCodePrompt, buildNotesPrompt, generateChatResponse } = require('../services/chatPrompt.service');
const { getContextForRAG } = require('../services/search.service');

router.post('/test/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message required' });
    }
    
    // Step 1: Detect intent
    const intent = await detectIntent(message, history, { useAI: false });
    
    // Step 2: Get RAG context
    const contextResult = await getContextForRAG(intent.topic, { maxChunks: 5 });
    const contextChunks = contextResult.success ? contextResult.chunks : [];
    
    // Step 3: Build prompt based on intent
    let prompt;
    if (intent.intent === 'generate') {
      const isCode = /\b(code|program|function|implement|script|class)\b/i.test(message);
      if (isCode) {
        const langMatch = message.match(/\b(python|javascript|java|c\+\+|c|js|py)\b/i);
        const language = langMatch ? langMatch[1].toLowerCase() : 'python';
        prompt = buildCodePrompt(intent.topic, language, contextChunks);
      } else {
        prompt = buildNotesPrompt(intent.topic, contextChunks);
      }
    } else {
      prompt = buildGroundedPrompt(message, contextChunks, {
        intent: intent.intent,
        history
      });
    }
    
    // Step 4: Generate response
    const response = await generateChatResponse(prompt, {
      temperature: intent.intent === 'generate' ? 0.5 : 0.7
    });
    
    res.json({
      success: true,
      intent: intent.intent,
      confidence: intent.confidence,
      topic: intent.topic,
      reply: response.reply,
      sourcesCount: contextChunks.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/test/intent', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message required' });
    }
    
    const result = await detectIntent(message, history, { useAI: false });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create test content and index it
router.post('/test/create-content', async (req, res) => {
  try {
    const { title, text, type = 'theory', week = 1, topic = 'Test Topic' } = req.body;
    
    // Get or create a test admin user
    const User = require('../models/User');
    let testUser = await User.findOne({ email: 'test@eduxolve.com' });
    if (!testUser) {
      testUser = await User.create({
        firebaseUid: 'test-uid-' + Date.now(),
        email: 'test@eduxolve.com',
        role: 'admin'
      });
    }
    
    // Create content directly in DB (for testing)
    const content = await Content.create({
      title: title || 'Test Content',
      type,
      week,
      topic,
      tags: ['test', 'demo'],
      fileUrl: 'test://mock-file.txt',
      fileType: 'text',
      originalFileName: 'test-content.txt',
      fileSize: text ? text.length : 100,
      uploadedBy: testUser._id
    });

    // Mock text extraction by storing text in metadata
    const Embedding = require('../models/Embedding');
    const { chunkForIndexing } = require('../utils/chunkText');
    const { generateEmbeddings } = require('../services/embedding.service');

    const fullText = `${title}\n\n${topic}\n\n${text || 'Test content for semantic search'}`;
    const chunks = chunkForIndexing(fullText, { contentId: content._id, week, topic, contentType: type });

    if (chunks.length > 0) {
      const chunkTexts = chunks.map(c => c.text);
      const embeddings = await generateEmbeddings(chunkTexts);

      const embeddingDocs = chunks.map((chunk, index) => ({
        contentId: content._id,
        chunkText: chunk.text,
        chunkIndex: index,
        vector: embeddings[index],
        type: content.type,
        metadata: { week, topic, totalChunks: chunks.length }
      }));

      await Embedding.insertMany(embeddingDocs);
    }

    res.json({ 
      success: true, 
      message: 'Test content created and indexed',
      data: { contentId: content._id, title: content.title, chunksIndexed: chunks.length }
    });
  } catch (err) {
    console.error('Test content error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduXolve API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      me: 'GET /me (protected)',
      meFull: 'GET /me/full (protected)',
      adminUsers: 'GET /admin/users (admin only)',
      content: {
        list: 'GET /content (protected)',
        get: 'GET /content/:id (protected)',
        upload: 'POST /content (admin only)',
        update: 'PATCH /content/:id (admin only)',
        delete: 'DELETE /content/:id (admin only)'
      },
      ai: {
        info: 'GET /ai/info (protected)',
        generate: 'POST /ai/generate (protected)',
        theory: 'POST /ai/theory (protected)',
        lab: 'POST /ai/lab (protected)',
        slides: 'POST /ai/slides (protected)'
      },
      search: {
        search: 'POST /search (protected)',
        suggestions: 'GET /search/suggestions?q= (protected)',
        context: 'POST /search/context (protected)',
        related: 'GET /search/related/:contentId (protected)',
        stats: 'GET /search/stats (admin only)',
        indexSingle: 'POST /search/index/:contentId (admin only)',
        indexAll: 'POST /search/index-all (admin only)'
      },
      validate: {
        validate: 'POST /validate (protected)',
        quick: 'POST /validate/quick (protected)',
        correctness: 'POST /validate/correctness (protected)',
        stats: 'GET /validate/stats (admin only)'
      },
      chat: {
        chat: 'POST /chat (protected)',
        clear: 'POST /chat/clear (protected)',
        history: 'GET /chat/history (protected)',
        action: 'POST /chat/action (protected)'
      }
    }
  });
});

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = router;
