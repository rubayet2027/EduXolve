/**
 * Chat Prompt Service
 * 
 * Builds grounded prompts for RAG-based chat responses.
 * Ensures academic tone, explicit grounding, and structured responses.
 */

const { generateContent } = require('../config/gemini');

/**
 * System prompt for academic assistant
 */
const SYSTEM_PROMPT = `You are EduXolve, an AI academic assistant for computer science students.

Your responsibilities:
1. Answer questions using ONLY the provided course materials
2. Maintain an academic, educational tone
3. Provide clear, structured explanations
4. Include code examples when relevant (properly formatted)
5. Admit when information is not available in the context

IMPORTANT RULES:
- If the answer is NOT present in the provided context, say "I don't have information about this in the current course materials."
- Never make up information
- Always cite which source material you're using
- Use markdown formatting for readability
- For code, use proper code blocks with language specification`;

/**
 * Build a grounded prompt with RAG context
 * @param {string} query - User's question
 * @param {Object[]} contextChunks - Retrieved course material chunks
 * @param {Object} options - Additional options
 * @returns {string} Assembled prompt
 */
const buildGroundedPrompt = (query, contextChunks = [], options = {}) => {
  const { intent = 'explain', history = [] } = options;
  
  // Build context section
  let contextSection = '';
  if (contextChunks.length > 0) {
    contextSection = `\n\n=== COURSE MATERIALS (Use ONLY this information) ===\n\n`;
    contextChunks.forEach((chunk, index) => {
      const source = chunk.content?.title || chunk.metadata?.topic || `Source ${index + 1}`;
      const week = chunk.content?.week || chunk.metadata?.week;
      const weekStr = week ? ` (Week ${week})` : '';
      contextSection += `[${source}${weekStr}]\n${chunk.chunkText}\n\n---\n\n`;
    });
    contextSection += `=== END OF COURSE MATERIALS ===\n`;
  }
  
  // Build conversation history
  let historySection = '';
  if (history.length > 0) {
    historySection = `\n\nPrevious conversation:\n`;
    history.slice(-5).forEach(msg => {
      historySection += `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}\n`;
    });
  }
  
  // Intent-specific instructions
  const intentInstructions = {
    explain: `Provide a clear, educational explanation. Use examples and analogies where helpful.`,
    search: `Summarize the relevant information found in the course materials.`,
    generate: `Generate the requested content based on the course materials. Ensure accuracy.`,
    validate: `Review and validate the content. Point out any issues or confirm correctness.`,
    followup: `Continue the conversation naturally, building on previous context.`,
    greeting: `Respond warmly and offer to help with course-related questions.`,
  };
  
  const instruction = intentInstructions[intent] || intentInstructions.explain;
  
  // Assemble final prompt
  const prompt = `${SYSTEM_PROMPT}
${contextSection}${historySection}
Current task: ${instruction}

Student's question: ${query}

Provide a helpful, grounded response:`;

  return prompt;
};

/**
 * Build a code generation prompt
 * @param {string} topic - Topic for code
 * @param {string} language - Programming language
 * @param {Object[]} contextChunks - Context chunks
 * @returns {string} Code generation prompt
 */
const buildCodePrompt = (topic, language = 'python', contextChunks = []) => {
  let contextSection = '';
  if (contextChunks.length > 0) {
    contextSection = `\nReference materials from course:\n${contextChunks.map(c => c.chunkText).join('\n---\n')}\n`;
  }
  
  return `You are EduXolve, an AI academic assistant specialized in teaching programming.

Task: Generate a well-documented ${language} code example for: ${topic}
${contextSection}
Requirements:
1. Include comprehensive comments explaining each step
2. Add a docstring/header explaining purpose, inputs, outputs
3. Include a simple test/demo at the end showing usage
4. Follow ${language} best practices and conventions
5. Make it educational and easy to understand
6. If the context provides relevant theory, reference it in comments

Generate the code now. Use a properly formatted code block with the language specification:`;
};

/**
 * Build a notes generation prompt
 * @param {string} topic - Topic for notes
 * @param {Object[]} contextChunks - Context chunks
 * @returns {string} Notes generation prompt
 */
const buildNotesPrompt = (topic, contextChunks = []) => {
  let contextSection = '';
  if (contextChunks.length > 0) {
    contextSection = `\nSource materials:\n${contextChunks.map(c => c.chunkText).join('\n---\n')}\n`;
  }
  
  return `${SYSTEM_PROMPT}

Generate comprehensive study notes for: ${topic}
${contextSection}
Format the notes with:
1. Clear section headings (##)
2. Key concepts in bullet points
3. Important definitions highlighted
4. Examples where relevant
5. Summary at the end

Generate well-structured, educational notes:`;
};

/**
 * Generate a chat response using Gemini
 * @param {string} prompt - Assembled prompt
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated response
 */
const generateChatResponse = async (prompt, options = {}) => {
  try {
    const response = await generateContent(prompt, {
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 2048
    });
    
    if (!response.success) {
      return {
        success: false,
        reply: "I'm having trouble generating a response right now. Please try again.",
        error: response.error
      };
    }
    
    return {
      success: true,
      reply: response.content,
      usage: response.usage
    };
  } catch (error) {
    console.error('Chat response generation error:', error);
    return {
      success: false,
      reply: "An error occurred while generating the response.",
      error: error.message
    };
  }
};

/**
 * Format response with sources and actions
 * @param {string} reply - AI generated reply
 * @param {Object[]} contextChunks - Used context chunks
 * @param {string[]} actions - Suggested actions
 * @returns {Object} Formatted response
 */
const formatChatResponse = (reply, contextChunks = [], actions = []) => {
  // Extract sources from context chunks
  const sources = contextChunks
    .filter(chunk => chunk.content || chunk.metadata)
    .map(chunk => {
      const title = chunk.content?.title || chunk.metadata?.topic || 'Course Material';
      const week = chunk.content?.week || chunk.metadata?.week;
      return week ? `${title} - Week ${week}` : title;
    })
    .filter((v, i, a) => a.indexOf(v) === i); // Unique sources
  
  return {
    reply,
    sources,
    actions,
    timestamp: new Date().toISOString()
  };
};

/**
 * Build greeting response
 * @returns {Object} Greeting response
 */
const buildGreetingResponse = () => {
  const greetings = [
    "Hello! I'm EduXolve, your AI study assistant. How can I help you with your computer science studies today?",
    "Hi there! Ready to help you learn. You can ask me to explain concepts, generate notes, or find information in your course materials.",
    "Hey! Welcome to EduXolve. What would you like to learn about today?"
  ];
  
  return {
    reply: greetings[Math.floor(Math.random() * greetings.length)],
    sources: [],
    actions: ['search', 'generate_notes', 'explain_concept']
  };
};

/**
 * Build fallback response when no context found
 * @param {string} topic - Topic that wasn't found
 * @returns {Object} Fallback response
 */
const buildNoContextResponse = (topic) => {
  return {
    reply: `I couldn't find relevant information about "${topic}" in the current course materials. This topic might not be covered yet, or you could try rephrasing your question.\n\nWould you like me to:\n- Search for a related topic?\n- Generate general information (note: won't be grounded in course materials)?`,
    sources: [],
    actions: ['rephrase', 'search_related', 'generate_general']
  };
};

module.exports = {
  buildGroundedPrompt,
  buildCodePrompt,
  buildNotesPrompt,
  generateChatResponse,
  formatChatResponse,
  buildGreetingResponse,
  buildNoContextResponse,
  SYSTEM_PROMPT
};
