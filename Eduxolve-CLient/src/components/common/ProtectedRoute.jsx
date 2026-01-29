/**
 * ProtectedRoute - Route protection component
 * Redirects unauthenticated users to login
 * Optionally enforces role-based access
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store'

function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuthStore()
  const location = useLocation()

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#111111]/60">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (requiredRole && role !== requiredRole) {
    // Redirect admin to admin dashboard, students to student dashboard
    const redirectPath = role === 'admin' ? '/admin' : '/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default ProtectedRoute
