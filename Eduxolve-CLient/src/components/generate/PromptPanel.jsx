/**
 * PromptPanel - Left panel with prompt input and options
 */

import { motion, AnimatePresence } from 'framer-motion'
import { BrutalButton } from '../ui'

// Content type options
const contentTypes = [
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'slides', label: 'Slides', icon: '📊' },
  { id: 'code', label: 'Lab Code', icon: '💻' }
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
  isLoading
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading) {
      onGenerate()
    }
  }

  return (
    <div className="
      bg-white
      border-2 border-[#111111]
      rounded-xl
      shadow-[4px_4px_0_#111111]
      p-6
      h-full
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
              shadow-[3px_3px_0_#111111]
              outline-none
              resize-none
              transition-all duration-150
              focus:-translate-x-0.5 focus:-translate-y-0.5
              focus:shadow-[5px_5px_0_#111111]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
        </div>

        {/* Content Type Selection */}
        <div>
          <label className="block font-semibold text-[#111111] mb-3">
            Content Type
          </label>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setContentType(type.id)}
                disabled={isLoading}
                className={`
                  px-4 py-2
                  text-sm font-semibold
                  border-2 border-[#111111]
                  rounded-lg
                  transition-all duration-150
                  cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${contentType === type.id
                    ? 'bg-[#FFD93D] shadow-[2px_2px_0_#111111] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-white shadow-[2px_2px_0_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }
                `}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </button>
            ))}
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
                    text-sm font-semibold
                    border-2 border-[#111111]
                    rounded-lg
                    transition-all duration-150
                    cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${language === lang.id
                      ? 'bg-[#4D96FF] text-white shadow-[2px_2px_0_#111111] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-white shadow-[2px_2px_0_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5'
                    }
                  `}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <BrutalButton
          type="submit"
          variant="primary"
          disabled={!prompt.trim() || isLoading}
          className="w-full py-4 text-lg"
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
                  ✨
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
              >
                ✨ Generate
              </motion.span>
            )}
          </AnimatePresence>
        </BrutalButton>
      </form>
    </div>
  )
}

export default PromptPanel
