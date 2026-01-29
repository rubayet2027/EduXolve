import { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { 
  Landing, 
  Login, 
  Dashboard, 
  Search, 
  Chat, 
  Generate,
  AdminDashboard,
  UploadContent,
  ManageContent,
  NotFound,
} from './pages'
import { ProtectedRoute } from './components/common'

// ScrollToTop component - scrolls to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

// Global auth error handler
function AuthErrorHandler() {
  const navigate = useNavigate()
  
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('Unauthorized - redirecting to login')
      navigate('/login', { replace: true })
    }
    
    const handleForbidden = () => {
      console.log('Forbidden - insufficient permissions')
      navigate('/dashboard', { replace: true })
    }
    
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    window.addEventListener('auth:forbidden', handleForbidden)
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
      window.removeEventListener('auth:forbidden', handleForbidden)
    }
  }, [navigate])
  
  return null
}

function App() {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />
      <AuthErrorHandler />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Student Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/generate" element={
            <ProtectedRoute>
              <Generate />
            </ProtectedRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/upload" element={
            <ProtectedRoute requiredRole="admin">
              <UploadContent />
            </ProtectedRoute>
          } />
          <Route path="/admin/content" element={
            <ProtectedRoute requiredRole="admin">
              <ManageContent />
            </ProtectedRoute>
          } />

          {/* 404 Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
