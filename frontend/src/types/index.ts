export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: ApiError[]
}

export interface ApiError {
  field?: string
  code: string
  message: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

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
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export type DocumentStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'HIDDEN'
  | 'ARCHIVED'

export interface Subject {
  id: number
  code: string
  name: string
}

export interface Major {
  id: number
  code: string
  name: string
}

export interface AcademicYear {
  id: number
  code: string
  name: string
  startYear?: number
}

export interface Technology {
  id: number
  name: string
  slug: string
}

export interface LovValue {
  code: string
  label: string
  displayOrder: number
}
