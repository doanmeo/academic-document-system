// === LUỒNG 1: XÁC THỰC & PHÂN QUYỀN (ProtectedRoute / Route Guard) ===
// Bảo vệ các tuyến đường riêng tư (Upload, Đổi mật khẩu, Quản trị Admin)
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types/auth'

interface ProtectedRouteProps {
  /** Nếu truyền vào, sẽ kiểm tra vai trò người dùng (ví dụ: 'ADMIN'). Không truyền = chỉ cần đã đăng nhập. */
  requiredRole?: UserRole
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()

  // 1. Đang kiểm tra trạng thái đăng nhập → hiển thị vòng xoay chờ tải
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary" />
      </div>
    )
  }

  // 2. Nếu CHƯA đăng nhập → tự động chuyển hướng người dùng về trang /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 3. Nếu ĐÃ đăng nhập nhưng không đủ quyền hạn (ví dụ Sinh viên cố vào trang Admin) → chuyển hướng về trang chủ
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  // 4. Đủ điều kiện → cho phép truy cập vào các trang con bên trong
  return <Outlet />
}
