/**
 * Authentication Service
 * 
 * Provides Firebase authentication functions:
 * - Google Sign-In
 * - Email/Password Login
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

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account', // Always show account selection
})

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
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<User>} Firebase user object
 */
export const loginWithEmail = async (email, password) => {
  try {
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
    await signOut(auth)
  } catch (error) {
    console.error('Logout error:', error)
    throw formatAuthError(error)
  }
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
