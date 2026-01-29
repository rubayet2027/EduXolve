/**
 * Chat Page - Conversational AI Chat Interface
 * Core interaction layer for academic learning
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatHeader, ChatMessage, ChatInput } from '../components/chat'
import { BrutalButton } from '../components/ui'
import PageWrapper from '../components/common/PageWrapper'

// Mock AI responses based on query type
const mockResponses = {
  default: {
    text: "Based on the course materials, I can help explain this concept.\n\nA stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle. Think of it like a stack of plates - you can only add or remove from the top.\n\nKey operations:\n• push(item) - Add to top\n• pop() - Remove from top\n• peek() - View top without removing\n• isEmpty() - Check if empty",
    sources: ["Lecture 3 - Data Structures", "Lab Sheet 2 - Stack Implementation"],
    actions: ["Explain more", "Generate notes", "Validate"]
  },
  example: {
    text: "Here's a practical example of a stack in action:\n\n```python\nstack = []\n\n# Push elements\nstack.append('A')  # ['A']\nstack.append('B')  # ['A', 'B']\nstack.append('C')  # ['A', 'B', 'C']\n\n# Pop element\ntop = stack.pop()  # Returns 'C'\nprint(stack)       # ['A', 'B']\n```\n\nReal-world applications include:\n• Undo functionality in text editors\n• Browser back button history\n• Function call stack in programming",
    sources: ["Lab Manual - Python Examples", "Lecture 4 - Applications"],
    actions: ["Try another example", "Explain the code", "Show in Java"]
  },
  summarize: {
    text: "📝 Summary: Stacks\n\n• Definition: LIFO (Last-In-First-Out) data structure\n• Core operations: push, pop, peek, isEmpty\n• Time complexity: O(1) for all basic operations\n• Space complexity: O(n) where n = number of elements\n• Common uses: Undo systems, expression parsing, backtracking algorithms\n\nKey takeaway: Stacks are simple but powerful structures ideal for scenarios requiring reverse-order processing.",
    sources: ["Course Summary - Week 3"],
    actions: ["Expand on time complexity", "Compare with queues", "Quiz me"]
  },
  code: {
    text: "Here's a complete Stack implementation in Python:\n\n```python\nclass Stack:\n    def __init__(self):\n        self.items = []\n    \n    def push(self, item):\n        self.items.append(item)\n    \n    def pop(self):\n        if not self.is_empty():\n            return self.items.pop()\n        raise IndexError(\"Stack is empty\")\n    \n    def peek(self):\n        if not self.is_empty():\n            return self.items[-1]\n        raise IndexError(\"Stack is empty\")\n    \n    def is_empty(self):\n        return len(self.items) == 0\n    \n    def size(self):\n        return len(self.items)\n```\n\nThis implementation uses Python's list as the underlying storage.",
    sources: ["Lab Sheet 2 - Implementation Guide", "Reference Code Repository"],
    actions: ["Explain each method", "Add error handling", "Convert to Java"]
  }
}

// Suggested follow-ups shown after AI messages
const suggestedFollowUps = [
  "Give an example",
  "Summarize",
  "Show code"
]

// Initial welcome message
const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello! I'm your Course Assistant for Data Structures. 👋\n\nI can help you:\n• Understand concepts from lectures and labs\n• Find relevant course materials\n• Generate study notes and examples\n\nWhat would you like to learn about today?",
  sources: [],
  actions: []
}

function Chat() {
  const [messages, setMessages] = useState([welcomeMessage])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Get appropriate mock response based on message content
  const getMockResponse = (userMessage) => {
    const lower = userMessage.toLowerCase()
    if (lower.includes('example')) return mockResponses.example
    if (lower.includes('summarize') || lower.includes('summary')) return mockResponses.summarize
    if (lower.includes('code') || lower.includes('implement')) return mockResponses.code
    return mockResponses.default
  }

  // Handle sending a message
  const handleSend = async (content) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Add loading message
    const loadingId = Date.now() + 1
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'assistant',
      isLoading: true
    }])

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500))

    // Get mock response
    const response = getMockResponse(content)

    // Replace loading with actual response
    setMessages(prev => prev.map(msg => 
      msg.id === loadingId
        ? {
            id: loadingId,
            role: 'assistant',
            content: response.text,
            sources: response.sources,
            actions: response.actions,
            isLoading: false
          }
        : msg
    ))
    setIsLoading(false)
  }

  // Handle action button clicks
  const handleAction = (action) => {
    handleSend(action)
  }

  // Handle suggested follow-up clicks
  const handleFollowUp = (followUp) => {
    handleSend(followUp)
  }

  // Get the last message to check if we should show follow-ups
  const lastMessage = messages[messages.length - 1]
  const showFollowUps = lastMessage?.role === 'assistant' && !lastMessage?.isLoading && !isLoading

  return (
    <PageWrapper>
      <div className="h-screen flex flex-col bg-[#FAFAF7]">
        {/* Header */}
        <ChatHeader />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onAction={handleAction}
              />
            ))}

            {/* Suggested Follow-ups */}
            <AnimatePresence>
              {showFollowUps && (
                <motion.div 
                  className="flex flex-wrap gap-2 justify-center pt-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {suggestedFollowUps.map((followUp, index) => (
                    <motion.div
                      key={followUp}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.15, delay: index * 0.05 }}
                    >
                      <BrutalButton
                        variant="neutral"
                        onClick={() => handleFollowUp(followUp)}
                        className="px-4 py-2 text-sm bg-[#F5F5F5]"
                      >
                        {followUp}
                      </BrutalButton>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </PageWrapper>
  )
}

export default Chat
