/**
 * Indexing Service
 * 
 * Handles the indexing pipeline for course content:
 * 1. Extract text from content
 * 2. Chunk text into semantic units
 * 3. Generate embeddings for each chunk
 * 4. Store embeddings in MongoDB
 */

const Embedding = require('../models/Embedding');
const Content = require('../models/Content');
const { chunkForIndexing } = require('../utils/chunkText');
const { generateEmbedding, generateEmbeddings } = require('./embedding.service');
const fs = require('fs').promises;
const path = require('path');

/**
 * Extract text content from a file
 * For hackathon: supports text files directly, mocks PDF/PPT
 * @param {string} filePath - Path to the file
 * @param {string} fileType - Type of file
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromFile = async (filePath, fileType) => {
  try {
    const fullPath = path.join(__dirname, '../../uploads', path.basename(filePath));
    
    // For text-based files, read directly
    const textBasedTypes = ['text', 'python', 'javascript', 'c/c++', 'java', 'json'];
    
    if (textBasedTypes.includes(fileType)) {
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    }

    // For PDF/PPT - mock extraction for hackathon
    // In production, use pdf-parse or similar libraries
    if (fileType === 'pdf' || fileType === 'presentation') {
      // Return a placeholder - in real app, use pdf-parse, pptx-parser, etc.
      console.log(`📄 Mock extraction for ${fileType} file`);
      return `[Content extracted from ${fileType} file: ${path.basename(filePath)}]`;
    }

    // Unknown file type
    return '';

  } catch (error) {
    console.error('❌ Text extraction error:', error.message);
    return '';
  }
};

/**
 * Index a single content item
 * @param {string} contentId - MongoDB ObjectId of content
 * @param {Object} options - Indexing options
 * @returns {Promise<Object>} Indexing result
 */
const indexContent = async (contentId, options = {}) => {
  try {
    // Fetch content from database
    const content = await Content.findById(contentId);
    
    if (!content) {
      throw new Error('Content not found');
    }

    // Delete existing embeddings for this content (re-indexing)
    await Embedding.deleteByContentId(contentId);

    // Extract text from file
    let text = await extractTextFromFile(content.fileUrl, content.fileType);

    // If no text extracted, use content metadata as text
    if (!text || text.trim().length < 50) {
      text = `${content.title}\n\n${content.topic || ''}\n\nTags: ${(content.tags || []).join(', ')}`;
    }

    // Also include title and topic in text for better search
    const fullText = `${content.title}\n\n${content.topic || ''}\n\n${text}`;

    // Chunk the text
    const chunks = chunkForIndexing(fullText, {
      contentId: content._id,
      week: content.week,
      topic: content.topic,
      contentType: content.type
    });

    if (chunks.length === 0) {
      return {
        success: false,
        message: 'No chunks generated from content',
        contentId
      };
    }

    // Generate embeddings for all chunks
    const chunkTexts = chunks.map(c => c.text);
    const embeddings = await generateEmbeddings(chunkTexts);

    // Create embedding documents
    const embeddingDocs = chunks.map((chunk, index) => ({
      contentId: content._id,
      chunkText: chunk.text,
      chunkIndex: index,
      vector: embeddings[index],
      type: chunk.type === 'code' ? 'lab' : (content.type || 'theory'),
      metadata: {
        week: content.week,
        topic: content.topic,
        language: chunk.language,
        totalChunks: chunks.length
      }
    }));

    // Bulk insert embeddings
    await Embedding.insertMany(embeddingDocs);

    console.log(`✅ Indexed content ${contentId}: ${chunks.length} chunks`);

    return {
      success: true,
      contentId,
      chunksIndexed: chunks.length,
      contentTitle: content.title
    };

  } catch (error) {
    console.error('❌ Indexing error:', error.message);
    return {
      success: false,
      error: error.message,
      contentId
    };
  }
};

/**
 * Index all unindexed content
 * @returns {Promise<Object>} Batch indexing results
 */
const indexAllContent = async () => {
  try {
    // Get all content IDs
    const allContent = await Content.find().select('_id title');
    
    // Get already indexed content IDs
    const indexedIds = await Embedding.distinct('contentId');
    const indexedIdSet = new Set(indexedIds.map(id => id.toString()));

    // Find unindexed content
    const unindexed = allContent.filter(c => !indexedIdSet.has(c._id.toString()));

    console.log(`📊 Found ${unindexed.length} unindexed content items`);

    const results = {
      total: unindexed.length,
      success: 0,
      failed: 0,
      details: []
    };

    // Index each content item
    for (const content of unindexed) {
      const result = await indexContent(content._id);
      
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
      }
      
      results.details.push(result);
    }

    return results;

  } catch (error) {
    console.error('❌ Batch indexing error:', error.message);
    throw error;
  }
};

/**
 * Re-index a specific content item
 * @param {string} contentId - Content ID to re-index
 * @returns {Promise<Object>} Re-indexing result
 */
const reindexContent = async (contentId) => {
  return indexContent(contentId);
};

/**
 * Delete embeddings for content
 * @param {string} contentId - Content ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteContentEmbeddings = async (contentId) => {
  try {
    const result = await Embedding.deleteByContentId(contentId);
    
    return {
      success: true,
      deletedCount: result.deletedCount,
      contentId
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      contentId
    };
  }
};

/**
 * Get indexing statistics
 * @returns {Promise<Object>} Statistics
 */
const getIndexingStats = async () => {
  const [totalContent, totalEmbeddings, contentByType, embeddingsByType] = await Promise.all([
    Content.countDocuments(),
    Embedding.countDocuments(),
    Content.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    Embedding.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }])
  ]);

  const indexedContentIds = await Embedding.distinct('contentId');

  return {
    totalContent,
    indexedContent: indexedContentIds.length,
    unindexedContent: totalContent - indexedContentIds.length,
    totalEmbeddings,
    contentByType: contentByType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    embeddingsByType: embeddingsByType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
};

module.exports = {
  indexContent,
  indexAllContent,
  reindexContent,
  deleteContentEmbeddings,
  extractTextFromFile,
  getIndexingStats
};
