// === LUỒNG 1: XÁC THỰC & PHÂN QUYỀN (Auth & RBAC Flow) ===
// Quản lý trạng thái đăng nhập, lưu trữ token, thông tin sinh viên toàn ứng dụng
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import * as authApi from '../api/authApi'
import type { User, RegisterRequest } from '../types/auth'

// ─── Cấu trúc dữ liệu của AuthContext ─────────────────────────────────────────
interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// ─── Component cung cấp AuthContext cho toàn bộ cây giao diện ──────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // LUỒNG 1: Khi ứng dụng khởi động - nạp lại phiên đăng nhập nếu đã có accessToken
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const me = await authApi.getMe()
        setUser(me)
      } catch {
        // Token hết hạn hoặc không hợp lệ → axios interceptor đã xử lý tự động refresh
        // Nếu refresh thất bại → interceptor đã tự động xóa localStorage
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // ─── LUỒNG 1: Đăng nhập tài khoản ───────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken, user: loggedInUser } = await authApi.login({
      email,
      password,
    })
    // Lưu cặp token vào bộ nhớ trình duyệt LocalStorage
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    // Cập nhật State user -> kích hoạt hiệu ứng domino đổi giao diện toàn web
    setUser(loggedInUser)
  }, [])

  // ─── LUỒNG 1: Đăng ký tài khoản sinh viên mới ───────────────────────────────
  const register = useCallback(async (payload: RegisterRequest) => {
    const { accessToken, refreshToken, user: newUser } = await authApi.register(payload)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(newUser)
  }, [])

  // ─── LUỒNG 1: Đăng xuất tài khoản ───────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken })
      }
    } catch {
      // Bỏ qua lỗi khi logout nếu token đã bị hủy trước đó trên server
    } finally {
      // Dọn dẹp sạch sẽ token khỏi LocalStorage và đưa state user về null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }, [])

  // ─── Cập nhật lại thông tin user (dùng sau khi chỉnh sửa hồ sơ) ──────────────
  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.getMe()
      setUser(me)
    } catch {
      // Interceptor đã tự động xử lý
    }
  }, [])

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, isAdmin: user?.role === 'ADMIN', login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Custom Hook useAuth tiện lợi cho các component gọi trực tiếp ──────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider')
  }
  return context
}
