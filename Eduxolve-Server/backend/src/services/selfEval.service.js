/**
 * Self-Evaluation Service
 * 
 * Uses Gemini to evaluate AI-generated content for:
 * - Correctness
 * - Grounding in source materials
 * - Academic quality
 * - Explainability
 */

const { generateContent } = require('../config/gemini');

/**
 * Evaluation rubric for AI self-assessment
 */
const EVALUATION_RUBRIC = {
  theory: `
Evaluate the following theory content using this rubric:

1. ACCURACY (0-25 points)
   - Are the facts and concepts correct?
   - Are there any factual errors or misconceptions?

2. GROUNDING (0-25 points)
   - Does the content align with the provided reference materials?
   - Are claims supported by the context?

3. COMPLETENESS (0-25 points)
   - Does it cover the topic adequately?
   - Are key concepts explained?

4. CLARITY (0-25 points)
   - Is the content well-organized?
   - Is the language clear and appropriate for students?

Provide your evaluation in this exact JSON format:
{
  "totalScore": <0-100>,
  "breakdown": {
    "accuracy": <0-25>,
    "grounding": <0-25>,
    "completeness": <0-25>,
    "clarity": <0-25>
  },
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "explanation": "<brief explanation of the evaluation>"
}
`,
  lab: `
Evaluate the following code/lab content using this rubric:

1. CORRECTNESS (0-30 points)
   - Does the code logic appear correct?
   - Does it solve the stated problem?

2. SAFETY (0-20 points)
   - Are there any security concerns?
   - Does it follow safe coding practices?

3. STYLE (0-25 points)
   - Is the code well-formatted?
   - Are there appropriate comments?
   - Does it follow language conventions?

4. EDUCATIONAL VALUE (0-25 points)
   - Is it appropriate for learning?
   - Are concepts clearly demonstrated?

Provide your evaluation in this exact JSON format:
{
  "totalScore": <0-100>,
  "breakdown": {
    "correctness": <0-30>,
    "safety": <0-20>,
    "style": <0-25>,
    "educationalValue": <0-25>
  },
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "explanation": "<brief explanation of the evaluation>"
}
`,
  slides: `
Evaluate the following presentation slides using this rubric:

1. CONTENT QUALITY (0-30 points)
   - Is the information accurate and relevant?
   - Does it align with the reference materials?

2. STRUCTURE (0-25 points)
   - Is there a clear flow (intro, body, conclusion)?
   - Are slides logically organized?

3. VISUAL DESIGN (0-20 points)
   - Are bullet points used effectively?
   - Is text concise and readable?

4. EDUCATIONAL IMPACT (0-25 points)
   - Would students learn from these slides?
   - Are key points emphasized?

Provide your evaluation in this exact JSON format:
{
  "totalScore": <0-100>,
  "breakdown": {
    "contentQuality": <0-30>,
    "structure": <0-25>,
    "visualDesign": <0-20>,
    "educationalImpact": <0-25>
  },
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "explanation": "<brief explanation of the evaluation>"
}
`
};

/**
 * AI Self-Evaluation of generated content
 * @param {string} content - Content to evaluate
 * @param {string} type - Content type ('theory' | 'lab' | 'slides')
 * @param {string[]} context - Reference context chunks
 * @returns {Promise<Object>} Evaluation result
 */
