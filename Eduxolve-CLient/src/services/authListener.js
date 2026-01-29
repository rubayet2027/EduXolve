/**
 * Auth State Listener
 * 
 * Listens to Firebase auth state changes and syncs with backend.
 * Backend is the source of truth for user roles.
 * This ensures session persistence across page refreshes.
 */

import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import useAuthStore from '../store/auth.store'
import { userApi } from './api'

let unsubscribe = null

/**
 * Fetch user role from backend (source of truth)
 * @param {Object} user - Firebase user object
 * @returns {Promise<{userData: Object, role: string}>}
 */
const syncWithBackend = async (user) => {
  try {
    const response = await userApi.getMe()
    
    if (response.success && response.data) {
      return {
        userData: {
          uid: user.uid,
          email: response.data.email || user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          id: response.data.id, // MongoDB user ID
        },
        role: response.data.role || 'student',
      }
    }
  } catch (error) {
    console.warn('Failed to sync with backend, using default role:', error.message)
  }
  
  // Fallback if backend is unavailable
  return {
    userData: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    },
    role: 'student', // Default to student if backend fails
  }
}

/**
 * Initialize auth state listener
 * Call this once when the app mounts
 */
export const initAuthListener = () => {
  // Prevent multiple listeners
  if (unsubscribe) {
    return unsubscribe
  }

  const { setAuth, setLoading, logout } = useAuthStore.getState()

  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in - sync with backend
      setLoading(true)
      
      try {
        const { userData, role } = await syncWithBackend(user)
        setAuth(userData, role)
        console.log(`Auth: User signed in as ${role}`, userData.email)
      } catch (error) {
        console.error('Auth sync error:', error)
        // Still allow user in with default role
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        }
        setAuth(userData, 'student')
      }
    } else {
      // User is signed out
      logout()
      console.log('Auth: User signed out')
    }
  })

  return unsubscribe
}

/**
 * Refresh user role from backend
 * Call this when you need to re-sync the role
 */
export const refreshUserRole = async () => {
  const user = auth.currentUser
  if (!user) return
  
  const { setAuth } = useAuthStore.getState()
  const { userData, role } = await syncWithBackend(user)
  setAuth(userData, role)
}

/**
 * Cleanup auth listener
 * Call this when the app unmounts
 */
export const cleanupAuthListener = () => {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
}

export default initAuthListener
