// ─── Document types ────────────────────────────────────────────────────────────

export type DocumentStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'HIDDEN'
  | 'REVISION_REQUIRED'

export type DocumentTypeCode =
  | 'SLIDE'
  | 'NOTE'
  | 'ASSIGNMENT'
  | 'SAMPLE_CODE'
  | 'REFERENCE'
  | 'THESIS'
  | 'EXAM'
  | 'LAB'
  | 'CAPSTONE'
  | 'PROJECT'
  | 'LECTURE'
  | 'EXERCISE'
  | 'OTHER'

export const OFFICIAL_DOCUMENT_TYPES = [
  { code: 'SLIDE' as const, label: 'Slide bài giảng', description: 'Slide trình chiếu bài giảng môn học của giảng viên', badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { code: 'NOTE' as const, label: 'Ghi chú ôn tập', description: 'Tóm tắt lý thuyết trọng tâm, mindmap & đề cương ôn thi', badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { code: 'ASSIGNMENT' as const, label: 'Bài tập lớn (BTL)', description: 'Báo cáo bài tập lớn, đồ án môn học chuẩn format UTC', badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { code: 'SAMPLE_CODE' as const, label: 'Mã nguồn mẫu', description: 'Source code mẫu, demo thuật toán & link GitHub/GitLab', badgeClass: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
  { code: 'REFERENCE' as const, label: 'Tài liệu tham khảo', description: 'Giáo trình chính thức, sách chuyên khảo & tài liệu đọc thêm', badgeClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  { code: 'THESIS' as const, label: 'Đồ án / Khóa luận tốt nghiệp', description: 'Báo cáo khóa luận tốt nghiệp Kỹ sư/Cử nhân đạt điểm xuất sắc', badgeClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { code: 'EXAM' as const, label: 'Đề thi & Lời giải', description: 'Tuyển tập đề thi kết thúc học phần, giữa kỳ kèm đáp án', badgeClass: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  { code: 'LAB' as const, label: 'Hướng dẫn Lab & Thực hành', description: 'Tài liệu hướng dẫn thực hành phòng máy, lab Cisco, Linux', badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
]

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
