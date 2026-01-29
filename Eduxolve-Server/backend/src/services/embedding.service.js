/**
 * Embedding Service
 * 
 * Generates vector embeddings for text using Gemini embedding model.
 * Falls back to a simple TF-IDF-like approach for hackathon reliability.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Embedding model configuration
const EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_DIMENSION = 768; // Gemini embedding dimension

/**
 * Generate embedding for a single text using Gemini
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector
 */
const generateEmbedding = async (text) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('⚠️ Gemini API key not configured, using fallback embedding');
      return generateFallbackEmbedding(text);
    }

    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    
    if (!embedding || !embedding.values) {
      throw new Error('Invalid embedding response');
    }

    return embedding.values;

  } catch (error) {
    console.error('❌ Embedding generation error:', error.message);
    
    // Fallback to simple embedding on error
    if (error.message.includes('API_KEY') || error.message.includes('RATE_LIMIT')) {
      return generateFallbackEmbedding(text);
    }
    
    throw error;
  }
};

/**
 * Generate embeddings for multiple texts (batch)
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
const generateEmbeddings = async (texts) => {
  const embeddings = [];
  
  // Process in batches to avoid rate limits
  const batchSize = 5;
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    const batchPromises = batch.map(text => generateEmbedding(text));
    const batchResults = await Promise.all(batchPromises);
    
    embeddings.push(...batchResults);
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return embeddings;
};

/**
 * Fallback embedding using simple word frequency approach
 * Used when Gemini API is unavailable
 * @param {string} text - Text to embed
 * @returns {number[]} Simple embedding vector
 */
const generateFallbackEmbedding = (text) => {
  // Normalize text
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, '');
  const words = normalizedText.split(/\s+/).filter(w => w.length > 2);
  
  // Create a simple hash-based embedding
  const vector = new Array(EMBEDDING_DIMENSION).fill(0);
  
  for (const word of words) {
    // Hash word to get indices
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use hash to set multiple dimensions
    const indices = [
      Math.abs(hash) % EMBEDDING_DIMENSION,
      Math.abs(hash * 31) % EMBEDDING_DIMENSION,
      Math.abs(hash * 37) % EMBEDDING_DIMENSION
    ];
    
    for (const idx of indices) {
      vector[idx] += 1;
    }
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= magnitude;
    }
  }
  
  return vector;
};

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Similarity score (0-1)
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  
  if (magnitude === 0) return 0;
  
  return dotProduct / magnitude;
};

/**
 * Find top-K similar vectors
 * @param {number[]} queryVector - Query embedding
 * @param {Object[]} documents - Documents with vectors
 * @param {number} topK - Number of results to return
 * @returns {Object[]} Top K documents with scores
 */
const findSimilar = (queryVector, documents, topK = 5) => {
  const scored = documents.map(doc => ({
    ...doc,
    score: cosineSimilarity(queryVector, doc.vector)
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top K
  return scored.slice(0, topK);
};

module.exports = {
  generateEmbedding,
  generateEmbeddings,
  generateFallbackEmbedding,
  cosineSimilarity,
  findSimilar,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSION
};
