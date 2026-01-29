/**
 * Generate Page - AI Content Generation Interface
 * Create notes, slides, or lab code grounded in course materials
 * Now with file attachment support for context-aware generation
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PromptPanel, OutputPanel } from '../components/generate'
import PageWrapper from '../components/common/PageWrapper'
import FileAttachment from '../components/common/FileAttachment'
import { aiApi, validationApi } from '../services/api'

function Generate() {
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState('notes')
  const [language, setLanguage] = useState('python')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [output, setOutput] = useState(null)
  const [error, setError] = useState(null)
  const [attachedFile, setAttachedFile] = useState(null) // { fileId, fileName, ... }

  // Map frontend content type to backend type
  const getBackendType = (type) => {
    switch (type) {
      case 'notes': return 'theory'
      case 'slides': return 'slides'
      case 'code': return 'lab'
      default: return 'theory'
    }
  }

  // Handle file processed
  const handleFileProcessed = (fileData) => {
    setAttachedFile(fileData)
    
    // Auto-set content type based on file
    if (fileData.isCode) {
      setContentType('code')
      // Try to match language
      const langMap = {
        'Python': 'python',
        'JavaScript': 'javascript',
        'C': 'c',
        'C++': 'cpp'
      }
      if (langMap[fileData.language]) {
        setLanguage(langMap[fileData.language])
      }
    }
  }

  // Handle file removed
  const handleFileRemoved = () => {
    setAttachedFile(null)
  }

  // Parse generated content into sections
  const parseGeneratedContent = (content, type) => {
    if (!content) return null

    // If content is already structured, return as-is
    if (typeof content === 'object' && content.sections) {
      return content
    }

    // Parse markdown-like content into sections
    const lines = (typeof content === 'string' ? content : '').split('\n')
    const sections = []
    let currentSection = null

    for (const line of lines) {
      // Check for heading
      if (line.startsWith('## ') || line.startsWith('# ')) {
        if (currentSection) sections.push(currentSection)
        currentSection = {
          heading: line.replace(/^#+\s*/, ''),
          content: '',
          bullets: [],
          code: null
        }
      } else if (currentSection) {
        // Check for bullet points
        if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
          currentSection.bullets.push(line.replace(/^[-•*]\s*/, ''))
        } 
        // Check for code block
        else if (line.startsWith('```')) {
          // Skip code fence markers
        } else if (currentSection.code !== null || /^(class |def |function |const |let |var |#include)/.test(line.trim())) {
          currentSection.code = (currentSection.code || '') + line + '\n'
        } else {
          currentSection.content += (currentSection.content ? ' ' : '') + line.trim()
        }
      }
    }
    if (currentSection) sections.push(currentSection)

    // If no sections were created, create a single section with all content
    if (sections.length === 0) {
      sections.push({
        heading: type === 'code' ? 'Generated Code' : 'Generated Content',
        content: typeof content === 'string' ? content : JSON.stringify(content),
        bullets: [],
        code: type === 'code' ? content : null
      })
    }

    return {
      title: `Generated ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
      sections,
      validationStatus: 'pending'
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsLoading(true)
    setOutput(null)
    setError(null)

    try {
      // Prepare request based on content type
      const backendType = getBackendType(contentType)
      const requestBody = {
        type: backendType,
        topic: prompt,
        ...(contentType === 'code' && { language }),
        ...(attachedFile?.fileId && { fileId: attachedFile.fileId })
      }

      // Call the AI generation API
      const response = await aiApi.generate(requestBody)
      
      // Extract generated content
      const generatedContent = response.data?.content || response.content || response.data || ''
      const sources = response.data?.sources || response.sources || []
      const hasFileContext = response.data?.hasFileContext || false
      
      // Parse and structure the content
      const parsedOutput = parseGeneratedContent(generatedContent, contentType)
      
      if (parsedOutput) {
        parsedOutput.sources = sources
        parsedOutput.rawContent = generatedContent
        parsedOutput.hasFileContext = hasFileContext
        
        // Automatically validate after generation
        setOutput(parsedOutput)
        await handleValidate(generatedContent, backendType)
      }
    } catch (err) {
      console.error('Generation error:', err)
      setError(err.message || 'Failed to generate content. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidate = async (content, type) => {
    setIsValidating(true)
    
    try {
      const response = await validationApi.validate({
        type,
        content: typeof content === 'string' ? content : JSON.stringify(content)
      })
      
      // Update output with validation results
      setOutput(prev => ({
        ...prev,
        validationStatus: response.data?.status || response.status || 'review',
        validationScore: response.data?.score || response.score,
        validationFeedback: response.data?.feedback || response.feedback
      }))
    } catch (err) {
      console.error('Validation error:', err)
      // Don't fail the whole generation if validation fails
      setOutput(prev => ({
        ...prev,
        validationStatus: 'error',
        validationFeedback: 'Validation unavailable'
      }))
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        {/* Main Content - Two Column Layout */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#111111]">
              Generate Learning Materials
            </h1>
            <p className="text-sm text-[#111111]/60 mt-1">
              Create notes, slides, or lab code using course content or uploaded files
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-xl">
              <p className="font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* File Attachment Section */}
          <div className="mb-6">
            <AnimatePresence mode="wait">
              {!attachedFile ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <FileAttachment
                    onFileProcessed={handleFileProcessed}
                    onFileRemoved={handleFileRemoved}
                    disabled={isLoading}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#E8F0FC] border-2 border-[#111111] rounded-xl shadow-[3px_3px_0px_#111111] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📎</span>
                      <div>
                        <p className="font-semibold text-[#111111]">{attachedFile.fileName}</p>
                        <p className="text-sm text-[#111111]/60">
                          {attachedFile.isCode ? attachedFile.language : attachedFile.fileType?.toUpperCase()} 
                          {attachedFile.summary && ` • ${attachedFile.summary.substring(0, 60)}...`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleFileRemoved}
                      className="text-sm text-[#111111]/60 hover:text-[#111111] underline"
                    >
                      Remove
                    </button>
                  </div>
                  
                  {/* Quick prompts based on file */}
                  {attachedFile.suggestedActions?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#111111]/20">
                      <p className="text-xs text-[#111111]/60 mb-2">Quick prompts:</p>
                      <div className="flex flex-wrap gap-2">
                        {attachedFile.suggestedActions.slice(0, 3).map((action) => (
                          <button
                            key={action.id}
                            onClick={() => setPrompt(action.prompt)}
                            className="text-xs px-2 py-1 bg-white border border-[#111111]/30 rounded-lg hover:bg-[#FFD93D]/30 transition-colors"
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-150">
            {/* Left Panel - Prompt & Options */}
            <PromptPanel
              prompt={prompt}
              setPrompt={setPrompt}
              contentType={contentType}
              setContentType={setContentType}
              language={language}
              setLanguage={setLanguage}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />

            {/* Right Panel - Generated Output */}
            <OutputPanel
              output={output}
              isLoading={isLoading || isValidating}
              contentType={contentType}
            />
          </div>
        </main>
      </div>
    </PageWrapper>
  )
}

export default Generate
