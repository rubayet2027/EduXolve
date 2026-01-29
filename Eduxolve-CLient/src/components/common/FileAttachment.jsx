/**
 * FileAttachment Component
 * 
 * A beautiful, accessible file attachment UI that:
 * - Supports drag & drop and click-to-upload
 * - Works on desktop and mobile
 * - Shows upload progress
 * - Displays file preview with remove option
 * - Suggests quick actions after upload
 */

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IoAttach, 
  IoDocument, 
  IoCode, 
  IoClose, 
  IoCheckmarkCircle,
  IoAlertCircle,
  IoCloudUpload
} from 'react-icons/io5'
import { fileApi } from '../../services/api'

// Accepted file types
const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'text/plain': 'TXT',
  '.c': 'C',
  '.cpp': 'C++',
  '.h': 'C Header',
  '.hpp': 'C++ Header',
  '.py': 'Python',
  '.js': 'JavaScript',
}

const ACCEPT_STRING = '.pdf,.docx,.doc,.txt,.c,.cpp,.h,.hpp,.py,.js'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// File type icons and colors
const FILE_TYPE_CONFIG = {
  pdf: { icon: IoDocument, color: '#FF6B6B', label: 'PDF' },
  docx: { icon: IoDocument, color: '#4D96FF', label: 'DOCX' },
  doc: { icon: IoDocument, color: '#4D96FF', label: 'DOC' },
  txt: { icon: IoDocument, color: '#6BCB77', label: 'TXT' },
  c: { icon: IoCode, color: '#FF9500', label: 'C' },
  cpp: { icon: IoCode, color: '#007AFF', label: 'C++' },
  h: { icon: IoCode, color: '#FF9500', label: 'C Header' },
  hpp: { icon: IoCode, color: '#007AFF', label: 'C++ Header' },
  py: { icon: IoCode, color: '#FFD93D', label: 'Python' },
  js: { icon: IoCode, color: '#F7DF1E', label: 'JavaScript' },
  default: { icon: IoDocument, color: '#888888', label: 'File' },
}

/**
 * Get file extension
 */
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase()
}

/**
 * Format file size
 */
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * FileAttachment Component
 */
