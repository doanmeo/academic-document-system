import { useState, useEffect } from 'react'
import { fileApi } from '../api/fileApi'

interface PdfViewerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  fileId?: number
  fileUrl?: string
  fileName?: string
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  title,
  fileId,
  fileUrl,
  fileName,
}: PdfViewerModalProps) {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(fileUrl || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setResolvedUrl(null)
      setError(null)
      return
    }

    if (fileUrl) {
      setResolvedUrl(fileUrl)
      setError(null)
      return
    }

    if (fileId) {
      setLoading(true)
      setError(null)
      fileApi
        .getPreviewUrl(fileId)
        .then((res) => {
          if (res.success && res.data?.url) {
            setResolvedUrl(res.data.url)
          } else {
            setError('Không thể lấy liên kết xem trước tệp')
          }
        })
        .catch(() => {
          setError('Không thể tải tệp xem trước từ hệ thống lưu trữ')
        })
        .finally(() => setLoading(false))
    } else {
      setError('Tài liệu chưa có tệp đính kèm để xem trước')
    }
  }, [isOpen, fileId, fileUrl])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="bg-slate-800 text-white px-6 py-3 border-b border-slate-700 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3 max-w-xl">
          <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold truncate text-slate-100">{title}</h3>
            {fileName && <p className="text-[11px] text-slate-400 truncate">{fileName}</p>}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-700/60 rounded-lg p-0.5 border border-slate-600 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="px-2 py-1 hover:bg-slate-600 rounded text-slate-300"
              title="Thu nhỏ"
            >
              -
            </button>
            <span className="px-2 font-mono text-slate-300">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
              className="px-2 py-1 hover:bg-slate-600 rounded text-slate-300"
              title="Phóng to"
            >
              +
            </button>
          </div>

          {resolvedUrl && (
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={fileName || 'document.pdf'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Tải về
            </a>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Đóng trình xem"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Viewer Body */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 bg-slate-900">
        {loading ? (
          <div className="text-white text-xs font-mono animate-pulse">
            Đang tải tài liệu từ máy chủ lưu trữ...
          </div>
        ) : error ? (
          <div className="text-slate-300 text-xs bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center max-w-md shadow-lg space-y-2">
            <p className="font-bold text-rose-400">Không thể xem tài liệu</p>
            <p className="text-slate-400">{error}</p>
          </div>
        ) : resolvedUrl ? (
          <iframe
            src={resolvedUrl}
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms"
            className="w-full h-full max-w-5xl rounded-lg shadow-2xl bg-white border border-slate-700 transition-all duration-200"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          />
        ) : null}
      </div>
    </div>
  )
}
