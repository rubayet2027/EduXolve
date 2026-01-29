/**
 * File Context Service
 * 
 * Responsibilities:
 * - Chunk extracted text for AI processing
 * - Summarize large files
 * - Generate AI-ready context
 * - Provide smart file analysis
 */

const { generateContent } = require('../config/gemini');

// Context limits
const MAX_CONTEXT_LENGTH = 8000; // Characters for AI context
const CHUNK_SIZE = 2000; // Characters per chunk
const SUMMARY_THRESHOLD = 5000; // Summarize if longer than this

/**
 * Analyze code content to extract metadata
 * @param {string} code - Code content
 * @param {string} language - Programming language
 * @returns {Object} Code analysis
 */
const analyzeCode = (code, language) => {
  const analysis = {
    language,
    lineCount: code.split('\n').length,
    hasComments: false,
    functions: [],
    classes: [],
    imports: [],
    potentialIssues: []
  };
  
  const lines = code.split('\n');
  
  // Detect patterns based on language
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Comments
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || 
        trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      analysis.hasComments = true;
    }
    
    // Function definitions
    if (language === 'Python' && trimmed.startsWith('def ')) {
      const match = trimmed.match(/def\s+(\w+)/);
      if (match) analysis.functions.push(match[1]);
    } else if (['C', 'C++', 'JavaScript'].includes(language)) {
      const funcMatch = trimmed.match(/(?:void|int|float|double|char|bool|string|function|const|let|var)\s+(\w+)\s*\(/);
      if (funcMatch) analysis.functions.push(funcMatch[1]);
    }
    
    // Class definitions
    if (trimmed.startsWith('class ')) {
      const match = trimmed.match(/class\s+(\w+)/);
      if (match) analysis.classes.push(match[1]);
    }
    
    // Imports
    if (trimmed.startsWith('#include') || trimmed.startsWith('import ') || 
        trimmed.startsWith('from ') || trimmed.startsWith('require(')) {
      analysis.imports.push(trimmed);
    }
    
    // Potential issues
    if (trimmed.includes('TODO') || trimmed.includes('FIXME')) {
      analysis.potentialIssues.push({ line: index + 1, text: trimmed });
    }
  });
  
  return analysis;
};

/**
 * Generate a concise summary of document content
 * @param {string} text - Document text
 * @param {string} filename - Original filename
 * @returns {Promise<string>} Summary
 */
const generateSummary = async (text, filename) => {
  try {
    const prompt = `Analyze this document and provide a BRIEF summary (max 200 words).
Focus on:
- Main topic/subject
- Key concepts mentioned
- Type of content (notes, assignment, code, etc.)

Document content:
"""
${text.substring(0, 4000)}
"""

Provide a structured summary:`;

    const result = await generateContent(prompt, {
      temperature: 0.3,
      maxTokens: 500
    });
    
    if (result.success) {
      return result.content;
    }
    
    return 'Summary could not be generated.';
  } catch (error) {
    console.error('Summary generation error:', error);
    return 'Summary generation failed.';
  }
};

/**
 * Chunk text into smaller pieces for processing
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Size of each chunk
 * @returns {string[]} Array of chunks
 */
const chunkText = (text, chunkSize = CHUNK_SIZE) => {
  const chunks = [];
  let currentChunk = '';
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  
  for (const para of paragraphs) {
    if ((currentChunk + para).length <= chunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      
      // If paragraph itself is too long, split by sentences
      if (para.length > chunkSize) {
        const sentences = para.split(/(?<=[.!?])\s+/);
        currentChunk = '';
        
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length <= chunkSize) {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = sentence;
          }
        }
      } else {
        currentChunk = para;
      }
    }
  }
  
  if (currentChunk) chunks.push(currentChunk);
  
  return chunks;
};

/**
 * Build AI-ready context from extracted file content
 * @param {Object} extractionResult - Result from fileExtract.service
 * @param {string} filename - Original filename
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} AI context object
 */
