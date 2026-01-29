/**
 * Login Page
 * 
 * Supports:
 * - Google Sign-In
 * - Email/Password Login
 * - Email/Password Registration (toggle)
 * 
 * Features:
 * - Loading states
 * - Error handling
 * - Role-based redirect
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrutalCard, BrutalButton, BrutalInput } from '../components/ui'
import { signInWithGoogle, loginWithEmail, registerWithEmail } from '../services/auth.service'
import { useAuthStore } from '../store'
import PageWrapper from '../components/common/PageWrapper'

function Login() {
  const navigate = useNavigate()
  const { user, role, loading: authLoading } = useAuthStore()
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  }, [user, role, authLoading, navigate])

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    if (isLoading) return // Prevent double clicks
    
    setIsLoading(true)
    setError('')

    try {
      await signInWithGoogle()
      // Navigation handled by useEffect above after auth state updates
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  // Handle email login/registration
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return // Prevent double clicks
    
    setIsLoading(true)
    setError('')

    try {
      if (isRegistering) {
        await registerWithEmail(email, password)
      } else {
        await loginWithEmail(email, password)
      }
      // Navigation handled by useEffect above after auth state updates
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  // Toggle between login and register mode
  const toggleMode = () => {
    setIsRegistering(!isRegistering)
    setError('')
  }

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#111111]/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Back to home link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#111111] font-medium mb-8 hover:underline"
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
          Back to home
        </Link>

        <BrutalCard>
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#111111] mb-2">
                {isRegistering ? 'Create your account' : 'Sign in to your course'}
              </h1>
              <p className="text-[#111111]/60">
                {isRegistering 
                  ? 'Get started with AI-powered learning'
                  : 'Welcome back! Please enter your details.'
                }
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] rounded-xl"
                >
                  <p className="text-[#111111] text-sm font-medium flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#FF6B6B] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign-in Button */}
            <BrutalButton
              variant="neutral"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <motion.div 
                    className="w-5 h-5 border-2 border-[#111111] border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isRegistering ? 'Sign up with Google' : 'Sign in with Google'}
                </>
              )}
            </BrutalButton>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-0.5 bg-[#111111]/20" />
              <span className="text-[#111111]/50 font-medium">or</span>
              <div className="flex-1 h-0.5 bg-[#111111]/20" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <BrutalInput
                id="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />

              <BrutalInput
                id="password"
                label="Password"
                type="password"
                placeholder={isRegistering ? 'Create a password (min 6 chars)' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />

              <BrutalButton
                type="submit"
                variant="primary"
                disabled={isLoading}
                className={`w-full mt-2 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div 
                      className="w-5 h-5 border-2 border-[#111111] border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    {isRegistering ? 'Creating account...' : 'Signing in...'}
                  </span>
                ) : (
                  isRegistering ? 'Create Account' : 'Login'
                )}
              </BrutalButton>
            </form>

            {/* Toggle Login/Register */}
            <p className="text-center text-sm text-[#111111]/60">
              {isRegistering ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="font-semibold text-[#111111] hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="font-semibold text-[#111111] hover:underline cursor-pointer"
                  >
                    Create one
                  </button>
                </>
              )}
            </p>
          </div>
        </BrutalCard>

        {/* Admin hint (for testing) */}
        <p className="text-center text-xs text-[#111111]/40 mt-4">
          Admin access: Use admin@university.edu
        </p>
        </motion.div>
      </div>
    </PageWrapper>
  )
}

export default Login
