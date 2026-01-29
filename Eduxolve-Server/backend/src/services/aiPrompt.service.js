/**
 * AI Prompt Service
 * 
 * Contains prompt templates for different content generation types.
 * Designed to be RAG-ready with context injection support.
 */

// ===================
// SYSTEM INSTRUCTIONS
// ===================

const SYSTEM_ROLE = `You are an expert academic content generator for a university-level learning platform.
Your responses must be:
- Academically rigorous and accurate
- Well-structured and easy to understand
- Suitable for undergraduate/graduate students
- Based on provided course materials when available`;

// ===================
// THEORY GENERATION
// ===================

/**
 * Generate prompt for theory/notes content
 * @param {string} topic - The topic to generate content for
 * @param {string} context - Optional course material context
 * @param {Object} options - Additional options
 * @returns {string} Formatted prompt
 */
const buildTheoryPrompt = (topic, context = '', options = {}) => {
  const { depth = 'comprehensive', format = 'notes' } = options;

  let prompt = `${SYSTEM_ROLE}

TASK: Generate ${depth} academic notes on the following topic.

TOPIC: ${topic}

`;

  // Add context if provided (RAG support)
  if (context && context.trim()) {
    prompt += `REFERENCE MATERIALS:
"""
${context}
"""

Use the above reference materials to ground your response. Cite relevant concepts from these materials.

`;
  }

  prompt += `OUTPUT REQUIREMENTS:
1. Start with a clear **Introduction** explaining the topic's importance
2. Use **Headings** and **Subheadings** for organization (use Markdown ##, ###)
3. Include **Key Concepts** as bullet points
4. Provide **Examples** where applicable
5. Add **Important Notes** or **Tips** in callout format
6. End with a **Summary** section
7. Keep language academic but accessible

FORMAT: Markdown with proper headings, bullet points, and emphasis.

Generate the content now:`;

  return prompt;
};

// ===================
// LAB CODE GENERATION
// ===================

/**
 * Language-specific code generation instructions
 */
const LANGUAGE_INSTRUCTIONS = {
  c: {
    name: 'C',
    style: 'Use standard C99/C11. Include necessary headers. Use clear variable names.',
    structure: 'Include main() function, proper memory management, and error handling.'
  },
  cpp: {
    name: 'C++',
    style: 'Use modern C++ (C++17/20). Prefer STL containers. Use RAII for resources.',
    structure: 'Include proper includes, namespaces, and class definitions where appropriate.'
  },
  python: {
    name: 'Python',
    style: 'Use Python 3.x. Follow PEP 8 style guidelines. Use type hints where helpful.',
    structure: 'Include docstrings, proper imports, and if __name__ == "__main__" guard.'
  },
  java: {
    name: 'Java',
    style: 'Use Java 11+. Follow standard naming conventions. Use appropriate access modifiers.',
    structure: 'Include class definition, proper imports, and main method.'
  },
  javascript: {
    name: 'JavaScript',
    style: 'Use ES6+ features. Use const/let appropriately. Include JSDoc comments.',
    structure: 'Use modern syntax, arrow functions where appropriate, and proper error handling.'
  },
  js: {
    name: 'JavaScript',
    style: 'Use ES6+ features. Use const/let appropriately. Include JSDoc comments.',
    structure: 'Use modern syntax, arrow functions where appropriate, and proper error handling.'
  }
};

/**
 * Generate prompt for lab code content
 * @param {string} topic - The coding topic/problem
 * @param {string} language - Programming language
 * @param {string} context - Optional course material context
 * @param {Object} options - Additional options
 * @returns {string} Formatted prompt
 */
const buildLabCodePrompt = (topic, language = 'python', context = '', options = {}) => {
  const { difficulty = 'intermediate', includeTests = true } = options;
  const langConfig = LANGUAGE_INSTRUCTIONS[language.toLowerCase()] || LANGUAGE_INSTRUCTIONS.python;

  let prompt = `${SYSTEM_ROLE}

TASK: Generate a complete, working ${langConfig.name} program for the following topic.

TOPIC: ${topic}
LANGUAGE: ${langConfig.name}
DIFFICULTY: ${difficulty}

`;

  // Add context if provided (RAG support)
  if (context && context.trim()) {
    prompt += `REFERENCE MATERIALS:
"""
${context}
"""

Use the above reference materials to inform your implementation. Follow any patterns or approaches mentioned.

`;
  }

  prompt += `LANGUAGE-SPECIFIC REQUIREMENTS:
- Style: ${langConfig.style}
- Structure: ${langConfig.structure}

OUTPUT REQUIREMENTS:
1. **Complete, runnable code** - not pseudocode
2. **Detailed comments** explaining the logic
3. **Clear function/method documentation**
4. **Example usage** demonstrating the code
${includeTests ? '5. **Test cases** to verify correctness' : ''}

OUTPUT FORMAT:
\`\`\`${language}
// Your code here with comments
\`\`\`

**Explanation:**
[Provide a clear explanation of how the code works, key algorithms used, and time/space complexity if applicable]

${includeTests ? `**Test Cases:**
[Provide test cases and expected outputs]` : ''}

Generate the code now:`;

  return prompt;
};

