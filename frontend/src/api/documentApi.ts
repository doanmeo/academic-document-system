// === LUỒNG 2: TRA CỨU & KHÁM PHÁ HỌC LIỆU ĐA CHIỀU (Search & Filter Flow) ===
// === LUỒNG 3: XEM CHI TIẾT & TƯƠNG TÁC HỌC LIỆU (Document Detail & Interaction Flow) ===
// Các hàm gọi API tương tác với Học liệu, Tìm kiếm, Xem chi tiết, Trích dẫn
import api from './axios'
import type {
  DocumentDetail,
  DocumentSummary,
  PageResponse,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  SearchDocumentParams,
  MyDocumentsParams,
  CitationFormat,
  CitationResponse,
} from '../types/document'

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data

// ─── Document API ─────────────────────────────────────────────────────────────

/**
 * GET /documents/search hoặc GET /documents
 * Tìm kiếm & lọc tài liệu
 */
export const searchDocuments = async (
  params: SearchDocumentParams = {}
): Promise<PageResponse<DocumentSummary>> => {
  // Chuẩn hóa query params: hỗ trợ cả sortBy/sortDir và documentTypeCode/type
  const queryParams: Record<string, any> = { ...params }
  if (params.documentTypeCode && !params.type) {
    queryParams.type = params.documentTypeCode
  }
  if (params.sortBy) {
    if (params.sortBy === 'newest') queryParams.sort = 'createdAt,desc'
    else if (params.sortBy === 'views') queryParams.sort = 'viewCount,desc'
    else if (params.sortBy === 'downloads') queryParams.sort = 'downloadCount,desc'
    else if (params.sortBy === 'rating') queryParams.sort = 'avgRating,desc'
  }

  try {
    const res = await api.get('/documents/search', { params: queryParams })
    return unwrap(res)
  } catch (err: any) {
    // Fallback sang GET /documents nếu /documents/search không có
    if (err.response?.status === 404) {
      const res = await api.get('/documents', { params: queryParams })
      return unwrap(res)
    }
    throw err
  }
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
 */
export const createDocument = async (
  payload: CreateDocumentRequest
): Promise<{ id: number; [key: string]: any }> => {
  const res = await api.post('/documents', payload)
  return unwrap(res)
}

/**
 * PUT /documents/:id
 * Cập nhật tài liệu
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
export const submitDocument = async (id: number): Promise<DocumentDetail | void> => {
  const res = await api.post(`/documents/${id}/submit`)
  return res.data?.data
}

/**
 * PUT /documents/:id/resubmit
 * Nộp lại tài liệu sau khi chỉnh sửa kèm revisionNote (changelog)
 */
export const resubmitDocument = async (
  id: number,
  revisionNote: string
): Promise<DocumentDetail> => {
  try {
    const res = await api.put(`/documents/${id}/resubmit`, { revisionNote })
    return unwrap(res)
  } catch (err: any) {
    // Fallback nếu endpoint resubmit riêng chưa sẵn sàng: update note rồi submit
    if (err.response?.status === 404 || err.response?.status === 405) {
      await updateDocument(id, { abstractText: undefined } as any)
      const submitRes = await submitDocument(id)
      return (submitRes as DocumentDetail) || (await getDocument(id))
    }
    throw err
  }
}

/**
 * DELETE /documents/:id
 * Xóa mềm tài liệu
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

/**
 * Helper: Tạo trích dẫn chuẩn client-side (fallback an toàn khi mạng/BE chưa có)
 */
export const generateClientCitation = (
  doc: Partial<DocumentDetail>,
  format: CitationFormat
): string => {
  const author = doc.uploaderName || 'Khoa CNTT - UTC'
  const title = doc.title || 'Học liệu Khoa CNTT'
  const year = doc.academicYearName ? doc.academicYearName.split('-')[0] : '2025'
  const typeLabel = doc.documentTypeLabel || 'Tài liệu học thuật'
  const url = `${window.location.origin}/documents/${doc.id || 1}`

  if (format === 'APA') {
    return `${author}. (${year}). ${title} [${typeLabel}, Khoa Công nghệ Thông tin, Trường Đại học Giao thông Vận tải]. ${url}`
  }

  if (format === 'IEEE') {
    // Chuyển "Nguyễn Văn An" thành "N. V. An"
    const parts = author.trim().split(/\s+/)
    let abbreviated = author
    if (parts.length >= 2) {
      const initials = parts.slice(0, -1).map((p) => p[0].toUpperCase() + '.').join(' ')
      abbreviated = `${initials} ${parts[parts.length - 1]}`
    }
    return `${abbreviated}, "${title}," ${typeLabel}, Khoa CNTT, ĐH Giao thông Vận tải, Hà Nội, ${year}. [Online]. Available: ${url}`
  }

  // BIBTEX
  const citeKey = `utc_fit_${doc.id || 'doc'}_${year}`
  return `@misc{${citeKey},
  author = {${author}},
  title = {${title}},
  howpublished = {Khoa Công nghệ Thông tin, Trường Đại học Giao thông Vận tải},
  year = {${year}},
  note = {${typeLabel}},
  url = {${url}}
}`
}

/**
 * GET /documents/:id/citation?format=APA|IEEE|BIBTEX
 * Sinh trích dẫn học thuật
 */
export const getCitation = async (
  id: number,
  format: CitationFormat,
  fallbackDoc?: Partial<DocumentDetail>
): Promise<CitationResponse> => {
  try {
    const res = await api.get(`/documents/${id}/citation`, { params: { format } })
    const data = unwrap<CitationResponse>(res)
    if (data && data.citation) return data
  } catch (err) {
    // Fallback sang sinh client-side nếu BE chưa có endpoint hoặc lỗi mạng
  }

  if (fallbackDoc) {
    return {
      format,
      citation: generateClientCitation(fallbackDoc, format),
    }
  }

  // Nếu không truyền fallbackDoc, fetch doc rồi sinh
  try {
    const doc = await getDocument(id)
    return {
      format,
      citation: generateClientCitation(doc, format),
    }
  } catch {
    return {
      format,
      citation: generateClientCitation({ id }, format),
    }
  }
}

/**
 * POST /documents/:id/rate
 */
export const rateDocument = async (id: number, score: number): Promise<void> => {
  await api.post(`/documents/${id}/rate`, { score })
}

/**
 * POST /documents/:id/bookmark
 */
export const addBookmark = async (id: number): Promise<void> => {
  await api.post(`/documents/${id}/bookmark`)
}

/**
 * DELETE /documents/:id/bookmark
 */
export const removeBookmark = async (id: number): Promise<void> => {
  await api.delete(`/documents/${id}/bookmark`)
}

/**
 * POST /documents/:id/reports
 */
export const reportDocument = async (
  id: number,
  payload: { reasonCode?: string; description?: string; reason?: string } | string,
  descArg?: string
): Promise<void> => {
  let reasonCode = 'COPYRIGHT'
  let description = ''

  if (typeof payload === 'string') {
    reasonCode = payload || 'COPYRIGHT'
    description = descArg || ''
  } else if (payload && typeof payload === 'object') {
    reasonCode = payload.reasonCode || 'COPYRIGHT'
    description = payload.description || payload.reason || ''
  }

  const body = {
    reasonCode,
    description,
  }
  await api.post(`/documents/${id}/reports`, body)
}

/**
 * GET /documents/:id/related
 * Lấy danh sách học liệu cùng mạch học thuật (cùng môn, cùng GVHD, cùng ngành)
 */
export const getRelatedDocuments = async (
  id: number,
  limit = 4
): Promise<import('../types/document').RelatedDocument[]> => {
  const res = await api.get(`/documents/${id}/related`, { params: { limit } })
  return unwrap(res)
}

/**
 * POST /documents/check-similarity
 * Kiểm tra tương đồng và phát hiện trùng lặp đề tài khi sinh viên nhập
 */
export const checkSimilarity = async (
  payload: import('../types/document').SimilarityCheckParams
): Promise<import('../types/document').RelatedDocument[]> => {
  const res = await api.post('/documents/check-similarity', payload)
  return unwrap(res)
}


/**
 * POST /documents/compare-topics
 * Phân tích độ trùng lặp và tính mới của đề tài nghiên cứu / đồ án
 */
export const compareTopics = async (
  payload: import('../types/document').TopicComparisonRequest
): Promise<import('../types/document').TopicComparisonResult> => {
  const res = await api.post('/documents/compare-topics', payload)
  return unwrap(res)
}


/**
 * POST /documents/generate-abstract
 * AI hỗ trợ sinh tóm tắt đề tài học thuật (F4: Gemini AI / Rule-based)
 */
export const generateAbstract = async (
  payload: import('../types/document').GenerateAbstractRequest
): Promise<import('../types/document').GenerateAbstractResponse> => {
  const res = await api.post('/documents/generate-abstract', payload)
  return unwrap(res)
}

/**
 * POST /documents/generate-abstract-from-file
 * Đọc 2-3 trang đầu tệp PDF và dùng AI sinh tóm tắt học thuật chính xác (Gemini & OpenRouter failover)
 */
export const generateAbstractFromFile = async (
  file: File,
  title?: string,
  subjectName?: string,
  documentTypeCode?: string
): Promise<import('../types/document').GenerateAbstractResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  if (title) formData.append('title', title)
  if (subjectName) formData.append('subjectName', subjectName)
  if (documentTypeCode) formData.append('documentTypeCode', documentTypeCode)

  const res = await api.post('/documents/generate-abstract-from-file', formData)
  return unwrap(res)
}

