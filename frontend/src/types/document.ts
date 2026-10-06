// ─── Document types ────────────────────────────────────────────────────────────

export type DocumentStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'HIDDEN'
  | 'REVISION_REQUIRED'

export type DocumentTypeCode = 'THESIS' | 'CAPSTONE' | 'PROJECT' | 'LECTURE'

// ─── Tóm tắt tài liệu (dùng trong danh sách / grid) ──────────────────────────
export interface DocumentSummary {
  id: number
  title: string
  abstractText: string
  status: DocumentStatus
  documentTypeCode: DocumentTypeCode
  documentTypeLabel: string
  subjectId: number
  subjectName: string
  academicYearId: number
  academicYearName: string
  uploaderName: string
  advisorName: string
  viewCount: number
  downloadCount: number
  primaryFileMimeType: string
  bookmarked: boolean
  avgRating: number
  ratingCount: number
  createdAt: string
  // Trường bổ sung (có thể có hoặc không tùy endpoint)
  rejectionNote?: string | null
  technologies?: { id: number; name: string }[]
}

// ─── Chi tiết đầy đủ tài liệu ─────────────────────────────────────────────────
export interface DocumentMember {
  userId: number
  fullName: string
  studentCode: string
  isLeader: boolean
}

export interface DocumentFile {
  id: number
  fileName: string
  mimeType: string
  fileSize: number
  isPrimary: boolean
}

export interface DocumentDetail extends DocumentSummary {
  description: string | null
  githubUrl: string | null
  gitlabUrl: string | null
  majorId: number
  majorName: string
  technologies: { id: number; name: string }[]
  members: DocumentMember[]
  files: DocumentFile[]
  rejectionNote: string | null
  updatedAt: string
}

// ─── Phân trang ────────────────────────────────────────────────────────────────
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// ─── Request payloads ──────────────────────────────────────────────────────────
export interface CreateDocumentRequest {
  title: string
  abstractText: string
  description?: string
  documentTypeCode: DocumentTypeCode
  subjectId: number
  majorId: number
  academicYearId: number
  advisorName?: string
  githubUrl?: string
  gitlabUrl?: string
  technologyIds?: number[]
  memberStudentCodes?: string[]
}

export type UpdateDocumentRequest = Partial<CreateDocumentRequest>

export interface SearchDocumentParams {
  keyword?: string
  subjectId?: number
  academicYearId?: number
  documentTypeCode?: DocumentTypeCode
  technologyId?: number
  page?: number
  size?: number
  sort?: string
}

export interface MyDocumentsParams {
  status?: DocumentStatus
  keyword?: string
  page?: number
  size?: number
}

// ─── File upload response ──────────────────────────────────────────────────────
export interface UploadedFile {
  id: number
  documentId: number
  fileName: string
  mimeType: string
  fileSize: number
  isPrimary: boolean
  createdAt: string
}

export interface SignedUrlResponse {
  url: string
  expiresIn: number
}
