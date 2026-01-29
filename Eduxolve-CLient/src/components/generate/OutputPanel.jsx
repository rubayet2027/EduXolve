/**
 * OutputPanel - Right panel showing generated content
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { IoDocument, IoRefresh, IoChatbubble, IoChatbubbles, IoInformationCircle } from 'react-icons/io5'
import { BrutalButton } from '../ui'
import { MarkdownRenderer } from '../common'
import ValidationBadge from './ValidationBadge'

function OutputPanel({ output, isLoading, contentType }) {
  const navigate = useNavigate()

  const handleAskToRefine = () => {
    navigate('/chat', {
      state: {
        prefillMessage: 'Please refine this generated content to be more detailed and accurate.'
      }
    })
  }

  const handleExplain = () => {
    navigate('/chat', {
      state: {
        prefillMessage: 'Can you explain the concepts covered in this generated content?'
      }
    })
  }

  const handleSendToChat = () => {
    navigate('/chat', {
      state: {
        prefillMessage: `I generated some ${contentType} content. Can we discuss it further?`
      }
    })
  }

  // Initial empty state
  if (!output && !isLoading) {
    return (
      <div className="
        bg-[#FFF9E8]
        border-2 border-[#111111]
        rounded-2xl
        shadow-[3px_3px_0px_#111111]
        p-6
        h-full
        flex items-center justify-center
      ">
        <div className="text-center">
          <div className="w-16 h-16 bg-white border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111] flex items-center justify-center mx-auto mb-5">
            <IoDocument size={32} style={{ color: '#007AFF' }} />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-2">
            Generated content will appear here
          </h3>
          <p className="text-[#111111]/60 text-sm max-w-xs">
            Enter a prompt and click Generate to create notes, slides, or code
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="
          bg-[#FFF9E8]
          border-2 border-[#111111]
          rounded-2xl
          shadow-[3px_3px_0px_#111111]
          p-6
          h-full
        "
      >
        <div className="space-y-5">
          {/* Validation badge skeleton */}
          <motion.div 
            className="w-48 h-8 bg-[#E8E8E4] rounded-lg"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Title skeleton */}
          <motion.div 
            className="w-3/4 h-8 bg-[#E8E8E4] rounded-lg"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
          />
          
          {/* Content skeleton */}
          <div className="space-y-3 mt-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                className={`h-4 bg-[#E8E8E4] rounded ${i === 2 ? 'w-5/6' : i === 4 ? 'w-4/5' : 'w-full'}`}
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 * i }}
              />
            ))}
          </div>

          {/* Code block skeleton */}
          <motion.div 
            className="w-full h-32 bg-[#1a1a1a] rounded-lg mt-4"
            animate={{ opacity: [0.7, 0.9, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />

          {/* More content */}
          <div className="space-y-3 mt-4">
            <motion.div 
              className="w-full h-4 bg-[#E8E8E4] rounded"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
            <motion.div 
              className="w-3/4 h-4 bg-[#E8E8E4] rounded"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 bg-[#111111] rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ 
                  duration: 0.5, 
                  repeat: Infinity, 
                  delay: i * 0.15,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              />
            ))}
          </div>
          <span className="text-[#111111]/60">AI is generating...</span>
        </div>
      </motion.div>
    )
  }

  // Output state
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      className="
        bg-[#FFF9E8]
        border-2 border-[#111111]
        rounded-2xl
        shadow-[3px_3px_0px_#111111]
        p-6
        h-full
        overflow-y-auto
      "
    >
      {/* Validation Badge */}
      <div className="mb-5">
        <ValidationBadge status={output.validationStatus} />
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-[#111111] mb-4">
        {output.title}
      </h2>

      {/* Content - Use MarkdownRenderer for raw AI content */}
      <div className="prose prose-sm max-w-none text-[#111111]">
        {output.rawContent ? (
          // Render raw Markdown content from AI
          <MarkdownRenderer content={output.rawContent} />
        ) : (
          // Fallback to structured sections (legacy support)
          output.sections?.map((section, index) => (
            <div key={index} className="mb-6">
              {section.heading && (
                <h3 className="text-lg font-bold text-[#111111] mb-2">
                  {section.heading}
                </h3>
              )}
              
              {section.content && (
                <p className="text-[#111111]/80 leading-relaxed mb-3">
                  {section.content}
                </p>
              )}

              {section.bullets && (
                <ul className="list-disc list-inside space-y-1 text-[#111111]/80 mb-3">
                  {section.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}

              {section.code && (
                <pre className="
                  bg-[#1a1a1a]
                  text-[#6BCB77]
                  text-sm
                  p-4
                  rounded-lg
                  border-2 border-[#111111]
                  overflow-x-auto
                  font-mono
                  mb-3
                ">
                  <code>{section.code}</code>
                </pre>
              )}

              {section.note && (
                <div className="
                  bg-[#FFF9E6]
                  border-2 border-[#FFD93D]
                  rounded-lg
                  p-3
                  text-sm
                  text-[#111111]/80
                  flex items-start gap-2
                ">
                  <IoInformationCircle size={16} style={{ color: '#FF9500' }} className="mt-0.5 shrink-0" /> {section.note}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Source Attribution */}
      {output.sources && (
        <div className="mt-6 pt-4 border-t-2 border-[#111111]/20">
          <p className="text-xs font-semibold text-[#111111]/50 uppercase tracking-wide mb-2">
            Sources Used
          </p>
          <div className="flex flex-wrap gap-2">
            {output.sources.map((source, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-white border-2 border-[#111111] rounded-lg flex items-center gap-1"
              >
                <IoDocument size={12} style={{ color: '#007AFF' }} /> {source}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t-2 border-[#111111]/20 flex flex-wrap gap-2">
        <BrutalButton
          variant="neutral"
          onClick={handleAskToRefine}
          className="px-4 py-2 text-sm flex items-center gap-1"
        >
          <IoRefresh size={14} style={{ color: '#007AFF' }} /> Ask AI to refine
        </BrutalButton>
        <BrutalButton
          variant="neutral"
          onClick={handleExplain}
          className="px-4 py-2 text-sm flex items-center gap-1"
        >
          <IoChatbubble size={14} style={{ color: '#34C759' }} /> Explain this
        </BrutalButton>
        <BrutalButton
          variant="primary"
          onClick={handleSendToChat}
          className="px-4 py-2 text-sm flex items-center gap-1"
        >
          <IoChatbubbles size={14} /> Send to Chat
        </BrutalButton>
      </div>
    </motion.div>
  )
}

export default OutputPanel
