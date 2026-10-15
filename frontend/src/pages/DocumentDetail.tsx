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
  ListTree,
  Code2,
  GitFork,
  Zap,
  Star,
  Bookmark,
  FolderPlus,
  Flag,
  ShieldCheck,
  User,
  Calendar,
  FileQuestion,
  X,
  AlertTriangle,
  AlertCircle,
  School,
  Gavel,
  History,
  MessageSquareQuote,
  Layers,
  ChevronDown
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Spinner from '../components/ui/Spinner'
import StarRating from '../components/ui/StarRating'
import CitationModal from '../components/CitationModal'
import CodeViewer from '../components/CodeViewer'
import DocumentQASection from '../components/DocumentQASection'
import AddToCollectionModal from '../components/AddToCollectionModal'
import { getDocument, getRelatedDocuments, documentApi } from '../api/documentApi'
import { getPreviewUrl, getDownloadUrl } from '../api/fileApi'
import { addBookmark, removeBookmark, rateDocument, reportDocument } from '../api/interactionApi'
import { getLov } from '../api/catalogApi'
import { getErrorMessage } from '../utils/errorMessages'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import type { DocumentDetail as DocDetail, RelatedDocument, DocumentReviewHistory } from '../types/document'
import type { LovItem } from '../types/catalog'

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const viewerContainerRef = useRef<HTMLDivElement>(null)

  const [doc, setDoc] = useState<DocDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCitation, setShowCitation] = useState(false)
  const [showCollectionModal, setShowCollectionModal] = useState(false)

  // Academic Related Documents State
  const [relatedDocs, setRelatedDocs] = useState<RelatedDocument[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  // Review Timeline State (U4)
  const [reviews, setReviews] = useState<DocumentReviewHistory[]>([])

  // PDF Viewer State
  const [pdfUrl, setPdfUrl] = useState<string>('/sample.pdf')
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [activeFileId, setActiveFileId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(48)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dlLoading, setDlLoading] = useState(false)

  // Interactions State
  const [bookmarked, setBookmarked] = useState(false)
  const [bmLoading, setBmLoading] = useState(false)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [showRateModal, setShowRateModal] = useState(false)
  const [rateScore, setRateScore] = useState(5)
  const [rateLoading, setRateLoading] = useState(false)

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
        setBookmarked(data.bookmarked)
        if (data.userRating) setUserRating(data.userRating)

        // Fetch related academic documents in parallel
        getRelatedDocuments(docId, 4)
          .then((res) => setRelatedDocs(res || []))
          .catch(() => setRelatedDocs([]))

        // Fetch review timeline history (U4)
        documentApi.getDocumentReviews(docId)
          .then((res) => setReviews(res || []))
          .catch(() => setReviews([]))

        // Automatically resolve primary PDF for direct viewing
        const primary = data.files.find((f) => f.isPrimary) ?? data.files[0]
        if (primary) {
          setActiveFileId(primary.id)
          try {
            const previewRes = await getPreviewUrl(primary.id)
            if (previewRes?.url && !previewRes.url.includes('YOUR_PROJECT.supabase.co')) {
              setPdfUrl(previewRes.url)
            } else {
              setPdfUrl('/sample.pdf')
            }
          } catch {
            setPdfUrl('/sample.pdf')
          }
        } else {
          setPdfUrl('/sample.pdf')
        }
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    fetchDoc()
  }, [id])

  // Convert pdfUrl to Blob URL to prevent IDM auto-intercepting on preview
  useEffect(() => {
    let active = true
    let currentBlobUrl: string | null = null

    if (pdfUrl) {
      fetch(pdfUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Không thể tải file PDF preview')
          return res.blob()
        })
        .then((blob) => {
          if (!active) return
          const pdfBlob = new Blob([blob], { type: 'application/pdf' })
          currentBlobUrl = URL.createObjectURL(pdfBlob)
          setBlobUrl(currentBlobUrl)
        })
        .catch((err) => {
          console.warn('PDF preview blob conversion fallback:', err)
          if (active) setBlobUrl(pdfUrl)
        })
    }

    return () => {
      active = false
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl)
      }
    }
  }, [pdfUrl])

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
  const handleSelectFile = async (fileId: number) => {
    setActiveFileId(fileId)
    try {
      const res = await getPreviewUrl(fileId)
      if (res?.url && !res.url.includes('YOUR_PROJECT.supabase.co')) {
        setPdfUrl(res.url)
      } else {
        setPdfUrl('/sample.pdf')
      }
    } catch {
      setPdfUrl('/sample.pdf')
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
      if (url && !url.includes('YOUR_PROJECT.supabase.co')) {
        const a = document.createElement('a')
        a.href = url
        a.download = targetFile.fileName
        a.target = '_blank'
        a.click()
      } else {
        const a = document.createElement('a')
        a.href = '/sample.pdf'
        a.download = targetFile.fileName
        a.click()
      }
    } catch {
      const a = document.createElement('a')
      a.href = '/sample.pdf'
      a.download = targetFile.fileName
      a.click()
    } finally {
      setDlLoading(false)
    }
  }

  // Handle Bookmark toggle
  const handleBookmark = async () => {
    if (!doc) return
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setBmLoading(true)
    try {
      if (bookmarked) {
        await removeBookmark(doc.id)
        setBookmarked(false)
        toast.info('Đã xóa khỏi Tủ tài liệu cá nhân')
      } else {
        await addBookmark(doc.id)
        setBookmarked(true)
        toast.success('Đã lưu vào Tủ tài liệu thành công!')
      }
    } catch (err) {
      toast.error('Lỗi thao tác', getErrorMessage(err))
    } finally {
      setBmLoading(false)
    }
  }

  // Handle Rating
  const handleRateSubmit = async () => {
    if (!doc) return
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setRateLoading(true)
    try {
      await rateDocument(doc.id, rateScore)
      setUserRating(rateScore)
      setShowRateModal(false)
      toast.success(`Đã gửi đánh giá ${rateScore} sao thành công!`, 'Cảm ơn phản hồi học thuật của bạn.')
    } catch (err) {
      toast.error('Lỗi khi gửi đánh giá', getErrorMessage(err))
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
  const handleToggleFullscreen = () => {
    if (!viewerContainerRef.current) return
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <Spinner />
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-16 px-4">
          <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Không tìm thấy tài liệu</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {error || 'Tài liệu không tồn tại hoặc đã bị ẩn khỏi hệ thống học liệu Khoa CNTT.'}
            </p>
            <button
              onClick={() => navigate('/search')}
              className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Về trang tra cứu
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const primaryFile = doc.files.find((f) => f.isPrimary) ?? doc.files[0]
  const totalFileSize = doc.files.reduce((acc, f) => acc + (f.fileSize || 0), 0)

  // Status badge helper
  const renderStatusBadge = () => {
    switch (doc.status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ĐÃ KIỂM DUYỆT (APPROVED)
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            CHỜ DUYỆT (PENDING)
          </span>
        )
      case 'REVISION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            YÊU CẦU CHỈNH SỬA
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-300 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            TỪ CHỐI (REJECTED)
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            BẢN NHÁP (DRAFT)
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-150">
      <Navbar />

      <main className="w-full pt-16">
        <div className="flex flex-col w-full">
          {/* TOP BREADCRUMB & METADATA BAR */}
          <div className="w-full bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 flex-wrap">
                <Link to="/search" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Kho Học Liệu</span>
                </Link>
                <span>/</span>
                <span className="text-slate-800 dark:text-slate-200 uppercase font-semibold">
                  {doc.documentTypeLabel || 'HỌC LIỆU'}
                </span>
                <span>/</span>
                {doc.subjectId ? (
                  <Link
                    to={`/search?subjectId=${doc.subjectId}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs sm:max-w-md font-medium"
                  >
                    {doc.subjectName}
                  </Link>
                ) : (
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs sm:max-w-md">
                    {doc.subjectName || 'Khoa CNTT'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-slate-700">
                  MÃ ĐỀ TÀI: #{88000 + doc.id}
                </span>
              </div>
            </div>
          </div>

          {/* MAIN TWO-COLUMN CONTENT */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: ~68% (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* 1. HEADER BLOCK & METADATA */}
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col gap-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {renderStatusBadge()}
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg uppercase">
                      {doc.documentTypeLabel || 'BÁO CÁO HỌC PHẦN'}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg">
                      {doc.academicYearName || 'Niên khóa 2024 - 2025'}
                    </span>
                    {doc.targetYear && (
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1">
                        <School className="w-3.5 h-3.5" />
                        <span>
                          {doc.targetYear === 'YEAR_1' ? 'NĂM 1' : doc.targetYear === 'YEAR_2' ? 'NĂM 2' : doc.targetYear === 'YEAR_3' ? 'NĂM 3' : doc.targetYear === 'YEAR_4' ? 'NĂM 4' : 'NĂM 5'}
                        </span>
                      </span>
                    )}
                    {doc.advisorName && (
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>GVHD: {doc.advisorName}</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {doc.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 text-xs border-y border-slate-100 dark:border-slate-800 py-3">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Học phần:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{doc.subjectName}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Cập nhật:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                        {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString('vi-VN')}
                      </strong>
                    </span>
                  </div>

                  {/* ABSTRACT BLOCK */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Tóm tắt đề tài (Abstract)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                      {doc.abstractText ||
                        'Đề tài tập trung nghiên cứu, thiết kế và hiện thực hóa học liệu số dành riêng cho giảng viên và sinh viên Khoa Công nghệ Thông tin - Trường Đại học Giao thông Vận tải.'}
                    </p>
                    {doc.description && (
                      <p className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {doc.description}
                      </p>
                    )}
                  </div>

                  {/* CON DẤU THẨM ĐỊNH LIÊM CHÍNH */}
                  <div className="p-4 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-slate-50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-slate-900/40 border border-blue-200/80 dark:border-blue-800/40 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 dark:border-blue-900/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-300 tracking-wider uppercase">
                          THẨM ĐỊNH LIÊM CHÍNH HỌC THUẬT KHOA CNTT
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold rounded">
                        MÃ ĐỐI SOÁT: {doc.verificationCode || `#UTC-FIT-${88000 + doc.id}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Đơn vị xác thực</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {doc.facultyUnit || 'Khoa Công nghệ Thông tin - UTC'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Phạm vi lưu hành</span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">
                          {doc.sharingScope === 'PUBLIC_REFERENCE' ? 'THAM KHẢO RỘNG RÃI' : 'LƯU HÀNH NỘI BỘ KHOA'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Cam kết quyền tác giả</span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ĐÃ KÝ CAM KẾT</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FUTURE WORK & MẠCH KẾ THỪA HỌC THUẬT */}
                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                      <GitFork className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Mạch kế thừa học thuật &amp; Hướng nghiên cứu cho sinh viên khóa sau:</span>
                    </div>
                    <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed text-justify">
                      {doc.futureWorkSuggestions ||
                        '1. Tối ưu kiến trúc microservices và mở rộng bộ chỉ mục ngữ nghĩa; 2. Thử nghiệm trên dữ liệu bài giảng thực tế của Khoa; 3. Kế thừa mã nguồn mở để hoàn thiện các module phục vụ đào tạo tại UTC.'}
                    </p>
                  </div>

                  {/* REVIEW TIMELINE / LỊCH SỬ THẨM ĐỊNH (U4) */}
                  {reviews && reviews.length > 0 && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                        <History className="w-4 h-4 text-blue-600" />
                        <span>Lịch sử Thẩm định &amp; Kiểm duyệt Học thuật:</span>
                      </div>
                      <div className="space-y-2.5 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                        {reviews.map((rev) => (
                          <div key={rev.id} className="relative pl-4 text-xs">
                            <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
                            <div className="flex items-center gap-2 font-semibold">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                rev.decision === 'APPROVED'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  : rev.decision === 'REJECTED'
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              }`}>
                                {rev.decision === 'APPROVED' ? 'ĐÃ DUYỆT' : rev.decision === 'REJECTED' ? 'TỪ CHỐI' : 'YÊU CẦU SỬA'}
                              </span>
                              <span className="text-slate-500 font-mono text-[11px]">
                                {new Date(rev.actionAt).toLocaleString('vi-VN')}
                              </span>
                              {rev.reviewerName && (
                                <span className="text-slate-600 dark:text-slate-400 font-normal">bởi {rev.reviewerName}</span>
                              )}
                            </div>
                            {rev.comment && (
                              <p className="mt-1 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 leading-relaxed">
                                {rev.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TECH STACK */}
                  {doc.technologies && doc.technologies.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                        Công nghệ &amp; Kỹ thuật sử dụng
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {doc.technologies.map((t) => (
                          <span
                            key={t.id}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MEMBERS & GITHUB */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                        Người đăng tải học liệu:
                      </span>
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {doc.uploaderName || 'Sinh viên Khoa CNTT - UTC'}
                        </span>
                      </div>
                    </div>

                    {doc.githubUrl && (
                      <a
                        href={doc.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                      >
                        <Code2 className="w-4 h-4" />
                        <span>Xem GitHub Repository</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>

                {/* 2. KHUNG XEM TRƯỚC TÀI LIỆU (PDF VIEWER DIRECT) */}
                <div
                  ref={viewerContainerRef}
                  className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col"
                >
                  {/* VIEWER TOOLBAR */}
                  <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>TRÌNH XEM HỌC THUẬT</span>
                      </span>

                      {/* Page Navigator */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage <= 1}
                          className="p-1 hover:text-blue-600 transition-colors disabled:opacity-30 cursor-pointer"
                          title="Trang trước"
                          type="button"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-mono font-bold px-1 select-none">
                          {String(currentPage).padStart(2, '0')} / {totalPages}
                        </span>
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage >= totalPages}
                          className="p-1 hover:text-blue-600 transition-colors disabled:opacity-30 cursor-pointer"
                          title="Trang kế"
                          type="button"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Zoom Controls */}
                      <div className="flex items-center bg-white dark:bg-slate-900 px-2 py-1 gap-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                        <button
                          onClick={handleZoomOut}
                          className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Thu nhỏ"
                          type="button"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-xs select-none">{zoomLevel}%</span>
                        <button
                          onClick={handleZoomIn}
                          className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Phóng to"
                          type="button"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Fullscreen Button */}
                      <button
                        onClick={handleToggleFullscreen}
                        className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                        type="button"
                        title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                      >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>

                      {/* Open New Tab Button */}
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở tab mới</span>
                      </a>
                    </div>
                  </div>

                  {/* DOCUMENT VIEWER BODY */}
                  <div className="bg-slate-900/5 dark:bg-slate-950 p-2 sm:p-4 flex flex-col justify-center items-center min-h-[640px]">
                    <div
                      className="w-full bg-white dark:bg-slate-900 shadow-md overflow-hidden relative rounded-xl"
                      style={{
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.15s ease-out',
                      }}
                    >
                      {blobUrl ? (
                        <iframe
                          src={`${blobUrl}#page=${currentPage}&zoom=${zoomLevel}`}
                          className="w-full h-[680px] sm:h-[760px] border-0 block"
                          title={doc.title}
                        />
                      ) : (
                        <div className="w-full h-[680px] sm:h-[760px] flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-white dark:bg-slate-900">
                          <span className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                          <p className="text-xs font-medium">Đang chuẩn bị học liệu số xem trực tuyến...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. DANH SÁCH FILE ĐÍNH KÈM */}
                <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      <span>Tệp đính kèm trong hồ sơ ({doc.files?.length || 0} tệp)</span>
                    </span>
                    {totalFileSize > 0 && (
                      <span className="text-xs text-slate-500 font-mono">
                        Dung lượng tổng: {formatFileSize(totalFileSize)}
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
                            className={`p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex flex-col justify-between gap-3 border transition-colors ${
                              isSelected ? 'border-blue-600 dark:border-blue-500' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={f.fileName}>
                                  {f.fileName}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                                  <span>{f.fileSize ? formatFileSize(f.fileSize) : 'Tài liệu số'}</span>
                                  <span>•</span>
                                  <span>{ext}</span>
                                  {f.isPrimary && (
                                    <>
                                      <span>•</span>
                                      <span className="text-blue-600 dark:text-blue-400 font-bold">CHÍNH THỨC</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                              {isPdf && (
                                <button
                                  onClick={() => handleSelectFile(f.id)}
                                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                  }`}
                                  type="button"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{isSelected ? 'Đang xem' : 'Xem trực tiếp'}</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDownload(f.id)}
                                disabled={dlLoading}
                                className={`${isPdf ? '' : 'w-full'} py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer`}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Tải về</span>
                              </button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="col-span-full p-6 bg-slate-50 dark:bg-slate-900/60 text-slate-400 text-xs rounded-xl text-center">
                        Học liệu này đã được số hóa trực tiếp trên hệ thống.
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. MÃ NGUỒN MẪU TRỰC TUYẾN (NẾU CÓ) */}
                {doc.sourceCodeSnippet && (
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-blue-600" />
                        <span>Mã nguồn mẫu trực tuyến ({doc.codeLanguage || 'Mã nguồn'})</span>
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono font-bold uppercase border border-blue-200 dark:border-blue-800">
                        {doc.codeLanguage || 'SOURCE'}
                      </span>
                    </div>
                    <CodeViewer
                      code={doc.sourceCodeSnippet}
                      language={doc.codeLanguage}
                      title={`Thực thi & Minh họa: ${doc.title}`}
                    />
                  </div>
                )}

                {/* 5. HỌC LIỆU CÙNG MẠCH HỌC THUẬT */}
                {relatedDocs.length > 0 && (
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>Học liệu cùng mạch học thuật &amp; Hướng nghiên cứu</span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {relatedDocs.length} tài liệu liên quan
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
                          className="p-4 bg-slate-50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all flex flex-col justify-between gap-3 cursor-pointer group rounded-xl shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase rounded border border-blue-200 dark:border-blue-800">
                                {item.documentTypeLabel}
                              </span>
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded">
                                {item.similarityScore}% tương quan
                              </span>
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {item.subjectName} • {item.academicYearName}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium text-[10px] truncate max-w-[180px]">
                              {item.matchReason}
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              Xem chi tiết →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. HỎI ĐÁP HỌC THUẬT & GÓP Ý TRỰC TIẾP */}
                <DocumentQASection documentId={doc.id} />
              </div>

              {/* RIGHT COLUMN: ~32% (4 cols) Sticky Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-6 sticky top-20">
                {/* CARD 1: THAO TÁC HỌC THUẬT */}
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span>THAO TÁC HỌC THUẬT</span>
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold rounded">
                      FIT-UTC
                    </span>
                  </div>

                  {/* Nút đọc toàn màn hình */}
                  <button
                    onClick={handleToggleFullscreen}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                    type="button"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>ĐỌC TOÀN MÀN HÌNH</span>
                  </button>

                  {/* Nút Tải xuống PDF */}
                  <button
                    onClick={() => handleDownload()}
                    disabled={dlLoading}
                    className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-between rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>{dlLoading ? 'Đang chuẩn bị...' : 'Tải tài liệu chính thức'}</span>
                    </span>
                    {primaryFile?.fileSize && (
                      <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono rounded">
                        {formatFileSize(primaryFile.fileSize)}
                      </span>
                    )}
                  </button>

                  {/* Nút Trích dẫn học thuật */}
                  <button
                    onClick={() => setShowCitation(true)}
                    className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 rounded-xl transition-colors cursor-pointer"
                    type="button"
                  >
                    <MessageSquareQuote className="w-4 h-4 text-blue-600" />
                    <span>TRÍCH DẪN (IEEE / APA / BIBTEX)</span>
                  </button>

                  {/* Bookmark button */}
                  <button
                    onClick={handleBookmark}
                    disabled={bmLoading}
                    className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 rounded-xl transition-colors cursor-pointer"
                    type="button"
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                    <span>{bookmarked ? 'Đã lưu trong tủ tài liệu' : 'Lưu vào danh sách đọc sau'}</span>
                  </button>

                  {/* Add to Collection button */}
                  <button
                    onClick={() => setShowCollectionModal(true)}
                    className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 rounded-xl transition-colors cursor-pointer"
                    type="button"
                  >
                    <FolderPlus className="w-4 h-4 text-blue-600" />
                    <span>THÊM VÀO BỘ SƯU TẬP</span>
                  </button>

                  {/* Report button */}
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full py-1.5 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 rounded-lg transition-colors cursor-pointer"
                    type="button"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Báo cáo vi phạm / Bản quyền</span>
                  </button>
                </div>

                {/* CARD 2: THÔNG TIN HỌC THUẬT & ĐÁNH GIÁ */}
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-4">
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <School className="w-4 h-4 text-blue-600" />
                    <span>Thông tin học thuật &amp; Độc giả</span>
                  </div>

                  <div className="flex flex-col gap-3 text-xs">
                    {doc.advisorName && (
                      <div className="flex flex-col bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                          GIẢNG VIÊN HƯỚNG DẪN
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                          {doc.advisorName}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {doc.majorName ? `Bộ môn ${doc.majorName} · Khoa CNTT` : 'Khoa Công nghệ Thông tin - UTC'}
                        </span>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-center pt-1 text-xs">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">LƯỢT XEM</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {doc.viewCount || 0}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">LƯỢT TẢI</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {doc.downloadCount || 0}
                        </span>
                      </div>
                    </div>

                    {/* Rating display & Action */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-slate-800 dark:text-slate-200">
                          {doc.avgRating > 0 ? doc.avgRating.toFixed(1) : 'Chưa có'} / 5.0
                        </span>
                        <span className="text-slate-400 text-[11px] font-normal">
                          ({doc.ratingCount || 0})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (!isAuthenticated) navigate('/login')
                          else setShowRateModal(true)
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                      >
                        Đánh giá ngay
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD 3: CHÍNH SÁCH BẢO HỘ & PHÁP LÝ */}
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                    <Gavel className="w-4 h-4 text-blue-600" />
                    <span>Chính sách &amp; Pháp lý</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                    Học liệu lưu hành nội bộ phục vụ mục đích nghiên cứu và học tập của sinh viên Khoa CNTT - ĐH Giao thông Vận tải.
                  </p>

                  <div className="pt-2 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Cho phép tham khảo học phần &amp; trích dẫn chuẩn</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Nghiêm cấm đạo văn hoặc nộp lại nguyên văn</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* MODAL: BÁO CÁO VI PHẠM */}
      {showReport &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] max-w-lg w-full p-6 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-rose-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Báo cáo vi phạm tài liệu</span>
                </span>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer p-1 rounded-lg"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Gửi yêu cầu kiểm tra tới Hội đồng Thẩm định Khoa CNTT - ĐH GTVT nếu phát hiện nội dung có vi phạm:
              </p>

              <form onSubmit={handleReportSubmit} className="flex flex-col gap-3 text-xs">
                {reportReasons.map((r) => (
                  <label
                    key={r.code}
                    className="flex items-center gap-2.5 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.code}
                      checked={reportReason === r.code}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="accent-blue-600"
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{r.label}</span>
                  </label>
                ))}

                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Ghi chú cụ thể (Trang vi phạm, tài liệu đối chứng) *:
                  </span>
                  <textarea
                    required
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Ví dụ: Trang 18 trích nguyên văn mã nguồn từ repository ABC..."
                    rows={3}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl resize-none text-xs focus:ring-2 focus:ring-blue-600 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowReport(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors cursor-pointer rounded-xl"
                    type="button"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="submit"
                    disabled={reportLoading}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-xs cursor-pointer disabled:opacity-50 rounded-xl"
                  >
                    {reportLoading ? 'ĐANG GỬI...' : 'GỬI BÁO CÁO'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL: ĐÁNH GIÁ TÀI LIỆU */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] max-w-md w-full p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Đánh giá chất lượng tài liệu</span>
              </span>
              <button
                onClick={() => setShowRateModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Chia sẻ đánh giá giúp sinh viên khác nhanh chóng tìm thấy học liệu chất lượng:
            </p>

            <div className="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 gap-2">
              <StarRating rating={rateScore} onRate={(s) => setRateScore(s)} size={32} />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {rateScore} / 5 Sao
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 text-xs">
              <button
                onClick={() => setShowRateModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors cursor-pointer rounded-xl"
                type="button"
              >
                HỦY
              </button>
              <button
                onClick={handleRateSubmit}
                disabled={rateLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-xs cursor-pointer disabled:opacity-50 rounded-xl"
                type="button"
              >
                {rateLoading ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
              </button>
            </div>
          </div>
        </div>
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
