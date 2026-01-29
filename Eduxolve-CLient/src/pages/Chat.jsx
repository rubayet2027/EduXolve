/**
 * Chat Page - Conversational AI Chat Interface
 * Core interaction layer for academic learning
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatHeader, ChatMessage, ChatInput } from '../components/chat'
import { BrutalButton } from '../components/ui'
import PageWrapper from '../components/common/PageWrapper'
import { chatApi } from '../services/api'

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
  content: "Hello! I'm your Course Assistant for Data Structures.\n\nI can help you:\n• Understand concepts from lectures and labs\n• Find relevant course materials\n• Generate study notes and examples\n\nWhat would you like to learn about today?",
  sources: [],
  actions: []
}

function Chat() {
  const [messages, setMessages] = useState([welcomeMessage])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Build chat history for API (exclude welcome message and loading states)
  const buildChatHistory = () => {
    return messages
      .filter(msg => msg.id !== 'welcome' && !msg.isLoading)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))
  }

  // Handle sending a message
  const handleSend = async (content) => {
    if (!content.trim()) return
    
    setError(null)
    
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

    try {
      // Call the chat API
      const response = await chatApi.send({
        message: content,
        history: buildChatHistory()
      })

      // Extract the reply from response
      const aiReply = response.data || response
      
      // Replace loading with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId
          ? {
              id: loadingId,
              role: 'assistant',
              content: aiReply.reply || aiReply.message || 'I received your message but couldn\'t generate a response.',
              sources: aiReply.sources || [],
              actions: aiReply.actions || [],
              isLoading: false
            }
          : msg
      ))
    } catch (err) {
      console.error('Chat error:', err)
      
      // Replace loading with error message
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId
          ? {
              id: loadingId,
              role: 'assistant',
              content: "I'm sorry, I couldn't process your request. Please try again.",
              sources: [],
              actions: [],
              isLoading: false,
              isError: true
            }
          : msg
      ))
      
      setError(err.message || 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle action button clicks
  const handleAction = (action) => {
    handleSend(action)
  }

  // Handle suggested follow-up clicks
  const handleFollowUp = (followUp) => {
    handleSend(followUp)
  }
  
  // Clear chat session
  const handleClearChat = async () => {
    try {
      await chatApi.clearSession()
      setMessages([welcomeMessage])
      setError(null)
    } catch (err) {
      console.error('Failed to clear chat:', err)
    }
  }

  // Get the last message to check if we should show follow-ups
  const lastMessage = messages[messages.length - 1]
  const showFollowUps = lastMessage?.role === 'assistant' && !lastMessage?.isLoading && !isLoading

  return (
    <PageWrapper>
      <div className="h-screen flex flex-col bg-[#FAF8F5]">
        {/* Header */}
        <ChatHeader />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
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
                  className="flex flex-wrap gap-2 justify-center pt-6"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  {suggestedFollowUps.map((followUp, index) => (
                    <motion.div
                      key={followUp}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.18, delay: index * 0.04 }}
                    >
                      <BrutalButton
                        variant="neutral"
                        onClick={() => handleFollowUp(followUp)}
                        className="px-4 py-2 text-sm bg-[#F3EEFA]"
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
