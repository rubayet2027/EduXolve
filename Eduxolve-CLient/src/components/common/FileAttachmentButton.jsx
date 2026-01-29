/**
 * FileAttachmentButton - Compact file attachment with popup
 * 
 * A small button that opens a popup for file upload
 * Replaces the large drop zone with a cleaner UI
 */

import { useState, useRef, useCallback, useEffect } from 'react'
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
import { useToast } from './Toast'

// Accepted file types
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

const getFileExtension = (filename) => filename.split('.').pop().toLowerCase()

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * FileAttachmentButton Component
 */
function FileAttachmentButton({ 
  onFileProcessed, 
  onFileRemoved,
  attachedFile,
  disabled = false,
  className = '' 
}) {
  const toast = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [uploadState, setUploadState] = useState('idle') // idle, uploading, success, error
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [fileData, setFileData] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)
  const popupRef = useRef(null)
  const buttonRef = useRef(null)

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen && 
        popupRef.current && 
        !popupRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Reset when file is removed externally
  useEffect(() => {
    if (!attachedFile && fileData) {
      setFile(null)
      setFileData(null)
      setUploadState('idle')
      setProgress(0)
      setError(null)
    }
  }, [attachedFile, fileData])

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File too large. Max ${formatFileSize(MAX_FILE_SIZE)}` }
    }
    const ext = getFileExtension(file.name)
    const isValidExt = ['pdf', 'docx', 'doc', 'txt', 'c', 'cpp', 'h', 'hpp', 'py', 'js'].includes(ext)
    if (!isValidExt) {
      return { valid: false, error: 'Unsupported file type' }
    }
    return { valid: true }
  }

  const handleFileSelect = useCallback(async (selectedFile) => {
    setError(null)
    const validation = validateFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error)
      toast.warning(validation.error)
      return
    }
    
    setFile(selectedFile)
    setUploadState('uploading')
    setProgress(0)
    
    try {
      const result = await fileApi.upload(selectedFile, (prog) => setProgress(prog))
      if (result.success) {
        setUploadState('success')
        setFileData(result.data)
        onFileProcessed?.(result.data)
        toast.success('File uploaded successfully!')
        // Auto close popup after success
        setTimeout(() => setIsOpen(false), 500)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (err) {
      console.error('File upload error:', err)
      setUploadState('error')
      setError(err.message || 'Upload failed')
      toast.error('File upload failed. Please try again.')
    }
  }, [onFileProcessed, toast])

  const handleInputChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) handleFileSelect(selectedFile)
  }

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); if (!disabled) setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    if (disabled) return
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  const handleRemove = async () => {
    if (fileData?.fileId) {
      try { await fileApi.delete(fileData.fileId) } catch (err) { console.error('Delete failed:', err) }
    }
    setFile(null)
    setFileData(null)
    setUploadState('idle')
    setProgress(0)
    setError(null)
    onFileRemoved?.()
    if (inputRef.current) inputRef.current.value = ''
  }

  const openFilePicker = () => {
    if (!disabled && uploadState !== 'uploading') inputRef.current?.click()
  }

  const ext = file ? getFileExtension(file.name) : 'default'
  const typeConfig = FILE_TYPE_CONFIG[ext] || FILE_TYPE_CONFIG.default
  const FileIcon = typeConfig.icon

  const hasFile = attachedFile || (file && uploadState === 'success')

  return (
    <div className={`relative flex ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          px-3 rounded-xl
          border-2 border-[#111111]
          ${hasFile ? 'bg-[#E8F5EC]' : 'bg-white'}
          text-[#111111]
          shadow-[2px_2px_0px_#111111]
          transition-all duration-150
          hover:-translate-y-0.5 hover:-translate-x-0.5
          hover:shadow-[3px_3px_0px_#111111]
          active:translate-y-0.5 active:translate-x-0.5
          active:shadow-[0px_0px_0px_#111111]
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-1.5
          shrink-0
        `}
        title={hasFile ? attachedFile?.fileName || file?.name : 'Attach file'}
      >
        <IoAttach size={20} />
        {hasFile && <IoCheckmarkCircle size={14} className="text-[#6BCB77]" />}
      </button>

      {/* Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              absolute bottom-full mb-2 left-0
              w-72 sm:w-80
              bg-white
              border-2 border-[#111111]
              rounded-xl
              shadow-[4px_4px_0px_#111111]
              overflow-hidden
              z-50
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#111111]/10 bg-[#F5F5F3]">
              <span className="font-semibold text-[#111111]">Attach File</span>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[#111111]/10 rounded-lg">
                <IoClose size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Show file preview if uploaded */}
              {file && (uploadState === 'uploading' || uploadState === 'success' || uploadState === 'error') ? (
                <div className="space-y-3">
                  {/* File Info */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${typeConfig.color}20` }}
                    >
                      <FileIcon size={20} style={{ color: typeConfig.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#111111] text-sm truncate">{file.name}</p>
                      <p className="text-xs text-[#111111]/60">{formatFileSize(file.size)}</p>
                    </div>
                    {uploadState === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                    )}
                    {uploadState === 'success' && <IoCheckmarkCircle size={20} className="text-[#6BCB77]" />}
                    {uploadState === 'error' && <IoAlertCircle size={20} className="text-[#FF6B6B]" />}
                  </div>

                  {/* Progress Bar */}
                  {uploadState === 'uploading' && (
                    <div className="h-1.5 bg-[#E8E8E4] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#4D96FF]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error */}
                  {error && <p className="text-xs text-red-600">{error}</p>}

                  {/* Remove Button */}
                  {(uploadState === 'success' || uploadState === 'error') && (
                    <button
                      onClick={handleRemove}
                      className="w-full py-2 text-sm text-[#111111]/70 hover:text-[#111111] border-2 border-dashed border-[#111111]/30 rounded-lg hover:bg-[#111111]/5 transition-colors"
                    >
                      Remove & Upload New
                    </button>
                  )}
                </div>
              ) : (
                /* Drop Zone */
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
                    border-2 border-dashed rounded-xl p-5 cursor-pointer text-center
                    transition-colors duration-200
                    ${isDragging ? 'bg-[#4D96FF]/10 border-[#4D96FF]' : 'bg-[#F5F5F3] border-[#111111]/50'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#E8E8E4]'}
                  `}
                >
                  <div className="w-10 h-10 rounded-full bg-[#4D96FF]/20 flex items-center justify-center mx-auto mb-2">
                    <IoCloudUpload size={20} className="text-[#4D96FF]" />
                  </div>
                  <p className="text-sm font-medium text-[#111111]">
                    {isDragging ? 'Drop here' : 'Click or drag file'}
                  </p>
                  <p className="text-xs text-[#111111]/50 mt-1">
                    PDF, DOCX, TXT, Code • Max 10MB
                  </p>
                </motion.div>
              )}

              {/* Error outside drop zone */}
              {error && !file && (
                <p className="text-xs text-red-600 mt-2">{error}</p>
              )}
            </div>

            {/* Suggested Actions (when file is uploaded) */}
            {uploadState === 'success' && fileData?.suggestedActions?.length > 0 && (
              <div className="px-4 pb-4 pt-0">
                <p className="text-xs text-[#111111]/60 mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {fileData.suggestedActions.slice(0, 3).map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        onFileProcessed?.({ ...fileData, selectedAction: action })
                        setIsOpen(false)
                      }}
                      className="
                        px-2 py-1 text-xs font-medium
                        bg-[#F5F5F3] border border-[#111111]/30 rounded-md
                        hover:bg-[#FFD93D]/30 transition-colors
                      "
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileAttachmentButton
