/**
 * ValidationBadge - Shows validation status of generated content
 * 
 * Animation: Gentle fade + scale entrance
 */

import { motion } from 'framer-motion'

function ValidationBadge({ status = 'grounded' }) {
  const badges = {
    grounded: {
      icon: '✅',
      text: 'Grounded in course materials',
      bg: 'bg-[#E8F5E9]',
      border: 'border-[#6BCB77]'
    },
    review: {
      icon: '⚠️',
      text: 'Needs review',
      bg: 'bg-[#FFF3E0]',
      border: 'border-[#FFB74D]'
    },
    error: {
      icon: '❌',
      text: 'Could not validate',
      bg: 'bg-[#FFEBEE]',
      border: 'border-[#FF6B6B]'
    }
  }

  const badge = badges[status] || badges.grounded

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        inline-flex items-center gap-2
        px-4 py-2
        ${badge.bg}
        border-2 ${badge.border}
        rounded-lg
        font-semibold
        text-[#111111]
      `}
    >
      <span className="text-lg">{badge.icon}</span>
      <span className="text-sm">{badge.text}</span>
    </motion.div>
  )
}

export default ValidationBadge
