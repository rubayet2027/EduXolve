/**
 * MarkdownRenderer - Safe Markdown rendering component
 * 
 * Renders AI responses with proper formatting:
 * - Headings, lists, bold/italic text
 * - Code blocks with syntax highlighting & copy button
 * - Tables (GFM support)
 * - Safe HTML sanitization (no raw HTML injection)
 */

import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCopy, IoCheckmark } from 'react-icons/io5'

// Code block with copy button
function CodeBlock({ children, className, ...props }) {
  const [copied, setCopied] = useState(false)
  
  // Extract language from className (e.g., "language-python")
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  
  // Get the actual code text
  const codeText = String(children).replace(/\n$/, '')
  
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [codeText])
  
  return (
    <div className="markdown-code-block group relative">
      {/* Language badge */}
      {language && (
        <span className="absolute top-2 left-3 text-xs font-mono text-[#888] uppercase">
          {language}
        </span>
      )}
      
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="
          absolute top-2 right-2 
          p-1.5 rounded-md
          bg-[#333] hover:bg-[#444]
          border border-[#555]
          text-[#ccc] hover:text-white
          opacity-0 group-hover:opacity-100
          transition-all duration-200
          flex items-center gap-1
          text-xs
        "
        title="Copy code"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1 text-[#6BCB77]"
            >
              <IoCheckmark size={14} /> Copied!
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1"
            >
              <IoCopy size={14} /> Copy
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      
      <pre className={className} {...props}>
        <code className={className}>{children}</code>
      </pre>
    </div>
  )
}

// Inline code styling
function InlineCode({ children, ...props }) {
  return (
    <code className="markdown-inline-code" {...props}>
      {children}
    </code>
  )
}

// Custom components for Markdown elements
const components = {
  // Code blocks vs inline code
  code({ inline, className, children, ...props }) {
    if (inline) {
      return <InlineCode {...props}>{children}</InlineCode>
    }
    return (
      <CodeBlock className={className} {...props}>
        {children}
      </CodeBlock>
    )
  },
  
  // Headings with proper styling
  h1: ({ children }) => (
    <h1 className="markdown-h1">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="markdown-h2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="markdown-h3">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="markdown-h4">{children}</h4>
  ),
  
  // Paragraphs
  p: ({ children }) => (
    <p className="markdown-p">{children}</p>
  ),
  
  // Lists
  ul: ({ children }) => (
    <ul className="markdown-ul">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="markdown-ol">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="markdown-li">{children}</li>
  ),
  
  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="markdown-blockquote">{children}</blockquote>
  ),
  
  // Tables (GFM)
  table: ({ children }) => (
    <div className="markdown-table-wrapper">
      <table className="markdown-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="markdown-thead">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="markdown-tbody">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="markdown-tr">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="markdown-th">{children}</th>
  ),
  td: ({ children }) => (
    <td className="markdown-td">{children}</td>
  ),
  
  // Links
  a: ({ href, children }) => (
    <a 
      href={href} 
      className="markdown-link"
      target="_blank" 
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  
  // Horizontal rule
  hr: () => <hr className="markdown-hr" />,
  
  // Strong/Bold
  strong: ({ children }) => (
    <strong className="markdown-strong">{children}</strong>
  ),
  
  // Emphasis/Italic
  em: ({ children }) => (
    <em className="markdown-em">{children}</em>
  ),
}

/**
 * MarkdownRenderer Component
 * 
 * @param {string} content - Markdown content to render
 * @param {string} className - Additional CSS classes
 * @param {boolean} animate - Enable fade-in animation (default: true)
 */
function MarkdownRenderer({ content, className = '', animate = true }) {
  if (!content) return null
  
  const markdownContent = (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
  
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {markdownContent}
      </motion.div>
    )
  }
  
  return markdownContent
}

export default MarkdownRenderer
