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

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Khi app khởi động: nếu có accessToken → fetch thông tin user hiện tại
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
        // Token hết hạn hoặc không hợp lệ → axios interceptor đã xử lý refresh
        // Nếu refresh cũng fail → interceptor đã clear localStorage
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // ─── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken, user: loggedInUser } = await authApi.login({
      email,
      password,
    })
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(loggedInUser)
  }, [])

  // ─── register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (payload: RegisterRequest) => {
    const { accessToken, refreshToken, user: newUser } = await authApi.register(payload)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(newUser)
  }, [])

  // ─── logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken })
      }
    } catch {
      // Bỏ qua lỗi khi logout (token đã hết hạn trên server)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }, [])

  // ─── refreshUser: re-fetch thông tin user (dùng sau khi cập nhật profile) ──
  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.getMe()
      setUser(me)
    } catch {
      // Không làm gì — interceptor đã xử lý
    }
  }, [])

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider')
  }
  return context
}
