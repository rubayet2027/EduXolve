/**
 * Generate Page - AI Content Generation Interface
 * Create notes, slides, or lab code grounded in course materials
 */

import { useState } from 'react'
import { PromptPanel, OutputPanel } from '../components/generate'
import PageWrapper from '../components/common/PageWrapper'
import { aiApi, validationApi } from '../services/api'

function Generate() {
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState('notes')
  const [language, setLanguage] = useState('python')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [output, setOutput] = useState(null)
  const [error, setError] = useState(null)

  // Map frontend content type to backend type
  const getBackendType = (type) => {
    switch (type) {
      case 'notes': return 'theory'
      case 'slides': return 'slides'
      case 'code': return 'lab'
      default: return 'theory'
    }
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
        ...(contentType === 'code' && { language })
      }

      // Call the AI generation API
      const response = await aiApi.generate(requestBody)
      
      // Extract generated content
      const generatedContent = response.data?.content || response.content || response.data || ''
      const sources = response.data?.sources || response.sources || []
      
      // Parse and structure the content
      const parsedOutput = parseGeneratedContent(generatedContent, contentType)
      
      if (parsedOutput) {
        parsedOutput.sources = sources
        parsedOutput.rawContent = generatedContent
        
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
              Create notes, slides, or lab code using course content
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-xl">
              <p className="font-medium text-red-700">{error}</p>
            </div>
          )}

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
