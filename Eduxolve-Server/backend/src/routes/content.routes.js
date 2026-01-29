const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares');
const { upload } = require('../services/upload.service');
const {
  uploadContent,
  listContent,
  getContent,
  deleteContent,
  updateContent
} = require('../controllers/content.controller');

/**
 * Multer error handler middleware
 */
const handleUploadError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field. Use "file" as the field name.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  next();
};

/**
 * @route   POST /api/content
 * @desc    Upload new content
 * @access  Protected (Admin only)
 */
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  upload.single('file'),
  handleUploadError,
  uploadContent
);

/**
 * @route   GET /api/content
 * @desc    List all content with filters
 * @access  Protected (Admin + Student)
 * @query   type, week, topic, tags, page, limit
 */
router.get(
  '/',
  authenticate,
  listContent
);

/**
 * @route   GET /api/content/:id
 * @desc    Get single content by ID
 * @access  Protected (Admin + Student)
 */
router.get(
  '/:id',
  authenticate,
  getContent
);

/**
 * @route   PATCH /api/content/:id
 * @desc    Update content metadata
 * @access  Protected (Admin only)
 */
router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  updateContent
);

/**
 * @route   DELETE /api/content/:id
 * @desc    Delete content
 * @access  Protected (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  deleteContent
);

/**
 * @route   POST /api/content/seed
 * @desc    Seed dummy content for demo (Public - for demo only)
 * @access  Public (for demo purposes)
 */
router.post(
  '/seed',
  async (req, res) => {
    try {
      const Content = require('../models/Content');
      
      // Check if content already exists - allow force parameter to bypass
      const existingCount = await Content.countDocuments();
      const force = req.query.force === 'true';
      
      if (existingCount > 0 && !force) {
        return res.status(400).json({
          success: false,
          message: `Database already has ${existingCount} content items. Add ?force=true to seed anyway.`
        });
      }

      const adminId = 'admin-demo-user';

      const dummyContent = [
        {
          title: 'Week 1 - Introduction to Data Structures',
          type: 'theory',
          week: 1,
          topic: 'Introduction',
          tags: ['arrays', 'basics', 'introduction'],
          fileUrl: '/uploads/week1_intro.pdf',
          fileType: 'application/pdf',
          originalFileName: 'Week1_Introduction.pdf',
          fileSize: 1024000,
          uploadedBy: adminId
        },
        {
          title: 'Week 2 - Arrays and Linked Lists',
          type: 'theory',
          week: 2,
          topic: 'Linear Data Structures',
          tags: ['arrays', 'linked-lists', 'linear'],
          fileUrl: '/uploads/week2_arrays.pdf',
          fileType: 'application/pdf',
          originalFileName: 'Week2_Arrays_LinkedLists.pdf',
          fileSize: 2048000,
          uploadedBy: adminId
        },
        {
          title: 'Week 3 - Stacks and Queues',
          type: 'theory',
          week: 3,
          topic: 'Linear Data Structures',
          tags: ['stacks', 'queues', 'linear'],
          fileUrl: '/uploads/week3_stacks.pdf',
          fileType: 'application/pdf',
          originalFileName: 'Week3_Stacks_Queues.pdf',
          fileSize: 1536000,
          uploadedBy: adminId
        },
        {
          title: 'Lab 1 - Array Implementation',
          type: 'lab',
          week: 1,
          topic: 'Hands-on Arrays',
          tags: ['arrays', 'implementation', 'python'],
          fileUrl: '/uploads/lab1_arrays.py',
          fileType: 'text/x-python',
          originalFileName: 'Lab1_Arrays.py',
          fileSize: 5120,
          uploadedBy: adminId
        },
        {
          title: 'Lab 2 - Linked List Operations',
          type: 'lab',
          week: 2,
          topic: 'Linked List Practice',
          tags: ['linked-lists', 'implementation', 'python'],
          fileUrl: '/uploads/lab2_linkedlist.py',
          fileType: 'text/x-python',
          originalFileName: 'Lab2_LinkedList.py',
          fileSize: 8192,
          uploadedBy: adminId
        },
        {
          title: 'Week 4 - Trees and Binary Trees',
          type: 'theory',
          week: 4,
          topic: 'Non-Linear Data Structures',
          tags: ['trees', 'binary-trees', 'traversal'],
          fileUrl: '/uploads/week4_trees.pdf',
          fileType: 'application/pdf',
          originalFileName: 'Week4_Trees.pdf',
          fileSize: 3072000,
          uploadedBy: adminId
        },
        {
          title: 'Lab 3 - Binary Search Tree',
          type: 'lab',
          week: 4,
          topic: 'BST Implementation',
          tags: ['bst', 'trees', 'python'],
          fileUrl: '/uploads/lab3_bst.py',
          fileType: 'text/x-python',
          originalFileName: 'Lab3_BST.py',
          fileSize: 10240,
          uploadedBy: adminId
        },
        {
          title: 'Week 5 - Graphs Introduction',
          type: 'theory',
          week: 5,
          topic: 'Graph Theory',
          tags: ['graphs', 'bfs', 'dfs'],
          fileUrl: '/uploads/week5_graphs.pdf',
          fileType: 'application/pdf',
          originalFileName: 'Week5_Graphs.pdf',
          fileSize: 4096000,
          uploadedBy: adminId
        }
      ];

      const inserted = await Content.insertMany(dummyContent);
      
      console.log(`✅ Seeded ${inserted.length} dummy content items`);
      
      res.status(201).json({
        success: true,
        message: `Successfully seeded ${inserted.length} content items`,
        data: {
          count: inserted.length,
          theory: inserted.filter(c => c.type === 'theory').length,
          lab: inserted.filter(c => c.type === 'lab').length
        }
      });
    } catch (error) {
      console.error('❌ Seed error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to seed content'
      });
    }
  }
);

module.exports = router;
