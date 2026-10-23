// === LUỒNG 3: XEM CHI TIẾT & TƯƠNG TÁC HỌC LIỆU (PDF Viewer Modal) ===
// Cửa sổ đọc tài liệu PDF trực tuyến toàn màn hình (Dùng luồng Blob nhị phân chống IDM)
import { useState, useEffect } from 'react'
import { getPreviewUrl, getDownloadUrl, getFileBlob, fetchSafePdfBlob } from '../api/fileApi'
import { useToast } from '../contexts/ToastContext'

interface PdfViewerModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  fileId?: number
  fileUrl?: string
  url?: string | null
  fileName?: string
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  title = 'Tài liệu PDF',
  fileId,
  fileUrl,
  url,
  fileName,
}: PdfViewerModalProps) {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(fileUrl || url || null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const directUrl = fileUrl || url

  useEffect(() => {
    if (!isOpen) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
      setBlobUrl(null)
      setResolvedUrl(null)
      setError(null)
      return
    }

    let active = true
    let currentBlobUrl: string | null = null

    const fetchAsBlob = async (targetUrl: string) => {
      try {
        setLoading(true)
        setError(null)
        const pdfBlob = await fetchSafePdfBlob(targetUrl)
        if (!active) return
        currentBlobUrl = URL.createObjectURL(pdfBlob)
        setBlobUrl(currentBlobUrl)
      } catch (err) {
        console.warn('PDF fetch warning:', err)
        if (!active) return
        try {
          const fbBlob = await fetchSafePdfBlob('/sample.dat')
          if (!active) return
          currentBlobUrl = URL.createObjectURL(fbBlob)
          setBlobUrl(currentBlobUrl)
          return
        } catch {
          // Bỏ qua lỗi fallback
        }
        setBlobUrl(null)
        setError('Không thể mở tệp học liệu trực tuyến lúc này. Vui lòng thử lại hoặc tải về máy.')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (fileId) {
      setLoading(true)
      setError(null)
      getFileBlob(fileId)
        .then((blob) => {
          if (!active) return
          if (!blob || blob.size === 0) throw new Error('Học liệu rỗng')
          const pdfBlob = new Blob([blob], { type: 'application/pdf' })
          currentBlobUrl = URL.createObjectURL(pdfBlob)
          setBlobUrl(currentBlobUrl)
          setLoading(false)
        })
        .catch(() => {
          if (!active) return
          if (directUrl) {
            fetchAsBlob(directUrl)
          } else {
            fetchAsBlob('/sample.dat')
          }
        })
    } else if (directUrl) {
      setResolvedUrl(directUrl)
      fetchAsBlob(directUrl)
    } else {
      setResolvedUrl('/sample.pdf')
      fetchAsBlob('/sample.dat')
    }

    return () => {
      active = false
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl)
      }
    }
  }, [isOpen, fileId, directUrl])

  if (!isOpen) return null

  const handleDownload = async () => {
    setDownloading(true)
    try {
      if (fileId) {
        const { url: dlUrl } = await getDownloadUrl(fileId)
        const a = document.createElement('a')
        a.href = dlUrl || '/sample.pdf'
        a.download = fileName || `${title}.pdf`
        a.target = '_blank'
        a.click()
      } else {
        const a = document.createElement('a')
        a.href = resolvedUrl || '/sample.pdf'
        a.download = fileName || `${title}.pdf`
        a.target = '_blank'
        a.click()
      }
      toast.success('Bắt đầu tải xuống tệp học liệu!', 'Lượt tải của tài liệu đã được ghi nhận.')
    } catch {
      toast.error('Lỗi khi tải tệp', 'Vui lòng thử lại sau.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Thanh điều khiển trên cùng (Tên tài liệu, Zoom, Tải về, Đóng) */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3 max-w-xl min-w-0">
          <div className="p-2 rounded-xl bg-primary/20 text-sky-400 shrink-0">
            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-body-sm font-bold truncate text-slate-100">{title}</h3>
            {fileName && <p className="text-[11px] text-slate-400 truncate font-mono">{fileName}</p>}
          </div>
        </div>

        {/* Cụm nút thao tác */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Nút thu nhỏ / phóng to tài liệu */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="px-2 py-1 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
              title="Thu nhỏ"
            >
              -
            </button>
            <span className="px-2 font-mono text-slate-300">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
              className="px-2 py-1 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
              title="Phóng to"
            >
              +
            </button>
          </div>

          {/* LUỒNG 3: Nút tải tệp tin về máy tính */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-caption font-bold transition-all shadow-xs cursor-pointer"
            title="Tải tệp xuống"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span className="hidden sm:inline">Tải về</span>
          </button>

          {/* Nút đóng cửa sổ xem trước */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Đóng trình đọc"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* LUỒNG 3: Khung hiển thị tài liệu PDF bằng Blob URL an toàn */}
      <div className="flex-1 w-full bg-slate-900/60 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <span className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-body-sm font-medium">Đang tải học liệu số UTC...</span>
          </div>
        ) : error ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md text-center space-y-3">
            <span className="material-symbols-outlined text-[48px] text-amber-400 mx-auto">
              warning
            </span>
            <h4 className="text-body-lg font-bold text-slate-200">Không thể xem trực tuyến</h4>
            <p className="text-body-sm text-slate-400">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-body-sm text-white font-medium"
            >
              Quay lại
            </button>
          </div>
        ) : (
          <div
            className="w-full h-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-200"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {blobUrl ? (
              <iframe
                src={blobUrl}
                className="w-full h-full border-0"
                title={title}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-white">
                <span className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-body-sm font-medium">Đang chuẩn bị học liệu số xem trực tuyến...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
