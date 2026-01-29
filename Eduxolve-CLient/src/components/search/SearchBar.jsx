/**
 * SearchBar - Large centered search input with brutal styling
 * 
 * Animations:
 * - Focus ring animation (lift effect)
 * - Loading state with spinner
 */

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { BrutalButton } from '../ui'

function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onSearch(query.trim())
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <motion.div 
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Search Input */}
        <div className="flex-1 relative">
          <motion.div 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/40"
            animate={{ scale: isFocused ? 1.1 : 1 }}
            transition={{ duration: 0.15 }}
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </motion.div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="e.g. explain stacks using examples"
            disabled={isLoading}
            className={`
              w-full
              pl-12 pr-4 py-4
              text-lg
              bg-white
              text-[#111111]
              placeholder-[#111111]/40
              border-2 border-[#111111]
              rounded-xl
              shadow-[4px_4px_0_#111111]
              outline-none
              transition-all duration-150 ease-out
              focus:-translate-x-0.5 focus:-translate-y-0.5
              focus:shadow-[6px_6px_0_#111111]
              focus:border-[#4D96FF]
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          />
        </div>

        {/* Search Button */}
        <BrutalButton
          type="submit"
          variant="primary"
          disabled={!query.trim() || isLoading}
          className={`px-8 py-4 text-lg shrink-0 ${isLoading ? 'opacity-80' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <motion.span
                className="w-5 h-5 border-2 border-[#111111] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              Searching
            </span>
          ) : 'Search'}
        </BrutalButton>
      </motion.div>

      {/* Helper Text */}
      <motion.p 
        className="text-center text-sm text-[#111111]/50 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        Search through lectures, labs, and course materials using natural language
      </motion.p>
    </form>
  )
}

export default SearchBar
