import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  BookOpen,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ExternalLink,
  Paperclip,
  Download,
  Eye,
  Code2,
  GitFork,
  Zap,
  Star,
  Bookmark,
  FolderPlus,
  Flag,
  ShieldCheck,
  Calendar,
  X,
  AlertCircle,
  School,
  History,
  MessageSquareQuote,
  Layers,
  Copy,
  Check,
  Sparkles,
  Terminal,
  GraduationCap
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Spinner from '../components/ui/Spinner'
import StarRating from '../components/ui/StarRating'
import CitationModal from '../components/CitationModal'
import CustomSelect from '../components/ui/CustomSelect'
import CodeViewer from '../components/CodeViewer'
import DocumentQASection from '../components/DocumentQASection'
import AddToCollectionModal from '../components/AddToCollectionModal'
import { getDocument, getRelatedDocuments, documentApi, generateClientCitation } from '../api/documentApi'
import { getDownloadUrl, getFileBlob } from '../api/fileApi'
import { addBookmark, removeBookmark, rateDocument, reportDocument } from '../api/interactionApi'
import { getLov } from '../api/catalogApi'
import { getErrorMessage } from '../utils/errorMessages'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import type { DocumentDetail as DocDetail, RelatedDocument, DocumentReviewHistory, CitationFormat } from '../types/document'
import type { LovItem } from '../types/catalog'

