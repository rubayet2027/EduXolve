/**
 * File Extraction Service
 * 
 * Responsibilities:
 * - Detect file type
 * - Extract readable text from various formats
 * - Clean text (remove noise)
 * - Limit extracted text length
 * 
 * ⚠️ Raw files are NOT stored permanently - only temporary processing
 */

const path = require('path');

// Lazy load pdf-parse and mammoth to avoid issues if not installed
let pdfParse = null;
let mammoth = null;

const loadPdfParse = async () => {
  if (!pdfParse) {
    try {
      pdfParse = require('pdf-parse');
    } catch (e) {
      console.warn('pdf-parse not available, using fallback extraction');
    }
  }
  return pdfParse;
};

const loadMammoth = async () => {
  if (!mammoth) {
    try {
      mammoth = require('mammoth');
    } catch (e) {
      console.warn('mammoth not available, using fallback extraction');
    }
  }
  return mammoth;
};

// Maximum characters to extract (to prevent context overflow)
const MAX_TEXT_LENGTH = 15000;

// Supported file types with MIME mappings
const FILE_TYPE_MAP = {
  // Documents
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'text/plain': 'txt',
  
  // Code files
  'text/x-c': 'c',
  'text/x-c++': 'cpp',
  'text/x-python': 'py',
  'application/javascript': 'js',
  'text/javascript': 'js',
  
  // Fallbacks by extension
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.doc': 'doc',
  '.txt': 'txt',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.py': 'py',
  '.js': 'js'
};

// Code file extensions for syntax detection
const CODE_EXTENSIONS = ['.c', '.cpp', '.h', '.hpp', '.py', '.js', '.java', '.cs'];

// Language detection by extension
const LANGUAGE_MAP = {
  '.c': 'C',
  '.cpp': 'C++',
  '.h': 'C Header',
  '.hpp': 'C++ Header',
  '.py': 'Python',
  '.js': 'JavaScript',
  '.java': 'Java',
  '.cs': 'C#'
};

/**
 * Detect file type from MIME type and extension
 * @param {string} mimeType - MIME type from multer
 * @param {string} filename - Original filename
 * @returns {Object} File type info
 */
const detectFileType = (mimeType, filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  // Check if it's a code file
  const isCode = CODE_EXTENSIONS.includes(ext);
  
  // Get file category
  let category = 'unknown';
  let type = FILE_TYPE_MAP[mimeType] || FILE_TYPE_MAP[ext] || 'unknown';
  
  if (isCode) {
    category = 'code';
    type = ext.replace('.', '');
  } else if (['pdf', 'docx', 'doc'].includes(type)) {
    category = 'document';
  } else if (type === 'txt') {
    category = 'text';
  }
  
  return {
    type,
    category,
    extension: ext,
    language: isCode ? LANGUAGE_MAP[ext] : null,
    isCode
  };
};

/**
 * Extract text from PDF file
 * Uses pdf-parse library for reliable extraction
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<string>} Extracted text
 */
const extractFromPDF = async (buffer) => {
  try {
    // Try to use pdf-parse first
    const parser = await loadPdfParse();
    if (parser) {
      const data = await parser(buffer);
      const extractedText = cleanExtractedText(data.text || '');
      
      if (extractedText.length < 50) {
        return '[PDF content could not be fully extracted. The file may contain scanned images or complex formatting. Please copy-paste the relevant text directly.]';
      }
      return extractedText;
    }
    
    // Fallback: basic extraction
    const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 100000));
    const textMatches = content.match(/\(([\s\S]*?)\)/g) || [];
    let extractedText = textMatches
      .map(match => match.slice(1, -1))
      .filter(text => text.length > 2 && /[a-zA-Z]/.test(text))
      .join(' ');
    
    extractedText = cleanExtractedText(extractedText);
    
    if (extractedText.length < 50) {
      return '[PDF content could not be fully extracted. Please install pdf-parse for better PDF support, or copy-paste the text directly.]';
    }
    
    return extractedText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return '[Error extracting PDF content. Please try a different format or copy-paste the text.]';
  }
};

/**
 * Extract text from DOCX file
 * Uses mammoth library for reliable extraction
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<string>} Extracted text
 */
