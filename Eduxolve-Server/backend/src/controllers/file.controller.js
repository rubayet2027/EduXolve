/**
 * File Controller
 * 
 * Handles file upload, processing, and context generation
 * for AI-assisted learning features.
 * 
 * ⚠️ Files are processed in memory and NOT stored permanently
 */

const multer = require('multer');
const path = require('path');
const { extractText, isSupportedFileType, getSupportedTypes } = require('../services/fileExtract.service');
const { buildFileContext, getSuggestedActions, formatContextForPrompt } = require('../services/fileContext.service');

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/x-c',
  'text/x-c++',
  'text/x-python',
  'application/javascript',
  'text/javascript',
  'application/octet-stream' // For some code files
];

// Allowed extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt', '.c', '.cpp', '.h', '.hpp', '.py', '.js'];

// Configure multer for memory storage (no disk storage)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
  const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.mimetype) || 
                        file.mimetype.startsWith('text/');
  
  if (isAllowedExt || isAllowedMime) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext || file.mimetype}`), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter
}).single('file');

// Wrap multer in promise for better error handling
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large',
          message: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Upload error',
        message: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file',
        message: err.message
      });
    }
    next();
  });
};

// In-memory file context store (expires after 30 minutes)
const fileContextStore = new Map();
const CONTEXT_EXPIRY = 30 * 60 * 1000; // 30 minutes

// Clean up expired contexts periodically
setInterval(() => {
  const now = Date.now();
  for (const [fileId, data] of fileContextStore) {
    if (now - data.timestamp > CONTEXT_EXPIRY) {
      fileContextStore.delete(fileId);
      console.log(`🗑️ Cleaned up expired file context: ${fileId}`);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

/**
 * Generate unique file ID
 * @returns {string} Unique ID
 */
const generateFileId = () => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * @desc    Upload and process a file for AI context
 * @route   POST /api/files/upload
 * @access  Protected (Student + Admin)
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
        message: 'Please select a file to upload'
      });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    console.log(`📤 Processing file: ${originalname} (${(size / 1024).toFixed(1)}KB)`);

    // Validate file type again (defense in depth)
    if (!isSupportedFileType(mimetype, originalname)) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file type',
        message: 'Please upload a PDF, DOCX, TXT, or code file (.c, .cpp, .py, .js)',
        supportedTypes: getSupportedTypes()
      });
    }

    // Extract text from file
    const extractionResult = await extractText(buffer, mimetype, originalname);

    if (!extractionResult.success) {
      return res.status(422).json({
        success: false,
        error: 'Extraction failed',
        message: extractionResult.error || 'Could not extract text from file',
        fileInfo: extractionResult.fileInfo
      });
    }

    // Build AI context
    const fileContext = await buildFileContext(extractionResult, originalname, {
      includeFullContent: true,
      generateFileSummary: true
    });

    if (!fileContext.success) {
      return res.status(422).json({
        success: false,
        error: 'Context generation failed',
        message: fileContext.error
      });
    }

    // Generate file ID and store context
    const fileId = generateFileId();
    const userId = req.user?.id || 'anonymous';

    fileContextStore.set(fileId, {
      context: fileContext.context,
      formattedContext: formatContextForPrompt(fileContext),
      userId,
      timestamp: Date.now()
    });

    // Get suggested actions
    const suggestedActions = getSuggestedActions(fileContext);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        fileId,
        fileName: originalname,
        fileType: fileContext.context.fileType,
        fileCategory: fileContext.context.category,
        fileSize: size,
        language: fileContext.context.language,
        isCode: fileContext.context.isCode,
        summary: fileContext.context.summary || null,
        codeAnalysis: fileContext.context.codeAnalysis || null,
        suggestedActions,
        expiresIn: '30 minutes',
        message: 'File processed successfully! What would you like to do with it?'
      }
    });

  } catch (error) {
    console.error('❌ File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Processing failed',
      message: 'An error occurred while processing the file. Please try again.'
    });
  }
};

/**
 * @desc    Get file context by ID (for AI processing)
 * @route   GET /api/files/:fileId/context
 * @access  Protected (Student + Admin)
 */
const getFileContext = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id || 'anonymous';

    const stored = fileContextStore.get(fileId);

    if (!stored) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        message: 'The file context has expired or does not exist. Please upload the file again.'
      });
    }

    // Optional: Verify user owns this file context
    // if (stored.userId !== userId) { ... }

    res.status(200).json({
      success: true,
      data: {
        context: stored.context,
        formattedContext: stored.formattedContext
      }
    });

  } catch (error) {
    console.error('❌ Get context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve context'
    });
  }
};

/**
 * @desc    Delete file context
 * @route   DELETE /api/files/:fileId
 * @access  Protected (Student + Admin)
 */
const deleteFileContext = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (fileContextStore.has(fileId)) {
      fileContextStore.delete(fileId);
    }

    res.status(200).json({
      success: true,
      message: 'File context removed'
    });

  } catch (error) {
    console.error('❌ Delete context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete context'
    });
  }
};

/**
 * @desc    Get supported file types
 * @route   GET /api/files/supported-types
 * @access  Public
 */
const getSupportedFileTypes = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      ...getSupportedTypes(),
      allowedExtensions: ALLOWED_EXTENSIONS,
      maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024)
    }
  });
};

/**
 * Get stored file context by ID (internal use)
 * @param {string} fileId - File ID
 * @returns {Object|null} Stored context or null
 */
const getStoredContext = (fileId) => {
  const stored = fileContextStore.get(fileId);
  return stored || null;
};

module.exports = {
  uploadMiddleware,
  uploadFile,
  getFileContext,
  deleteFileContext,
  getSupportedFileTypes,
  getStoredContext
};