const buildFileContext = async (extractionResult, filename, options = {}) => {
  const { includeFullContent = true, generateFileSummary = true } = options;
  
  if (!extractionResult.success) {
    return {
      success: false,
      error: extractionResult.error,
      context: null
    };
  }
  
  const { text, fileInfo, stats } = extractionResult;
  const context = {
    filename,
    fileType: fileInfo.type,
    category: fileInfo.category,
    language: fileInfo.language,
    isCode: fileInfo.isCode,
    metadata: {
      extractedLength: stats.extractedLength,
      wasTruncated: stats.wasTruncated
    }
  };
  
  // For code files, add code analysis
  if (fileInfo.isCode) {
    context.codeAnalysis = analyzeCode(text, fileInfo.language);
  }
  
  // Generate summary for long documents
  if (generateFileSummary && text.length > SUMMARY_THRESHOLD) {
    context.summary = await generateSummary(text, filename);
  }
  
  // Prepare content for AI
  if (includeFullContent) {
    if (text.length > MAX_CONTEXT_LENGTH) {
      // Chunk and take most relevant parts
      const chunks = chunkText(text, CHUNK_SIZE);
      context.content = chunks.slice(0, 4).join('\n\n---\n\n');
      context.contentTruncated = true;
      context.totalChunks = chunks.length;
    } else {
      context.content = text;
      context.contentTruncated = false;
    }
  }
  
  return {
    success: true,
    context
  };
};

/**
 * Format file context for injection into AI prompt
 * @param {Object} fileContext - Context from buildFileContext
 * @returns {string} Formatted context string
 */
const formatContextForPrompt = (fileContext) => {
  if (!fileContext || !fileContext.success) {
    return '';
  }
  
  const ctx = fileContext.context;
  let formatted = `\n\n📎 UPLOADED FILE CONTEXT\n${'='.repeat(50)}\n`;
  
  // File info
  formatted += `File: ${ctx.filename}\n`;
  formatted += `Type: ${ctx.category.toUpperCase()}${ctx.language ? ` (${ctx.language})` : ''}\n`;
  
  // Summary if available
  if (ctx.summary) {
    formatted += `\nFile Summary:\n${ctx.summary}\n`;
  }
  
  // Code analysis if available
  if (ctx.codeAnalysis) {
    const analysis = ctx.codeAnalysis;
    formatted += `\nCode Analysis:\n`;
    formatted += `- Lines: ${analysis.lineCount}\n`;
    if (analysis.functions.length > 0) {
      formatted += `- Functions: ${analysis.functions.join(', ')}\n`;
    }
    if (analysis.classes.length > 0) {
      formatted += `- Classes: ${analysis.classes.join(', ')}\n`;
    }
    if (analysis.potentialIssues.length > 0) {
      formatted += `- Potential issues: ${analysis.potentialIssues.length} found\n`;
    }
  }
  
  // Content
  formatted += `\n--- FILE CONTENT ---\n`;
  formatted += ctx.content;
  if (ctx.contentTruncated) {
    formatted += `\n\n[Note: Content was truncated. Showing ${ctx.totalChunks > 4 ? '4 of ' + ctx.totalChunks : 'all'} sections]`;
  }
  formatted += `\n${'='.repeat(50)}\n`;
  
  return formatted;
};

/**
 * Get suggested actions based on file type
 * @param {Object} fileContext - Context from buildFileContext
 * @returns {Object[]} Suggested actions
 */
const getSuggestedActions = (fileContext) => {
  if (!fileContext?.context) return [];
  
  const ctx = fileContext.context;
  const actions = [];
  
  if (ctx.isCode) {
    actions.push(
      { id: 'debug', label: '🐛 Debug this code', prompt: 'Find and explain any bugs or issues in this code.' },
      { id: 'explain', label: '📖 Explain this code', prompt: 'Explain what this code does step by step.' },
      { id: 'optimize', label: '⚡ Optimize', prompt: 'Suggest optimizations for this code.' },
      { id: 'test', label: '🧪 Generate tests', prompt: 'Generate test cases for this code.' }
    );
  } else {
    actions.push(
      { id: 'summarize', label: '📝 Summarize', prompt: 'Provide a detailed summary of this document.' },
      { id: 'explain', label: '💡 Explain concepts', prompt: 'Explain the main concepts in this document.' },
      { id: 'questions', label: '❓ Generate questions', prompt: 'Create study questions based on this content.' },
      { id: 'compare', label: '📊 Compare with course', prompt: 'Compare this with the course materials and highlight any differences.' }
    );
  }
  
  return actions;
};

/**
 * Build safety disclaimer for file-based responses
 * @param {boolean} isCode - Whether the file is code
 * @returns {string} Disclaimer text
 */
const getFileResponseDisclaimer = (isCode) => {
  if (isCode) {
    return `\n\n---\n*Note: This analysis is based on the uploaded code file. I cannot execute code, only analyze it. Always test code in your development environment.*`;
  }
  return `\n\n---\n*Note: This response is based on the uploaded file content.*`;
};

module.exports = {
  buildFileContext,
  formatContextForPrompt,
  getSuggestedActions,
  getFileResponseDisclaimer,
  analyzeCode,
  generateSummary,
  chunkText,
  MAX_CONTEXT_LENGTH,
  CHUNK_SIZE,
  SUMMARY_THRESHOLD
};
