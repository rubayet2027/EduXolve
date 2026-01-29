/**
 * ValidationLog Model
 * 
 * Stores validation results for analytics and review
 */

const mongoose = require('mongoose');

const validationLogSchema = new mongoose.Schema({
  // Type of content validated
  type: {
    type: String,
    enum: ['theory', 'lab', 'slides'],
    required: true
  },
  
  // Content length (for analytics)
  contentLength: {
    type: Number,
    required: true
  },
  
  // Validation score (0-1)
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  
  // Whether content passed validation
  valid: {
    type: Boolean,
    required: true
  },
  
  // User who requested validation
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Detailed validation layers (optional)
  layers: {
    grounding: {
      score: Number,
      explanation: String
    },
    structure: {
      score: Number,
      issues: [String]
    },
    codeValidation: {
      score: Number,
      valid: Boolean,
      issues: [String]
    },
    aiEvaluation: {
      score: Number,
      breakdown: mongoose.Schema.Types.Mixed
    }
  },
  
  // Feedback provided
  feedback: {
    type: String
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
validationLogSchema.index({ type: 1, timestamp: -1 });
validationLogSchema.index({ userId: 1, timestamp: -1 });
validationLogSchema.index({ valid: 1 });

// Static method to get stats by time range
validationLogSchema.statics.getStatsByRange = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgScore: { $avg: '$score' },
        passCount: { $sum: { $cond: ['$valid', 1, 0] } }
      }
    }
  ]);
};

// Static method to get user validation history
validationLogSchema.statics.getUserHistory = async function(userId, limit = 20) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('type score valid feedback timestamp');
};

const ValidationLog = mongoose.model('ValidationLog', validationLogSchema);

module.exports = ValidationLog;
