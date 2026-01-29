/**
 * Validation Controller
 * 
 * Handles content validation requests with multi-layer evaluation
 */

const { validateTheory, validateCode, validateSlides, checkGrounding } = require('../services/validation.service');
const { selfEvaluate, quickValidate, evaluateCorrectness } = require('../services/selfEval.service');

// Optional: Store validation results
const ValidationLog = require('../models/ValidationLog');

/**
 * @desc    Validate AI-generated content
 * @route   POST /api/validate
 * @access  Protected (Admin + Student)
 */
const validate = async (req, res) => {
  try {
    const { type, content, context = [], options = {} } = req.body;

    // Input validation
    if (!type || !['theory', 'lab', 'slides'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be one of: theory, lab, slides'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Quick validation first
    const quickCheck = await quickValidate(content, type);
    if (!quickCheck.valid) {
      return res.status(400).json({
        success: false,
        valid: false,
        score: 0,
        feedback: quickCheck.reason
      });
    }

    let validationResult;

    // Route to appropriate validator
    switch (type) {
      case 'theory':
        validationResult = await validateTheoryContent(content, context, options);
        break;
      case 'lab':
        validationResult = await validateLabContent(content, context, options);
        break;
      case 'slides':
        validationResult = await validateSlidesContent(content, context, options);
        break;
    }

    // Optional: Log validation result
    if (options.log !== false) {
      try {
        await ValidationLog.create({
          type,
          contentLength: content.length,
          score: validationResult.score,
          valid: validationResult.valid,
          userId: req.user?.id,
          timestamp: new Date()
        });
      } catch (logError) {
        console.error('Validation logging failed:', logError.message);
        // Don't fail the request if logging fails
      }
    }

    res.status(200).json({
      success: true,
      ...validationResult
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation failed',
      error: error.message
    });
  }
};

/**
 * Validate theory content with all layers
 */
const validateTheoryContent = async (content, context, options) => {
  // Layer 1 & 2: Grounding + Structure
  const baseValidation = await validateTheory(content, context);
  
  // Layer 4: AI Self-evaluation (if enabled)
  let aiEvaluation = null;
  if (options.aiEval !== false) {
    aiEvaluation = await selfEvaluate(content, 'theory', context);
  }

  // Combine scores
  let finalScore = baseValidation.score;
  if (aiEvaluation?.success) {
    // Weighted average: 60% base + 40% AI evaluation
    finalScore = (baseValidation.score * 0.6) + (aiEvaluation.normalizedScore * 0.4);
  }

  return {
    valid: finalScore >= 0.5,
    score: Math.round(finalScore * 100) / 100,
    type: 'theory',
    layers: {
      ...baseValidation.layers,
      aiEvaluation: aiEvaluation ? {
        score: aiEvaluation.totalScore,
        breakdown: aiEvaluation.breakdown,
        strengths: aiEvaluation.strengths,
        improvements: aiEvaluation.improvements
      } : null
    },
    feedback: generateFeedback(finalScore, 'theory', baseValidation, aiEvaluation)
  };
};

/**
 * Validate lab/code content with all layers
 */
const validateLabContent = async (content, context, options) => {
  const language = options.language || detectLanguage(content);
  
  // Layer 1: Grounding check
  const grounding = context.length > 0 
    ? await checkGrounding(content, context)
    : { score: 0.7, explanation: 'No context provided' };
  
  // Layer 3: Code validation
  const codeValidation = validateCode(content, language);
  
  // Layer 4: AI Self-evaluation
  let aiEvaluation = null;
  if (options.aiEval !== false) {
    aiEvaluation = await selfEvaluate(content, 'lab', context);
  }

  // Combine scores: 30% grounding + 40% code validation + 30% AI eval
  let finalScore = (grounding.score * 0.3) + (codeValidation.score * 0.4);
  if (aiEvaluation?.success) {
    finalScore += (aiEvaluation.normalizedScore * 0.3);
  } else {
    finalScore += (codeValidation.score * 0.3); // Fall back to code validation weight
  }

  return {
    valid: codeValidation.valid && finalScore >= 0.5,
    score: Math.round(finalScore * 100) / 100,
    type: 'lab',
    language,
    layers: {
      grounding: {
        score: grounding.score,
        explanation: grounding.explanation
      },
      codeValidation: {
        score: codeValidation.score,
        valid: codeValidation.valid,
        issues: codeValidation.issues,
        explanation: codeValidation.explanation
      },
      aiEvaluation: aiEvaluation ? {
        score: aiEvaluation.totalScore,
        breakdown: aiEvaluation.breakdown,
        strengths: aiEvaluation.strengths,
        improvements: aiEvaluation.improvements
      } : null
    },
    feedback: generateFeedback(finalScore, 'lab', { codeValidation, grounding }, aiEvaluation)
  };
};

/**
 * Validate slides content with all layers
 */
const validateSlidesContent = async (content, context, options) => {
  // Layer 1: Grounding check
  const grounding = context.length > 0 
    ? await checkGrounding(content, context)
    : { score: 0.7, explanation: 'No context provided' };
  
  // Layer 2: Slides structure
  const slideValidation = validateSlides(content);
  
  // Layer 4: AI Self-evaluation
  let aiEvaluation = null;
  if (options.aiEval !== false) {
    aiEvaluation = await selfEvaluate(content, 'slides', context);
  }

  // Combine scores
  let finalScore = (grounding.score * 0.3) + (slideValidation.score * 0.4);
  if (aiEvaluation?.success) {
    finalScore += (aiEvaluation.normalizedScore * 0.3);
  } else {
    finalScore += (slideValidation.score * 0.3);
  }

  return {
    valid: finalScore >= 0.5,
    score: Math.round(finalScore * 100) / 100,
    type: 'slides',
    slideCount: slideValidation.slideCount,
    layers: {
      grounding: {
        score: grounding.score,
        explanation: grounding.explanation
      },
      structure: {
        score: slideValidation.score,
        issues: slideValidation.issues,
        explanation: slideValidation.explanation
      },
      aiEvaluation: aiEvaluation ? {
        score: aiEvaluation.totalScore,
        breakdown: aiEvaluation.breakdown,
        strengths: aiEvaluation.strengths,
        improvements: aiEvaluation.improvements
      } : null
    },
    feedback: generateFeedback(finalScore, 'slides', { slideValidation, grounding }, aiEvaluation)
  };
};

/**
 * Generate human-readable feedback
 */
const generateFeedback = (score, type, baseValidation, aiEvaluation) => {
  let feedback = '';
  
  if (score >= 0.8) {
    feedback = `Excellent ${type} content! `;
  } else if (score >= 0.6) {
    feedback = `Good ${type} content with room for improvement. `;
  } else if (score >= 0.5) {
    feedback = `Acceptable ${type} content but needs work. `;
  } else {
    feedback = `${type.charAt(0).toUpperCase() + type.slice(1)} content needs significant improvements. `;
  }
  
  // Add specific feedback from AI evaluation
  if (aiEvaluation?.success && aiEvaluation.improvements?.length > 0) {
    feedback += `Suggestions: ${aiEvaluation.improvements.slice(0, 2).join('; ')}.`;
  }
  
  return feedback;
};

/**
 * Detect programming language from code
 */
const detectLanguage = (code) => {
  if (/\bdef\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import/.test(code)) return 'python';
  if (/\bfunction\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|=>\s*{/.test(code)) return 'javascript';
  if (/\bpublic\s+class|private\s+void|System\.out\.print/.test(code)) return 'java';
  if (/\b#include\s*<|int\s+main\s*\(|printf\s*\(/.test(code)) return 'c';
  return 'unknown';
};

/**
 * @desc    Quick validation without AI evaluation
 * @route   POST /api/validate/quick
 * @access  Protected
 */
const quickValidateEndpoint = async (req, res) => {
  try {
    const { type, content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const result = await quickValidate(content, type || 'theory');

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Quick validation failed',
      error: error.message
    });
  }
};

/**
 * @desc    Check correctness only
 * @route   POST /api/validate/correctness
 * @access  Protected
 */
const checkCorrectness = async (req, res) => {
  try {
    const { content, topic } = req.body;

    if (!content || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Content and topic are required'
      });
    }

    const result = await evaluateCorrectness(content, topic);

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Correctness check failed',
      error: error.message
    });
  }
};

/**
 * @desc    Get validation statistics
 * @route   GET /api/validate/stats
 * @access  Protected (Admin)
 */
const getValidationStats = async (req, res) => {
  try {
    const stats = await ValidationLog.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
          passRate: {
            $avg: { $cond: ['$valid', 1, 0] }
          }
        }
      }
    ]);

    const totalValidations = await ValidationLog.countDocuments();
    const recentValidations = await ValidationLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .select('type score valid timestamp');

    res.status(200).json({
      success: true,
      data: {
        total: totalValidations,
        byType: stats.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            avgScore: Math.round(item.avgScore * 100) / 100,
            passRate: Math.round(item.passRate * 100) + '%'
          };
          return acc;
        }, {}),
        recent: recentValidations
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch validation stats',
      error: error.message
    });
  }
};

module.exports = {
  validate,
  quickValidateEndpoint,
  checkCorrectness,
  getValidationStats
};
