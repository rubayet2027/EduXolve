/**
 * Chat Controller
 * 
 * Orchestrates conversational AI with tool-based decision logic:
 * - Intent Detection
 * - RAG Search
 * - AI Generation
 * - Content Validation
 * - Context Management
 */

const { detectIntent, getSuggestedActions } = require('../services/intent.service');
const { semanticSearch, getContextForRAG } = require('../services/search.service');
const { validateTheory, validateCode } = require('../services/validation.service');
const { selfEvaluate } = require('../services/selfEval.service');
const {
  buildGroundedPrompt,
  buildCodePrompt,
  buildNotesPrompt,
  generateChatResponse,
  formatChatResponse,
  buildGreetingResponse,
  buildNoContextResponse
} = require('../services/chatPrompt.service');

// In-memory session storage (simple implementation)
const sessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_HISTORY = 10;

/**
 * Get or create session
 * @param {string} userId - User ID
 * @returns {Object} Session data
 */
const getSession = (userId) => {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      history: [],
      lastTopic: null,
      lastIntent: null,
      createdAt: Date.now()
    });
  }
  
  const session = sessions.get(userId);
  
  // Check for session timeout
  if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
    sessions.set(userId, {
      history: [],
      lastTopic: null,
      lastIntent: null,
      createdAt: Date.now()
    });
    return sessions.get(userId);
  }
  
  return session;
};

/**
 * Update session with new message
 * @param {string} userId - User ID
 * @param {string} role - Message role ('user' or 'assistant')
 * @param {string} content - Message content
 */
const updateSession = (userId, role, content) => {
  const session = getSession(userId);
  session.history.push({ role, content, timestamp: Date.now() });
  
  // Trim history to max size
  if (session.history.length > MAX_HISTORY) {
    session.history = session.history.slice(-MAX_HISTORY);
  }
};

/**
 * @desc    Main chat endpoint - orchestrates all AI interactions
 * @route   POST /api/chat
 * @access  Protected (Admin + Student)
 */
