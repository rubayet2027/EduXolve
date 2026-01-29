/**
 * Search Service
 * 
 * Semantic search engine using vector similarity.
 * Retrieves relevant course content chunks based on natural language queries.
 */

const Embedding = require('../models/Embedding');
const Content = require('../models/Content');
const { generateEmbedding, cosineSimilarity, findSimilar } = require('./embedding.service');

// Search configuration
const DEFAULT_TOP_K = 5;
const MIN_SIMILARITY_THRESHOLD = 0.3; // Minimum similarity score to include

/**
 * Perform semantic search
 * @param {string} query - User's search query
 * @param {Object} options - Search options
 * @param {string} options.type - Filter by content type (theory/lab)
 * @param {number} options.week - Filter by week
 * @param {string} options.topic - Filter by topic
 * @param {number} options.topK - Number of results to return
 * @returns {Promise<Object>} Search results
 */
const semanticSearch = async (query, options = {}) => {
  try {
    const {
      type = null,
      week = null,
      topic = null,
      topK = DEFAULT_TOP_K
    } = options;

    // Validate query
    if (!query || query.trim().length < 2) {
      return {
        success: false,
        error: 'Query must be at least 2 characters'
      };
    }

    // Generate embedding for the query
    const queryVector = await generateEmbedding(query.trim());

    // Build filter for document retrieval
    const filter = {};
    if (type && ['theory', 'lab', 'code'].includes(type)) {
      filter.type = type;
    }
    if (week) {
      filter.week = week;
    }
    if (topic) {
      filter.topic = topic;
    }

    // Get all embeddings matching filter
    const embeddings = await Embedding.getVectorsForSearch(filter);

    if (embeddings.length === 0) {
      return {
        success: true,
        results: [],
        message: 'No indexed content found matching the criteria'
      };
    }

    // Find similar documents
    const similar = findSimilar(queryVector, embeddings, topK * 2); // Get more, then filter

    // Filter by minimum threshold
    const filtered = similar.filter(doc => doc.score >= MIN_SIMILARITY_THRESHOLD);

    // Limit to topK
    const topResults = filtered.slice(0, topK);

    // Enrich results with content info
    const enrichedResults = await enrichSearchResults(topResults);

    return {
      success: true,
      query,
      results: enrichedResults,
      totalMatches: filtered.length,
      filters: { type, week, topic }
    };

  } catch (error) {
    console.error('❌ Search error:', error.message);
    return {
      success: false,
      error: 'Search failed',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    };
  }
};

/**
 * Enrich search results with content metadata
 * @param {Object[]} results - Search results with scores
 * @returns {Promise<Object[]>} Enriched results
 */
const enrichSearchResults = async (results) => {
  // Get unique content IDs
  const contentIds = [...new Set(results.map(r => r.contentId.toString()))];
  
  // Fetch content metadata
  const contents = await Content.find({ _id: { $in: contentIds } })
    .select('_id title type week topic tags fileUrl')
    .lean();

  // Create lookup map
  const contentMap = contents.reduce((acc, content) => {
    acc[content._id.toString()] = content;
    return acc;
  }, {});

  // Enrich results
  return results.map(result => {
    const content = contentMap[result.contentId.toString()] || {};
    
    return {
      chunkText: result.chunkText,
      score: Math.round(result.score * 100) / 100, // Round to 2 decimals
      contentId: result.contentId,
      type: result.type,
      metadata: result.metadata,
      content: {
        title: content.title,
        type: content.type,
        week: content.week,
        topic: content.topic,
        tags: content.tags,
        fileUrl: content.fileUrl
      }
    };
  });
};

/**
 * Search for content relevant to a topic (for RAG context)
 * @param {string} topic - Topic to search for
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Context object with chunks array
 */
const getContextForRAG = async (topic, options = {}) => {
  const { type = null, maxChunks = 3, maxLength = 2000 } = options;

  const searchResult = await semanticSearch(topic, {
    type,
    topK: maxChunks
  });

  if (!searchResult.success || searchResult.results.length === 0) {
    return { success: false, chunks: [], context: '' };
  }

  // Filter chunks by max length
  let totalLength = 0;
  const filteredChunks = [];
  
  for (const result of searchResult.results) {
    if (totalLength + result.chunkText.length > maxLength) {
      break;
    }
    filteredChunks.push(result);
    totalLength += result.chunkText.length;
  }

  // Build context string
  const context = filteredChunks.map(c => c.chunkText).join('\n\n---\n\n');

  return {
    success: true,
    chunks: filteredChunks,
    context: context.trim()
  };
};

/**
 * Get search suggestions based on partial query
 * @param {string} partial - Partial query
 * @returns {Promise<string[]>} Suggestions
 */
const getSearchSuggestions = async (partial) => {
  try {
    if (!partial || partial.length < 2) {
      return [];
    }

    // Search for topics matching the partial query
    const contents = await Content.find({
      $or: [
        { title: { $regex: partial, $options: 'i' } },
        { topic: { $regex: partial, $options: 'i' } },
        { tags: { $regex: partial, $options: 'i' } }
      ]
    })
      .select('title topic tags')
      .limit(5)
      .lean();

    // Extract unique suggestions
    const suggestions = new Set();
    
    for (const content of contents) {
      if (content.title) suggestions.add(content.title);
      if (content.topic) suggestions.add(content.topic);
    }

    return Array.from(suggestions).slice(0, 5);

  } catch (error) {
    console.error('❌ Suggestions error:', error.message);
    return [];
  }
};

/**
 * Get related content based on a content ID
 * @param {string} contentId - Content ID
 * @param {number} limit - Number of related items
 * @returns {Promise<Object[]>} Related content
 */
const getRelatedContent = async (contentId, limit = 5) => {
  try {
    // Get embeddings for the source content
    const sourceEmbeddings = await Embedding.findByContentId(contentId);
    
    if (sourceEmbeddings.length === 0) {
      return [];
    }

    // Use the first chunk's embedding as representative
    const sourceVector = sourceEmbeddings[0].vector;

    // Get all other embeddings (excluding source)
    const allEmbeddings = await Embedding.find({
      contentId: { $ne: contentId }
    })
      .select('contentId vector')
      .lean();

    // Find similar
    const similar = findSimilar(sourceVector, allEmbeddings, limit * 3);

    // Get unique content IDs
    const seen = new Set();
    const uniqueResults = similar.filter(r => {
      const id = r.contentId.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice(0, limit);

    // Fetch content details
    const contentIds = uniqueResults.map(r => r.contentId);
    const contents = await Content.find({ _id: { $in: contentIds } })
      .select('_id title type week topic tags')
      .lean();

    return contents;

  } catch (error) {
    console.error('❌ Related content error:', error.message);
    return [];
  }
};

module.exports = {
  semanticSearch,
  getContextForRAG,
  getSearchSuggestions,
  getRelatedContent,
  enrichSearchResults,
  DEFAULT_TOP_K,
  MIN_SIMILARITY_THRESHOLD
};
