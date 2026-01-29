/**
 * SearchResultCard - Individual search result with actions
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { IoChatbubbles, IoOpenOutline } from 'react-icons/io5'
import { BrutalButton } from '../ui'

// Type badge colors - softer pastels
const typeBadgeStyles = {
  theory: {
    bg: 'bg-[#FFF0D9]',
    label: 'Theory'
  },
  lab: {
    bg: 'bg-[#E8F5EC]',
    label: 'Lab'
  },
  code: {
    bg: 'bg-[#E8F0FC]',
    label: 'Code'
  },
  note: {
    bg: 'bg-[#FFF0EC]',
    label: 'Note'
  },
  slide: {
    bg: 'bg-[#F3EEFA]',
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: index * 0.04,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="
        bg-white
        border-2 border-[#111111]
        rounded-2xl
        shadow-[3px_3px_0px_#111111]
        p-5
        hover:-translate-y-1
        hover:shadow-[4px_4px_0px_#111111]
        transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
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
        shadow-[2px_2px_0px_#111111]
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
          className="px-4 py-2 text-sm flex items-center gap-1"
        >
          <IoChatbubbles size={14} /> Ask AI about this
        </BrutalButton>
        <BrutalButton
          variant="neutral"
          onClick={handleOpenSource}
          className="px-4 py-2 text-sm flex items-center gap-1"
        >
          <IoOpenOutline size={14} /> Open source
        </BrutalButton>
      </div>
    </motion.div>
  )
}

export default SearchResultCard