const extractFromDOCX = async (buffer) => {
  try {
    // Try to use mammoth first
    const docxParser = await loadMammoth();
    if (docxParser) {
      const result = await docxParser.extractRawText({ buffer });
      const extractedText = cleanExtractedText(result.value || '');
      
      if (extractedText.length < 20) {
        return '[DOCX content could not be fully extracted. Please try saving as TXT or copy-paste the text.]';
      }
      return extractedText;
    }
    
    // Fallback: basic XML extraction
    const content = buffer.toString('utf-8');
    const textMatches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    let extractedText = textMatches
      .map(match => {
        const textMatch = match.match(/>([^<]*)</);
        return textMatch ? textMatch[1] : '';
      })
      .join(' ');
    
    extractedText = cleanExtractedText(extractedText);
    
    if (extractedText.length < 20) {
      return '[DOCX content could not be fully extracted. Please install mammoth for better DOCX support, or copy-paste the text.]';
    }
    
    return extractedText;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return '[Error extracting DOCX content. Please try a different format.]';
  }
};

/**
 * Extract text from plain text or code file
 * @param {Buffer} buffer - File buffer
 * @param {Object} fileInfo - File type info
 * @returns {string} File content
 */
const extractFromText = (buffer, fileInfo) => {
  try {
    let content = buffer.toString('utf-8');
    
    // For code files, preserve formatting but add metadata
    if (fileInfo.isCode) {
      return content; // Keep code as-is
    }
    
    // For text files, clean up
    return cleanExtractedText(content);
  } catch (error) {
    console.error('Text extraction error:', error);
    return '[Error reading text file.]';
  }
};

/**
 * Clean extracted text
 * - Remove excessive whitespace
 * - Remove non-printable characters
 * - Normalize line endings
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
const cleanExtractedText = (text) => {
  if (!text) return '';
  
  return text
    // Remove null bytes and control characters (except newlines/tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim();
};

/**
 * Main extraction function
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - MIME type
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} Extraction result
 */
const extractText = async (buffer, mimeType, filename) => {
  // Detect file type
  const fileInfo = detectFileType(mimeType, filename);
  
  if (fileInfo.type === 'unknown') {
    return {
      success: false,
      error: 'Unsupported file type',
      fileInfo
    };
  }
  
  let extractedText = '';
  let extractionMethod = '';
  
  try {
    // Route to appropriate extractor
    switch (fileInfo.category) {
      case 'code':
        extractedText = extractFromText(buffer, fileInfo);
        extractionMethod = 'raw_code';
        break;
        
      case 'document':
        if (fileInfo.type === 'pdf') {
          extractedText = await extractFromPDF(buffer);
          extractionMethod = 'pdf_parse';
        } else if (fileInfo.type === 'docx') {
          extractedText = await extractFromDOCX(buffer);
          extractionMethod = 'docx_parse';
        } else {
          extractedText = extractFromText(buffer, fileInfo);
          extractionMethod = 'text_read';
        }
        break;
        
      case 'text':
        extractedText = extractFromText(buffer, fileInfo);
        extractionMethod = 'text_read';
        break;
        
      default:
        extractedText = extractFromText(buffer, fileInfo);
        extractionMethod = 'fallback';
    }
    
    // Truncate if too long
    const wasTruncated = extractedText.length > MAX_TEXT_LENGTH;
    if (wasTruncated) {
      extractedText = extractedText.substring(0, MAX_TEXT_LENGTH) + 
        '\n\n[... Content truncated due to length limit ...]';
    }
    
    return {
      success: true,
      text: extractedText,
      fileInfo,
      extractionMethod,
      stats: {
        originalLength: buffer.length,
        extractedLength: extractedText.length,
        wasTruncated
      }
    };
    
  } catch (error) {
    console.error('❌ Text extraction failed:', error);
    return {
      success: false,
      error: error.message || 'Extraction failed',
      fileInfo
    };
  }
};

/**
 * Validate if file type is supported
 * @param {string} mimeType - MIME type
 * @param {string} filename - Original filename
 * @returns {boolean} Is supported
 */
const isSupportedFileType = (mimeType, filename) => {
  const fileInfo = detectFileType(mimeType, filename);
  return fileInfo.type !== 'unknown';
};

/**
 * Get list of supported file types
 * @returns {Object} Supported types info
 */
const getSupportedTypes = () => ({
  documents: ['PDF', 'DOCX', 'DOC', 'TXT'],
  code: ['C (.c, .h)', 'C++ (.cpp, .hpp)', 'Python (.py)', 'JavaScript (.js)'],
  maxFileSize: '10MB',
  maxTextLength: MAX_TEXT_LENGTH
});

module.exports = {
  extractText,
  detectFileType,
  isSupportedFileType,
  getSupportedTypes,
  cleanExtractedText,
  MAX_TEXT_LENGTH
};