// ===================
// SLIDES GENERATION
// ===================

/**
 * Generate prompt for slide/presentation content
 * @param {string} topic - The topic for slides
 * @param {string} context - Optional course material context
 * @param {Object} options - Additional options
 * @returns {string} Formatted prompt
 */
const buildSlidesPrompt = (topic, context = '', options = {}) => {
  const { slideCount = 10, audience = 'undergraduate students' } = options;

  let prompt = `${SYSTEM_ROLE}

TASK: Generate presentation slide content for a lecture on the following topic.

TOPIC: ${topic}
TARGET AUDIENCE: ${audience}
NUMBER OF SLIDES: ${slideCount}

`;

  // Add context if provided (RAG support)
  if (context && context.trim()) {
    prompt += `REFERENCE MATERIALS:
"""
${context}
"""

Base the slide content on the above reference materials. Include key concepts from these materials.

`;
  }

  prompt += `OUTPUT REQUIREMENTS:
1. Each slide should have:
   - A clear **TITLE**
   - 3-5 **bullet points** (concise, not full sentences)
   - **Speaker notes** (what to explain verbally)

2. Slide structure:
   - Slide 1: Title slide with topic overview
   - Slides 2-${slideCount - 2}: Main content slides
   - Slide ${slideCount - 1}: Summary/Key Takeaways
   - Slide ${slideCount}: Questions/Discussion or References

3. Keep bullet points short and visual-friendly
4. Include suggestions for diagrams/images where helpful

OUTPUT FORMAT:
---
## Slide 1: [Title]
- Bullet point 1
- Bullet point 2
- Bullet point 3

**Speaker Notes:** [What to say for this slide]

**Visual Suggestion:** [Optional diagram/image idea]

---
## Slide 2: [Title]
...

Generate the slides now:`;

  return prompt;
};

// ===================
// UTILITY FUNCTIONS
// ===================

/**
 * Build prompt based on generation type
 * @param {string} type - 'theory' | 'lab' | 'slides'
 * @param {string} topic - The topic
 * @param {Object} params - Additional parameters
 * @returns {string} Formatted prompt
 */
const buildPrompt = (type, topic, params = {}) => {
  const { language, context, options } = params;

  switch (type) {
    case 'theory':
      return buildTheoryPrompt(topic, context, options);
    
    case 'lab':
      return buildLabCodePrompt(topic, language, context, options);
    
    case 'slides':
      return buildSlidesPrompt(topic, context, options);
    
    default:
      throw new Error(`Unknown generation type: ${type}`);
  }
};

/**
 * Get supported generation types
 * @returns {string[]} Array of supported types
 */
const getSupportedTypes = () => ['theory', 'lab', 'slides'];

/**
 * Get supported programming languages
 * @returns {string[]} Array of supported languages
 */
const getSupportedLanguages = () => Object.keys(LANGUAGE_INSTRUCTIONS);

/**
 * Validate generation parameters
 * @param {string} type - Generation type
 * @param {string} topic - Topic
 * @param {string} language - Language (for lab type)
 * @returns {Object} Validation result
 */
const validateParams = (type, topic, language) => {
  const errors = [];

  if (!type || !getSupportedTypes().includes(type)) {
    errors.push(`Invalid type. Must be one of: ${getSupportedTypes().join(', ')}`);
  }

  if (!topic || topic.trim().length < 3) {
    errors.push('Topic is required and must be at least 3 characters');
  }

  if (topic && topic.length > 500) {
    errors.push('Topic must be less than 500 characters');
  }

  if (type === 'lab' && language && !getSupportedLanguages().includes(language.toLowerCase())) {
    errors.push(`Unsupported language. Must be one of: ${getSupportedLanguages().join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  buildPrompt,
  buildTheoryPrompt,
  buildLabCodePrompt,
  buildSlidesPrompt,
  getSupportedTypes,
  getSupportedLanguages,
  validateParams,
  LANGUAGE_INSTRUCTIONS
};
