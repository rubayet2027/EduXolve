/**
 * Loader Component - Full page loading spinner
 * 
 * A beautiful neubrutalist loading component for EduXolve
 */

import { motion } from 'framer-motion'

function Loader({ message = 'Loading...', fullScreen = true }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Logo/Brand */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-black text-[#111111]"
      >
        Edu<span className="text-[#6BCB77]">X</span>olve
      </motion.div>

      {/* Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className="w-16 h-16 border-4 border-[#E8E8E4] rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        
        {/* Spinning ring */}
        <motion.div
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#6BCB77] border-r-[#111111] rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Inner dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-3 h-3 bg-[#6BCB77] rounded-full" />
        </motion.div>
      </div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-[#111111]/60 text-sm font-medium"
      >
        {message}
      </motion.p>

      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-[#111111]/40 rounded-full"
            animate={{
              y: [0, -8, 0],
              backgroundColor: ['#11111166', '#6BCB77', '#11111166']
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF8F5] flex items-center justify-center">
        {content}
      </div>
    )
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {content}
    </div>
  )
}

/**
 * Inline Loader - Small loader for buttons or inline use
 */
export function InlineLoader({ size = 'sm', color = '#111111' }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-transparent rounded-full`}
      style={{ 
        borderTopColor: color,
        borderRightColor: color 
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  )
}

/**
 * Skeleton Loader - For content placeholders
 */
export function SkeletonLoader({ className = '', variant = 'text' }) {
  const baseClasses = "bg-[#E8E8E4] animate-pulse rounded"
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-32 w-full rounded-xl',
    button: 'h-10 w-24 rounded-lg'
  }

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  )
}

export default Loader
