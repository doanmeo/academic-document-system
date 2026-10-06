import api from './axios'
import type { UploadedFile, SignedUrlResponse } from '../types/document'

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data

// ─── File API ─────────────────────────────────────────────────────────────────

/**
 * POST /files/upload
 * Upload tệp đính kèm vào tài liệu.
 * Dùng multipart/form-data, tối đa 25MB.
 * @param file        File object từ input[type=file]
 * @param documentId  ID tài liệu đích
 * @param isPrimary   Đánh dấu là file chính (default true)
 * @param onProgress  Callback tiến trình upload (0–100)
 */
export const uploadFile = async (
  file: File,
  documentId: number,
  isPrimary = true,
  onProgress?: (percent: number) => void
): Promise<UploadedFile> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentId', String(documentId))
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
 */
export const getPreviewUrl = async (fileId: number): Promise<SignedUrlResponse> => {
  const res = await api.get(`/files/${fileId}/preview-url`)
  return unwrap(res)
}

/**
 * GET /files/:fileId/download-url
 * Lấy signed URL để tải xuống tệp.
 * Tự động tăng downloadCount của tài liệu.
 */
export const getDownloadUrl = async (fileId: number): Promise<SignedUrlResponse> => {
  const res = await api.get(`/files/${fileId}/download-url`)
  return unwrap(res)
}

/**
 * DELETE /files/:fileId
 * Xóa tệp đính kèm (chỉ khi tài liệu còn ở trạng thái DRAFT).
 */
export const deleteFile = async (fileId: number): Promise<void> => {
  await api.delete(`/files/${fileId}`)
}
