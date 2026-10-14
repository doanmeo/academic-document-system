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
  verificationCode?: string | null
  facultyUnit?: string | null
  futureWorkSuggestions?: string | null
}

// ─── Sổ tay học phần & Gói học liệu chuẩn Bộ môn (Course Hub) ─────────────────
export interface CourseHub {
  subject: {
    id: number
    code: string
    name: string
  }
  totalDocuments: number
  totalLectures: number
  totalLabs: number
  totalProjects: number
  totalExams: number
  lectures: DocumentSummary[]
  labs: DocumentSummary[]
  projects: DocumentSummary[]
  exams: DocumentSummary[]
  instructorAdvisors: string[]
}

// ─── Đối soát đề tài & Đánh giá tính mới ─────────────────────────────────────
export interface TopicComparisonRequest {
  title: string
  subjectId?: number
  majorId?: number
  advisorName?: string
  expectedMethodology?: string
}

export interface MatchedDocumentDTO {
  id: number
  title: string
  advisorName?: string
  academicYearName?: string
  subjectName?: string
  similarityScore: number
  overlappingAspects: string
  githubUrl?: string
}

export interface TopicComparisonResult {
  overallOverlapScore: number
  riskLevel: 'LOW_DUPLICATION' | 'MEDIUM_SIMILARITY' | 'HIGH_DUPLICATION_RISK' | string
  verdict: string
  matchedDocuments: MatchedDocumentDTO[]
  noveltyRecommendations: string[]
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
  advisorName?: string
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

export interface RelatedDocument {
  id: number
  title: string
  documentTypeCode: string
  documentTypeLabel: string
  subjectId: number
  subjectName: string
  majorId?: number
  majorName?: string
  advisorName?: string
  academicYearName?: string
  avgRating: number
  viewCount: number
  downloadCount: number
  matchReason: string
  similarityScore: number
}

export interface SimilarityCheckParams {
  currentDocumentId?: number
  title: string
  subjectId?: number
  majorId?: number
  advisorName?: string
  documentTypeCode?: string
  abstractText?: string
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
