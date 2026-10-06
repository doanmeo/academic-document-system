import api from './axios'
import type { DocumentSummary, PageResponse } from '../types/document'
import type { Report } from '../types/admin'

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data

// ─── Bookmark API ─────────────────────────────────────────────────────────────

/**
 * POST /documents/:id/bookmark
 * Lưu tài liệu vào bộ sưu tập (chỉ tài liệu APPROVED)
 */
export const addBookmark = async (documentId: number): Promise<void> => {
  await api.post(`/documents/${documentId}/bookmark`)
}

/**
 * DELETE /documents/:id/bookmark
 * Bỏ lưu tài liệu khỏi bộ sưu tập
 */
export const removeBookmark = async (documentId: number): Promise<void> => {
  await api.delete(`/documents/${documentId}/bookmark`)
}

/**
 * GET /users/me/bookmarks
 * Danh sách tài liệu đã lưu của người dùng hiện tại
 */
export const getMyBookmarks = async (params: {
  page?: number
  size?: number
} = {}): Promise<PageResponse<DocumentSummary>> => {
  const res = await api.get('/users/me/bookmarks', { params })
  return unwrap(res)
}

// ─── Rating API ───────────────────────────────────────────────────────────────

/**
 * POST /documents/:id/rate
 * Đánh giá tài liệu từ 1 đến 5 sao
 */
export const rateDocument = async (documentId: number, score: number): Promise<void> => {
  await api.post(`/documents/${documentId}/rate`, { score })
}

// ─── Report API ───────────────────────────────────────────────────────────────

/**
 * POST /documents/:id/reports
 * Báo cáo vi phạm tài liệu
 */
export const reportDocument = async (
  documentId: number,
  payload: { reasonCode: string; description: string }
): Promise<void> => {
  await api.post(`/documents/${documentId}/reports`, payload)
}

/**
 * GET /users/me/reports
 * Danh sách báo cáo mà người dùng đã gửi
 */
export const getMyReports = async (params: {
  page?: number
  size?: number
} = {}): Promise<PageResponse<Report>> => {
  const res = await api.get('/users/me/reports', { params })
  return unwrap(res)
}
