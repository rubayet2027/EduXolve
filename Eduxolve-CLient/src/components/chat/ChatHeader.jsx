/**
 * ChatHeader - Header component for the chat page
 */

import { useNavigate } from 'react-router-dom'
import { BrutalButton } from '../ui'

function ChatHeader() {
  const navigate = useNavigate()

  return (
    <header className="border-b-2 border-[#111111] bg-white px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        {/* Back Button */}
        <BrutalButton
          variant="neutral"
          onClick={() => navigate('/dashboard')}
          className="px-3 py-2"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </BrutalButton>

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-[#111111]">
            Course Assistant
          </h1>
          <p className="text-sm text-[#111111]/60">
            Ask questions about your course
          </p>
        </div>
      </div>
    </header>
  )
}

export default ChatHeader
