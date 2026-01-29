// Firebase configuration and initialization
import { initializeApp } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration using environment variables
// Fallback to hardcoded values for development (will be removed in production)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC-lnkUsSHR0OQzXnEgnGqxx84DTUgLMjo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eduxolve.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eduxolve",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eduxolve.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "888371851783",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:888371851783:web:9c398af92bb140e6aeb0a2"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Set persistence to local (survives browser restart)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error)
})

export default app
