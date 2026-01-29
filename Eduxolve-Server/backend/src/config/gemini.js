const { GoogleGenerativeAI } = require('@google/generative-ai');

// Validate API key exists
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
  console.warn('⚠️ GEMINI_API_KEY not configured. AI features will not work.');
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Default model configuration
const MODEL_NAME = 'gemini-2.5-flash';
const DEFAULT_CONFIG = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 8192,
};

/**
 * Get Gemini model instance
 * @param {Object} config - Optional configuration overrides
 * @returns {GenerativeModel} Gemini model instance
 */
const getModel = (config = {}) => {
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { ...DEFAULT_CONFIG, ...config }
  });
};

/**
 * Generate content using Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} options - Optional configuration
 * @param {number} options.temperature - Creativity level (0-1)
 * @param {number} options.maxTokens - Maximum output tokens
 * @returns {Promise<Object>} Generated content with metadata
 */
const generateContent = async (prompt, options = {}) => {
  try {
    // Check API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const model = getModel({
      temperature: options.temperature || DEFAULT_CONFIG.temperature,
      maxOutputTokens: options.maxTokens || DEFAULT_CONFIG.maxOutputTokens
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      content: text,
      model: MODEL_NAME,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || null,
        completionTokens: response.usageMetadata?.candidatesTokenCount || null,
        totalTokens: response.usageMetadata?.totalTokenCount || null
      }
    };

  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);

    // Handle specific error types
    if (error.message.includes('API_KEY')) {
      return {
        success: false,
        error: 'AI service not configured',
        code: 'API_KEY_MISSING'
      };
    }

    if (error.message.includes('RATE_LIMIT') || error.status === 429) {
      return {
        success: false,
        error: 'AI service rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT'
      };
    }

    if (error.message.includes('SAFETY')) {
      return {
        success: false,
        error: 'Content blocked by safety filters',
        code: 'SAFETY_BLOCK'
      };
    }

    return {
      success: false,
      error: 'AI generation failed',
      code: 'GENERATION_ERROR',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    };
  }
};

/**
 * Generate content with streaming (for future use)
 * @param {string} prompt - The prompt to send
 * @param {Function} onChunk - Callback for each chunk
 * @returns {Promise<string>} Complete generated text
 */
const generateContentStream = async (prompt, onChunk) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const model = getModel();
    const result = await model.generateContentStream(prompt);

    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      if (onChunk) {
        onChunk(chunkText);
      }
    }

    return {
      success: true,
      content: fullText,
      model: MODEL_NAME
    };

  } catch (error) {
    console.error('❌ Gemini Stream Error:', error.message);
    return {
      success: false,
      error: 'AI streaming failed',
      code: 'STREAM_ERROR'
    };
  }
};

module.exports = {
  genAI,
  getModel,
  generateContent,
  generateContentStream,
  MODEL_NAME
};
