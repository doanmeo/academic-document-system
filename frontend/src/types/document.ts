// ─── Document types ────────────────────────────────────────────────────────────

export type DocumentStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'HIDDEN'
  | 'REVISION_REQUIRED'

export type DocumentTypeCode =
  | 'THESIS'
  | 'CAPSTONE'
  | 'PROJECT'
  | 'LECTURE'
  | 'EXAM'
  | 'EXERCISE'
  | 'LAB'

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
  majorId?: number
  majorName?: string
  academicYearId: number
  academicYearName: string
  uploaderId?: number
  uploaderName: string
  advisorName: string
  viewCount: number
  downloadCount: number
  primaryFileMimeType?: string
  bookmarked?: boolean
  isBookmarked?: boolean
  avgRating: number
  ratingCount: number
  userRating?: number | null
  createdAt: string
  // Trường bổ sung cho luồng kiểm duyệt & phản biện
  rejectionNote?: string | null
  revisionNote?: string | null
  pledgeAccepted?: boolean
  sharingScope?: string
  technologies?: { id: number; name: string; usageNote?: string }[]
}

// ─── Chi tiết đầy đủ tài liệu ─────────────────────────────────────────────────
export interface DocumentMember {
  id?: number
  userId?: number
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
  storageKey?: string
}

export interface DocumentDetail extends DocumentSummary {
  description: string | null
  githubUrl: string | null
  gitlabUrl: string | null
  majorId: number
  majorName: string
  technologies: { id: number; name: string; usageNote?: string }[]
  members: DocumentMember[]
  files: DocumentFile[]
  rejectionNote: string | null
  revisionNote: string | null
  updatedAt?: string
  approvedAt?: string | null
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
  majorId?: number
  academicYearId: number
  advisorName?: string
  githubUrl?: string
  gitlabUrl?: string
  pledgeAccepted?: boolean
  sharingScope?: string
  fileIds?: number[]
  memberStudentCodes?: string[]
  technologyIds?: number[]
}

export type UpdateDocumentRequest = Partial<CreateDocumentRequest>

export interface SearchDocumentParams {
  keyword?: string
  subjectId?: number
  majorId?: number
  academicYearId?: number
  type?: string
  documentTypeCode?: string
  technologyId?: number
  status?: DocumentStatus
  sortBy?: 'newest' | 'views' | 'downloads' | 'rating' | string
  sortDir?: 'asc' | 'desc'
  sort?: string
  page?: number
  size?: number
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
  documentId?: number
  fileName: string
  mimeType: string
  fileSize: number
  isPrimary: boolean
  createdAt?: string
  storageKey?: string
}

export interface SignedUrlResponse {
  url: string
  expiresIn: number
}

// ─── Citation format ───────────────────────────────────────────────────────────
export type CitationFormat = 'APA' | 'IEEE' | 'BIBTEX'

export interface CitationResponse {
  format: CitationFormat
  citation: string
}
