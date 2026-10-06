// ─── Auth types ────────────────────────────────────────────────────────────────

export type UserRole = 'STUDENT' | 'ADMIN'

export interface User {
  id: number
  email: string
  fullName: string
  studentCode: string | null
  role: UserRole
  majorId: number | null
  majorName: string | null
  avatarUrl: string | null
  active: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

export interface AuthResponse extends AuthTokens {
  user: User
}

// ─── Request payloads ──────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  studentCode: string
  majorId: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface LogoutRequest {
  refreshToken: string
}
