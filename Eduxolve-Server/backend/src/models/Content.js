const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: {
      values: ['theory', 'lab'],
      message: 'Type must be either "theory" or "lab"'
    },
    required: [true, 'Content type is required']
  },
  week: {
    type: Number,
    min: [1, 'Week must be at least 1'],
    max: [52, 'Week cannot exceed 52']
  },
  topic: {
    type: String,
    trim: true,
    maxlength: [300, 'Topic cannot exceed 300 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileType: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for common queries
contentSchema.index({ type: 1 });
contentSchema.index({ week: 1 });
contentSchema.index({ topic: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ createdAt: -1 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
