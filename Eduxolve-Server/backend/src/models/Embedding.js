const mongoose = require('mongoose');

const embeddingSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
    index: true
  },
  chunkText: {
    type: String,
    required: true
  },
  chunkIndex: {
    type: Number,
    default: 0
  },
  vector: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Vector must be a non-empty array of numbers'
    }
  },
  type: {
    type: String,
    enum: ['theory', 'lab', 'code'],
    required: true,
    index: true
  },
  metadata: {
    week: {
      type: Number,
      index: true
    },
    topic: {
      type: String,
      index: true
    },
    language: String,
    totalChunks: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
embeddingSchema.index({ contentId: 1, chunkIndex: 1 });
embeddingSchema.index({ type: 1, 'metadata.week': 1 });
embeddingSchema.index({ type: 1, 'metadata.topic': 1 });

/**
 * Static method to find embeddings by content ID
 */
embeddingSchema.statics.findByContentId = function(contentId) {
  return this.find({ contentId }).sort({ chunkIndex: 1 });
};

/**
 * Static method to delete all embeddings for a content
 */
embeddingSchema.statics.deleteByContentId = function(contentId) {
  return this.deleteMany({ contentId });
};

/**
 * Static method to get all vectors for similarity search
 * @param {Object} filter - Optional filter (type, week, topic)
 * @returns {Promise<Array>} Array of embeddings with vectors
 */
embeddingSchema.statics.getVectorsForSearch = async function(filter = {}) {
  const query = {};
  
  if (filter.type) {
    query.type = filter.type;
  }
  if (filter.week) {
    query['metadata.week'] = filter.week;
  }
  if (filter.topic) {
    query['metadata.topic'] = { $regex: filter.topic, $options: 'i' };
  }

  return this.find(query)
    .select('_id contentId chunkText vector type metadata')
    .lean();
};

const Embedding = mongoose.model('Embedding', embeddingSchema);

module.exports = Embedding;
