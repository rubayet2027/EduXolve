/**
 * Intent Detection Service
 * 
 * Detects user intent from chat messages using:
 * - Deterministic keyword rules (primary)
 * - Optional AI classification (fallback)
 * 
 * Intents:
 * - search: Find information in course materials
 * - generate: Create new content (notes, code, slides)
 * - explain: Explain a concept with context
 * - validate: Check/verify content
 * - followup: Continue previous conversation
 * - greeting: Hello/hi messages
 * - unknown: Cannot determine intent
 */

const { generateContent } = require('../config/gemini');

/**
 * Keyword patterns for deterministic intent detection
 * Priority order matters - first match wins
 */
const INTENT_PATTERNS = {
  // Generation intents (highest priority for explicit requests)
  generate: [
    /\b(generate|create|write|make|build|produce)\b.*\b(notes?|code|slides?|summary|example|program|script)\b/i,
    /\b(give me|show me|can you write|can you create)\b.*\b(code|example|notes?|slides?)\b/i,
    /\bwrite\s+(a\s+)?(code|program|function|class|script)\b/i,
    /\b(implement|code)\s+(a\s+)?(function|class|algorithm|program)\b/i,
  ],
  
  // Validation intents
  validate: [
    /\b(validate|verify|check|review|evaluate|assess)\b.*\b(this|my|the|following)?\b/i,
    /\bis\s+(this|it)\s+(correct|right|valid|accurate)\b/i,
    /\b(am\s+i|is\s+this)\s+(right|correct)\b/i,
  ],
  
  // Explanation intents (questions seeking understanding)
  explain: [
    /\b(explain|describe|what\s+is|what\s+are|what's|how\s+does|how\s+do|why\s+does|why\s+do)\b/i,
    /\bwhat\s+(is|are)\s+(a|an|the)?\s*\w+/i,
    /\bhow\s+(does|do|can|to)\b/i,
    /\bwhy\s+(is|are|does|do)\b/i,
    /\bdefine\s+\w+/i,
    /\btell\s+me\s+about\b/i,
    /\bcan\s+you\s+explain\b/i,
  ],
  
  // Search intents (looking for specific information)
  search: [
    /\b(find|search|look\s+for|look\s+up|where|locate)\b/i,
    /\bshow\s+me\s+(the|all|some)?\s*(notes?|slides?|materials?|content)\b/i,
    /\bin\s+(which|what)\s+(lecture|week|slide|chapter)\b/i,
    /\bwhere\s+(can\s+i|do\s+i|is|are)\s+find\b/i,
  ],
  
  // Followup intents (continuing conversation)
  followup: [
    /^(yes|no|ok|okay|sure|thanks|thank\s+you|got\s+it|i\s+see)\.?$/i,
    /\bmore\s+(details?|info|information|examples?)\b/i,
    /\btell\s+me\s+more\b/i,
    /\bwhat\s+(else|about)\b/i,
    /\band\s+(what|how|why)\b/i,
    /\bcan\s+you\s+(also|elaborate)\b/i,
  ],
  
  // Greeting intents
  greeting: [
    /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))[!?.\s]*$/i,
    /^(what's\s+up|howdy|sup)[!?.\s]*$/i,
  ],
};

/**
 * Extract topic/subject from user message
 * @param {string} message - User message
 * @returns {string} Extracted topic
 */
const extractTopic = (message) => {
  // Remove common question words and extract the main topic
  const cleaned = message
    .replace(/^(can you|could you|please|i want to|i'd like to|i need to)\s+/i, '')
    .replace(/\b(explain|describe|tell me about|what is|what are|how does|how do|why does|why do)\s+/i, '')
    .replace(/\b(search|find|look)\s+(for|up)?\s*/i, '')
    .replace(/\b(generate|create|write|make)\s+(me)?\s*/i, '')
    .replace(/\b(a|an|the)\s+/gi, '')
    .replace(/[?!.,]+$/, '')
    .trim();
  
  return cleaned || message;
};

/**
 * Detect intent using keyword patterns (deterministic)
 * @param {string} message - User message
 * @param {Array} history - Conversation history
 * @returns {{intent: string, confidence: number, topic: string}}
 */
const detectIntentByRules = (message, history = []) => {
  const normalizedMessage = message.trim().toLowerCase();
  
  // Check for empty message
  if (!normalizedMessage) {
    return { intent: 'unknown', confidence: 0, topic: '' };
  }
  
  // Check each intent pattern in priority order
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return {
          intent,
          confidence: 0.9,
          topic: extractTopic(message),
          matchedPattern: pattern.toString()
        };
      }
    }
  }
  
  // Check if it's a follow-up based on history
  if (history.length > 0) {
    // Short messages after conversation are likely follow-ups
    if (normalizedMessage.length < 30 && !normalizedMessage.includes('?')) {
      return { intent: 'followup', confidence: 0.7, topic: extractTopic(message) };
    }
  }
  
  // Default to explain for question-like messages
  if (message.includes('?')) {
    return { intent: 'explain', confidence: 0.6, topic: extractTopic(message) };
  }
  
  // Unknown intent
  return { intent: 'unknown', confidence: 0.3, topic: extractTopic(message) };
};

