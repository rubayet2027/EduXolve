/**
 * ChatInput - Input area for sending messages
 * Supports multiline with Shift+Enter, sends on Enter
 */

import { useState, useRef, useEffect } from 'react'
import { BrutalButton } from '../ui'

function ChatInput({ onSend, disabled, placeholder = 'Ask about your course materials...', leftSlot }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [value])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setValue('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t-2 border-[#111111] bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-stretch">
          {/* Left Slot (e.g., File Attachment Button) */}
          {leftSlot}
          
          {/* Text Input */}
          <div className="flex-1 relative flex">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="
                w-full
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
          </div>

          {/* Send Button */}
          <BrutalButton
            variant="primary"
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className="px-4 shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </BrutalButton>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-[#111111]/40 mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  )
}

export default ChatInput