/**
 * GET /documents/:id/reviews
 * Lấy lịch sử thẩm định (Review Timeline) của tài liệu (U4)
 */
export const getDocumentReviews = async (
  id: number
): Promise<import('../types/document').DocumentReviewHistory[]> => {
  const res = await api.get(`/documents/${id}/reviews`)
  return unwrap(res)
}

// Named object export để tương thích với các component gọi documentApi.method()
export const documentApi = {
  search: searchDocuments,
  searchDocuments,
  getDocuments: searchDocuments,
  get: getDocument,
  getById: getDocument,
  getDocument,
  getRelated: getRelatedDocuments,
  getRelatedDocuments,
  checkSimilarity,
  compareTopics,
  generateAbstract,
  generateAbstractFromFile,
  getDocumentReviews,
  create: createDocument,
  createDocument,
  update: updateDocument,
  updateDocument,
  submit: submitDocument,
  submitDocument,
  resubmit: resubmitDocument,
  resubmitDocument,
  delete: deleteDocument,
  deleteDocument,
  getMy: getMyDocuments,
  getMyDocuments,
  getCitation,
  rate: rateDocument,
  rateDocument,
  addBookmark,
  removeBookmark,
  bookmark: addBookmark,
  unbookmark: removeBookmark,
  report: reportDocument,
  reportDocument,
}