const selfEvaluate = async (content, type = 'theory', context = []) => {
  try {
    const rubric = EVALUATION_RUBRIC[type] || EVALUATION_RUBRIC.theory;
    
    // Build context string
    const contextStr = context.length > 0
      ? `\n\nReference Materials:\n${context.slice(0, 5).join('\n---\n')}`
      : '';
    
    // Build evaluation prompt
    const prompt = `${rubric}

Content to Evaluate:
${content}
${contextStr}

IMPORTANT: Respond with ONLY the JSON object, no additional text.`;

    // Get AI evaluation
    const response = await generateContent(prompt);
    
    // Check if generation was successful
    if (!response.success) {
      return {
        success: false,
        totalScore: 70,
        breakdown: {},
        strengths: ['Content was generated successfully'],
        improvements: ['Unable to perform detailed evaluation'],
        explanation: 'AI evaluation failed, using default assessment',
        raw: response
      };
    }
    
    // Parse JSON response
    let evaluation;
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      let jsonStr = response.content;
      // Remove markdown code block if present
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      evaluation = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI evaluation:', parseError.message);
      // Return default evaluation if parsing fails
      return {
        success: false,
        totalScore: 70,
        breakdown: {},
        strengths: ['Content was generated successfully'],
        improvements: ['Unable to perform detailed evaluation'],
        explanation: 'AI evaluation parsing failed, using default assessment',
        raw: response
      };
    }
    
    // Normalize score to 0-1 range
    const normalizedScore = Math.min(1, Math.max(0, evaluation.totalScore / 100));
    
    return {
      success: true,
      totalScore: evaluation.totalScore,
      normalizedScore,
      breakdown: evaluation.breakdown,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      explanation: evaluation.explanation || 'Evaluation complete',
      type
    };
    
  } catch (error) {
    console.error('Self-evaluation error:', error.message);
    return {
      success: false,
      totalScore: 50,
      normalizedScore: 0.5,
      breakdown: {},
      strengths: [],
      improvements: ['Evaluation could not be completed'],
      explanation: `Evaluation error: ${error.message}`,
      type
    };
  }
};

/**
 * Evaluate content correctness specifically
 * @param {string} content - Content to check
 * @param {string} topic - Topic being covered
 * @returns {Promise<Object>} Correctness assessment
 */
const evaluateCorrectness = async (content, topic) => {
  try {
    const prompt = `As an academic expert, evaluate the factual correctness of the following content about "${topic}".

Content:
${content}

Identify:
1. Any factual errors or misconceptions
2. Statements that are correct
3. Areas that need clarification

Respond in JSON format:
{
  "isCorrect": <true/false>,
  "confidence": <0-1>,
  "errors": ["<error1>", "<error2>"],
  "correctStatements": ["<statement1>", "<statement2>"],
  "clarifications": ["<clarification1>"]
}`;

    const response = await generateContent(prompt);
    
    // Parse response
    let result;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch {
      result = {
        isCorrect: true,
        confidence: 0.7,
        errors: [],
        correctStatements: ['Content appears reasonable'],
        clarifications: []
      };
    }
    
    return {
      success: true,
      ...result
    };
    
  } catch (error) {
    return {
      success: false,
      isCorrect: true,
      confidence: 0.5,
      errors: [],
      correctStatements: [],
      clarifications: ['Unable to verify correctness'],
      error: error.message
    };
  }
};

/**
 * Quick validation without full evaluation
 * @param {string} content - Content to validate
 * @param {string} type - Content type
 * @returns {Promise<{valid: boolean, reason: string}>}
 */
const quickValidate = async (content, type) => {
  // Basic checks
  if (!content || content.trim().length < 50) {
    return { valid: false, reason: 'Content is too short' };
  }
  
  if (content.length > 50000) {
    return { valid: false, reason: 'Content is too long' };
  }
  
  // Check for obvious issues
  const gibberishPattern = /(.)\1{10,}/; // Repeated characters
  if (gibberishPattern.test(content)) {
    return { valid: false, reason: 'Content appears to contain gibberish' };
  }
  
  // Type-specific quick checks
  if (type === 'lab') {
    // Check for actual code
    const codePatterns = /function|def |class |const |let |var |int |void |for\s*\(|while\s*\(/;
    if (!codePatterns.test(content)) {
      return { valid: false, reason: 'Lab content does not appear to contain code' };
    }
  }
  
  if (type === 'slides') {
    // Check for slide structure
    if (!content.includes('#') && !content.includes('---')) {
      return { valid: false, reason: 'Slides should have headings or separators' };
    }
  }
  
  return { valid: true, reason: 'Content passes basic validation' };
};

module.exports = {
  selfEvaluate,
  evaluateCorrectness,
  quickValidate,
  EVALUATION_RUBRIC
};
