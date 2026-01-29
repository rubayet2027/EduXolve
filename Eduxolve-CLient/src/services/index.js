// Services barrel export
export { auth, db } from './firebase'
export { default as firebaseApp } from './firebase'

// API Client exports
export { default as api } from './api'
export {
  ApiError,
  userApi,
  contentApi,
  searchApi,
  aiApi,
  validationApi,
  chatApi
} from './api'

// Auth exports
export * from './auth.service'
export { initAuthListener, cleanupAuthListener, refreshUserRole } from './authListener'
