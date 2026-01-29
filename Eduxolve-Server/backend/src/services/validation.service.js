/**
 * Validation Service
 * 
 * Multi-layer validation for AI-generated content:
 * - Layer 1: Grounding Check (semantic overlap with course materials)
 * - Layer 2: Structural Check (academic formatting)
 * - Layer 3: Code Validation (syntax & safety)
 */

const { cosineSimilarity, generateEmbedding } = require('./embedding.service');

/**
 * Calculate semantic similarity between content and context chunks
 * @param {string} content - Generated content
 * @param {string[]} contextChunks - Retrieved course chunks
 * @returns {Promise<{score: number, matchedChunks: string[]}>}
 */
const checkGrounding = async (content, contextChunks) => {
  if (!contextChunks || contextChunks.length === 0) {
    return { score: 0, matchedChunks: [], explanation: 'No context provided for grounding check' };
  }

  try {
    // Generate embedding for the content
    const contentEmbedding = await generateEmbedding(content);
    
    // Calculate similarity with each chunk
    const similarities = [];
    const matchedChunks = [];
    
    for (const chunk of contextChunks) {
      const chunkEmbedding = await generateEmbedding(chunk);
      const similarity = cosineSimilarity(contentEmbedding, chunkEmbedding);
      similarities.push(similarity);
      
      if (similarity > 0.5) {
        matchedChunks.push({ chunk: chunk.substring(0, 100) + '...', similarity });
      }
    }
    
    // Calculate average and max similarity
    const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
    const maxSimilarity = Math.max(...similarities);
    
    // Weighted score: 60% max + 40% average
    const groundingScore = (maxSimilarity * 0.6) + (avgSimilarity * 0.4);
    
    return {
      score: Math.round(groundingScore * 100) / 100,
      matchedChunks: matchedChunks.slice(0, 3),
      explanation: groundingScore > 0.6 
        ? 'Content is well-grounded in course materials'
        : groundingScore > 0.4
          ? 'Content has moderate grounding in course materials'
          : 'Content may not be sufficiently grounded in course materials'
    };
  } catch (error) {
    console.error('Grounding check error:', error.message);
    return { score: 0.5, matchedChunks: [], explanation: 'Unable to verify grounding' };
  }
};

/**
 * Check structural validity of theory content
 * @param {string} content - Theory content to validate
 * @returns {{score: number, issues: string[], explanation: string}}
 */
const checkTheoryStructure = (content) => {
  const issues = [];
  let score = 1.0;
  
  // Check minimum length
  if (content.length < 200) {
    issues.push('Content is too short for comprehensive theory');
    score -= 0.2;
  }
  
  // Check for headings (# or bold text)
  const hasHeadings = /^#{1,3}\s+.+/m.test(content) || /\*\*.+\*\*/m.test(content);
  if (!hasHeadings) {
    issues.push('Missing section headings');
    score -= 0.15;
  }
  
  // Check for bullet points or numbered lists
  const hasBullets = /^[\-\*]\s+.+/m.test(content) || /^\d+\.\s+.+/m.test(content);
  if (!hasBullets) {
    issues.push('Missing bullet points or numbered lists');
    score -= 0.1;
  }
  
  // Check for paragraphs (multiple line breaks)
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50);
  if (paragraphs.length < 2) {
    issues.push('Content should have multiple paragraphs');
    score -= 0.1;
  }
  
  // Check for code blocks if technical content
  const hasTechnicalTerms = /algorithm|function|complexity|data structure|variable|loop/i.test(content);
  const hasCodeBlocks = /```[\s\S]*?```/.test(content);
  if (hasTechnicalTerms && !hasCodeBlocks) {
    issues.push('Technical content should include code examples');
    score -= 0.1;
  }
  
  // Check for definitions or key concepts
  const hasDefinitions = /:\s*\n|is defined as|refers to|means that/i.test(content);
  if (!hasDefinitions && content.length > 500) {
    issues.push('Consider adding clear definitions');
    score -= 0.05;
  }
  
  return {
    score: Math.max(0, Math.round(score * 100) / 100),
    issues,
    explanation: issues.length === 0 
      ? 'Theory structure is well-organized'
      : `Found ${issues.length} structural issues`
  };
};

/**
 * Validate code for syntax and safety
 * @param {string} code - Code to validate
 * @param {string} language - Programming language
 * @returns {{valid: boolean, score: number, issues: string[], explanation: string}}
 */
