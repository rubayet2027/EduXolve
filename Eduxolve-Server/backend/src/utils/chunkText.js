/**
 * Text Chunking Utility
 * 
 * Splits content into semantically meaningful chunks for embedding.
 * Preserves context boundaries (paragraphs, code blocks, sections).
 */

// Configuration
const DEFAULT_CHUNK_SIZE = 500; // ~500 tokens (approx 400 words)
const DEFAULT_OVERLAP = 50; // Overlap for context continuity
const MIN_CHUNK_SIZE = 100;
const MAX_CHUNK_SIZE = 1000;

/**
 * Detect content type from text
 * @param {string} text - Text to analyze
 * @returns {string} 'code' | 'theory' | 'mixed'
 */
const detectContentType = (text) => {
  const codeIndicators = [
    /```[\s\S]*?```/g,           // Markdown code blocks
    /^\s*(def |function |class |const |let |var |import |#include|public |private )/m,
    /[{};]\s*$/m,                // Code-like endings
    /\(\s*\)\s*[{:]/,            // Function signatures
    /^\s*\/\//m,                 // Comments
    /^\s*#(?!#)/m                // Python comments / preprocessor
  ];

  let codeScore = 0;
  for (const pattern of codeIndicators) {
    if (pattern.test(text)) codeScore++;
  }

  if (codeScore >= 3) return 'code';
  if (codeScore >= 1) return 'mixed';
  return 'theory';
};

/**
 * Extract code blocks from text
 * @param {string} text - Text containing code blocks
 * @returns {Object} { codeBlocks: string[], textWithoutCode: string }
 */
const extractCodeBlocks = (text) => {
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const codeBlocks = [];
  let textWithoutCode = text;

  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    codeBlocks.push({
      language: match[1] || 'unknown',
      code: match[2].trim(),
      original: match[0]
    });
  }

  // Remove code blocks from text for separate processing
  textWithoutCode = text.replace(codeBlockRegex, '\n[CODE_BLOCK]\n');

  return { codeBlocks, textWithoutCode };
};

/**
 * Split text by semantic boundaries
 * @param {string} text - Text to split
 * @returns {string[]} Array of semantic sections
 */
const splitBySections = (text) => {
  // Split by headers (markdown)
  const headerRegex = /^#{1,6}\s+.+$/gm;
  
  // Split by double newlines (paragraphs)
  const paragraphRegex = /\n\n+/g;

  // First try to split by headers
  const sections = text.split(headerRegex).filter(s => s.trim());
  
  if (sections.length > 1) {
    return sections;
  }

  // Fallback to paragraph splitting
  return text.split(paragraphRegex).filter(s => s.trim());
};

/**
 * Chunk text with overlap
 * @param {string} text - Text to chunk
 * @param {number} maxSize - Maximum chunk size in characters
 * @param {number} overlap - Overlap between chunks
 * @returns {string[]} Array of chunks
 */
const chunkWithOverlap = (text, maxSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP) => {
  const words = text.split(/\s+/);
  const chunks = [];
  
  if (words.length * 5 <= maxSize) {
    // Text is small enough, return as single chunk
    return [text.trim()];
  }

  let currentChunk = [];
  let currentLength = 0;

  for (const word of words) {
    const wordLength = word.length + 1; // +1 for space
    
    if (currentLength + wordLength > maxSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push(currentChunk.join(' '));
      
      // Start new chunk with overlap
      const overlapWords = Math.floor(overlap / 5); // Approximate words for overlap
      currentChunk = currentChunk.slice(-overlapWords);
      currentLength = currentChunk.join(' ').length;
    }
    
    currentChunk.push(word);
    currentLength += wordLength;
  }

  // Add remaining chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
};

/**
 * Main chunking function
 * @param {string} text - Full text content
 * @param {Object} options - Chunking options
 * @param {number} options.chunkSize - Target chunk size
 * @param {number} options.overlap - Overlap between chunks
 * @param {string} options.contentType - Force content type
 * @returns {Object[]} Array of chunk objects
 */
const chunkText = (text, options = {}) => {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    overlap = DEFAULT_OVERLAP,
    contentType = null
  } = options;

  if (!text || typeof text !== 'string') {
    return [];
  }

  const chunks = [];
  const detectedType = contentType || detectContentType(text);

  // Extract code blocks first
  const { codeBlocks, textWithoutCode } = extractCodeBlocks(text);

  // Process code blocks as separate chunks
  for (const block of codeBlocks) {
    // For code, use larger chunks to preserve logic
    const codeChunks = chunkWithOverlap(block.code, MAX_CHUNK_SIZE, overlap);
    
    for (let i = 0; i < codeChunks.length; i++) {
      chunks.push({
        text: codeChunks[i],
        type: 'code',
        language: block.language,
        index: chunks.length,
        isCodeBlock: true
      });
    }
  }

  // Process theory text
  const sections = splitBySections(textWithoutCode);
  
  for (const section of sections) {
    // Skip placeholder markers
    if (section.trim() === '[CODE_BLOCK]') continue;
    
    const sectionChunks = chunkWithOverlap(section, chunkSize, overlap);
    
    for (const chunk of sectionChunks) {
      if (chunk.trim().length >= MIN_CHUNK_SIZE / 5) { // Min words
        chunks.push({
          text: chunk.trim(),
          type: detectedType === 'code' ? 'lab' : 'theory',
          index: chunks.length,
          isCodeBlock: false
        });
      }
    }
  }

  return chunks;
};

/**
 * Chunk content for indexing (higher-level function)
 * @param {string} text - Content text
 * @param {Object} metadata - Content metadata
 * @returns {Object[]} Chunks with metadata
 */
const chunkForIndexing = (text, metadata = {}) => {
  const { week, topic, contentType, contentId } = metadata;
  
  const chunks = chunkText(text, { contentType });
  
  return chunks.map((chunk, index) => ({
    ...chunk,
    contentId,
    metadata: {
      week,
      topic,
      chunkIndex: index,
      totalChunks: chunks.length
    }
  }));
};

/**
 * Estimate token count (rough approximation)
 * @param {string} text - Text to estimate
 * @returns {number} Estimated token count
 */
const estimateTokens = (text) => {
  // Rough estimate: 1 token ≈ 4 characters for English
  return Math.ceil(text.length / 4);
};

module.exports = {
  chunkText,
  chunkForIndexing,
  detectContentType,
  extractCodeBlocks,
  splitBySections,
  chunkWithOverlap,
  estimateTokens,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_OVERLAP,
  MIN_CHUNK_SIZE,
  MAX_CHUNK_SIZE
};
