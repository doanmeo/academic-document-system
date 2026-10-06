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
  description?: string
  active?: boolean
}

export interface Major {
  id: number
  code: string
  name: string
  active?: boolean
}

export interface AcademicYear {
  id: number
  code: string
  name: string
  startYear?: number
  active?: boolean
}

export interface Technology {
  id: number
  name: string
  slug?: string
  active?: boolean
}

export interface LovValue {
  code: string
  label: string
  displayOrder?: number
}

export interface DocumentSummary {
  id: number
  title: string
  abstractText: string
  status: DocumentStatus
  documentTypeCode: string
  documentTypeLabel?: string
  subjectId: number
  subjectName: string
  academicYearId: number
  academicYearName: string
  uploaderName: string
  advisorName?: string | null
  viewCount: number
  downloadCount: number
  primaryFileMimeType?: string | null
  createdAt: string
  approvedAt?: string | null
  bookmarked?: boolean
  avgRating?: number
  ratingCount?: number
  coverTheme?: string
}

export interface DocumentFile {
  id: number
  fileName: string
  mimeType: string
  fileSize: number
  isPrimary: boolean
  storageKey?: string
}

export interface DocumentMember {
  userId: number
  fullName: string
  studentCode: string
  isLeader: boolean
}

export interface DocumentDetail extends DocumentSummary {
  description?: string | null
  githubUrl?: string | null
  gitlabUrl?: string | null
  majorId?: number | null
  majorName?: string | null
  technologies: Array<{ id: number; name: string }>
  members: DocumentMember[]
  files: DocumentFile[]
  rejectionNote?: string | null
  updatedAt?: string
}

export interface Report {
  id: number
  documentId: number
  documentTitle: string
  reporterId: number
  reporterName: string
  reasonCode: string
  reasonLabel?: string
  description: string
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED'
  handledBy?: string | null
  handledAt?: string | null
  handlingNote?: string | null
  createdAt: string
}

export interface DocumentReview {
  id: number
  documentId: number
  reviewerName: string
  fromStatus: DocumentStatus
  toStatus: DocumentStatus
  comment: string
  createdAt: string
}

export interface DashboardStats {
  totalDocuments: number
  pendingDocuments: number
  totalUsers: number
  totalReports: number
  documentsByStatus: Record<string, number>
  topDocuments: DocumentSummary[]
  recentDocuments: DocumentSummary[]
}
