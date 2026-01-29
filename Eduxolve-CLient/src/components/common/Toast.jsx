/**
 * Toast - Brutal-style notification/alert system
 * Matches the Soft Neubrutalism design of EduXolve
 */

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCheckmarkCircle, IoAlertCircle, IoInformationCircle, IoClose, IoWarning } from 'react-icons/io5'

// Toast Context
const ToastContext = createContext(null)

// Toast variants with colors matching the brutal theme
const toastVariants = {
  success: {
    bg: 'bg-[#6BCB77]',
    icon: IoCheckmarkCircle,
    iconColor: 'text-green-800'
  },
  error: {
    bg: 'bg-[#FF6B6B]',
    icon: IoAlertCircle,
    iconColor: 'text-red-800'
  },
  warning: {
    bg: 'bg-[#FFD93D]',
    icon: IoWarning,
    iconColor: 'text-yellow-800'
  },
  info: {
    bg: 'bg-[#74C0FC]',
    icon: IoInformationCircle,
    iconColor: 'text-blue-800'
  }
}

// Single Toast Component
function ToastItem({ id, message, type = 'info', onClose }) {
  const variant = toastVariants[type] || toastVariants.info
  const Icon = variant.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 4000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        ${variant.bg}
        border-2 border-[#111111]
        shadow-[4px_4px_0px_#111111]
        rounded-xl
        px-4 py-3
        flex items-center gap-3
        min-w-[280px]
        max-w-[400px]
      `}
    >
      <Icon className={`w-6 h-6 ${variant.iconColor} shrink-0`} />
      <p className="flex-1 font-semibold text-[#111111] text-sm">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 p-1 hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
      >
        <IoClose className="w-5 h-5 text-[#111111]" />
      </button>
    </motion.div>
  )
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info')
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastProvider
