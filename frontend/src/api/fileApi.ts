import api from './axios'
import type { UploadedFile, SignedUrlResponse } from '../types/document'

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data

// ─── File API ─────────────────────────────────────────────────────────────────

/**
 * POST /files/upload
 * Upload tệp đính kèm vào tài liệu.
 * Dùng multipart/form-data.
 */
export const uploadFile = async (
  file: File,
  documentId?: number,
  isPrimary = true,
  onProgress?: (percent: number) => void
): Promise<UploadedFile> => {
  const formData = new FormData()
  formData.append('file', file)
  if (documentId) {
    formData.append('documentId', String(documentId))
  }
  formData.append('isPrimary', String(isPrimary))

  const res = await api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total))
      }
    },
  })
  return unwrap(res)
}

/**
 * GET /files/:fileId/preview-url
 * Lấy signed URL để nhúng vào iframe PDF viewer.
 * URL có hiệu lực 300 giây.
 * Hỗ trợ fallback an toàn khi demo offline.
 */
export const getPreviewUrl = async (fileId: number): Promise<SignedUrlResponse> => {
  try {
    const res = await api.get(`/files/${fileId}/preview-url`)
    const data = unwrap<SignedUrlResponse>(res)
    if (data?.url && !data.url.includes('YOUR_PROJECT.supabase.co')) {
      return data
    }
  } catch (err) {
    // Không ném lỗi để tránh sập UI lúc demo, fallback an toàn
  }
  return { url: '/sample.pdf', expiresIn: 300 }
}

/**
 * GET /files/:fileId/download-url
 * Lấy signed URL để tải xuống tệp.
 * Tự động tăng downloadCount của tài liệu.
 */
export const getDownloadUrl = async (fileId: number): Promise<SignedUrlResponse> => {
  try {
    const res = await api.get(`/files/${fileId}/download-url`)
    const data = unwrap<SignedUrlResponse>(res)
    if (data?.url && !data.url.includes('YOUR_PROJECT.supabase.co')) {
      return data
    }
  } catch (err) {
    // Fallback an toàn
  }
  return { url: '/sample.pdf', expiresIn: 300 }
}

/**
 * DELETE /files/:fileId
 * Xóa tệp đính kèm
 */
export const deleteFile = async (fileId: number): Promise<void> => {
  await api.delete(`/files/${fileId}`)
}

export const fileApi = {
  uploadFile,
  getPreviewUrl,
  getDownloadUrl,
  deleteFile,
}
