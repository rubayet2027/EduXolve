const {
  semanticSearch,
  getSearchSuggestions,
  getRelatedContent,
  getContextForRAG
} = require('../services/search.service');
const {
  indexContent,
  indexAllContent,
  getIndexingStats
} = require('../services/indexing.service');

/**
 * @desc    Semantic search for course content
 * @route   POST /api/search
 * @access  Protected (Admin + Student)
 */
const search = async (req, res) => {
  try {
    const { query, type, week, topic, limit } = req.body;

    // Validate query
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be at least 2 characters'
      });
    }

    // Perform search
    const result = await semanticSearch(query, {
      type,
      week: week ? parseInt(week, 10) : null,
      topic,
      topK: limit ? Math.min(parseInt(limit, 10), 20) : 5
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.status(200).json({
      success: true,
      query: result.query,
      results: result.results,
      totalMatches: result.totalMatches,
      filters: result.filters
    });

  } catch (error) {
    console.error('❌ Search controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
};

/**
 * @desc    Get search suggestions
 * @route   GET /api/search/suggestions
 * @access  Protected (Admin + Student)
 */
const suggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: []
      });
    }

    const results = await getSearchSuggestions(q);

    res.status(200).json({
      success: true,
      suggestions: results
    });

  } catch (error) {
    console.error('❌ Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions'
    });
  }
};

/**
 * @desc    Get related content for a content ID
 * @route   GET /api/search/related/:contentId
 * @access  Protected (Admin + Student)
 */
const related = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { limit = 5 } = req.query;

    if (!contentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content ID format'
      });
    }

    const results = await getRelatedContent(contentId, parseInt(limit, 10));

    res.status(200).json({
      success: true,
      contentId,
      related: results
    });

  } catch (error) {
    console.error('❌ Related content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get related content'
    });
  }
};

/**
 * @desc    Index a specific content item
 * @route   POST /api/search/index/:contentId
 * @access  Protected (Admin only)
 */
const indexSingle = async (req, res) => {
  try {
    const { contentId } = req.params;

    if (!contentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content ID format'
      });
    }

    const result = await indexContent(contentId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      message: 'Content indexed successfully',
      ...result
    });

  } catch (error) {
    console.error('❌ Index single error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to index content'
    });
  }
};

/**
 * @desc    Index all unindexed content
 * @route   POST /api/search/index-all
 * @access  Protected (Admin only)
 */
const indexAll = async (req, res) => {
  try {
    const result = await indexAllContent();

    res.status(200).json({
      success: true,
      message: 'Batch indexing completed',
      ...result
    });

  } catch (error) {
    console.error('❌ Index all error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to index content'
    });
  }
};

/**
 * @desc    Get indexing statistics
 * @route   GET /api/search/stats
 * @access  Protected (Admin only)
 */
const stats = async (req, res) => {
  try {
    const statistics = await getIndexingStats();

    res.status(200).json({
      success: true,
      stats: statistics
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
};

/**
 * @desc    Get RAG context for a topic
 * @route   POST /api/search/context
 * @access  Protected (Admin + Student)
 */
const getContext = async (req, res) => {
  try {
    const { topic, type, maxChunks = 3 } = req.body;

    if (!topic || topic.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    const context = await getContextForRAG(topic, {
      type,
      maxChunks: Math.min(parseInt(maxChunks, 10), 10)
    });

    res.status(200).json({
      success: true,
      topic,
      context,
      hasContext: context.length > 0
    });

  } catch (error) {
    console.error('❌ Context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get context'
    });
  }
};

module.exports = {
  search,
  suggestions,
  related,
  indexSingle,
  indexAll,
  stats,
  getContext
};
