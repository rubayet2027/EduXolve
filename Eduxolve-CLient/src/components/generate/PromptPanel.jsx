/**
 * PromptPanel - Left panel with prompt input and options
 */

import { motion, AnimatePresence } from 'framer-motion'
import { IoDocument, IoLayers, IoCode, IoSparkles } from 'react-icons/io5'
import { BrutalButton } from '../ui'
import { FileAttachmentButton } from '../common'

// Content type options
const contentTypes = [
  { id: 'notes', label: 'Notes', icon: IoDocument, color: '#FF9500' },
  { id: 'slides', label: 'Slides', icon: IoLayers, color: '#AF52DE' },
  { id: 'code', label: 'Lab Code', icon: IoCode, color: '#007AFF' }
]

// Programming language options (for Lab Code)
const languages = [
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'javascript', label: 'JavaScript' }
]

function PromptPanel({
  prompt,
  setPrompt,
  contentType,
  setContentType,
  language,
  setLanguage,
  onGenerate,
  isLoading,
  attachedFile,
  onFileProcessed,
  onFileRemoved
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading) {
      onGenerate()
    }
  }

  // Handle file processed with quick action
  const handleFileProcessed = (fileData) => {
    onFileProcessed?.(fileData)
    // If quick action selected, set prompt
    if (fileData.selectedAction) {
      setPrompt(fileData.selectedAction.prompt)
    }
  }

  return (
    <div className="
      bg-[#E8F0FC]
      border-2 border-[#111111]
      rounded-2xl
      shadow-[3px_3px_0px_#111111]
      p-6
      h-full
      overflow-y-auto
    ">
      <form onSubmit={handleSubmit} className="flex flex-col h-full gap-6">
        {/* Section Title */}
        <div>
          <h2 className="text-lg font-bold text-[#111111] mb-1">
            What would you like to generate?
          </h2>
          <p className="text-sm text-[#111111]/60">
            Describe the content you need based on your course materials
          </p>
        </div>

        {/* Prompt Input */}
        <div className="flex-1">
          <label className="block font-semibold text-[#111111] mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Explain stacks with examples and code"
            disabled={isLoading}
            rows={5}
            className="
              w-full h-32
              px-4 py-3
              bg-white
              text-[#111111]
              placeholder-[#111111]/40
              border-2 border-[#111111]
              rounded-xl
              shadow-[2px_2px_0px_#111111]
              outline-none
              resize-none
              transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              focus:-translate-y-0.5 focus:-translate-x-0.5
              focus:shadow-[3px_3px_0px_#111111]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
          
          {/* Attached File Indicator */}
          {attachedFile && (
            <div className="mt-2 flex items-center gap-2 text-sm text-[#111111]/70">
              <span>📎</span>
              <span className="font-medium">{attachedFile.fileName}</span>
              <button
                type="button"
                onClick={onFileRemoved}
                className="text-xs underline hover:text-[#111111]"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Content Type Selection */}
        <div>
          <label className="block font-semibold text-[#111111] mb-3">
            Content Type
          </label>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((type) => {
              const IconComponent = type.icon
              return (
              <button
                key={type.id}
                type="button"
                onClick={() => setContentType(type.id)}
                disabled={isLoading}
                className={`
                  px-4 py-2
                  text-sm font-bold
                  border-2 border-[#111111]
                  rounded-lg
                  transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${contentType === type.id
                    ? 'bg-[#FFF0D9] shadow-[2px_2px_0px_#111111] -translate-y-0.5 -translate-x-0.5'
                    : 'bg-white shadow-[2px_2px_0px_#111111] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_3px_0px_#111111]'
                  }
                `}
              >
                <span className="mr-2 inline-flex items-center"><IconComponent size={16} style={{ color: type.color }} /></span>
                {type.label}
              </button>
            )})
            }
          </div>
        </div>

        {/* Programming Language (shown only for Lab Code) */}
        {contentType === 'code' && (
          <div>
            <label className="block font-semibold text-[#111111] mb-3">
              Programming Language
            </label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  disabled={isLoading}
                  className={`
                    px-4 py-2
                    text-sm font-bold
                    border-2 border-[#111111]
                    rounded-lg
                    transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                    cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${language === lang.id
                      ? 'bg-[#E8F5EC] shadow-[2px_2px_0px_#111111] -translate-y-0.5 -translate-x-0.5'
                      : 'bg-white shadow-[2px_2px_0px_#111111] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_3px_0px_#111111]'
                    }
                  `}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button with File Attachment */}
        <div className="flex gap-3 items-stretch">
          <FileAttachmentButton
            onFileProcessed={handleFileProcessed}
            onFileRemoved={onFileRemoved}
            attachedFile={attachedFile}
            disabled={isLoading}
            className="self-stretch"
          />
          
          <BrutalButton
            type="submit"
            variant="primary"
            disabled={!prompt.trim() || isLoading}
            className="flex-1 py-4 text-lg"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center gap-2"
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    <IoSparkles size={20} />
                  </motion.span>
                  Generating...
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center gap-2"
                >
                  <IoSparkles size={20} /> Generate
                </motion.span>
              )}
            </AnimatePresence>
          </BrutalButton>
        </div>
      </form>
    </div>
  )
}

export default PromptPanel
