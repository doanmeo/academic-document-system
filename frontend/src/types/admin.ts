import type { User } from './auth'
import type { DocumentSummary } from './document'

// ─── Admin types ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalDocuments: number
  pendingDocuments: number
  totalUsers: number
  totalReports: number
  pendingReports: number
  /** BE trả về Map<String, Long> nên dùng Record động */
  documentsByStatus: Record<string, number>
  topDocuments: DocumentSummary[]
  recentDocuments: DocumentSummary[]
}

// ─── Review history ────────────────────────────────────────────────────────────
export interface ReviewHistory {
  id: number
  reviewerName: string
  fromStatus: string
  toStatus: string
  comment: string | null
  createdAt: string
}

// ─── Report ────────────────────────────────────────────────────────────────────
export type ReportStatus = 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED'

export interface Report {
  id: number
  documentId: number
  documentTitle: string
  reporterId: number
  reporterName: string
  reasonCode: string
  /** Nhãn hiển thị của reasonCode (từ LOV) */
  reasonLabel: string | null
  description: string
  status: ReportStatus
  /** Ghi chú xử lý của admin — BE field: handlingNote */
  handlingNote: string | null
  /** Tên admin đã xử lý */
  handledBy: string | null
  handledAt: string | null
  createdAt: string
}

// ─── Request payloads ──────────────────────────────────────────────────────────
export interface ApproveRequest {
  note?: string
}

export interface RejectRequest {
  note: string
}

export interface RevisionRequest {
  note: string
}

export interface HideDocumentRequest {
  reason: string
}

export interface HandleReportRequest {
  decision: ReportStatus
  note: string
  hideDocument?: boolean
}

export interface ToggleActiveRequest {
  active: boolean
}

// ─── Re-export User cho Admin pages ───────────────────────────────────────────
export type { User }