/**
 * Detect intent using AI (fallback for ambiguous cases)
 * @param {string} message - User message
 * @param {Array} history - Conversation history
 * @returns {Promise<{intent: string, confidence: number, topic: string}>}
 */
const detectIntentByAI = async (message, history = []) => {
  try {
    const historyContext = history.length > 0
      ? `Recent conversation:\n${history.slice(-3).map(h => `${h.role}: ${h.content}`).join('\n')}\n\n`
      : '';
    
    const prompt = `Classify the following user message into ONE of these intents:
- search: Looking for specific information in course materials
- generate: Wants to create content (notes, code, slides)
- explain: Wants explanation or understanding of a concept
- validate: Wants to check or verify something
- followup: Continuing a previous conversation
- greeting: Saying hello or similar

${historyContext}User message: "${message}"

Respond with ONLY a JSON object:
{"intent": "<intent>", "confidence": <0.0-1.0>, "topic": "<main topic>"}`;

    const response = await generateContent(prompt, { temperature: 0.1 });
    
    if (response.success) {
      const jsonStr = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const result = JSON.parse(jsonStr.match(/\{[\s\S]*\}/)[0]);
      return {
        intent: result.intent || 'unknown',
        confidence: result.confidence || 0.5,
        topic: result.topic || extractTopic(message),
        aiClassified: true
      };
    }
  } catch (error) {
    console.error('AI intent detection failed:', error.message);
  }
  
  // Fall back to rules if AI fails
  return detectIntentByRules(message, history);
};

/**
 * Main intent detection function
 * Uses rules first, AI as fallback for low-confidence cases
 * @param {string} message - User message
 * @param {Array} history - Conversation history
 * @param {Object} options - Detection options
 * @returns {Promise<Object>} Intent detection result
 */
const detectIntent = async (message, history = [], options = {}) => {
  // First try deterministic rules
  const ruleResult = detectIntentByRules(message, history);
  
  // If high confidence, use rule result
  if (ruleResult.confidence >= 0.7) {
    return {
      ...ruleResult,
      method: 'rules'
    };
  }
  
  // For low confidence, optionally use AI
  if (options.useAI !== false && ruleResult.confidence < 0.5) {
    const aiResult = await detectIntentByAI(message, history);
    if (aiResult.confidence > ruleResult.confidence) {
      return {
        ...aiResult,
        method: 'ai'
      };
    }
  }
  
  return {
    ...ruleResult,
    method: 'rules'
  };
};

/**
 * Get suggested actions based on intent and context
 * @param {string} intent - Detected intent
 * @param {Object} context - Additional context
 * @returns {string[]} Suggested actions
 */
const getSuggestedActions = (intent, context = {}) => {
  const actions = {
    search: ['view_sources', 'generate_notes', 'explain_more'],
    generate: ['validate', 'regenerate', 'save'],
    explain: ['generate_notes', 'show_code', 'search_related'],
    validate: ['regenerate', 'explain_issues', 'accept'],
    followup: ['continue', 'new_topic', 'summarize'],
    greeting: ['help', 'search', 'generate'],
    unknown: ['rephrase', 'help', 'search'],
  };
  
  return actions[intent] || actions.unknown;
};

module.exports = {
  detectIntent,
  detectIntentByRules,
  detectIntentByAI,
  extractTopic,
  getSuggestedActions,
  INTENT_PATTERNS
};
