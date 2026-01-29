/**
 * Auth Store (Zustand)
 * 
 * Single source of truth for authentication state.
 * Note: Role is determined by the backend, not the frontend.
 * 
 * State:
 * - user: Firebase user object or null
 * - role: 'student' | 'admin' | null (from backend)
 * - loading: boolean (true during initial auth check)
 */

import { create } from 'zustand'

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
  
  // Check if user has a specific role
  hasRole: (requiredRole) => {
    const state = useAuthStore.getState()
    return state.role === requiredRole
  },
  
  // Check if user is admin
  isAdmin: () => {
    const state = useAuthStore.getState()
    return state.role === 'admin'
  },
}))

export default useAuthStore
