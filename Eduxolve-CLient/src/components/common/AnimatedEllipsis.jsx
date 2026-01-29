/**
 * AnimatedEllipsis - Subtle animated thinking indicator
 * 
 * Displays: . → .. → ... in a smooth loop
 * Used in loading states for AI responses
 */

import { useState, useEffect } from 'react'

function AnimatedEllipsis({ className = '' }) {
  const [dots, setDots] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1)
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <span className={`inline-block min-w-[1.5em] ${className}`}>
      {'.'.repeat(dots)}
    </span>
  )
}

export default AnimatedEllipsis
