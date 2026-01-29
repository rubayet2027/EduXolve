/**
 * Auth Store (Zustand)
 * 
 * Single source of truth for authentication state.
 * 
 * State:
 * - user: Firebase user object or null
 * - role: 'student' | 'admin' | null
 * - loading: boolean (true during initial auth check)
 */

import { create } from 'zustand'

// Predefined admin emails (temporary - will be replaced by backend verification)
const ADMIN_EMAILS = [
  'admin@university.edu',
  'instructor@university.edu',
  // Add more admin emails as needed
]

/**
 * Determine user role based on email
 * @param {string} email - User's email
 * @returns {'admin' | 'student'} User role
 */
export const determineRole = (email) => {
  if (!email) return 'student'
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'student'
}

const useAuthStore = create((set) => ({
  // State
  user: null,
  role: null,
  loading: true, // Start as true to prevent route flickering

  // Actions
  setAuth: (user, role) => set({
    user,
    role,
    loading: false,
  }),

  setLoading: (loading) => set({ loading }),

  logout: () => set({
    user: null,
    role: null,
    loading: false,
  }),
}))

export default useAuthStore
