/**
 * UploadArea - Drag and drop file upload area (UI only)
 * 
 * Features:
 * - Dashed border styling
 * - Drag state visual feedback
 * - Supported file types display
 */

import { useState } from 'react'

function UploadArea({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    // Mock file selection
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect?.(file)
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect?.(file)
    }
  }

  return (
    <div
      className={`
        relative
        border-2 border-dashed
        ${isDragging ? 'border-[#6BCB77] bg-[#6BCB77]/10' : 'border-[#111111] bg-[#FAFAF7]'}
        rounded-2xl
        p-12
        text-center
        transition-colors duration-200 ease-out
        cursor-pointer
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input').click()}
    >
      <input
        id="file-input"
        type="file"
        className="hidden"
        accept=".pdf,.ppt,.pptx,.py,.js,.java,.cpp,.c,.txt,.md"
        onChange={handleFileInput}
      />

      {/* Upload Icon */}
      <div className="mb-4">
        <svg
          className="w-16 h-16 mx-auto text-[#111111]/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      {/* Text */}
      {selectedFile ? (
        <div>
          <p className="font-bold text-[#111111] mb-2">
            File selected:
          </p>
          <p className="text-[#6BCB77] font-bold">
            {selectedFile.name}
          </p>
        </div>
      ) : (
        <div>
          <p className="font-bold text-[#111111] mb-2">
            Drag & drop your file here
          </p>
          <p className="text-[#111111]/60 text-sm mb-4">
            or click to browse
          </p>
        </div>
      )}

      {/* Supported Types */}
      <div className="mt-6 pt-6 border-t border-[#111111]/10">
        <p className="text-xs text-[#111111]/50 font-medium mb-2">
          SUPPORTED FILE TYPES
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {['PDF', 'PPT', 'PPTX', 'Python', 'JavaScript', 'Java', 'C/C++'].map((type) => (
            <span
              key={type}
              className="
                px-2 py-1
                text-xs font-medium
                bg-white
                border border-[#111111]/20
                rounded-md
              "
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UploadArea
