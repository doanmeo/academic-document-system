import api from './axios'
import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  LogoutRequest,
  User,
} from '../types/auth'

// Helper: unwrap envelope data.data
const unwrap = <T>(res: { data: { data: T } }): T => res.data.data

// ─── Auth API ─────────────────────────────────────────────────────────────────

/** POST /auth/register → trả về AuthResponse (có user + tokens) */
export const register = async (payload: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post<{ data: { data: AuthResponse } }>('/auth/register', payload)
  return unwrap(res)
}

/** POST /auth/login → trả về AuthResponse (có user + tokens) */
export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post<{ data: { data: AuthResponse } }>('/auth/login', payload)
  return unwrap(res)
}

/** POST /auth/refresh → trả về tokens mới (không có user) */
export const refreshTokens = async (refreshToken: string): Promise<AuthTokens> => {
  const res = await api.post<{ data: { data: AuthTokens } }>('/auth/refresh', { refreshToken })
  return unwrap(res)
}

/** POST /auth/logout */
export const logout = async (payload: LogoutRequest): Promise<void> => {
  await api.post('/auth/logout', payload)
}

/** GET /auth/me → thông tin người dùng hiện tại */
export const getMe = async (): Promise<User> => {
  const res = await api.get<{ data: { data: User } }>('/auth/me')
  return unwrap(res)
}
