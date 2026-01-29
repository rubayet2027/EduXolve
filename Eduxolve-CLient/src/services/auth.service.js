/**
 * Authentication Service
 * 
 * Provides Firebase authentication functions:
 * - Google Sign-In
 * - Email/Password Login (with admin support)
 * - Email/Password Registration
 * - Logout
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './firebase'

// Admin emails (hardcoded for demo reliability)
const ADMIN_EMAILS = ['admin@eduxolve.com', 'admin@university.edu']

// API Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account', // Always show account selection
})

/**
 * Check if email is an admin email
 * @param {string} email
 * @returns {boolean}
 */
const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase())
}

/**
 * Login as admin using hardcoded credentials
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Admin user object with token
 */
export const loginAsAdmin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Admin login failed')
    }
    
    // Store admin token
    setAdminToken(data.token)
    
    return data.user
  } catch (error) {
    console.error('Admin login error:', error)
    throw new Error(error.message || 'Admin login failed')
  }
}

/**
 * Sign in with Google using popup
 * @returns {Promise<User>} Firebase user object
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Google sign-in error:', error)
    throw formatAuthError(error)
  }
}

/**
 * Login with email and password
 * Checks for admin credentials first, then falls back to Firebase
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<User>} Firebase user object or admin user
 */
export const loginWithEmail = async (email, password) => {
  try {
    // Check if this is an admin login attempt
    if (isAdminEmail(email)) {
      console.log('Auth: Admin login attempt detected')
      return await loginAsAdmin(email, password)
    }
    
    // Regular Firebase login
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error('Email login error:', error)
    throw formatAuthError(error)
  }
}

/**
 * Register new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<User>} Firebase user object
 */
export const registerWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error('Email registration error:', error)
    throw formatAuthError(error)
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // Clear admin token if exists
    localStorage.removeItem('adminToken')
    await signOut(auth)
  } catch (error) {
    console.error('Logout error:', error)
    throw formatAuthError(error)
  }
}

/**
 * Get admin token from localStorage
 * @returns {string|null}
 */
export const getAdminToken = () => {
  return localStorage.getItem('adminToken')
}

/**
 * Set admin token in localStorage
 * @param {string} token
 */
export const setAdminToken = (token) => {
  localStorage.setItem('adminToken', token)
}

/**
 * Check if user is logged in as admin (via hardcoded credentials)
 * @returns {boolean}
 */
export const isAdminLoggedIn = () => {
  return !!localStorage.getItem('adminToken')
}

/**
 * Format Firebase auth errors to user-friendly messages
 * @param {Error} error - Firebase auth error
 * @returns {Error} Formatted error with user-friendly message
 */
const formatAuthError = (error) => {
  const errorMessages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
  }

  const message = errorMessages[error.code] || error.message || 'An unexpected error occurred.'
  
  const formattedError = new Error(message)
  formattedError.code = error.code
  return formattedError
}
