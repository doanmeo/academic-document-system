import api from './axios'
import type { ApiResponse, AuthResponse, User } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  studentCode?: string
  majorId?: number
}

export const authApi = {
  login: async (data: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
    return res.data
  },

  register: async (data: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return res.data
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const res = await api.get<ApiResponse<User>>('/auth/me')
    return res.data
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const refreshToken = localStorage.getItem('refreshToken')
    const res = await api.post<ApiResponse<void>>('/auth/logout', { refreshToken })
    return res.data
  },
}
