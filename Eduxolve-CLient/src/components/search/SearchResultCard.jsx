/**
 * SearchResultCard - Individual search result with actions
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BrutalButton } from '../ui'

// Type badge colors
const typeBadgeStyles = {
  theory: {
    bg: 'bg-[#FFD93D]',
    label: 'Theory'
  },
  lab: {
    bg: 'bg-[#6BCB77]',
    label: 'Lab'
  },
  code: {
    bg: 'bg-[#4D96FF]',
    label: 'Code'
  },
  note: {
    bg: 'bg-[#FF6B6B]',
    label: 'Note'
  },
  slide: {
    bg: 'bg-[#A66CFF]',
    label: 'Slides'
  }
}

function SearchResultCard({ result, index }) {
  const navigate = useNavigate()
  const badgeStyle = typeBadgeStyles[result.type] || typeBadgeStyles.theory

  const handleAskAI = () => {
    // Navigate to chat with prefilled context
    navigate('/chat', {
      state: {
        prefillMessage: `Explain "${result.title}" using course materials`
      }
    })
  }

  const handleOpenSource = () => {
    // Mock action - in real app would open the source document
    console.log('Opening source:', result.source)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.08,
        ease: 'easeOut'
      }}
      className="
        bg-white
        border-2 border-[#111111]
        rounded-xl
        shadow-[4px_4px_0_#111111]
        p-5
        hover:-translate-x-0.5 hover:-translate-y-0.5
        hover:shadow-[6px_6px_0_#111111]
        transition-all duration-150
      "
    >
      {/* Type Badge */}
      <span className={`
        inline-block
        px-3 py-1
        text-xs font-bold uppercase tracking-wide
        text-[#111111]
        border-2 border-[#111111]
        rounded-lg
        mb-3
        ${badgeStyle.bg}
      `}>
        {badgeStyle.label}
      </span>

      {/* Title */}
      <h3 className="text-lg font-bold text-[#111111] mb-2">
        {result.title}
      </h3>

      {/* Snippet */}
      <p className="text-[#111111]/70 mb-3 leading-relaxed">
        {result.snippet}
      </p>

      {/* Code Block (if type is code) */}
      {result.code && (
        <pre className="
          bg-[#1a1a1a]
          text-[#6BCB77]
          text-sm
          p-3
          rounded-lg
          border-2 border-[#111111]
          overflow-x-auto
          mb-3
          font-mono
        ">
          <code>{result.code}</code>
        </pre>
      )}

      {/* Source Label */}
      <p className="text-sm text-[#111111]/50 mb-4 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {result.source}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-3 border-t-2 border-[#111111]/10">
        <BrutalButton
          variant="primary"
          onClick={handleAskAI}
          className="px-4 py-2 text-sm"
        >
          🤖 Ask AI about this
        </BrutalButton>
        <BrutalButton
          variant="neutral"
          onClick={handleOpenSource}
          className="px-4 py-2 text-sm"
        >
          📄 Open source
        </BrutalButton>
      </div>
    </motion.div>
  )
}

export default SearchResultCard
