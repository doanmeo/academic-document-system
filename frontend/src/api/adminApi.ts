import api from './axios'
import type { DocumentSummary, PageResponse } from '../types/document'
import type {
  DashboardStats,
  ReviewHistory,
  Report,
  ApproveRequest,
  RejectRequest,
  RevisionRequest,
  HideDocumentRequest,
  HandleReportRequest,
  ToggleActiveRequest,
  User,
} from '../types/admin'
import type { Subject, Major, AcademicYear, Technology } from '../types/catalog'

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data

// ─── Dashboard ────────────────────────────────────────────────────────────────

/** GET /admin/dashboard */
export const getDashboard = async (): Promise<DashboardStats> => {
  const res = await api.get('/admin/dashboard')
  return unwrap(res)
}

// ─── Document management ──────────────────────────────────────────────────────

/** GET /admin/documents/pending */
export const getPendingDocuments = async (params: {
  page?: number
  size?: number
  keyword?: string
} = {}): Promise<PageResponse<DocumentSummary>> => {
  const res = await api.get('/admin/documents/pending', { params })
  return unwrap(res)
}

/** GET /admin/documents */
export const getAllDocuments = async (params: {
  status?: string
  keyword?: string
  page?: number
  size?: number
} = {}): Promise<PageResponse<DocumentSummary>> => {
  const res = await api.get('/admin/documents', { params })
  return unwrap(res)
}

/** POST /admin/documents/:id/approve */
export const approveDocument = async (
  id: number,
  payload: ApproveRequest = {}
): Promise<void> => {
  await api.post(`/admin/documents/${id}/approve`, payload)
}

/** POST /admin/documents/:id/reject */
export const rejectDocument = async (
  id: number,
  payload: RejectRequest
): Promise<void> => {
  await api.post(`/admin/documents/${id}/reject`, payload)
}

/** POST /admin/documents/:id/request-revision */
export const requestRevision = async (
  id: number,
  payload: RevisionRequest
): Promise<void> => {
  await api.post(`/admin/documents/${id}/request-revision`, payload)
}

/** POST /admin/documents/:id/hide */
export const hideDocument = async (
  id: number,
  payload: HideDocumentRequest
): Promise<void> => {
  await api.post(`/admin/documents/${id}/hide`, payload)
}

/** GET /admin/documents/:id/reviews */
export const getDocumentReviews = async (id: number): Promise<ReviewHistory[]> => {
  const res = await api.get(`/admin/documents/${id}/reviews`)
  return unwrap(res)
}

// ─── Reports ──────────────────────────────────────────────────────────────────

/** GET /admin/reports */
export const getAdminReports = async (params: {
  status?: string
  page?: number
  size?: number
} = {}): Promise<PageResponse<Report>> => {
  const res = await api.get('/admin/reports', { params })
  return unwrap(res)
}

/** POST /admin/reports/:id/handle */
export const handleReport = async (
  id: number,
  payload: HandleReportRequest
): Promise<void> => {
  await api.post(`/admin/reports/${id}/handle`, payload)
}

// ─── User management ──────────────────────────────────────────────────────────

/** GET /admin/users */
export const getAdminUsers = async (params: {
  role?: string
  active?: boolean
  keyword?: string
  page?: number
  size?: number
} = {}): Promise<PageResponse<User>> => {
  const res = await api.get('/admin/users', { params })
  return unwrap(res)
}

/** PATCH /admin/users/:id/active */
export const toggleUserActive = async (
  id: number,
  payload: ToggleActiveRequest
): Promise<void> => {
  await api.patch(`/admin/users/${id}/active`, payload)
}

// ─── Catalog CRUD (Admin) ─────────────────────────────────────────────────────

export const createSubject = async (body: Omit<Subject, 'id'>): Promise<Subject> => {
  const res = await api.post('/admin/subjects', body)
  return unwrap(res)
}
export const updateSubject = async (id: number, body: Omit<Subject, 'id'>): Promise<Subject> => {
  const res = await api.put(`/admin/subjects/${id}`, body)
  return unwrap(res)
}
export const deleteSubject = async (id: number): Promise<void> => {
  await api.delete(`/admin/subjects/${id}`)
}

export const createMajor = async (body: Omit<Major, 'id'>): Promise<Major> => {
  const res = await api.post('/admin/majors', body)
  return unwrap(res)
}
export const updateMajor = async (id: number, body: Omit<Major, 'id'>): Promise<Major> => {
  const res = await api.put(`/admin/majors/${id}`, body)
  return unwrap(res)
}
export const deleteMajor = async (id: number): Promise<void> => {
  await api.delete(`/admin/majors/${id}`)
}

export const createAcademicYear = async (
  body: Omit<AcademicYear, 'id'>
): Promise<AcademicYear> => {
  const res = await api.post('/admin/academic-years', body)
  return unwrap(res)
}
export const updateAcademicYear = async (
  id: number,
  body: Omit<AcademicYear, 'id'>
): Promise<AcademicYear> => {
  const res = await api.put(`/admin/academic-years/${id}`, body)
  return unwrap(res)
}
export const deleteAcademicYear = async (id: number): Promise<void> => {
  await api.delete(`/admin/academic-years/${id}`)
}

export const createTechnology = async (body: Omit<Technology, 'id'>): Promise<Technology> => {
  const res = await api.post('/admin/technologies', body)
  return unwrap(res)
}
export const updateTechnology = async (
  id: number,
  body: Omit<Technology, 'id'>
): Promise<Technology> => {
  const res = await api.put(`/admin/technologies/${id}`, body)
  return unwrap(res)
}
export const deleteTechnology = async (id: number): Promise<void> => {
  await api.delete(`/admin/technologies/${id}`)
}
