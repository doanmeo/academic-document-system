// === LUỒNG 1: XÁC THỰC & PHÂN QUYỀN (Auth & RBAC Flow) ===
// Định nghĩa các hàm gọi API xác thực tới Spring Boot Backend
import api from './axios'
import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  LogoutRequest,
  User,
} from '../types/auth'

// Trợ thủ: Trích xuất dữ liệu thực tế từ vỏ bọc data.data của Backend
const unwrap = <T>(res: any): T => (res.data?.data ?? res.data) as T

// ─── LUỒNG 1: Đăng ký tài khoản ───────────────────────────────────────────────
/** POST /auth/register → trả về AuthResponse (gồm thông tin user + cặp token) */
export const register = async (payload: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post<{ data: { data: AuthResponse } }>('/auth/register', payload)
  return unwrap(res)
}

// ─── LUỒNG 1: Đăng nhập tài khoản ─────────────────────────────────────────────
/** POST /auth/login → trả về AuthResponse (gồm thông tin user + cặp token) */
export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post<{ data: { data: AuthResponse } }>('/auth/login', payload)
  return unwrap(res)
}

// ─── LUỒNG 1: Làm mới token khi accessToken hết hạn ────────────────────────────
/** POST /auth/refresh → trả về cặp tokens mới */
export const refreshTokens = async (refreshToken: string): Promise<AuthTokens> => {
  const res = await api.post<{ data: { data: AuthTokens } }>('/auth/refresh', { refreshToken })
  return unwrap(res)
}

// ─── LUỒNG 1: Đăng xuất và hủy phiên ─────────────────────────────────────────
/** POST /auth/logout → hủy refreshToken trên máy chủ */
export const logout = async (payload: LogoutRequest): Promise<void> => {
  await api.post('/auth/logout', payload)
}

// ─── LUỒNG 1: Lấy thông tin tài khoản hiện tại từ accessToken ─────────────────
/** GET /auth/me → trả về hồ sơ người dùng đang đăng nhập */
export const getMe = async (): Promise<User> => {
  const res = await api.get<{ data: { data: User } }>('/auth/me')
  return unwrap(res)
}
