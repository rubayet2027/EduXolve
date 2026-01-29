/**
 * Auth State Listener
 * 
 * Listens to Firebase auth state changes and updates Zustand store.
 * This ensures session persistence across page refreshes.
 */

import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import useAuthStore, { determineRole } from '../store/auth.store'

let unsubscribe = null

/**
 * Initialize auth state listener
 * Call this once when the app mounts
 */
export const initAuthListener = () => {
  // Prevent multiple listeners
  if (unsubscribe) {
    return unsubscribe
  }

  const { setAuth, logout } = useAuthStore.getState()

  unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      const role = determineRole(user.email)
      
      // Create a serializable user object
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      }

      setAuth(userData, role)
      
      console.log(`Auth: User signed in as ${role}`, userData.email)
    } else {
      // User is signed out
      logout()
      console.log('Auth: User signed out')
    }
  })

  return unsubscribe
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
