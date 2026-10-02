import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner text="Đang kiểm tra quyền truy cập..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}
