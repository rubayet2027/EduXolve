/**
 * Auth State Listener
 * 
 * Listens to Firebase auth state changes and syncs with backend.
 * Also handles admin JWT token sessions.
 * Backend is the source of truth for user roles.
 * This ensures session persistence across page refreshes.
 */

import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import useAuthStore from '../store/auth.store'
import { userApi } from './api'
import { isAdminLoggedIn } from './auth.service'

let unsubscribe = null

/**
 * Fetch user role from backend (source of truth)
 * @param {Object} user - Firebase user object or admin user object
 * @returns {Promise<{userData: Object, role: string}>}
 */
const syncWithBackend = async (user) => {
  try {
    // Add timeout to prevent hanging if backend is slow
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Backend sync timeout')), 5000)
    )
    
    const response = await Promise.race([
      userApi.getMe(),
      timeoutPromise
    ])
    
    if (response.success && response.data) {
      return {
        userData: {
          uid: user.uid || response.data.id,
          email: response.data.email || user.email,
          displayName: user.displayName || response.data.email,
          photoURL: user.photoURL || null,
          emailVerified: user.emailVerified ?? true,
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
 * Check for existing admin session on init
 * @returns {Promise<boolean>} True if admin session restored
 */
const checkAdminSession = async () => {
  if (!isAdminLoggedIn()) return false
  
  const { setAuth, setLoading } = useAuthStore.getState()
  
  try {
    console.log('Auth: Admin token found, restoring session...')
    const response = await userApi.getMe()
    
    if (response.success && response.data) {
      const userData = {
        uid: response.data.id,
        email: response.data.email,
        displayName: response.data.email,
        photoURL: null,
        emailVerified: true,
        id: response.data.id,
      }
      setAuth(userData, response.data.role || 'admin')
      console.log('Auth: Admin session restored', userData.email)
      return true
    }
  } catch (error) {
    console.warn('Auth: Admin token invalid, clearing...', error.message)
    localStorage.removeItem('adminToken')
  }
  
  return false
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

  // First check for admin session
  checkAdminSession().then(hasAdminSession => {
    if (hasAdminSession) {
      setLoading(false)
      return // Admin session active, don't overwrite with Firebase
    }
    
    // Set up Firebase auth listener for regular users
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Skip if admin is logged in
      if (isAdminLoggedIn()) {
        console.log('Auth: Admin session active, skipping Firebase user')
        return
      }
      
      if (user) {
        // User is signed in - sync with backend
        console.log('Auth: Firebase user detected', user.email)
        
        try {
          const { userData, role } = await syncWithBackend(user)
          setAuth(userData, role)
          console.log(`Auth: User signed in as ${role}`, userData.email)
        } catch (error) {
          console.error('Auth sync error:', error)
          // Still allow user in with default role - DON'T block login if backend fails
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          }
          setAuth(userData, 'student')
          console.log('Auth: Fallback - signed in as student')
        }
      } else {
        // User is signed out
        logout()
        console.log('Auth: User signed out')
      }
    })
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
