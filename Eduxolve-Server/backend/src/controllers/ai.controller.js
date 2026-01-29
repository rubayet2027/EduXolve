const { generateContent } = require('../config/gemini');
const {
  buildPrompt,
  validateParams,
  getSupportedTypes,
  getSupportedLanguages
} = require('../services/aiPrompt.service');
const { getStoredContext } = require('./file.controller');
const { formatContextForPrompt, getFileResponseDisclaimer } = require('../services/fileContext.service');

/**
 * @desc    Generate AI content (theory, lab code, slides)
 * @route   POST /api/ai/generate
 * @access  Protected (Admin + Student)
 */
const generate = async (req, res) => {
  try {
    const { type, topic, language, context, options, fileId } = req.body;

    // Validate required fields
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Type is required',
        supportedTypes: getSupportedTypes()
      });
    }

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    // Validate parameters
    const validation = validateParams(type, topic, language);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: validation.errors
      });
    }

    // Check for file context
    let fileContextStr = '';
    let hasFileContext = false;
    if (fileId) {
      const stored = getStoredContext(fileId);
      if (stored) {
        fileContextStr = stored.formattedContext || '';
        hasFileContext = true;
        console.log(`📎 Using file context for generation: ${stored.context?.filename}`);
      }
    }

    // Combine contexts
    const combinedContext = fileContextStr + (context || '');

    // Build the prompt
    const prompt = buildPrompt(type, topic.trim(), {
      language: language || 'python',
      context: combinedContext,
      options: options || {}
    });

    // Generate content using Gemini
    const result = await generateContent(prompt, {
      temperature: type === 'lab' ? 0.3 : 0.7, // Lower temperature for code
      maxTokens: type === 'slides' ? 4096 : 8192
    });

    // Handle generation errors
    if (!result.success) {
      const statusCode = result.code === 'RATE_LIMIT' ? 429 : 
                         result.code === 'API_KEY_MISSING' ? 503 : 500;
      
      return res.status(statusCode).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }

    // Build sources list
    const sources = [];
    if (hasFileContext) sources.push('uploaded_file');
    if (context) sources.push('course_materials');
    if (sources.length === 0) sources.push('ai_generated');

    // Return successful response
    res.status(200).json({
      success: true,
      data: {
        content: result.content,
        type,
        topic,
        language: type === 'lab' ? (language || 'python') : undefined,
        sources,
        hasFileContext,
        model: result.model,
        usage: result.usage
      }
    });

  } catch (error) {
    console.error('❌ AI Generation Error:', error);

    res.status(500).json({
      success: false,
      error: 'AI generation failed',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get supported generation types and languages
 * @route   GET /api/ai/info
 * @access  Protected (Admin + Student)
 */
const getInfo = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      types: getSupportedTypes(),
      languages: getSupportedLanguages(),
      endpoints: {
        generate: {
          method: 'POST',
          path: '/api/ai/generate',
          body: {
            type: 'theory | lab | slides (required)',
            topic: 'string (required)',
            language: 'string (required for lab type)',
            context: 'string (optional - course material snippets)',
            options: 'object (optional - additional settings)'
          }
        }
      },
      options: {
        theory: {
          depth: 'comprehensive | brief | detailed',
          format: 'notes | article | outline'
        },
        lab: {
          difficulty: 'beginner | intermediate | advanced',
          includeTests: 'boolean (default: true)'
        },
        slides: {
          slideCount: 'number (default: 10)',
          audience: 'string (default: undergraduate students)'
        }
      }
    }
  });
};

/**
 * @desc    Quick theory generation
 * @route   POST /api/ai/theory
 * @access  Protected (Admin + Student)
 */
const generateTheory = async (req, res) => {
  req.body.type = 'theory';
  return generate(req, res);
};

/**
 * @desc    Quick lab code generation
 * @route   POST /api/ai/lab
 * @access  Protected (Admin + Student)
 */
const generateLab = async (req, res) => {
  req.body.type = 'lab';
  return generate(req, res);
};

/**
 * @desc    Quick slides generation
 * @route   POST /api/ai/slides
 * @access  Protected (Admin + Student)
 */
const generateSlides = async (req, res) => {
  req.body.type = 'slides';
  return generate(req, res);
};

module.exports = {
  generate,
  getInfo,
  generateTheory,
  generateLab,
  generateSlides
};
