/**
 * ProtectedRoute - Route protection component
 * Redirects unauthenticated users to login
 * Optionally enforces role-based access
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store'
import Loader from './Loader'

function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuthStore()
  const location = useLocation()

  // Show loading spinner while checking auth state
  if (loading) {
    return <Loader message="Checking authentication..." />
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
