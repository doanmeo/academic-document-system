import api from './axios'
import type {
  DocumentDetail,
  DocumentSummary,
  PageResponse,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  SearchDocumentParams,
  MyDocumentsParams,
} from '../types/document'

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data

// ─── Document API ─────────────────────────────────────────────────────────────

/**
 * GET /documents/search
 * Tìm kiếm & lọc tài liệu — dùng cho Trang chủ
 */
export const searchDocuments = async (
  params: SearchDocumentParams = {}
): Promise<PageResponse<DocumentSummary>> => {
  const res = await api.get('/documents/search', { params })
  return unwrap(res)
}

/**
 * GET /documents/:id
 * Lấy chi tiết đầy đủ tài liệu, tự động tăng viewCount
 */
export const getDocument = async (id: number): Promise<DocumentDetail> => {
  const res = await api.get(`/documents/${id}`)
  return unwrap(res)
}

/**
 * POST /documents
 * Tạo tài liệu mới (trạng thái DRAFT)
 * @returns id của tài liệu vừa tạo
 */
export const createDocument = async (
  payload: CreateDocumentRequest
): Promise<{ id: number }> => {
  const res = await api.post('/documents', payload)
  return unwrap(res)
}

/**
 * PUT /documents/:id
 * Cập nhật tài liệu (chỉ khi DRAFT hoặc REJECTED)
 */
export const updateDocument = async (
  id: number,
  payload: UpdateDocumentRequest
): Promise<DocumentDetail> => {
  const res = await api.put(`/documents/${id}`, payload)
  return unwrap(res)
}

/**
 * POST /documents/:id/submit
 * Nộp tài liệu đi xét duyệt (DRAFT/REJECTED → PENDING)
 */
export const submitDocument = async (id: number): Promise<void> => {
  await api.post(`/documents/${id}/submit`)
}

/**
 * DELETE /documents/:id
 * Xóa mềm tài liệu (DRAFT/REJECTED → HIDDEN)
 */
export const deleteDocument = async (id: number): Promise<void> => {
  await api.delete(`/documents/${id}`)
}

/**
 * GET /documents/my
 * Danh sách tài liệu của người dùng hiện tại
 */
export const getMyDocuments = async (
  params: MyDocumentsParams = {}
): Promise<PageResponse<DocumentSummary>> => {
  const res = await api.get('/documents/my', { params })
  return unwrap(res)
}
