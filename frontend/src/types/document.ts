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
  | 'SLIDE'
  | 'EXAM'
  | 'EXERCISE'
  | 'LAB'
  | 'NOTE'
  | 'REFERENCE'
  | 'OTHER'

// ─── Tóm tắt tài liệu (dùng trong danh sách / grid) ──────────────────────────
export interface DocumentSummary {
  id: number
  title: string
  abstractText: string
  status: DocumentStatus
  documentTypeCode: DocumentTypeCode
  documentTypeLabel: string
  targetYear?: string
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
  primaryFileId?: number
  primaryFileName?: string
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
  codeLanguage?: string | null
  sourceCodeSnippet?: string | null
  examDifficulty?: string | null
  examSemester?: string | null
  examTips?: string | null
  hasSolution?: boolean | null
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
  targetYear?: string
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
  targetYear?: string
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

// ─── F1: Coverage Heatmap ──────────────────────────────────────────────────────
export interface CoverageMatrix {
  subjects: { id: number; code: string; name: string }[]
  types: { code: string; label: string }[]
  cellCounts: Record<string, number>
  totalApprovedDocuments: number
}

// ─── F2: In-App Notification ──────────────────────────────────────────────────
export interface InAppNotification {
  id: number
  type: string
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}

// ─── F5: User Contribution Stats ──────────────────────────────────────────────
export interface UserStats {
  totalApproved: number
  totalPending: number
  totalViews: number
  totalDownloads: number
  avgRating: number
  totalBookmarks: number
  topSubject: string
  contributorRank: string
  badges: string[]
}

export interface CitationResponse {
  format: CitationFormat
  citation: string
}

// ─── Review Timeline & AI Generation ─────────────────────────────────────────
export interface DocumentReviewHistory {
  id: number
  decision: string
  comment: string
  actionAt: string
  reviewerName?: string
}

export interface GenerateAbstractRequest {
  title: string
  subjectName?: string
  documentType?: string
  keywords?: string[]
}

export interface GenerateAbstractResponse {
  abstractText: string
  keywords: string[]
  suggestedTargetYear?: string
}

// ─── Inline Academic Q&A ──────────────────────────────────────────────────────
export interface DocumentQA {
  id: number
  documentId: number
  userId: number
  userFullName: string
  userStudentCode: string
  parentId?: number | null
  question: string
  answer?: string | null
  pageNumber?: number | null
  upvotes: number
  createdAt: string
  replies?: DocumentQA[]
}

// ─── Study Collections ────────────────────────────────────────────────────────
export interface CollectionItem {
  id: number
  collectionId: number
  documentId: number
  documentTitle: string
  documentTypeCode: string
  documentTypeLabel: string
  subjectName: string
  note?: string | null
  sortOrder: number
  createdAt: string
}

export interface Collection {
  id: number
  userId: number
  userFullName: string
  title: string
  description?: string | null
  isPublic: boolean
  shareToken: string
  itemCount: number
  createdAt: string
  updatedAt: string
  items?: CollectionItem[]
}
