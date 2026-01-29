/**
 * ChatMessage - Individual message component
 * Supports user, AI, and system message types
 * 
 * Animations:
 * - Messages slide in from bottom
 * - Smooth fade entrance
 * - Action buttons animate after content
 */

import { motion } from 'framer-motion'
import ActionButtons from './ActionButtons'

function ChatMessage({ message, onAction }) {
  const isUser = message.role === 'user'
  const isAI = message.role === 'assistant'
  const isLoading = message.isLoading

  // Message animation - slide up from bottom
  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 16,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1], // Custom ease-out
      }
    }
  }

  // Content animation for AI messages (staggered children)
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      }
    }
  }

  const childVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-[85%] md:max-w-[75%]
          border-2 border-[#111111]
          rounded-xl
          shadow-[3px_3px_0_#111111]
          p-4
          ${isUser 
            ? 'bg-white' 
            : 'bg-[#E8F5E9]'
          }
        `}
      >
        {/* Loading State - Animated Ellipsis */}
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <motion.span 
                className="w-2 h-2 bg-[#111111] rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.span 
                className="w-2 h-2 bg-[#111111] rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
              />
              <motion.span 
                className="w-2 h-2 bg-[#111111] rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
              />
            </div>
            <span className="text-[#111111]/60 text-sm">Thinking</span>
          </div>
        ) : (
          <motion.div
            variants={isAI ? contentVariants : undefined}
            initial={isAI ? "hidden" : undefined}
            animate={isAI ? "visible" : undefined}
          >
            {/* Message Content */}
            <motion.div 
              variants={isAI ? childVariants : undefined}
              className="text-[#111111] whitespace-pre-wrap"
            >
              {message.content}
            </motion.div>

            {/* Sources Section (AI only) */}
            {isAI && message.sources && message.sources.length > 0 && (
              <motion.div 
                variants={childVariants}
                className="mt-4 pt-3 border-t-2 border-[#111111]/20"
              >
                <p className="text-xs font-semibold text-[#111111]/60 uppercase tracking-wide mb-2">
                  Sources used
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((source, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-white border-2 border-[#111111] rounded-lg"
                    >
                      📄 {source}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons (AI only) - Animated entrance */}
            {isAI && message.actions && message.actions.length > 0 && (
              <motion.div variants={childVariants}>
                <ActionButtons 
                  actions={message.actions} 
                  onAction={onAction}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default ChatMessage