function FileAttachment({ 
  onFileProcessed, 
  onFileRemoved,
  compact = false,
  disabled = false,
  className = '' 
}) {
  const [file, setFile] = useState(null)
  const [uploadState, setUploadState] = useState('idle') // idle, uploading, success, error
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [fileData, setFileData] = useState(null) // Response from server
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  /**
   * Validate file before upload
   */
  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}` }
    }
    
    // Check file type
    const ext = getFileExtension(file.name)
    const isValidExt = ['pdf', 'docx', 'doc', 'txt', 'c', 'cpp', 'h', 'hpp', 'py', 'js'].includes(ext)
    
    if (!isValidExt) {
      return { valid: false, error: 'Unsupported file type. Please upload PDF, DOCX, TXT, or code files.' }
    }
    
    return { valid: true }
  }

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(async (selectedFile) => {
    setError(null)
    
    // Validate
    const validation = validateFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error)
      return
    }
    
    setFile(selectedFile)
    setUploadState('uploading')
    setProgress(0)
    
    try {
      // Upload file
      const result = await fileApi.upload(selectedFile, (prog) => {
        setProgress(prog)
      })
      
      if (result.success) {
        setUploadState('success')
        setFileData(result.data)
        onFileProcessed?.(result.data)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (err) {
      console.error('File upload error:', err)
      setUploadState('error')
      setError(err.message || 'Failed to upload file')
    }
  }, [onFileProcessed])

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  /**
   * Handle drag events
   */
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (disabled) return
    
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  /**
   * Remove file
   */
  const handleRemove = async () => {
    if (fileData?.fileId) {
      try {
        await fileApi.delete(fileData.fileId)
      } catch (err) {
        console.error('Failed to delete file:', err)
      }
    }
    
    setFile(null)
    setFileData(null)
    setUploadState('idle')
    setProgress(0)
    setError(null)
    onFileRemoved?.()
    
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  /**
   * Open file picker
   */
  const openFilePicker = () => {
    if (!disabled && uploadState !== 'uploading') {
      inputRef.current?.click()
    }
  }

  // Get file type config
  const ext = file ? getFileExtension(file.name) : 'default'
  const typeConfig = FILE_TYPE_CONFIG[ext] || FILE_TYPE_CONFIG.default
  const FileIcon = typeConfig.icon

  // Render compact button mode
  if (compact && uploadState === 'idle') {
    return (
      <div className={className}>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STRING}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        <button
          onClick={openFilePicker}
          disabled={disabled}
          className={`
            p-2 rounded-xl
            border-2 border-[#111111]
            bg-white
            text-[#111111]
            shadow-[2px_2px_0px_#111111]
            transition-all duration-150
            hover:-translate-y-0.5 hover:-translate-x-0.5
            hover:shadow-[3px_3px_0px_#111111]
            active:translate-y-0.5 active:translate-x-0.5
            active:shadow-[0px_0px_0px_#111111]
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="Attach file"
        >
          <IoAttach size={20} />
        </button>
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 bottom-full mb-2 p-2 bg-red-100 border-2 border-red-500 rounded-lg text-sm text-red-700 whitespace-nowrap"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Render file preview if file is selected
  if (file && (uploadState === 'uploading' || uploadState === 'success' || uploadState === 'error')) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          relative
          bg-white
          border-2 border-[#111111]
          rounded-xl
          shadow-[3px_3px_0px_#111111]
          overflow-hidden
          ${className}
        `}
      >
        {/* File Info */}
        <div className="flex items-center gap-3 p-4">
          {/* File Icon */}
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${typeConfig.color}20` }}
          >
            <FileIcon size={24} style={{ color: typeConfig.color }} />
          </div>
          
          {/* File Details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#111111] truncate">
              {file.name}
            </p>
            <p className="text-sm text-[#111111]/60">
              {formatFileSize(file.size)} • {typeConfig.label}
            </p>
          </div>
          
          {/* Status / Remove */}
          <div className="flex items-center gap-2">
            {uploadState === 'uploading' && (
              <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
            )}
            {uploadState === 'success' && (
              <IoCheckmarkCircle size={24} className="text-[#6BCB77]" />
            )}
            {uploadState === 'error' && (
              <IoAlertCircle size={24} className="text-[#FF6B6B]" />
            )}
            
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-[#111111]/10 rounded-lg transition-colors"
              title="Remove file"
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        {uploadState === 'uploading' && (
          <div className="h-1 bg-[#E8E8E4]">
            <motion.div
              className="h-full bg-[#4D96FF]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        )}
        
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-3 text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Success Info with Suggested Actions */}
        <AnimatePresence>
          {uploadState === 'success' && fileData && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="border-t-2 border-[#111111]/10 bg-[#F5F5F3]"
            >
              <div className="p-4">
                <p className="text-sm text-[#111111]/70 mb-3">
                  {fileData.message || 'File processed! What would you like to do?'}
                </p>
                
                {/* Suggested Actions */}
                {fileData.suggestedActions?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {fileData.suggestedActions.slice(0, 4).map((action) => (
                      <button
                        key={action.id}
                        onClick={() => onFileProcessed?.({ ...fileData, selectedAction: action })}
                        className="
                          px-3 py-1.5
                          text-sm font-medium
                          bg-white
                          border-2 border-[#111111]
                          rounded-lg
                          shadow-[2px_2px_0px_#111111]
                          hover:-translate-y-0.5 hover:-translate-x-0.5
                          hover:shadow-[3px_3px_0px_#111111]
                          active:translate-y-0.5 active:translate-x-0.5
                          active:shadow-[0px_0px_0px_#111111]
                          transition-all duration-150
                        "
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Render drop zone (default state)
  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFilePicker}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? '#4D96FF' : '#111111',
        }}
        className={`
          relative
          border-2 border-dashed border-[#111111]
          rounded-xl
          p-6
          cursor-pointer
          transition-colors duration-200
          ${isDragging ? 'bg-[#4D96FF]/10' : 'bg-[#F5F5F3]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#E8E8E4]'}
        `}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#4D96FF]/20 flex items-center justify-center">
            <IoCloudUpload size={24} className="text-[#4D96FF]" />
          </div>
          
          <div>
            <p className="font-semibold text-[#111111]">
              {isDragging ? 'Drop file here' : 'Attach a file'}
            </p>
            <p className="text-sm text-[#111111]/60 mt-1">
              Drag & drop or click to browse
            </p>
          </div>
          
          <p className="text-xs text-[#111111]/50">
            PDF, DOCX, TXT, C, C++, Python, JS • Max {formatFileSize(MAX_FILE_SIZE)}
          </p>
        </div>
      </motion.div>
      
      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 p-3 bg-red-100 border-2 border-red-500 rounded-lg text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileAttachment
