/**
 * ActionCard - A large clickable card for primary dashboard actions
 * Following Soft Neubrutalism design with accent colors
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BrutalButton } from '../ui'

function ActionCard({ 
  icon, 
  iconColor = '#111111',
  title, 
  description, 
  cta, 
  to, 
  accentColor = '#FFF0D9',
  buttonColor = '#FFD93D',
  index = 0 
}) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(to)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.25, 
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ 
        y: -3,
        boxShadow: '5px 5px 0px #111111',
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
      }}
      whileTap={{
        y: 1,
        x: 1,
        boxShadow: '0px 0px 0px #111111',
        transition: { duration: 0.1 }
      }}
      onClick={handleClick}
      style={{ backgroundColor: accentColor }}
      className="
        border-2 border-[#111111]
        rounded-2xl
        shadow-[3px_3px_0px_#111111]
        p-6
        cursor-pointer
        transition-colors duration-200
        flex flex-col h-full
      "
    >
      {/* Icon Container */}
      <div 
        className="w-14 h-14 bg-white border-2 border-[#111111] rounded-2xl shadow-[2px_2px_0px_#111111] flex items-center justify-center mb-5"
      >
        {typeof icon === 'function' ? (
          <span className="text-2xl">{icon({ size: 28, style: { color: iconColor } })}</span>
        ) : (
          <span className="text-3xl">{icon}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-[#111111] mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[#111111]/70 mb-8 grow">
        {description}
      </p>

      {/* CTA Button */}
      <BrutalButton 
        variant="primary"
        className="w-full"
        style={{ backgroundColor: buttonColor }}
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
