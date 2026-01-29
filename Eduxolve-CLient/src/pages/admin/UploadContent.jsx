/**
 * UploadContent - Content upload page
 * 
 * Features:
 * - File upload area (drag & drop UI)
 * - Metadata form
 * - Save & Index functionality
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BrutalCard from '../../components/ui/BrutalCard'
import PageWrapper from '../../components/common/PageWrapper'
import { UploadArea, MetadataForm } from '../../components/admin'
import { contentApi } from '../../services/api'

function UploadContent() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setError(null)
  }

  const handleSubmit = async (formData) => {
    // Validate
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }
    
    if (!formData.topic?.trim()) {
      setError('Please enter a topic')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      // Create FormData for file upload
      const uploadData = new FormData()
      uploadData.append('file', selectedFile)
      uploadData.append('type', formData.contentType || 'theory')
      uploadData.append('topic', formData.topic)
      
      if (formData.week) {
        uploadData.append('week', formData.week)
      }
      
      if (formData.tags) {
        // Split tags by comma and trim whitespace
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        uploadData.append('tags', JSON.stringify(tagsArray))
      }
      
      // Call the upload API
      await contentApi.upload(uploadData)
      
      // Show success message
      setShowSuccess(true)
      
      // Navigate after brief delay
      setTimeout(() => {
        navigate('/admin/content')
      }, 1500)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload content. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#FAFAF7]">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-10">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="font-bold text-2xl text-[#111111]">
              Upload Content
            </h1>
            <p className="text-[#111111]/60 text-sm mt-1">
              Add new course materials to the platform
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="
                  mb-6 p-4
                  bg-red-100
                  border-2 border-red-500
                  rounded-2xl
                  flex items-center gap-3
                "
              >
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-red-700">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="
                  mb-6 p-4
                  bg-[#6BCB77]
                  border-2 border-[#111111]
                  rounded-2xl
                  shadow-[4px_4px_0px_#111111]
                  flex items-center gap-3
                "
              >
                <svg className="w-6 h-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold text-[#111111]">
                  Content uploaded and indexed successfully! Redirecting...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div>
              <h2 className="font-bold text-lg text-[#111111] mb-4">
                1. Select File
              </h2>
              <BrutalCard className="p-0 overflow-hidden">
                <UploadArea onFileSelect={handleFileSelect} />
              </BrutalCard>

              <AnimatePresence>
                {selectedFile && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 p-4 bg-white border-2 border-[#111111] rounded-xl"
                  >
                    <p className="text-sm text-[#111111]/60 mb-1">Selected file:</p>
                    <p className="font-semibold text-[#111111]">{selectedFile.name}</p>
                    <p className="text-sm text-[#111111]/50">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Metadata Form */}
            <div>
              <h2 className="font-bold text-lg text-[#111111] mb-4">
                2. Add Metadata
              </h2>
              <BrutalCard>
                <MetadataForm 
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </BrutalCard>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-10">
            <BrutalCard className="bg-[#4ECDC4]/20">
              <h3 className="font-bold text-[#111111] mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tips for uploading content
              </h3>
              <ul className="space-y-2 text-sm text-[#111111]/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#6BCB77] mt-0.5">•</span>
                  <span>Use descriptive file names for better searchability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6BCB77] mt-0.5">•</span>
                  <span>Add relevant tags to help students find content faster</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6BCB77] mt-0.5">•</span>
                  <span>Content will be automatically indexed for AI-powered search</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6BCB77] mt-0.5">•</span>
                  <span>Large files may take a few moments to process</span>
                </li>
              </ul>
            </BrutalCard>
          </div>
        </main>
      </div>
    </PageWrapper>
  )
}

export default UploadContent