const chat = async (req, res) => {
  try {
    const { message, history: clientHistory } = req.body;
    const userId = req.user?.id || 'anonymous';
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const trimmedMessage = message.trim();
    
    // Get session and merge with client history if provided
    const session = getSession(userId);
    const conversationHistory = clientHistory || session.history;
    
    // Step 1: Detect Intent
    const intentResult = await detectIntent(trimmedMessage, conversationHistory, { useAI: true });
    console.log(`💬 Chat intent: ${intentResult.intent} (${intentResult.confidence}) - "${intentResult.topic}"`);
    
    // Update session
    updateSession(userId, 'user', trimmedMessage);
    session.lastIntent = intentResult.intent;
    session.lastTopic = intentResult.topic;
    
    // Step 2: Route to appropriate handler based on intent
    let response;
    
    switch (intentResult.intent) {
      case 'greeting':
        response = buildGreetingResponse();
        break;
        
      case 'search':
        response = await handleSearchIntent(trimmedMessage, intentResult, conversationHistory);
        break;
        
      case 'generate':
        response = await handleGenerateIntent(trimmedMessage, intentResult, conversationHistory);
        break;
        
      case 'explain':
        response = await handleExplainIntent(trimmedMessage, intentResult, conversationHistory);
        break;
        
      case 'validate':
        response = await handleValidateIntent(trimmedMessage, intentResult, conversationHistory);
        break;
        
      case 'followup':
        response = await handleFollowupIntent(trimmedMessage, session, conversationHistory);
        break;
        
      default:
        // Unknown intent - try explain as default
        response = await handleExplainIntent(trimmedMessage, intentResult, conversationHistory);
    }
    
    // Update session with assistant response
    updateSession(userId, 'assistant', response.reply);
    
    // Return response
    res.status(200).json({
      success: true,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      ...response
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred processing your message',
      reply: "I'm sorry, something went wrong. Please try again.",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

/**
 * Handle search intent - find information in course materials
 */
const handleSearchIntent = async (message, intentResult, history) => {
  const { topic } = intentResult;
  
  // Perform semantic search using getContextForRAG which returns chunks
  console.log(`🔍 Chat search for topic: "${topic}"`);
  const contextResult = await getContextForRAG(topic, { maxChunks: 5 });
  console.log(`🔍 Search result success: ${contextResult.success}, chunks: ${contextResult.chunks?.length || 0}`);
  
  if (!contextResult.success || contextResult.chunks.length === 0) {
    return buildNoContextResponse(topic);
  }
  
  // Build response summarizing findings
  const contextChunks = contextResult.chunks;
  const prompt = buildGroundedPrompt(
    `Summarize what the course materials say about: ${topic}`,
    contextChunks,
    { intent: 'search', history }
  );
  
  const aiResponse = await generateChatResponse(prompt);
  
  return formatChatResponse(
    aiResponse.reply,
    contextChunks,
    getSuggestedActions('search')
  );
};

/**
 * Handle generate intent - create notes, code, slides
 */
const handleGenerateIntent = async (message, intentResult, history) => {
  const { topic } = intentResult;
  
  // Detect what to generate
  const isCode = /\b(code|program|function|implement|script|class)\b/i.test(message);
  const isNotes = /\b(notes?|summary|overview)\b/i.test(message);
  
  // Get RAG context
  const contextResult = await getContextForRAG(topic, { maxChunks: 5 });
  const contextChunks = contextResult.success ? contextResult.chunks : [];
  
  let prompt;
  let response;
  
  if (isCode) {
    // Detect language
    const langMatch = message.match(/\b(python|javascript|java|c\+\+|c|js|py)\b/i);
    const language = langMatch ? langMatch[1].toLowerCase() : 'python';
    
    prompt = buildCodePrompt(topic, language, contextChunks);
    response = await generateChatResponse(prompt, { temperature: 0.5 });
    
    // Optionally validate generated code
    if (response.success) {
      const validation = validateCode(response.reply, language);
      if (!validation.valid) {
        response.reply += `\n\n⚠️ **Note:** ${validation.explanation}`;
      }
    }
  } else {
    // Generate notes by default
    prompt = buildNotesPrompt(topic, contextChunks);
    response = await generateChatResponse(prompt, { temperature: 0.6 });
  }
  
  if (!response.success) {
    return {
      reply: "I couldn't generate the content. Please try again or rephrase your request.",
      sources: [],
      actions: ['rephrase', 'try_again']
    };
  }
  
  return formatChatResponse(
    response.reply,
    contextChunks,
    getSuggestedActions('generate')
  );
};

/**
 * Handle explain intent - explain concepts with RAG context
 */
const handleExplainIntent = async (message, intentResult, history) => {
  const { topic } = intentResult;
  
  // Get RAG context
  const contextResult = await getContextForRAG(topic, { maxChunks: 5 });
  
  if (!contextResult.success || contextResult.chunks.length === 0) {
    // Try broader search
    const searchResult = await semanticSearch(topic, { limit: 3 });
    
    if (!searchResult.success || searchResult.results.length === 0) {
      return buildNoContextResponse(topic);
    }
    
    contextResult.chunks = searchResult.results;
  }
  
  // Build grounded prompt
  const prompt = buildGroundedPrompt(message, contextResult.chunks, {
    intent: 'explain',
    history
  });
  
  const response = await generateChatResponse(prompt);
  
  if (!response.success) {
    return {
      reply: "I'm having trouble explaining this right now. Please try again.",
      sources: [],
      actions: ['try_again', 'rephrase']
    };
  }
  
  return formatChatResponse(
    response.reply,
    contextResult.chunks,
    getSuggestedActions('explain')
  );
};

/**
 * Handle validate intent - validate content
 */
const handleValidateIntent = async (message, intentResult, history) => {
  // Extract content to validate from message or history
  let contentToValidate = message;
  
  // Check if they're referring to previous content
  if (history.length > 0 && message.length < 50) {
    const lastAssistant = [...history].reverse().find(h => h.role === 'assistant');
    if (lastAssistant) {
      contentToValidate = lastAssistant.content;
    }
  }
  
  // Detect content type
  const isCode = /```|def |function |class |const |let |int |void /.test(contentToValidate);
  
  let validationResult;
  if (isCode) {
    // Extract code from markdown if present
    const codeMatch = contentToValidate.match(/```[\w]*\n?([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1] : contentToValidate;
    
    // Detect language
    const langMatch = contentToValidate.match(/```(\w+)/);
    const language = langMatch ? langMatch[1] : 'python';
    
    validationResult = validateCode(code, language);
    
    // Also get AI evaluation
    const aiEval = await selfEvaluate(code, 'lab', []);
    
    const reply = `## Validation Results\n\n**Score:** ${validationResult.score * 100}%\n**Status:** ${validationResult.valid ? '✅ Valid' : '⚠️ Issues Found'}\n\n${validationResult.issues.length > 0 ? '**Issues:**\n' + validationResult.issues.map(i => `- ${i}`).join('\n') : 'No issues found!'}\n\n${aiEval.success ? `**AI Assessment:** ${aiEval.explanation}` : ''}`;
    
    return {
      reply,
      sources: [],
      actions: ['regenerate', 'explain_issues', 'accept'],
      validation: validationResult
    };
  } else {
    // Validate as theory
    validationResult = await validateTheory(contentToValidate, []);
    
    const reply = `## Validation Results\n\n**Score:** ${validationResult.score * 100}%\n**Status:** ${validationResult.valid ? '✅ Valid' : '⚠️ Needs Improvement'}\n\n**Grounding:** ${validationResult.layers.grounding.explanation}\n**Structure:** ${validationResult.layers.structure.explanation}\n\n${validationResult.feedback}`;
    
    return {
      reply,
      sources: [],
      actions: ['improve', 'regenerate', 'accept'],
      validation: validationResult
    };
  }
};

/**
 * Handle followup intent - continue conversation
 */
const handleFollowupIntent = async (message, session, history) => {
  // Use context from previous turn
  const lastTopic = session.lastTopic || 'the previous topic';
  
  // Build a continuation prompt
  const prompt = buildGroundedPrompt(
    `Continue the conversation. The student says: "${message}". Previous topic was: ${lastTopic}`,
    [],
    { intent: 'followup', history }
  );
  
  const response = await generateChatResponse(prompt);
  
  return formatChatResponse(
    response.reply,
    [],
    getSuggestedActions('followup')
  );
};

/**
 * @desc    Clear chat session
 * @route   POST /api/chat/clear
 * @access  Protected
 */
const clearSession = async (req, res) => {
  const userId = req.user?.id || 'anonymous';
  sessions.delete(userId);
  
  res.status(200).json({
    success: true,
    message: 'Chat session cleared'
  });
};

/**
 * @desc    Get chat session history
 * @route   GET /api/chat/history
 * @access  Protected
 */
const getHistory = async (req, res) => {
  const userId = req.user?.id || 'anonymous';
  const session = getSession(userId);
  
  res.status(200).json({
    success: true,
    history: session.history,
    lastTopic: session.lastTopic
  });
};

/**
 * @desc    Quick action endpoint
 * @route   POST /api/chat/action
 * @access  Protected
 */
const executeAction = async (req, res) => {
  try {
    const { action, context } = req.body;
    const userId = req.user?.id || 'anonymous';
    const session = getSession(userId);
    
    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }
    
    let response;
    
    switch (action) {
      case 'generate_notes':
        response = await handleGenerateIntent(
          `Generate notes about ${context || session.lastTopic}`,
          { topic: context || session.lastTopic },
          session.history
        );
        break;
        
      case 'show_code':
        response = await handleGenerateIntent(
          `Generate code example for ${context || session.lastTopic}`,
          { topic: context || session.lastTopic },
          session.history
        );
        break;
        
      case 'validate':
        response = await handleValidateIntent(
          'Validate the previous content',
          { topic: 'validation' },
          session.history
        );
        break;
        
      case 'search_related':
        response = await handleSearchIntent(
          `Find related information about ${context || session.lastTopic}`,
          { topic: context || session.lastTopic },
          session.history
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: `Unknown action: ${action}`
        });
    }
    
    // Update session
    updateSession(userId, 'assistant', response.reply);
    
    res.status(200).json({
      success: true,
      action,
      ...response
    });
    
  } catch (error) {
    console.error('Action error:', error);
    res.status(500).json({
      success: false,
      message: 'Action failed',
      error: error.message
    });
  }
};

module.exports = {
  chat,
  clearSession,
  getHistory,
  executeAction
};
