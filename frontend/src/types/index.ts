export * from './document'
export * from './catalog'
export * from './admin'
export * from './auth'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: ApiError[]
  timestamp?: string
}

export interface ApiError {
  field?: string
  code: string
  message: string
}
