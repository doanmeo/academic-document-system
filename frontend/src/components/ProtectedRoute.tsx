import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types/auth'

interface ProtectedRouteProps {
  /** Nếu truyền vào, sẽ kiểm tra role. Không truyền = chỉ cần đăng nhập. */
  requiredRole?: UserRole
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()

  // Đang tải thông tin auth → hiện spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary" />
      </div>
    )
  }

  // Chưa đăng nhập → về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Đăng nhập rồi nhưng không đúng role → về trang chủ
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
