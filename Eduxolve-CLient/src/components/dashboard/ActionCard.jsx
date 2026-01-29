/**
 * ActionCard - A large clickable card for primary dashboard actions
 * Following Soft Neubrutalism design with accent colors
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BrutalButton } from '../ui'

function ActionCard({ 
  icon, 
  title, 
  description, 
  cta, 
  to, 
  accentColor = '#FFD93D',
  index = 0 
}) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(to)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.25, 
        delay: index * 0.06,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        y: -4,
        boxShadow: '6px 6px 0 #111111',
        transition: { duration: 0.15 }
      }}
      onClick={handleClick}
      className="
        bg-white
        border-2 border-[#111111]
        rounded-xl
        shadow-[4px_4px_0_#111111]
        p-6
        cursor-pointer
        transition-colors duration-150
        flex flex-col h-full
      "
    >
      {/* Icon Container */}
      <div 
        className="w-14 h-14 border-2 border-[#111111] rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: accentColor }}
      >
        <span className="text-3xl">{icon}</span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-[#111111] mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[#111111]/70 mb-6 grow">
        {description}
      </p>

      {/* CTA Button */}
      <BrutalButton 
        variant="primary"
        className="w-full"
        style={{ backgroundColor: accentColor }}
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
      >
        {cta}
      </BrutalButton>
    </motion.div>
  )
}

export default ActionCard
