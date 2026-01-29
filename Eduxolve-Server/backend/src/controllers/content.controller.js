const Content = require('../models/Content');
const { getFileUrl, deleteFile, getFileType } = require('../services/upload.service');
const { indexContent, deleteContentEmbeddings } = require('../services/indexing.service');

/**
 * @desc    Upload new content (Admin only)
 * @route   POST /api/content
 * @access  Protected (Admin)
 */
const uploadContent = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a file.'
      });
    }

    // Extract metadata from request body
    const { title, type, week, topic, tags } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!type || !['theory', 'lab'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type is required and must be either "theory" or "lab"'
      });
    }

    // Parse tags if provided as string
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        parsedTags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        parsedTags = tags.map(tag => tag.trim().toLowerCase()).filter(Boolean);
      }
    }

    // Create content document
    const content = await Content.create({
      title: title.trim(),
      type,
      week: week ? parseInt(week, 10) : undefined,
      topic: topic ? topic.trim() : undefined,
      tags: parsedTags,
      fileUrl: getFileUrl(req.file.filename),
      fileType: getFileType(req.file.originalname),
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user.id
    });

    // Auto-index content for semantic search (async, don't block response)
    indexContent(content._id).then(result => {
      if (result.success) {
        console.log(`📚 Auto-indexed content: ${content.title}`);
      }
    }).catch(err => {
      console.error('Auto-indexing failed:', err.message);
    });

    // Populate uploadedBy for response
    await content.populate('uploadedBy', 'email role');

    res.status(201).json({
      success: true,
      message: 'Content uploaded successfully',
      data: content
    });

  } catch (error) {
    console.error('Upload content error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload content'
    });
  }
};

/**
 * @desc    List all content with filters
 * @route   GET /api/content
 * @access  Protected (Admin + Student)
 */
const listContent = async (req, res) => {
  try {
    const { type, week, topic, tags, page = 1, limit = 20 } = req.query;

    // Build query filter
    const filter = {};

    if (type && ['theory', 'lab'].includes(type)) {
      filter.type = type;
    }

    if (week) {
      const weekNum = parseInt(week, 10);
      if (!isNaN(weekNum)) {
        filter.week = weekNum;
      }
    }

    if (topic) {
      // Case-insensitive partial match
      filter.topic = { $regex: topic, $options: 'i' };
    }

    if (tags) {
      // Support comma-separated tags
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [content, total] = await Promise.all([
      Content.find(filter)
        .populate('uploadedBy', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Content.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: content,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('List content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content'
    });
  }
};

/**
 * @desc    Get single content by ID
 * @route   GET /api/content/:id
 * @access  Protected (Admin + Student)
 */
const getContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content ID format'
      });
    }

    const content = await Content.findById(id)
      .populate('uploadedBy', 'email role')
      .select('-__v');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.status(200).json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content'
    });
  }
};

/**
 * @desc    Delete content (Admin only)
 * @route   DELETE /api/content/:id
 * @access  Protected (Admin)
 */
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content ID format'
      });
    }

    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Delete file from storage
    if (content.fileUrl) {
      await deleteFile(content.fileUrl);
    }

    // Delete embeddings for this content (async, don't block)
    deleteContentEmbeddings(id).catch(err => {
      console.error('Failed to delete embeddings:', err.message);
    });

    // Delete from database
    await Content.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully',
      data: {
        id: content._id,
        title: content.title
      }
    });

  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content'
    });
  }
};

/**
 * @desc    Update content metadata (Admin only)
 * @route   PATCH /api/content/:id
 * @access  Protected (Admin)
 */
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, week, topic, tags } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content ID format'
      });
    }

    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Build update object
    const updates = {};

    if (title !== undefined) updates.title = title.trim();
    if (type !== undefined) {
      if (!['theory', 'lab'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "theory" or "lab"'
        });
      }
      updates.type = type;
    }
    if (week !== undefined) updates.week = parseInt(week, 10) || null;
    if (topic !== undefined) updates.topic = topic.trim();
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        updates.tags = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        updates.tags = tags.map(t => t.trim().toLowerCase()).filter(Boolean);
      }
    }

    // Update document
    const updatedContent = await Content.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'email role').select('-__v');

    res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: updatedContent
    });

  } catch (error) {
    console.error('Update content error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update content'
    });
  }
};

module.exports = {
  uploadContent,
  listContent,
  getContent,
  deleteContent,
  updateContent
};
