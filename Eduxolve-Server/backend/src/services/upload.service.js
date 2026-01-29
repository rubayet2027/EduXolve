const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Allowed file types
const ALLOWED_MIME_TYPES = {
  // Documents
  'application/pdf': 'pdf',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  
  // Code files
  'text/x-c': 'c',
  'text/x-c++': 'cpp',
  'text/x-python': 'py',
  'text/javascript': 'js',
  'application/javascript': 'js',
  'text/plain': 'txt',
  
  // Additional common types
  'text/x-java-source': 'java',
  'application/json': 'json'
};

// Allowed extensions (fallback for code files)
const ALLOWED_EXTENSIONS = [
  '.pdf', '.ppt', '.pptx',
  '.c', '.cpp', '.cc', '.h', '.hpp',
  '.py', '.js', '.ts', '.java',
  '.txt', '.json', '.md'
];

/**
 * File filter function
 * Validates file type by MIME type and extension
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  // Check by MIME type first
  if (ALLOWED_MIME_TYPES[mimeType]) {
    return cb(null, true);
  }

  // Fallback to extension check (useful for code files)
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(null, true);
  }

  // Reject file
  const error = new Error(`File type not allowed. Allowed types: PDF, PPT/PPTX, and code files (${ALLOWED_EXTENSIONS.join(', ')})`);
  error.code = 'INVALID_FILE_TYPE';
  return cb(error, false);
};

/**
 * Storage configuration
 * Saves files with unique names to prevent collisions
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_') // Sanitize filename
      .substring(0, 50); // Limit length
    
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  }
});

/**
 * Multer upload instance
 * Configured with file size limit and type validation
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 1 // Single file upload
  }
});

/**
 * Get file URL from filename
 * @param {string} filename - The stored filename
 * @returns {string} The URL to access the file
 */
const getFileUrl = (filename) => {
  return `/uploads/${filename}`;
};

/**
 * Delete file from storage
 * @param {string} fileUrl - The file URL or path
 * @returns {Promise<boolean>} Success status
 */
const deleteFile = async (fileUrl) => {
  try {
    // Extract filename from URL
    const filename = path.basename(fileUrl);
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error.message);
    return false;
  }
};

/**
 * Get file type category from extension
 * @param {string} filename - Original filename
 * @returns {string} File type category
 */
const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  if (ext === '.pdf') return 'pdf';
  if (['.ppt', '.pptx'].includes(ext)) return 'presentation';
  if (['.c', '.cpp', '.cc', '.h', '.hpp'].includes(ext)) return 'c/c++';
  if (ext === '.py') return 'python';
  if (['.js', '.ts'].includes(ext)) return 'javascript';
  if (ext === '.java') return 'java';
  if (['.txt', '.md'].includes(ext)) return 'text';
  if (ext === '.json') return 'json';
  
  return 'other';
};

module.exports = {
  upload,
  getFileUrl,
  deleteFile,
  getFileType,
  uploadsDir,
  ALLOWED_EXTENSIONS
};