const validateCode = (code, language = 'python') => {
  const issues = [];
  let score = 1.0;
  const lang = language.toLowerCase();
  
  // Check for empty code
  if (!code || code.trim().length < 10) {
    return {
      valid: false,
      score: 0,
      issues: ['Code is empty or too short'],
      explanation: 'Invalid code submission'
    };
  }
  
  // Common dangerous patterns (safety check)
  const dangerousPatterns = [
    { pattern: /\bos\.system\b/gi, msg: 'Avoid os.system() - use subprocess instead' },
    { pattern: /\beval\s*\(/gi, msg: 'Avoid eval() - security risk' },
    { pattern: /\bexec\s*\(/gi, msg: 'Avoid exec() - security risk' },
    { pattern: /\b__import__\b/gi, msg: 'Avoid __import__ - use regular imports' },
    { pattern: /rm\s+-rf/gi, msg: 'Dangerous shell command detected' },
    { pattern: /DROP\s+TABLE/gi, msg: 'Dangerous SQL command detected' },
  ];
  
  for (const { pattern, msg } of dangerousPatterns) {
    if (pattern.test(code)) {
      issues.push(`⚠️ Security: ${msg}`);
      score -= 0.2;
    }
  }
  
  // Language-specific validation
  if (lang === 'python' || lang === 'py') {
    // Check for proper indentation
    const lines = code.split('\n');
    let hasIndentationIssue = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Check for mixed tabs and spaces
      if (/^\t+ /.test(line) || /^ +\t/.test(line)) {
        hasIndentationIssue = true;
        break;
      }
    }
    
    if (hasIndentationIssue) {
      issues.push('Mixed tabs and spaces in indentation');
      score -= 0.1;
    }
    
    // Check for function definitions
    const hasFunctions = /\bdef\s+\w+\s*\(/.test(code);
    
    // Check for docstrings in functions
    if (hasFunctions && !/"""[\s\S]*?"""/.test(code) && !/'''[\s\S]*?'''/.test(code)) {
      issues.push('Functions should include docstrings');
      score -= 0.05;
    }
    
    // Check for basic syntax patterns
    const syntaxPatterns = [
      { pattern: /if\s+.+:\s*$|elif\s+.+:\s*$|else\s*:\s*$/m, valid: true },
      { pattern: /for\s+\w+\s+in\s+.+:\s*$/m, valid: true },
      { pattern: /while\s+.+:\s*$/m, valid: true },
      { pattern: /def\s+\w+\s*\([^)]*\)\s*:/m, valid: true },
      { pattern: /class\s+\w+.*:/m, valid: true },
    ];
    
    // Check for unclosed brackets
    const openBrackets = (code.match(/\(/g) || []).length;
    const closeBrackets = (code.match(/\)/g) || []).length;
    if (openBrackets !== closeBrackets) {
      issues.push('Unbalanced parentheses');
      score -= 0.15;
    }
    
  } else if (lang === 'javascript' || lang === 'js') {
    // Check for semicolons (style check)
    const statements = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
    
    // Check for const/let usage
    if (/\bvar\s+/.test(code)) {
      issues.push('Consider using const/let instead of var');
      score -= 0.05;
    }
    
    // Check for balanced braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push('Unbalanced curly braces');
      score -= 0.15;
    }
    
  } else if (lang === 'c' || lang === 'cpp' || lang === 'c++') {
    // Check for main function
    if (!/int\s+main\s*\(/.test(code) && !/void\s+main\s*\(/.test(code)) {
      issues.push('Missing main() function');
      score -= 0.1;
    }
    
    // Check for includes
    if (!/^#include\s*[<"]/.test(code)) {
      issues.push('Missing #include statements');
      score -= 0.05;
    }
    
    // Check for semicolons at end of statements
    const lines = code.split('\n').filter(l => 
      l.trim() && 
      !l.trim().startsWith('//') && 
      !l.trim().startsWith('#') &&
      !l.trim().endsWith('{') &&
      !l.trim().endsWith('}')
    );
    
    // Check balanced braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push('Unbalanced curly braces');
      score -= 0.15;
    }
  } else if (lang === 'java') {
    // Check for class definition
    if (!/\bclass\s+\w+/.test(code)) {
      issues.push('Missing class definition');
      score -= 0.15;
    }
    
    // Check for main method
    if (!/public\s+static\s+void\s+main/.test(code)) {
      issues.push('Missing main method');
      score -= 0.1;
    }
  }
  
  // Check for comments
  const hasComments = /\/\/.*|\/\*[\s\S]*?\*\/|#.*/.test(code);
  if (!hasComments && code.length > 100) {
    issues.push('Code should include comments for clarity');
    score -= 0.05;
  }
  
  return {
    valid: score >= 0.5,
    score: Math.max(0, Math.round(score * 100) / 100),
    issues,
    explanation: issues.length === 0
      ? 'Code passes all validation checks'
      : issues.length <= 2
        ? 'Code has minor issues'
        : 'Code has several issues that should be addressed'
  };
};

/**
 * Validate slides structure and formatting
 * @param {string} slides - Slide content (markdown format)
 * @returns {{score: number, issues: string[], explanation: string}}
 */
const validateSlides = (slides) => {
  const issues = [];
  let score = 1.0;
  
  // Check for slide separators
  const slideCount = (slides.match(/^---$/gm) || []).length + 1;
  
  if (slideCount < 3) {
    issues.push('Presentation should have at least 3 slides');
    score -= 0.2;
  }
  
  // Split into individual slides
  const slideArray = slides.split(/^---$/m).map(s => s.trim());
  
  // Check each slide
  for (let i = 0; i < slideArray.length; i++) {
    const slide = slideArray[i];
    
    // Check for title (heading)
    if (!slide.match(/^#/m)) {
      issues.push(`Slide ${i + 1}: Missing title heading`);
      score -= 0.05;
    }
    
    // Check for bullet points
    if (!slide.match(/^[\-\*]\s/m) && slide.length > 100) {
      issues.push(`Slide ${i + 1}: Consider using bullet points`);
      score -= 0.03;
    }
    
    // Check slide length (not too long)
    if (slide.length > 1000) {
      issues.push(`Slide ${i + 1}: Content too long for a single slide`);
      score -= 0.05;
    }
    
    // Check slide length (not too short)
    if (slide.length < 50 && i > 0 && i < slideArray.length - 1) {
      issues.push(`Slide ${i + 1}: Content too short`);
      score -= 0.03;
    }
  }
  
  // Check for consistent formatting
  const hasIntro = /introduction|overview|agenda/i.test(slideArray[0] || '');
  const hasConclusion = /conclusion|summary|key takeaway/i.test(slideArray[slideArray.length - 1] || '');
  
  if (!hasIntro) {
    issues.push('Consider adding an introduction/overview slide');
    score -= 0.05;
  }
  
  if (!hasConclusion) {
    issues.push('Consider adding a conclusion/summary slide');
    score -= 0.05;
  }
  
  return {
    score: Math.max(0, Math.round(score * 100) / 100),
    slideCount,
    issues: issues.slice(0, 10), // Limit to 10 issues
    explanation: issues.length === 0
      ? 'Slides are well-structured'
      : issues.length <= 3
        ? 'Slides have minor formatting issues'
        : 'Slides need structural improvements'
  };
};

/**
 * Validate theory content (combined grounding + structure)
 * @param {string} content - Theory content
 * @param {string[]} contextChunks - Retrieved context chunks
 * @returns {Promise<Object>} Validation result
 */
const validateTheory = async (content, contextChunks = []) => {
  // Layer 1: Grounding check
  const grounding = await checkGrounding(content, contextChunks);
  
  // Layer 2: Structure check
  const structure = checkTheoryStructure(content);
  
  // Combined score: 50% grounding + 50% structure
  const combinedScore = (grounding.score * 0.5) + (structure.score * 0.5);
  
  return {
    valid: combinedScore >= 0.5,
    score: Math.round(combinedScore * 100) / 100,
    layers: {
      grounding: {
        score: grounding.score,
        explanation: grounding.explanation,
        matchedChunks: grounding.matchedChunks
      },
      structure: {
        score: structure.score,
        issues: structure.issues,
        explanation: structure.explanation
      }
    },
    feedback: combinedScore >= 0.7
      ? 'Content is well-grounded and properly structured'
      : combinedScore >= 0.5
        ? 'Content is acceptable but could be improved'
        : 'Content needs significant improvements'
  };
};

module.exports = {
  validateTheory,
  validateCode,
  validateSlides,
  checkGrounding,
  checkTheoryStructure
};