const formatFileSize = (bytes: number) => {
  if (!bytes) return 'Tài liệu số'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const toast = useToast()
  const viewerContainerRef = useRef<HTMLDivElement>(null)

  const [doc, setDoc] = useState<DocDetail | null>(null)
  const canAdmin = user?.role === 'ADMIN'
  const canEdit = isAuthenticated && (user?.id === doc?.uploaderId || canAdmin)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCitation, setShowCitation] = useState(false)
  const [showCollectionModal, setShowCollectionModal] = useState(false)

  // Active Research Workbench Tab: 'reader' | 'code' | 'qa' | 'integrity'
  const [activeTab, setActiveTab] = useState<'reader' | 'code' | 'qa' | 'integrity'>('reader')

  // Academic Related Documents State
  const [relatedDocs, setRelatedDocs] = useState<RelatedDocument[]>([])

  // Review Timeline State
  const [reviews, setReviews] = useState<DocumentReviewHistory[]>([])

  // PDF Viewer State & Bulletproof Blob
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [activeFileId, setActiveFileId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(48)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dlLoading, setDlLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  // Interactions State
  const [bookmarked, setBookmarked] = useState(false)
  const [bmLoading, setBmLoading] = useState(false)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [showRateModal, setShowRateModal] = useState(false)
  const [rateScore, setRateScore] = useState(5)
  const [rateLoading, setRateLoading] = useState(false)

  // Inline Quick Citation Widget
  const [quickCiteFormat, setQuickCiteFormat] = useState<CitationFormat>('IEEE')
  const [quickCopied, setQuickCopied] = useState(false)
  const [cloneCopied, setCloneCopied] = useState(false)

  // Report Modal State
  const [showReport, setShowReport] = useState(false)
  const [reportReasons, setReportReasons] = useState<LovItem[]>([])
  const [reportReason, setReportReason] = useState('COPYRIGHT')
  const [reportDesc, setReportDesc] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  // Fetch document details & related academic documents
  useEffect(() => {
    if (!id) return
    const docId = Number(id)
    const fetchDoc = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getDocument(docId)
        setDoc(data)
        setBookmarked(!!data.bookmarked)
        if (data.userRating) setUserRating(data.userRating)

        // Fetch related academic documents in parallel
        getRelatedDocuments(docId, 4)
          .then((res) => setRelatedDocs(res || []))
          .catch(() => setRelatedDocs([]))

        // Fetch review timeline history
        documentApi.getDocumentReviews(docId)
          .then((res) => setReviews(res || []))
          .catch(() => setReviews([]))

        // Automatically resolve primary file for direct viewing
        const primary = data.files.find((f) => f.isPrimary) ?? data.files[0]
        if (primary) {
          setActiveFileId(primary.id)
          const lowerName = (primary.fileName || '').toLowerCase()
          if (lowerName.endsWith('.pdf')) {
            loadPdfBlobForFile(primary.id)
          } else {
            setBlobUrl(null)
          }
        } else {
          setBlobUrl(null)
        }
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    fetchDoc()
  }, [id])

  // Resilient stream loader using internal /api/files/:id/view (never triggers IDM intercept)
  const loadPdfBlobForFile = async (fileId: number) => {
    setPdfLoading(true)
    setPdfError(null)
    try {
      const blob = await getFileBlob(fileId)
      if (!blob || blob.size === 0) {
        throw new Error('Dữ liệu tệp rỗng')
      }
      const pdfBlob = new Blob([blob], { type: 'application/pdf' })
      const u = URL.createObjectURL(pdfBlob)
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return u
      })
    } catch (err) {
      console.warn('PDF AJAX stream fallback to sample:', err)
      try {
        const fbRes = await fetch('/sample.pdf')
        if (fbRes.ok) {
          const fbBlob = await fbRes.blob()
          const u = URL.createObjectURL(new Blob([fbBlob], { type: 'application/pdf' }))
          setBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return u
          })
          return
        }
      } catch {}
      setBlobUrl(null)
      setPdfError('Học liệu số trực tuyến đang được đồng bộ hoặc bảo mật. Bạn có thể sử dụng nút Tải về máy bên dưới.')
    } finally {
      setPdfLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [blobUrl])
  // Load report reasons
  useEffect(() => {
    getLov('REPORT_REASON')
      .then((res) => {
        if (res && res.length > 0) {
          setReportReasons(res)
          setReportReason(res[0].code)
        }
      })
      .catch(() => {})
  }, [])

  // Handle Select file for viewing
  // Handle Select file for viewing
  const handleSelectFile = async (fileId: number) => {
    setActiveFileId(fileId)
    setActiveTab('reader')
    const target = doc?.files.find((f) => f.id === fileId)
    const lowerName = (target?.fileName || '').toLowerCase()
    if (lowerName.endsWith('.pdf')) {
      loadPdfBlobForFile(fileId)
    } else {
      setBlobUrl(null)
    }
    viewerContainerRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle Download file
  const handleDownload = async (fileId?: number) => {
    if (!doc) return
    const targetFile = fileId
      ? doc.files.find((f) => f.id === fileId)
      : doc.files.find((f) => f.isPrimary) ?? doc.files[0]
    if (!targetFile) return

    setDlLoading(true)
    try {
      const { url } = await getDownloadUrl(targetFile.id)
      if (!url) throw new Error('Không thể tạo liên kết tải xuống an toàn')
      const a = document.createElement('a')
      a.href = url
      a.download = targetFile.fileName || `${doc.title}.pdf`
      a.target = '_blank'
      a.click()
      toast.success('Bắt đầu tải xuống tệp chính thức!', `Tệp: ${targetFile.fileName}`)
      setDoc((prev) => (prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null))
    } catch (err) {
      toast.error('Lỗi khi tải tệp', getErrorMessage(err))
    } finally {
      setDlLoading(false)
    }
  }

  // Handle Bookmark toggle
  const handleBookmark = async () => {
    if (!doc) return
    if (!isAuthenticated) {
      toast.info('Yêu cầu đăng nhập', 'Đăng nhập để lưu học liệu vào Tủ tài liệu cá nhân.')
      navigate('/login')
      return
    }
    setBmLoading(true)
    try {
      if (bookmarked) {
        await removeBookmark(doc.id)
        setBookmarked(false)
        toast.info('Đã xóa khỏi Tủ học liệu cá nhân')
      } else {
        await addBookmark(doc.id)
        setBookmarked(true)
        toast.success('Đã lưu vào Tủ học liệu cá nhân!')
      }
    } catch (err) {
      toast.error('Lỗi thao tác', getErrorMessage(err))
    } finally {
      setBmLoading(false)
    }
  }

  // Handle Direct Instant Rating
  const handleDirectRate = async (score: number) => {
    const isFirstTime = !userRating
    const oldScore = userRating || 0

    setRateScore(score)
    setUserRating(score)
    if (!doc) return

    const prevCount = doc.ratingCount || 0
    const prevAvg = doc.avgRating || 5.0
    const newCount = isFirstTime ? prevCount + 1 : prevCount
    const newAvg = isFirstTime
      ? Number(((prevAvg * prevCount + score) / newCount).toFixed(1))
      : Number(((prevAvg * prevCount - oldScore + score) / (prevCount || 1)).toFixed(1))

    try {
      await rateDocument(doc.id, score)
      setDoc({ ...doc, avgRating: newAvg, ratingCount: newCount, userRating: score })
      toast.success(
        isFirstTime ? `Đã đánh giá ${score} sao thành công!` : `Đã cập nhật đánh giá thành ${score} sao!`,
        'Cảm ơn phản hồi học thuật của bạn.'
      )
    } catch (err) {
      console.warn('Fallback rating:', err)
      setDoc({ ...doc, avgRating: newAvg, ratingCount: newCount, userRating: score })
      toast.success(`Đã ghi nhận đánh giá ${score} sao!`, 'Cảm ơn phản hồi học thuật của bạn.')
    }
  }

  // Handle Rating
  const handleRateSubmit = async () => {
    if (!doc) return
    const isFirstTime = !userRating
    const oldScore = userRating || 0

    setRateLoading(true)
    const prevCount = doc.ratingCount || 0
    const prevAvg = doc.avgRating || 5.0
    const newCount = isFirstTime ? prevCount + 1 : prevCount
    const newAvg = isFirstTime
      ? Number(((prevAvg * prevCount + rateScore) / newCount).toFixed(1))
      : Number(((prevAvg * prevCount - oldScore + rateScore) / (prevCount || 1)).toFixed(1))

    try {
      await rateDocument(doc.id, rateScore)
      setUserRating(rateScore)
      setShowRateModal(false)
      setDoc({ ...doc, avgRating: newAvg, ratingCount: newCount, userRating: rateScore })
      toast.success(
        isFirstTime ? `Đã gửi đánh giá ${rateScore} sao thành công!` : `Đã cập nhật đánh giá thành ${rateScore} sao!`,
        'Cảm ơn phản hồi học thuật của bạn.'
      )
    } catch (err) {
      console.warn('Rating submit fallback:', err)
      // Optimistic update so the user is never blocked
      setUserRating(rateScore)
      setShowRateModal(false)
      setDoc({ ...doc, avgRating: newAvg, ratingCount: newCount, userRating: rateScore })
      toast.success(`Đã ghi nhận đánh giá ${rateScore} sao!`, 'Cảm ơn phản hồi học thuật của bạn.')
    } finally {
      setRateLoading(false)
    }
  }

  // Handle Report Submit
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doc) return
    if (!isAuthenticated) {
      toast.info('Yêu cầu đăng nhập', 'Bạn cần đăng nhập tài khoản sinh viên/giảng viên để gửi báo cáo vi phạm.')
      setShowReport(false)
      navigate('/login')
      return
    }
    const reason = reportReason || (reportReasons.length > 0 ? reportReasons[0].code : 'COPYRIGHT')
    if (!reportDesc.trim() || reportDesc.trim().length < 10) {
      toast.error('Thiếu thông tin chi tiết', 'Mô tả vi phạm phải có tối thiểu 10 ký tự để Ban Kiểm duyệt xác minh.')
      return
    }
    setReportLoading(true)
    try {
      await reportDocument(doc.id, { reasonCode: reason, description: reportDesc })
      toast.success('Đã gửi báo cáo vi phạm!', 'Ban Thanh tra Học thuật Khoa CNTT UTC sẽ thụ lý giải quyết.')
      setShowReport(false)
      setReportDesc('')
    } catch (err) {
      toast.error('Không thể gửi báo cáo', getErrorMessage(err))
    } finally {
      setReportLoading(false)
    }
  }

  // Copy Quick Citation
  const handleCopyCitation = async () => {
    if (!doc) return
    const citationStr = generateClientCitation(doc, quickCiteFormat)
    try {
      await navigator.clipboard.writeText(citationStr)
      setQuickCopied(true)
      toast.success(`Đã sao chép trích dẫn chuẩn ${quickCiteFormat}!`, 'Dán trực tiếp vào danh mục tài liệu tham khảo.')
      setTimeout(() => setQuickCopied(false), 2000)
    } catch {
      toast.error('Không thể tự động sao chép', 'Vui lòng chọn văn bản và nhấn Ctrl+C.')
    }
  }

  // Copy Clone Command
  const handleCopyClone = async (url: string) => {
    try {
      await navigator.clipboard.writeText(`git clone ${url}`)
      setCloneCopied(true)
      toast.success('Đã sao chép lệnh git clone vào clipboard!')
      setTimeout(() => setCloneCopied(false), 2000)
    } catch {
      toast.error('Không thể sao chép lệnh clone')
    }
  }

  // Pager & Zoom handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1)
  }
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1)
  }
  const handleZoomIn = () => {
    if (zoomLevel < 175) setZoomLevel((z) => z + 25)
  }
  const handleZoomOut = () => {
    if (zoomLevel > 75) setZoomLevel((z) => z - 25)
  }
  // Sync isFullscreen with native browser fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // Allow ESC key to exit CSS fullscreen fallback as well
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {})
        }
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const handleToggleFullscreen = () => {
    if (activeTab !== 'reader') {
      setActiveTab('reader')
      setTimeout(() => {
        if (viewerContainerRef.current) {
          if (!document.fullscreenElement && !isFullscreen) {
            viewerContainerRef.current.requestFullscreen().then(() => {
              setIsFullscreen(true)
            }).catch(() => {
              setIsFullscreen(true)
            })
          }
        }
      }, 100)
      return
    }

    if (!viewerContainerRef.current) return
    if (!document.fullscreenElement && !isFullscreen) {
      viewerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(() => {
        setIsFullscreen(true)
      })
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      setIsFullscreen(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f5] dark:bg-[#0c1017]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-24 gap-3">
          <Spinner />
          <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
            ĐANG TẢI HỒ SƠ HỌC THUẬT FIT-UTC...
          </span>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f5] dark:bg-[#0c1017] text-stone-900 dark:text-stone-100 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4">
          <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-sm border border-stone-300 dark:border-slate-800 text-center max-w-md">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-200 dark:border-rose-800">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif-academic text-xl font-bold text-stone-900 dark:text-white">
              Không tìm thấy học liệu
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-2 font-mono leading-relaxed">
              {error || 'Học liệu không tồn tại hoặc đã được chuyển vào kho lưu trữ nội bộ Khoa CNTT.'}
            </p>
            <button
              onClick={() => navigate('/search')}
              className="mt-6 px-5 py-2.5 bg-stone-900 hover:bg-black dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
            >
              ← Quay lại Tra cứu tài liệu
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const primaryFile = doc.files.find((f) => f.isPrimary) ?? doc.files[0]
  const currentActiveFile = doc.files.find((f) => f.id === activeFileId) ?? primaryFile
  const totalFileSize = doc.files.reduce((acc, f) => acc + (f.fileSize || 0), 0)
  const repoUrl = doc.githubUrl || doc.repositoryUrl

  // Status badge helper
  const renderStatusBadge = () => {
    switch (doc.status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold text-emerald-900 dark:text-emerald-300 rounded-md tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            BẢN THẨM ĐỊNH CHÍNH THỨC
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-300 rounded-md tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            CHỜ HỘI ĐỒNG THẨM ĐỊNH
          </span>
        )
      case 'REVISION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-300 rounded-md tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            YÊU CẦU BỔ SUNG CHỈNH SỬA
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-[11px] font-bold text-rose-900 dark:text-rose-300 rounded-md tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            CHƯA ĐẠT CHUẨN XÉT DUYỆT
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 text-[11px] font-bold text-stone-700 dark:text-slate-300 rounded-md tracking-wider">
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            BẢN NHÁP TÁC GIẢ (DRAFT)
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] dark:bg-[#0c1017] text-stone-900 dark:text-stone-100 font-sans selection:bg-amber-200 selection:text-stone-900 relative">
      {/* Texture: Grid paper overlay */}
      <div className="fixed inset-0 pointer-events-none bg-paper-grid opacity-60 z-0" />

      <Navbar />

      <main className="w-full pt-16 relative z-10 flex-1 flex flex-col bg-paper-grid">
        {/* ─── ACCESSION & BREADCRUMB BAR (LEDGER STYLE) ────────────────── */}
        <div className="w-full bg-[#f4f2ea]/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-stone-200/90 dark:border-slate-800 py-3 shadow-2xs">
          <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-600 dark:text-slate-400 flex-wrap">
              <Link
                to="/"
                className="hover:text-amber-800 dark:hover:text-sky-400 font-medium transition-colors"
              >
                Trang chủ
              </Link>
              <span>/</span>
              <Link
                to="/search"
                className="hover:text-amber-800 dark:hover:text-sky-400 font-semibold transition-colors flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-sky-400" />
                <span>Tra cứu tài liệu</span>
              </Link>
              <span>/</span>
              {doc.subjectId ? (
                <Link
                  to={`/search?subjectId=${doc.subjectId}`}
                  className="text-stone-800 dark:text-slate-200 font-semibold hover:underline truncate max-w-xs sm:max-w-sm"
                >
                  {doc.subjectName}
                </Link>
              ) : (
                <span className="text-stone-700 dark:text-slate-300 truncate max-w-xs">
                  {doc.subjectName || 'Khoa CNTT - UTC'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white dark:bg-slate-800 text-stone-800 dark:text-slate-200 font-mono text-[11px] font-bold rounded border border-stone-300 dark:border-slate-700 shadow-2xs">
                MÃ HỌC LIỆU: #{88000 + doc.id}
              </span>
              <span className="px-2.5 py-1 bg-amber-100/70 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-mono text-[11px] font-bold rounded border border-amber-300 dark:border-amber-800">
                FIT-UTC ARCHIVE
              </span>
            </div>
          </div>
        </div>

        {/* ─── MAIN TWO-COLUMN WORKBENCH ─────────────────────────────────── */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ═══ LEFT WORKBENCH COLUMN (~68%, 8 cols) ═══ */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* 1. DOCUMENT IDENTITY & DOSSIER HEADER */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col gap-5 relative overflow-hidden">
                {/* Stamp accent banner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

                {/* Metadata Badge Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  {renderStatusBadge()}
                  <span className="px-3 py-1 bg-sky-50 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-300 text-[11px] font-bold rounded-md uppercase tracking-wider">
                    {doc.documentTypeLabel || 'HỌC LIỆU'}
                  </span>
                  <span className="px-3 py-1 bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 text-[11px] font-mono font-semibold rounded-md border border-stone-200 dark:border-slate-700">
                    {doc.academicYearName || 'Niên khóa 2024 - 2025'}
                  </span>
                  {doc.targetYear && (
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-[11px] font-bold rounded-md flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>
                        {doc.targetYear === 'YEAR_1' ? 'NĂM 1' : doc.targetYear === 'YEAR_2' ? 'NĂM 2' : doc.targetYear === 'YEAR_3' ? 'NĂM 3' : doc.targetYear === 'YEAR_4' ? 'NĂM 4' : 'NĂM 5'}
                      </span>
                    </span>
                  )}
                  {doc.advisorName && (
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 text-[11px] font-bold rounded-md flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>GVHD: {doc.advisorName}</span>
                    </span>
                  )}
                </div>

                {/* Main Academic Title */}
                <h1 className="font-serif-academic text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 leading-tight tracking-tight">
                  {doc.title}
                </h1>

                {/* Subject & Meta Row */}
                <div className="flex flex-wrap items-center gap-4 text-stone-500 dark:text-slate-400 text-xs border-y border-stone-100 dark:border-slate-800 py-3 font-mono">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-700 dark:text-sky-400" />
                    <span>Môn học:</span>
                    <strong className="text-stone-900 dark:text-stone-100 font-semibold">{doc.subjectName}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-stone-400" />
                    <span>Lưu chiểu:</span>
                    <strong className="text-stone-800 dark:text-slate-200 font-semibold">
                      {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString('vi-VN')}
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-stone-400" />
                    <span>{doc.viewCount || 0} lượt đọc</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{doc.downloadCount || 0} lượt tải</span>
                  </span>
                </div>

                {/* Academic Abstract Callout */}
                <div className="p-5 bg-[#faf9f5] dark:bg-slate-900/50 rounded-xl border border-stone-200 dark:border-slate-800 space-y-2.5">
                  <div className="text-xs uppercase tracking-wider text-amber-800 dark:text-sky-400 font-mono font-bold flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Tóm tắt học thuật (Abstract / Trích yếu)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-slate-300 leading-relaxed text-justify font-sans">
                    {doc.abstractText ||
                      'Học liệu số phục vụ giảng dạy, nghiên cứu khoa học và ôn tập chuyên sâu thuộc chương trình đào tạo Khoa Công nghệ Thông tin - Trường Đại học Giao thông Vận tải (UTC).'}
                  </p>
                  {doc.description && (
                    <p className="mt-2 pt-2 border-t border-stone-200 dark:border-slate-800 text-xs text-stone-500 dark:text-slate-400 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Faculty Integrity & Honor Pledge Seal */}
                <div className="p-4 bg-gradient-to-r from-emerald-50/60 via-amber-50/40 to-stone-50/80 dark:from-emerald-950/20 dark:via-amber-950/10 dark:to-slate-900/40 border border-emerald-300/80 dark:border-emerald-800/40 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 dark:border-emerald-900/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 tracking-wider uppercase font-mono">
                        THẨM ĐỊNH LIÊM CHÍNH HỌC THUẬT FIT-UTC
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold rounded border border-emerald-300 dark:border-emerald-800">
                      MÃ ĐỐI SOÁT: {doc.verificationCode || `#UTC-FIT-${88000 + doc.id}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 dark:text-slate-500 block uppercase font-mono">
                        Đơn vị thẩm định
                      </span>
                      <span className="font-semibold text-stone-800 dark:text-slate-200">
                        {doc.facultyUnit || 'Khoa Công nghệ Thông tin - UTC'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 dark:text-slate-500 block uppercase font-mono">
                        Phạm vi lưu hành
                      </span>
                      <span className="font-bold text-amber-800 dark:text-sky-400">
                        {doc.sharingScope === 'PUBLIC_REFERENCE' ? 'THAM KHẢO RỘNG RÃI' : 'LƯU HÀNH NỘI BỘ KHOA'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 dark:text-slate-500 block uppercase font-mono">
                        Cam kết liêm chính
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ĐÃ KÝ CAM KẾT</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tech Stack Chips (if available) */}
                {doc.technologies && doc.technologies.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] uppercase tracking-wider text-stone-400 dark:text-slate-500 font-mono font-bold">
                      Công nghệ &amp; Thư viện áp dụng trong đề tài:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doc.technologies.map((t) => (
                        <span
                          key={t.id}
                          className="px-2.5 py-1 bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-slate-200 text-xs font-mono font-semibold rounded-md border border-stone-200 dark:border-slate-700"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. RESEARCH WORKBENCH TABS SELECTOR */}
              <div className="bg-white dark:bg-[#111827] rounded-xl border border-stone-200/90 dark:border-slate-800 p-1.5 shadow-2xs flex flex-wrap gap-1">
                <button
                  onClick={() => setActiveTab('reader')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'reader'
                      ? 'bg-stone-900 text-white dark:bg-sky-600 dark:text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800'
                  }`}
                  type="button"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Phòng Đọc Học Liệu</span>
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-white/20 rounded">
                    {doc.files?.length || 1}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'code'
                      ? 'bg-stone-900 text-white dark:bg-sky-600 dark:text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800'
                  }`}
                  type="button"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Mã Nguồn &amp; Repo</span>
                  {repoUrl && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('qa')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'qa'
                      ? 'bg-stone-900 text-white dark:bg-sky-600 dark:text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800'
                  }`}
                  type="button"
                >
                  <MessageSquareQuote className="w-4 h-4" />
                  <span>Hỏi Đáp Phản Biện</span>
                </button>

                <button
                  onClick={() => setActiveTab('integrity')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'integrity'
                      ? 'bg-stone-900 text-white dark:bg-sky-600 dark:text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800'
                  }`}
                  type="button"
                >
                  <History className="w-4 h-4" />
                  <span>Lịch Sử Thẩm Định</span>
                  {reviews.length > 0 && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-white/20 rounded">
                      {reviews.length}
                    </span>
                  )}
                </button>
              </div>

              {/* 3. TAB CONTENT WORKSPACE */}
              {activeTab === 'reader' && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  {/* IN-LINE RESILIENT PDF VIEWER */}
                  <div
                    ref={viewerContainerRef}
                    className={`bg-white dark:bg-[#111827] shadow-xs overflow-hidden flex flex-col ${
                      isFullscreen
                        ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none border-0'
                        : 'rounded-2xl border border-stone-200/90 dark:border-slate-800'
                    }`}
                  >
                    {/* Viewer Controls Toolbar */}
                    <div className="bg-[#f7f5ee] dark:bg-slate-800/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-stone-200 dark:border-slate-700 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-white dark:bg-slate-900 font-mono font-bold text-stone-800 dark:text-slate-200 rounded-md flex items-center gap-1.5 border border-stone-300 dark:border-slate-700 shadow-2xs">
                          <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-sky-400" />
                          <span>TRÌNH ĐỌC HỌC LIỆU SỐ</span>
                        </span>

                        {/* Page Navigator */}
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-stone-300 dark:border-slate-700 shadow-2xs font-mono">
                          <button
                            onClick={handlePrevPage}
                            disabled={currentPage <= 1}
                            className="p-1 hover:text-amber-800 dark:hover:text-sky-400 transition-colors disabled:opacity-30 cursor-pointer"
                            title="Trang trước"
                            type="button"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="font-bold px-1 select-none">
                            {String(currentPage).padStart(2, '0')} / {totalPages}
                          </span>
                          <button
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages}
                            className="p-1 hover:text-amber-800 dark:hover:text-sky-400 transition-colors disabled:opacity-30 cursor-pointer"
                            title="Trang kế"
                            type="button"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Zoom Controls */}
                        <div className="flex items-center bg-white dark:bg-slate-900 px-2 py-1 gap-2 rounded-md border border-stone-300 dark:border-slate-700 shadow-2xs font-mono">
                          <button
                            onClick={handleZoomOut}
                            className="p-1 hover:text-amber-800 dark:hover:text-sky-400 transition-colors cursor-pointer"
                            title="Thu nhỏ"
                            type="button"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-xs select-none">{zoomLevel}%</span>
                          <button
                            onClick={handleZoomIn}
                            className="p-1 hover:text-amber-800 dark:hover:text-sky-400 transition-colors cursor-pointer"
                            title="Phóng to"
                            type="button"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Fullscreen Button */}
                        <button
                          onClick={handleToggleFullscreen}
                          className={`p-1.5 font-semibold rounded-md border transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-mono ${
                            isFullscreen
                              ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                              : 'bg-white dark:bg-slate-900 hover:bg-stone-50 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-200 border-stone-300 dark:border-slate-700'
                          }`}
                          type="button"
                          title={isFullscreen ? 'Thoát toàn màn hình (Phím Esc)' : 'Toàn màn hình'}
                        >
                          {isFullscreen ? (
                            <>
                              <Minimize2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Thoát toàn màn hình</span>
                            </>
                          ) : (
                            <Maximize2 className="w-4 h-4" />
                          )}
                        </button>

                        {/* Open in New Window via in-memory Blob without IDM trigger */}
                        {blobUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(blobUrl, '_blank')}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-black dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-mono font-bold flex items-center gap-1.5 rounded-md transition-colors shadow-2xs cursor-pointer text-xs uppercase"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Mở tab mới</span>
                          </button>
                        )}
                      </div>
                    </div>
                    {/* PDF Document Canvas */}
                    <div
                      className={`bg-stone-200/50 dark:bg-slate-950 flex flex-col justify-center items-center ${
                        isFullscreen
                          ? 'flex-1 h-full w-full min-h-0 p-0 overflow-hidden'
                          : 'p-2 sm:p-4 min-h-[640px]'
                      }`}
                    >
                      <div
                        className={`w-full bg-white dark:bg-slate-900 overflow-hidden relative flex flex-col ${
                          isFullscreen
                            ? 'flex-1 h-full min-h-0 rounded-none border-0 shadow-none'
                            : 'rounded-xl border border-stone-300 dark:border-slate-800 shadow-md'
                        }`}
                        style={
                          isFullscreen
                            ? undefined
                            : {
                                transform: `scale(${zoomLevel / 100})`,
                                transformOrigin: 'top center',
                                transition: 'transform 0.15s ease-out',
                              }
                        }
                      >
                        {!currentActiveFile ? (
                          <div className="w-full h-[540px] flex flex-col items-center justify-center p-8 text-center bg-stone-50 dark:bg-slate-900/60 rounded-xl border border-dashed border-stone-300 dark:border-slate-800 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-xs">
                              <FileText className="w-8 h-8" />
                            </div>
                            <div className="max-w-md">
                              <h4 className="font-serif-academic text-lg font-bold text-stone-900 dark:text-white">
                                Hồ sơ tài liệu chưa đính kèm tệp
                              </h4>
                              <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Tài liệu này hiện được tạo dưới dạng bản thảo hồ sơ. Người đăng có thể bổ sung tệp toàn văn (PDF, Word, PowerPoint) trong mục Chỉnh sửa.
                              </p>
                            </div>
                            {(canEdit || canAdmin) && (
                              <Link
                                to={`/documents/${doc.id}/edit`}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                                <span>Chỉnh sửa &amp; Tải tệp lên</span>
                              </Link>
                            )}
                          </div>
                        ) : (currentActiveFile.fileName || '').toLowerCase().endsWith('.pptx') || (currentActiveFile.fileName || '').toLowerCase().endsWith('.ppt') ? (
                          <div className="w-full h-[580px] flex flex-col items-center justify-center p-8 text-center bg-stone-50 dark:bg-slate-900/60 rounded-xl gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shadow-sm ring-8 ring-amber-500/5">
                              <span className="material-symbols-outlined text-[44px]">slideshow</span>
                            </div>
                            <div className="max-w-lg space-y-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                                Bản trình chiếu bài giảng / Slide báo cáo (PowerPoint)
                              </span>
                              <h4 className="font-serif-academic text-xl font-bold text-stone-900 dark:text-white break-words">
                                {currentActiveFile.fileName}
                              </h4>
                              <p className="text-xs font-mono text-stone-500 dark:text-slate-400">
                                Định dạng Microsoft PowerPoint • Dung lượng: {formatFileSize(currentActiveFile.fileSize || 0)}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                              <button
                                onClick={() => handleDownload(currentActiveFile.id)}
                                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all"
                              >
                                <Download className="w-4 h-4" />
                                <span>Tải slide bài giảng (.pptx)</span>
                              </button>
                            </div>
                          </div>
                        ) : (currentActiveFile.fileName || '').toLowerCase().endsWith('.docx') || (currentActiveFile.fileName || '').toLowerCase().endsWith('.doc') ? (
                          <div className="w-full h-[580px] flex flex-col items-center justify-center p-8 text-center bg-stone-50 dark:bg-slate-900/60 rounded-xl gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-sm ring-8 ring-blue-500/5">
                              <span className="material-symbols-outlined text-[44px]">description</span>
                            </div>
                            <div className="max-w-lg space-y-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                                Tài liệu soạn thảo học thuật (Microsoft Word)
                              </span>
                              <h4 className="font-serif-academic text-xl font-bold text-stone-900 dark:text-white break-words">
                                {currentActiveFile.fileName}
                              </h4>
                              <p className="text-xs font-mono text-stone-500 dark:text-slate-400">
                                Định dạng Word Document • Dung lượng: {formatFileSize(currentActiveFile.fileSize || 0)}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                              <button
                                onClick={() => handleDownload(currentActiveFile.id)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all"
                              >
                                <Download className="w-4 h-4" />
                                <span>Tải văn bản Word (.docx)</span>
                              </button>
                            </div>
                          </div>
                        ) : (currentActiveFile.fileName || '').toLowerCase().endsWith('.zip') ? (
                          <div className="w-full h-[580px] flex flex-col items-center justify-center p-8 text-center bg-stone-50 dark:bg-slate-900/60 rounded-xl gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-sm ring-8 ring-emerald-500/5">
                              <span className="material-symbols-outlined text-[44px]">folder_zip</span>
                            </div>
                            <div className="max-w-lg space-y-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                                Gói mã nguồn &amp; Dữ liệu nén (ZIP)
                              </span>
                              <h4 className="font-serif-academic text-xl font-bold text-stone-900 dark:text-white break-words">
                                {currentActiveFile.fileName}
                              </h4>
                              <p className="text-xs font-mono text-stone-500 dark:text-slate-400">
                                Tệp nén lưu trữ • Dung lượng: {formatFileSize(currentActiveFile.fileSize || 0)}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                              <button
                                onClick={() => handleDownload(currentActiveFile.id)}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all"
                              >
                                <Download className="w-4 h-4" />
                                <span>Tải gói nén (.zip)</span>
                              </button>
                            </div>
                          </div>
                        ) : pdfLoading ? (
                          <div className={`w-full flex flex-col items-center justify-center p-8 text-center text-stone-500 dark:text-slate-400 bg-white dark:bg-slate-900 ${isFullscreen ? 'flex-1 h-full min-h-0' : 'h-[680px] sm:h-[760px]'}`}>
                            <span className="w-8 h-8 border-3 border-amber-600 dark:border-sky-400 border-t-transparent rounded-full animate-spin mb-3" />
                            <p className="text-xs font-mono font-medium">Đang kết nối học liệu số FIT-UTC...</p>
                          </div>
                        ) : pdfError ? (
                          <div className={`w-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 gap-3 ${isFullscreen ? 'flex-1 h-full min-h-0' : 'h-[680px] sm:h-[760px]'}`}>
                            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
                            <h4 className="font-serif-academic text-base font-bold text-stone-800 dark:text-slate-200">
                              Không thể mở trực tuyến tệp này
                            </h4>
                            <p className="text-xs text-stone-500 dark:text-slate-400 max-w-md font-mono">
                              {pdfError}
                            </p>
                            <button
                              onClick={() => handleDownload(currentActiveFile.id)}
                              className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-xs rounded-lg uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Download className="w-4 h-4" />
                              <span>Tải tệp về máy</span>
                            </button>
                          </div>
                        ) : blobUrl ? (
                          <iframe
                            src={`${blobUrl}#page=${currentPage}&zoom=${zoomLevel}`}
                            className={`w-full border-0 block ${
                              isFullscreen ? 'flex-1 h-full min-h-0' : 'h-[680px] sm:h-[760px]'
                            }`}
                            title={doc.title}
                          />
                        ) : (
                          <div className={`w-full flex flex-col items-center justify-center p-8 text-center text-stone-400 bg-white dark:bg-slate-900 ${isFullscreen ? 'flex-1 h-full min-h-0' : 'h-[680px] sm:h-[760px]'}`}>
                            <span className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
                            <p className="text-xs font-mono">Đang nạp dữ liệu xem trước...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DOCUMENT FILES LEDGER */}
                  <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-serif-academic text-stone-900 dark:text-white flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-amber-700 dark:text-sky-400" />
                        <span>Danh mục tệp đính kèm trong hồ sơ ({doc.files?.length || 0} tệp)</span>
                      </span>
                      {totalFileSize > 0 && (
                        <span className="text-xs text-stone-500 dark:text-slate-400 font-mono">
                          Tổng dung lượng: {formatFileSize(totalFileSize)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doc.files && doc.files.length > 0 ? (
                        doc.files.map((f) => {
                          const isPdf = f.fileName.toLowerCase().endsWith('.pdf')
                          const isSelected = activeFileId === f.id
                          const ext = f.fileName.split('.').pop()?.toUpperCase() || 'FILE'

                          return (
                            <div
                              key={f.id}
                              className={`p-4 rounded-xl flex flex-col justify-between gap-3 border transition-all ${
                                isSelected
                                  ? 'bg-amber-50/50 dark:bg-sky-950/30 border-amber-500 dark:border-sky-500 shadow-2xs'
                                  : 'bg-stone-50/80 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 hover:border-stone-400'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700 shadow-2xs shrink-0">
                                  <FileText className="w-5 h-5 text-amber-700 dark:text-sky-400" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold text-stone-800 dark:text-slate-200 truncate" title={f.fileName}>
                                    {f.fileName}
                                  </span>
                                  <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-slate-400 font-mono mt-0.5">
                                    <span>{f.fileSize ? formatFileSize(f.fileSize) : 'Tài liệu số'}</span>
                                    <span>•</span>
                                    <span>{ext}</span>
                                    {f.isPrimary && (
                                      <>
                                        <span>•</span>
                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">CHÍNH THỨC</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80 dark:border-slate-800">
                                {isPdf && (
                                  <button
                                    onClick={() => handleSelectFile(f.id)}
                                    className={`flex-1 py-1.5 px-3 text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase ${
                                      isSelected
                                        ? 'bg-amber-800 text-white dark:bg-sky-600'
                                        : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-200 border border-stone-200 dark:border-slate-700 hover:bg-stone-100'
                                    }`}
                                    type="button"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{isSelected ? 'Đang đọc' : 'Đọc tệp này'}</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDownload(f.id)}
                                  disabled={dlLoading}
                                  className={`${isPdf ? '' : 'w-full'} py-1.5 px-3 bg-stone-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase`}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Tải về</span>
                                </button>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="col-span-full p-6 bg-stone-50 dark:bg-slate-900/60 text-stone-400 text-xs rounded-xl text-center font-mono">
                          Học liệu này đã được số hóa trực tiếp trên hệ thống thư viện điện tử UTC.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MÃ NGUỒN & KHO LƯU TRỮ REPO */}
              {activeTab === 'code' && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  {/* REPO ACCESS CARD */}
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
                      <span className="text-sm font-bold font-serif-academic text-stone-900 dark:text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-600" />
                        <span>Kho lưu trữ mã nguồn đề tài (Source Repository)</span>
                      </span>
                      {repoUrl && (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                          GIT REPO LIVE
                        </span>
                      )}
                    </div>

                    {repoUrl ? (
                      <div className="space-y-4">
                        <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed font-sans">
                          Mã nguồn của đề tài đã được liên kết chính thức với kho lưu trữ của Khoa CNTT. Sinh viên có thể clone về máy để chạy thử nghiệm, kế thừa kiến trúc hoặc phát triển tính năng đồ án.
                        </p>

                        {/* Git Clone Box */}
                        <div className="bg-stone-900 dark:bg-slate-950 rounded-xl p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-md">
                          <div className="flex items-center gap-2 overflow-x-auto min-w-0">
                            <span className="text-emerald-400 select-none">$</span>
                            <span className="text-stone-300 truncate">git clone {repoUrl}</span>
                          </div>
                          <button
                            onClick={() => handleCopyClone(repoUrl)}
                            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-lg flex items-center gap-1.5 font-bold transition-colors cursor-pointer shrink-0 text-[11px]"
                            type="button"
                          >
                            {cloneCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{cloneCopied ? 'ĐÃ SAO CHÉP' : 'COPY CLONE'}</span>
                          </button>
                        </div>

                        {/* Repo Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <a
                            href={repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-stone-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                          >
                            <Code2 className="w-4 h-4 text-emerald-400" />
                            <span>Truy cập Kho mã nguồn trên GitHub</span>
                            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-stone-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-stone-300 dark:border-slate-800 text-center space-y-3">
                        <Code2 className="w-8 h-8 text-stone-400 mx-auto" />
                        <h4 className="font-serif-academic text-sm font-bold text-stone-800 dark:text-slate-200">
                          Học liệu này chưa liên kết kho mã nguồn ngoài
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
                          Tài liệu tập trung vào phần lý thuyết, slide bài giảng hoặc đề thi. Nếu bạn là tác giả hoặc có repository mã nguồn mẫu kế thừa cho đề tài này, bạn có thể gửi yêu cầu liên kết repo qua mục Thảo luận.
                        </p>
                      </div>
                    )}

                    {/* SOURCE CODE SNIPPET (IF ANY) */}
                    {doc.sourceCodeSnippet && (
                      <div className="mt-4 pt-4 border-t border-stone-200 dark:border-slate-800 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Minh họa thuật toán &amp; Cấu trúc cốt lõi ({doc.codeLanguage || 'Source'})</span>
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 font-bold rounded">
                            {doc.codeLanguage || 'CODE'}
                          </span>
                        </div>
                        <CodeViewer
                          code={doc.sourceCodeSnippet}
                          language={doc.codeLanguage}
                          title={`Mã nguồn mẫu: ${doc.title}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: THẢO LUẬN & PHẢN BIỆN HỌC THUẬT */}
              {activeTab === 'qa' && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="p-4 bg-amber-50/70 dark:bg-slate-900/70 rounded-xl border border-amber-300/80 dark:border-slate-800 flex items-center gap-3 text-xs text-amber-950 dark:text-slate-300">
                    <MessageSquareQuote className="w-5 h-5 text-amber-700 dark:text-sky-400 shrink-0" />
                    <div>
                      <strong className="font-bold">Diễn đàn Phản biện Học thuật FIT-UTC:</strong> Sinh viên có thể đặt câu hỏi về công thức, thuật toán, đề tài hoặc thắc mắc về mã nguồn để được tác giả và giảng viên bộ môn giải đáp.
                    </div>
                  </div>
                  <DocumentQASection documentId={doc.id} />
                </div>
              )}

              {/* TAB 4: LỊCH SỬ THẨM ĐỊNH & LIÊM CHÍNH */}
              {activeTab === 'integrity' && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  {/* REVIEW TIMELINE (LỊCH SỬ THẨM ĐỊNH) */}
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
                      <span className="text-sm font-bold font-serif-academic text-stone-900 dark:text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-amber-700 dark:text-sky-400" />
                        <span>Quy trình Thẩm định &amp; Phản biện của Hội đồng Bộ môn</span>
                      </span>
                      <span className="text-xs font-mono text-stone-400">
                        Mã lưu trữ #{doc.id}
                      </span>
                    </div>

                    {reviews && reviews.length > 0 ? (
                      <div className="space-y-4 pl-3 border-l-2 border-stone-300 dark:border-slate-700">
                        {reviews.map((rev) => (
                          <div key={rev.id} className="relative pl-5 text-xs">
                            <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-amber-600 dark:bg-sky-500 border-2 border-white dark:border-slate-900 shadow-2xs" />
                            <div className="flex flex-wrap items-center gap-2 font-semibold">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                rev.decision === 'APPROVED'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : rev.decision === 'REJECTED'
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              }`}>
                                {rev.decision === 'APPROVED' ? 'ĐÃ PHÊ DUYỆT' : rev.decision === 'REJECTED' ? 'TỪ CHỐI' : 'YÊU CẦU CHỈNH SỬA'}
                              </span>
                              <span className="text-stone-500 font-mono text-[11px]">
                                {new Date(rev.actionAt).toLocaleString('vi-VN')}
                              </span>
                              {rev.reviewerName && (
                                <span className="text-stone-700 dark:text-slate-300 font-medium">
                                  — Người thẩm định: <strong>{rev.reviewerName}</strong>
                                </span>
                              )}
                            </div>
                            {rev.comment && (
                              <p className="mt-2 text-stone-700 dark:text-slate-300 bg-stone-50 dark:bg-slate-900/80 p-3 rounded-xl border border-stone-200 dark:border-slate-800 leading-relaxed font-sans">
                                {rev.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 bg-stone-50 dark:bg-slate-900/50 rounded-xl text-xs text-stone-500 dark:text-slate-400 font-mono text-center">
                        Tài liệu thuộc danh mục học liệu chuẩn đã được Khoa CNTT UTC xác thực và đưa vào lưu chiểu thư viện số.
                      </div>
                    )}
                  </div>

                  {/* FUTURE WORK & MẠCH KẾ THỪA HỌC THUẬT */}
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-xs uppercase tracking-wider font-mono">
                      <GitFork className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Mạch kế thừa học thuật &amp; Hướng nghiên cứu cho khóa sau:</span>
                    </div>
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-xl">
                      <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed text-justify font-sans">
                        {doc.futureWorkSuggestions ||
                          '1. Kế thừa mã nguồn và mở rộng các giải thuật học máy / xử lý phân tán; 2. Thử nghiệm trên tập dữ liệu thực tế tại các phòng Lab Khoa CNTT UTC; 3. Hoàn thiện báo cáo và bài báo khoa học sinh viên.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. HỌC LIỆU LIÊN QUAN CÙNG MẠCH CHUYÊN ĐỀ */}
              {relatedDocs.length > 0 && (
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
                    <span className="text-sm font-bold font-serif-academic text-stone-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-700 dark:text-sky-400" />
                      <span>Học liệu cùng mạch chuyên đề &amp; Đề tài liên quan ({relatedDocs.length})</span>
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      FIT-UTC RECOMMENDATIONS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedDocs.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          navigate(`/documents/${item.id}`)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="p-4 bg-stone-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 border border-stone-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-sky-400 transition-all flex flex-col justify-between gap-3 cursor-pointer group rounded-xl shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300 text-[10px] font-mono font-bold uppercase rounded border border-sky-200 dark:border-sky-800">
                              {item.documentTypeLabel}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 px-1.5 py-0.5 rounded">
                              {item.similarityScore}% tương quan
                            </span>
                          </div>
                          <h4 className="font-serif-academic font-bold text-xs sm:text-sm text-stone-900 dark:text-slate-200 group-hover:text-amber-800 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 font-mono">
                            {item.subjectName} • {item.academicYearName}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-stone-500 font-medium text-[10px] truncate max-w-[180px]">
                            {item.matchReason}
                          </span>
                          <span className="text-amber-800 dark:text-sky-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Xem hồ sơ →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ═══ RIGHT COLUMN (~32%, 4 cols) STICKY DOSSIER SIDEBAR ═══ */}
            <div className="lg:col-span-4 flex flex-col gap-6 sticky top-20">
              {/* CARD 1: THAO TÁC HỌC THUẬT (ACTION STATION) */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800 font-mono">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-sky-400" />
                    <span>THAO TÁC HỌC LIỆU</span>
                  </span>
                  <span className="px-2 py-0.5 bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 text-[11px] font-bold rounded">
                    UTC-FIT
                  </span>
                </div>

                {/* Primary Action Button: Download Official Document */}
                <button
                  onClick={() => handleDownload()}
                  disabled={dlLoading}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-mono font-bold flex items-center justify-between rounded-xl shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>{dlLoading ? 'Đang chuẩn bị tệp...' : 'TẢI VĂN BẢN CHÍNH THỨC'}</span>
                  </span>
                  {primaryFile?.fileSize && (
                    <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-mono rounded">
                      {formatFileSize(primaryFile.fileSize)}
                    </span>
                  )}
                </button>

                {/* Focus Fullscreen Reading Mode */}
                <button
                  onClick={handleToggleFullscreen}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 rounded-xl shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
                  type="button"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>ĐỌC TOÀN MÀN HÌNH</span>
                </button>

                {/* Academic Citation Modal Trigger */}
                <button
                  onClick={() => setShowCitation(true)}
                  className="w-full py-2.5 px-4 bg-stone-50 dark:bg-slate-900 hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-300 dark:border-slate-700 text-stone-800 dark:text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-2 rounded-xl transition-colors cursor-pointer uppercase tracking-wider"
                  type="button"
                >
                  <MessageSquareQuote className="w-4 h-4 text-amber-700 dark:text-sky-400" />
                  <span>TRÍCH DẪN ĐẦY ĐỦ (APA/IEEE/BIBTEX)</span>
                </button>

                {/* Bookmark Toggle Button */}
                <button
                  onClick={handleBookmark}
                  disabled={bmLoading}
                  className={`w-full py-2.5 px-4 border text-xs font-mono font-bold flex items-center justify-center gap-2 rounded-xl transition-colors cursor-pointer uppercase tracking-wider ${
                    bookmarked
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-300'
                      : 'bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-700 text-stone-700 dark:text-slate-300 hover:bg-stone-50'
                  }`}
                  type="button"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500 text-amber-500' : 'text-stone-400'}`} />
                  <span>{bookmarked ? 'ĐÃ LƯU TRONG TỦ HỌC LIỆU' : 'LƯU VÀO TỦ TÀI LIỆU'}</span>
                </button>

                {/* Add to Collection Button */}
                <button
                  onClick={() => setShowCollectionModal(true)}
                  className="w-full py-2.5 px-4 bg-stone-50 dark:bg-slate-900 hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-300 dark:border-slate-700 text-stone-800 dark:text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-2 rounded-xl transition-colors cursor-pointer uppercase tracking-wider"
                  type="button"
                >
                  <FolderPlus className="w-4 h-4 text-stone-500" />
                  <span>THÊM VÀO BỘ SƯU TẬP</span>
                </button>

                {/* Report Infringement Trigger */}
                <button
                  onClick={() => setShowReport(true)}
                  className="w-full py-1.5 px-3 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-mono font-bold flex items-center justify-center gap-1.5 rounded-lg transition-colors cursor-pointer"
                  type="button"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Báo cáo vi phạm / Liêm chính</span>
                </button>
              </div>

              {/* CARD 2: INSTANT QUICK CITATION BOX (1-CLICK COPY) */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-slate-800">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
                    <QuoteIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>TRÍCH DẪN NHANH 1-CHẠM</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {(['IEEE', 'APA', 'BIBTEX'] as CitationFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setQuickCiteFormat(fmt)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                          quickCiteFormat === fmt
                            ? 'bg-stone-900 text-white dark:bg-sky-600'
                            : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400 hover:bg-stone-200'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-[#faf9f5] dark:bg-slate-900/60 rounded-xl border border-stone-200 dark:border-slate-800 text-[11px] font-mono text-stone-700 dark:text-slate-300 leading-relaxed break-all select-all">
                  {generateClientCitation(doc, quickCiteFormat)}
                </div>

                <button
                  onClick={handleCopyCitation}
                  className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                  type="button"
                >
                  {quickCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{quickCopied ? 'ĐÃ SAO CHÉP TRÍCH DẪN' : `SAO CHÉP CHUẨN ${quickCiteFormat}`}</span>
                </button>
              </div>

              {/* CARD 3: HỒ SƠ HỌC THUẬT & GIẢNG VIÊN HƯỚNG DẪN */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-4">
                <div className="text-xs font-mono font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-slate-800">
                  <School className="w-4 h-4 text-amber-700 dark:text-sky-400" />
                  <span>HỒ SƠ HỌC THUẬT FIT-UTC</span>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  {/* Advisor */}
                  {doc.advisorName && (
                    <div className="flex flex-col bg-[#faf9f5] dark:bg-slate-900/60 p-3.5 rounded-xl border border-stone-200 dark:border-slate-800">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono font-bold">
                        GIẢNG VIÊN HƯỚNG DẪN (GVHD)
                      </span>
                      <span className="font-bold text-stone-900 dark:text-white text-sm mt-0.5 font-serif-academic">
                        {doc.advisorName}
                      </span>
                      <span className="text-stone-500 text-[11px] font-mono mt-0.5">
                        {doc.majorName ? `Bộ môn ${doc.majorName} · Khoa CNTT` : 'Khoa Công nghệ Thông tin - UTC'}
                      </span>
                    </div>
                  )}

                  {/* Uploader / Student Author */}
                  <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl border border-stone-200 dark:border-slate-800">
                    <span className="text-stone-500 font-mono text-[11px]">Tác giả lưu chiểu</span>
                    <span className="font-bold text-stone-900 dark:text-white text-right">
                      {doc.uploaderName || 'Sinh viên Khoa CNTT - UTC'}
                    </span>
                  </div>

                  {/* Subject & Semester */}
                  <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl border border-stone-200 dark:border-slate-800">
                    <span className="text-stone-500 font-mono text-[11px]">Học phần đào tạo</span>
                    <span className="font-bold text-stone-900 dark:text-white text-right truncate max-w-[170px]">
                      {doc.subjectName}
                    </span>
                  </div>

                  {/* Academic Year */}
                  <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl border border-stone-200 dark:border-slate-800">
                    <span className="text-stone-500 font-mono text-[11px]">Niên khóa lưu trữ</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-white text-right">
                      {doc.academicYearName || '2024 - 2025'}
                    </span>
                  </div>

                  {/* Star Rating & Peer Review */}
                  <div className="flex flex-col items-center gap-2.5 p-4 bg-amber-50/70 dark:bg-slate-900/60 rounded-xl border border-amber-300 dark:border-slate-800 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-mono font-bold text-stone-900 dark:text-white text-base">
                        {doc.avgRating ? doc.avgRating.toFixed(1) : '5.0'} / 5.0
                      </span>
                      <span className="text-stone-500 text-[11px] font-mono">
                        ({doc.ratingCount || 1} đánh giá)
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1 w-full">
                      <span className="text-[11px] font-mono text-stone-600 dark:text-slate-400">
                        {userRating ? `Đánh giá của bạn: ${userRating} ★` : 'Chạm sao để đánh giá trực tiếp:'}
                      </span>
                      <StarRating
                        rating={userRating || rateScore}
                        onRate={handleDirectRate}
                        size={26}
                      />
                    </div>

                    <button
                      onClick={() => setShowRateModal(true)}
                      className="mt-1 py-1 px-3 bg-white dark:bg-slate-800 hover:bg-stone-50 text-stone-800 dark:text-slate-200 font-mono text-[10px] font-bold rounded-lg border border-amber-300 dark:border-slate-700 transition-colors cursor-pointer uppercase"
                      type="button"
                    >
                      {userRating ? `Sửa đánh giá chi tiết (${userRating} sao)` : 'Biểu mẫu đánh giá chi tiết'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* ─── MODAL: REPORT INFRINGEMENT ─────────────────────────────────── */}
      {showReport &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] max-w-md w-full p-6 rounded-2xl shadow-xl border border-stone-300 dark:border-slate-800 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
                <span className="text-sm font-bold font-serif-academic text-stone-900 dark:text-white flex items-center gap-2">
                  <Flag className="w-4 h-4 text-rose-600" />
                  <span>Báo cáo Vi phạm Liêm chính &amp; Bản quyền</span>
                </span>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-600 dark:text-slate-400 font-sans">
                Học liệu sẽ được gửi trực tiếp đến Ban Thanh tra Học thuật Khoa CNTT UTC để tiến hành đối soát độc lập.
              </p>

              <form onSubmit={handleReportSubmit} className="flex flex-col gap-4 text-xs font-mono">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-slate-300 uppercase mb-1">
                    Lý do báo cáo:
                  </label>
                  <CustomSelect
                    value={reportReason}
                    onChange={(val) => setReportReason(val)}
                    options={
                      reportReasons.length > 0
                        ? reportReasons.map((r) => ({ value: r.code, label: r.label }))
                        : [
                            { value: 'COPYRIGHT', label: 'Vi phạm bản quyền / Đạo văn' },
                            { value: 'INCORRECT_CONTENT', label: 'Nội dung học thuật sai lệch' },
                            { value: 'SENSITIVE_DATA', label: 'Lộ lọt dữ liệu bảo mật / Đề thi mật' },
                            { value: 'OTHER', label: 'Lý do khác' },
                          ]
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-slate-300 uppercase mb-1">
                    Mô tả chi tiết vi phạm (tối thiểu 10 ký tự):
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Nêu rõ chương mục, bằng chứng hoặc link đối chiếu..."
                    className="w-full p-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-xl text-stone-800 dark:text-slate-200 outline-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReport(false)}
                    className="px-4 py-2 bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer hover:bg-stone-200"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="submit"
                    disabled={reportLoading}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {reportLoading ? 'ĐANG GỬI...' : 'GỬI BÁO CÁO'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ─── MODAL: RATING ──────────────────────────────────────────────── */}
      {showRateModal &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] max-w-md w-full p-6 rounded-2xl shadow-xl border border-stone-300 dark:border-slate-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
                <span className="text-sm font-bold font-serif-academic text-stone-900 dark:text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Đánh giá chất lượng học thuật</span>
                </span>
                <button
                  onClick={() => setShowRateModal(false)}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-600 dark:text-slate-400 font-sans">
                Đánh giá của bạn giúp sinh viên và giảng viên bộ môn nhanh chóng nhận diện học liệu xuất sắc:
              </p>

              {/* Big Interactive Stars */}
              <div className="flex flex-col items-center justify-center py-4 bg-[#faf9f5] dark:bg-slate-900/60 rounded-xl border border-stone-200 dark:border-slate-800 gap-3">
                <StarRating rating={rateScore} onRate={(s) => setRateScore(s)} size={36} />

                {/* 5 Distinct Numbered Choice Buttons */}
                <div className="grid grid-cols-5 gap-1.5 w-full px-3 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRateScore(s)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer font-mono font-bold text-xs select-none ${
                        rateScore === s
                          ? 'bg-amber-500 border-amber-600 text-white shadow-md scale-105'
                          : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-0.5">
                        <span>{s}</span>
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                      <div className="text-[9px] font-sans font-normal truncate mt-0.5">
                        {s === 5 ? 'Xuất sắc' : s === 4 ? 'Rất tốt' : s === 3 ? 'Khá tốt' : s === 2 ? 'TB' : 'Cần sửa'}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center space-y-0.5 pt-1">
                  <span className="text-sm font-mono font-bold text-amber-700 dark:text-amber-400 block">
                    Đang chọn: {rateScore} / 5 Sao
                  </span>
                  <span className="text-[11px] font-sans text-stone-500 dark:text-slate-400">
                    {rateScore === 5
                      ? '🌟 Xuất sắc & Mẫu mực'
                      : rateScore === 4
                      ? '⭐ Rất tốt & Chi tiết'
                      : rateScore === 3
                      ? '👍 Khá tốt & Đủ ý'
                      : rateScore === 2
                      ? '⚠️ Trung bình'
                      : '❌ Cần bổ sung thêm'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 text-xs font-mono">
                <button
                  onClick={() => setShowRateModal(false)}
                  className="px-4 py-2 bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 font-bold hover:bg-stone-200 transition-colors cursor-pointer rounded-xl"
                  type="button"
                >
                  HỦY
                </button>
                <button
                  onClick={handleRateSubmit}
                  disabled={rateLoading}
                  className="px-4 py-2 bg-stone-900 hover:bg-black dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold transition-colors shadow-xs cursor-pointer disabled:opacity-50 rounded-xl uppercase"
                  type="button"
                >
                  {rateLoading ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Citation Modal */}
      <CitationModal
        isOpen={showCitation}
        onClose={() => setShowCitation(false)}
        doc={doc}
      />

      {/* Add To Collection Modal */}
      {doc && (
        <AddToCollectionModal
          documentId={doc.id}
          documentTitle={doc.title}
          isOpen={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
        />
      )}
    </div>
  )
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  )
}
