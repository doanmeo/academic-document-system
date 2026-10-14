import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Spinner from '../components/ui/Spinner'
import StarRating from '../components/ui/StarRating'
import CitationModal from '../components/CitationModal'
import { getDocument, getRelatedDocuments } from '../api/documentApi'
import { getPreviewUrl, getDownloadUrl } from '../api/fileApi'
import { addBookmark, removeBookmark, rateDocument, reportDocument } from '../api/interactionApi'
import { getLov } from '../api/catalogApi'
import { getErrorMessage } from '../utils/errorMessages'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import type { DocumentDetail as DocDetail, RelatedDocument } from '../types/document'
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

  // Academic Related Documents State
  const [relatedDocs, setRelatedDocs] = useState<RelatedDocument[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

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

  // Listen for fullscreen change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Handle previewing a specific attached file
  const handleSelectFile = async (fileId: number) => {
    setActiveFileId(fileId)
    setViewMode('pdf')
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
    // Scroll smoothly to viewer
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
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
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
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-16 px-4">
          <div className="bg-surface-container-lowest p-8 shadow-sm border border-surface-container text-center max-w-md">
            <span className="material-symbols-outlined text-[48px] text-error mb-2">error</span>
            <h2 className="font-headline-md font-bold text-primary">Không tìm thấy tài liệu</h2>
            <p className="text-body-sm text-on-surface-variant mt-2">
              {error || 'Tài liệu không tồn tại hoặc đã bị ẩn khỏi hệ thống.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-4 py-2 bg-primary text-on-primary font-bold text-body-sm hover:bg-primary-container transition-colors"
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container font-label-code text-label-code font-bold text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            ĐÃ KIỂM DUYỆT (APPROVED)
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 font-label-code text-label-code font-bold text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            CHỜ KIỂM DUYỆT (PENDING)
          </span>
        )
      case 'REVISION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 font-label-code text-label-code font-bold text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            YÊU CẦU CHỈNH SỬA
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-error-container font-label-code text-label-code font-bold text-error">
            <span className="w-2 h-2 rounded-full bg-error"></span>
            TỪ CHỐI (REJECTED)
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container font-label-code text-label-code font-bold text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-on-surface-variant"></span>
            BẢN NHÁP (DRAFT)
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-md text-body-md text-on-surface antialiased">
      <Navbar />

      <main className="w-full pt-16 bg-surface">
        <div className="flex flex-col w-full">
          {/* TOP BREADCRUMB & METADATA BAR */}
          <div className="w-full bg-surface-container-high py-2.5">
            <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 font-label-code text-label-code">
              <div className="flex items-center gap-2 text-on-surface-variant flex-wrap">
                <Link to="/" className="text-primary font-bold hover:underline">
                  KHO HỌC LIỆU
                </Link>
                <span>/</span>
                <span className="text-on-surface uppercase font-semibold">
                  {doc.documentTypeLabel || 'HỌC LIỆU'}
                </span>
                <span>/</span>
                <span className="text-on-surface-variant truncate max-w-xs sm:max-w-md">
                  {doc.subjectName || 'Khoa CNTT'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-white text-slate-700 font-mono text-xs font-semibold rounded border border-slate-200">
                  MÃ ĐỀ TÀI: #{88000 + doc.id}
                </span>
              </div>
            </div>
          </div>

          {/* MAIN TWO-COLUMN CONTENT */}
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: ~68% (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                {/* 1. HEADER BLOCK & METADATA */}
                <div className="bg-surface-container-lowest p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {renderStatusBadge()}
                    <span className="px-3 py-1 bg-surface-container font-label-code text-label-code font-bold text-on-surface uppercase">
                      {doc.documentTypeLabel || 'BÁO CÁO HỌC PHẦN'}
                    </span>
                    <span className="px-3 py-1 bg-surface-container-high font-label-code text-label-code text-on-surface">
                      {doc.academicYearName || 'HỌC KỲ II · 2024 - 2025'}
                    </span>
                    <span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed font-label-code text-label-code font-bold">
                      {doc.majorName ? `BỘ MÔN ${doc.majorName.toUpperCase()}` : 'BỘ MÔN KTPM'}
                    </span>
                    {doc.advisorName && (
                      <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-label-code text-label-code font-bold flex items-center gap-1">
                        <span>GVHD:</span>
                        <span>{doc.advisorName}</span>
                      </span>
                    )}
                  </div>

                  <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase leading-tight">
                    {doc.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-label-code text-label-code">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">menu_book</span>
                      Học phần: <strong className="text-on-surface">{doc.subjectName}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Mã đề tài: <strong className="text-on-surface">FIT-OSS-2025-0{doc.id}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      Cập nhật:{' '}
                      <strong className="text-on-surface">
                        {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString('vi-VN')}
                      </strong>
                    </span>
                  </div>

                  {/* ABSTRACT BLOCK */}
                  <div className="mt-2 p-5 bg-surface-container-low">
                    <div className="font-label-meta text-label-meta uppercase tracking-wider text-primary font-bold mb-2">
                      Tóm tắt đề tài (Abstract)
                    </div>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed text-justify">
                      {doc.abstractText ||
                        'Đề tài tập trung nghiên cứu, thiết kế và hiện thực hóa nền tảng kho tri thức số dành riêng cho giảng viên và sinh viên Khoa Công nghệ Thông tin - Trường Đại học Giao thông Vận tải. Hệ thống giải quyết các vấn đề cốt lõi: phân tán học liệu, trùng lặp đề tài đồ án, thiếu cơ chế xác thực phiên bản tài liệu chuẩn và thiếu công cụ kiểm duyệt học thuật khép kín.'}
                    </p>
                    {doc.description && (
                      <p className="mt-3 pt-3 border-t border-surface-container text-body-sm text-on-surface-variant leading-relaxed">
                        {doc.description}
                      </p>
                    )}
                  </div>

                  {/* CON DẤU THẨM ĐỊNH LIÊM CHÍNH & PHẠM VI LƯU HÀNH NỘI BỘ */}
                  <div className="p-4 bg-gradient-to-r from-blue-950/5 via-indigo-950/5 to-slate-900/5 border border-primary/20 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-primary">verified_user</span>
                        <span className="font-label-code text-caption font-bold text-primary tracking-wider uppercase">
                          CON DẤU THẨM ĐỊNH LIÊM CHÍNH HỌC THUẬT KHOA CNTT
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary font-mono text-[11px] font-bold rounded">
                        MÃ ĐỐI SOÁT: {doc.verificationCode || `#UTC-FIT-${88000 + doc.id}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-on-surface-variant font-medium block uppercase tracking-wider">
                          Đơn vị xác thực
                        </span>
                        <span className="font-semibold text-on-surface text-[11px] block">
                          {doc.facultyUnit || 'Khoa Công nghệ Thông tin - UTC'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-on-surface-variant font-medium block uppercase tracking-wider">
                          Phạm vi lưu hành
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-primary text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {doc.sharingScope === 'PUBLIC_REFERENCE'
                            ? 'THAM KHẢO RỘNG RÃI'
                            : 'LƯU HÀNH NỘI BỘ KHOA'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-on-surface-variant font-medium block uppercase tracking-wider">
                          Cam kết quyền tác giả
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          ĐÃ KÝ CAM KẾT LIÊM CHÍNH
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MẠCH KẾ THỪA HỌC THUẬT & HƯỚNG PHÁT TRIỂN CHO KHÓA SAU (FUTURE WORK) */}
                  <div className="p-4 bg-indigo-50/50 border border-indigo-200/60 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[18px] text-indigo-600">account_tree</span>
                      <span>Mạch kế thừa học thuật &amp; Hướng nghiên cứu cho sinh viên khóa sau:</span>
                    </div>
                    <p className="text-xs text-indigo-950 font-normal leading-relaxed pl-6 text-justify">
                      {doc.futureWorkSuggestions ||
                        '1. Tích hợp mô hình AI đánh giá tự động chất lượng mã nguồn; 2. Thử nghiệm mở rộng trên hạ tầng đám mây phân tán đa cụm; 3. Kế thừa mã nguồn GitHub để hoàn thiện các module phục vụ trực tiếp cho hoạt động giảng dạy của Khoa.'}
                    </p>
                  </div>

                  {/* REVISION NOTE / ADMIN FEEDBACK */}
                  {(doc.revisionNote || doc.rejectionNote) && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800 font-bold font-label-code text-caption uppercase tracking-wider mb-1">
                        <span className="material-symbols-outlined text-[18px] text-amber-600">rate_review</span>
                        <span>Ý kiến phản biện &amp; Nhận xét của Ban Quản trị:</span>
                      </div>
                      <p className="text-body-sm text-on-surface font-medium leading-relaxed">
                        {doc.revisionNote || doc.rejectionNote}
                      </p>
                    </div>
                  )}

                  {/* TECH STACK (Only if technologies exist) */}
                  {doc.technologies && doc.technologies.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-bold">
                        Công nghệ &amp; Kỹ thuật sử dụng
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {doc.technologies.map((t) => (
                          <span
                            key={t.id}
                            className="px-2.5 py-1 bg-surface-container font-label-code text-label-code text-on-surface font-semibold rounded-md border border-surface-container-high"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MEMBERS & GITHUB */}
                  <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {doc.members && doc.members.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-bold">
                          Thành viên thực hiện:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {doc.members.map((m, idx) => (
                            <div
                              key={m.userId || idx}
                              className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg border border-slate-200"
                            >
                              <span className="font-body-sm text-xs font-bold text-on-surface">
                                {m.fullName}
                              </span>
                              {m.studentCode && (
                                <span className="font-mono text-[11px] text-slate-500">
                                  ({m.studentCode})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-bold">
                          Người đăng tải học liệu:
                        </span>
                        <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg w-fit border border-slate-200">
                          <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                          <span className="font-body-sm text-xs font-semibold text-on-surface">
                            {doc.uploaderName || 'Sinh viên Khoa CNTT - UTC'}
                          </span>
                        </div>
                      </div>
                    )}

                    {doc.githubUrl && (
                      <a
                        className="inline-flex items-center gap-2 px-3 py-2 bg-surface-container hover:bg-surface-container-high transition-colors font-label-code text-label-code font-bold text-on-surface self-start md:self-auto shadow-sm"
                        href={doc.githubUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path>
                        </svg>
                        <span>GitHub Repository</span>
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* 2. KHUNG XEM TRƯỚC TÀI LIỆU (PDF VIEWER DIRECT) */}
                <div
                  ref={viewerContainerRef}
                  className="bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col"
                >
                  {/* VIEWER TOOLBAR */}
                  <div className="bg-surface-container-high px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-label-code text-label-code border-b border-surface-container">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-surface-container-highest font-bold text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          picture_as_pdf
                        </span>
                        TRÌNH XEM HỌC THUẬT
                      </span>

                      {/* Page Navigator */}
                      <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage <= 1}
                          className="hover:text-primary transition-colors flex items-center disabled:opacity-30 cursor-pointer"
                          title="Trang trước"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                        </button>
                        <span className="font-bold px-1 select-none">
                          Trang {String(currentPage).padStart(2, '0')} / {totalPages}
                        </span>
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage >= totalPages}
                          className="hover:text-primary transition-colors flex items-center disabled:opacity-30 cursor-pointer"
                          title="Trang kế"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                      </div>

                    </div>

                    <div className="flex items-center gap-2">
                      {/* Zoom Controls */}
                      <div className="flex items-center bg-surface-container-lowest px-2 py-1 gap-2 rounded">
                        <button
                          onClick={handleZoomOut}
                          className="hover:text-primary transition-colors flex items-center cursor-pointer"
                          title="Thu nhỏ"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">zoom_out</span>
                        </button>
                        <span className="font-bold text-xs select-none">{zoomLevel}%</span>
                        <button
                          onClick={handleZoomIn}
                          className="hover:text-primary transition-colors flex items-center cursor-pointer"
                          title="Phóng to"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                        </button>
                      </div>

                      {/* Fullscreen Button */}
                      <button
                        onClick={handleToggleFullscreen}
                        className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer rounded"
                        type="button"
                        title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                        </span>
                        <span className="hidden sm:inline text-xs">
                          {isFullscreen ? 'Thu nhỏ' : 'Fullscreen'}
                        </span>
                      </button>

                      {/* Open New Tab Button */}
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-primary text-on-primary font-bold flex items-center gap-1 hover:bg-primary/90 transition-colors shadow-xs cursor-pointer rounded text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        <span>Mở tab mới</span>
                      </a>
                    </div>
                  </div>

                  {/* DOCUMENT VIEWER BODY */}
                  <div className="bg-slate-900/5 p-2 sm:p-4 flex flex-col justify-center items-center min-h-[640px]">
                    <div
                      className="w-full bg-surface-container-lowest shadow-md overflow-hidden relative rounded"
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
                        <div className="w-full h-[680px] sm:h-[760px] flex flex-col items-center justify-center p-8 text-center text-on-surface-variant bg-surface-container-lowest">
                          <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                          <p className="text-body-sm font-medium">Đang chuẩn bị học liệu số xem trực tuyến...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. DANH SÁCH FILE ĐÍNH KÈM */}
                <div className="p-6 bg-surface-container-lowest shadow-sm rounded-xl border border-surface-container flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">attachment</span>
                      Tệp đính kèm trong hồ sơ ({doc.files?.length || 0} tệp)
                    </span>
                    {totalFileSize > 0 && (
                      <span className="font-label-code text-xs text-on-surface-variant">
                        Dung lượng tổng: {formatFileSize(totalFileSize)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doc.files && doc.files.length > 0 ? (
                      doc.files.map((f) => {
                        const isPdf = f.fileName.toLowerCase().endsWith('.pdf')
                        const isPptx =
                          f.fileName.toLowerCase().endsWith('.pptx') ||
                          f.fileName.toLowerCase().endsWith('.ppt')
                        const isSelected = activeFileId === f.id
                        const ext = f.fileName.split('.').pop()?.toUpperCase() || 'FILE'

                        return (
                          <div
                            key={f.id}
                            className={`p-4 bg-surface-container-low flex flex-col justify-between gap-3 border rounded-lg transition-colors ${
                              isSelected ? 'border-primary' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2.5 rounded-lg ${
                                  isPdf
                                    ? 'bg-red-50 text-red-600 border border-red-200'
                                    : isPptx
                                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                    : 'bg-primary/10 text-primary border border-primary/20'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[24px]">
                                  {isPdf ? 'picture_as_pdf' : isPptx ? 'slideshow' : 'insert_drive_file'}
                                </span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span
                                  className="font-body-sm text-body-sm font-bold text-on-surface truncate"
                                  title={f.fileName}
                                >
                                  {f.fileName}
                                </span>
                                <div className="flex items-center gap-2 font-label-code text-xs text-on-surface-variant flex-wrap">
                                  <span>{f.fileSize ? formatFileSize(f.fileSize) : 'Tài liệu số'}</span>
                                  <span>•</span>
                                  <span>{ext}</span>
                                  {f.isPrimary && (
                                    <>
                                      <span>•</span>
                                      <span className="text-primary font-bold">CHÍNH THỨC</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                              {isPdf && (
                                <button
                                  onClick={() => handleSelectFile(f.id)}
                                  className={`flex-1 py-1.5 px-3 font-label-code text-xs font-bold flex items-center justify-center gap-1 rounded transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-primary text-on-primary'
                                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                                  }`}
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    visibility
                                  </span>
                                  {isSelected ? 'Đang xem' : 'Xem trực tiếp'}
                                </button>
                              )}
                              <button
                                onClick={() => handleDownload(f.id)}
                                disabled={dlLoading}
                                className={`${
                                  isPdf ? '' : 'w-full'
                                } py-1.5 px-3 bg-primary text-on-primary hover:bg-primary/90 font-label-code text-xs font-bold flex items-center justify-center gap-1 rounded transition-colors shadow-xs cursor-pointer`}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  download
                                </span>
                                Tải về
                              </button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="col-span-full p-6 bg-surface-container-low text-on-surface-variant text-body-sm rounded-lg text-center flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[28px] text-on-surface-variant/60">folder_open</span>
                        <p>Học liệu này đã được số hóa trực tiếp trên hệ thống.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. MỤC LỤC TÀI LIỆU CHÍNH */}
                <div className="bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        format_list_bulleted
                      </span>
                      Cấu trúc tài liệu (Table of Contents)
                    </span>
                    <span className="font-label-code text-label-code text-on-surface-variant">
                      4 Chương · 12 Mục
                    </span>
                  </div>

                  <div className="flex flex-col font-label-code text-label-code">
                    <div
                      onClick={() => {
                        setCurrentPage(4)
                        setViewMode('pdf')
                        viewerContainerRef.current?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="py-2.5 px-3 bg-surface-container-low flex justify-between items-center hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <span className="font-bold text-on-surface">
                        CHƯƠNG 1: TỔNG QUAN HỆ THỐNG VÀ BÀI TOÁN QUẢN LÝ HỌC LIỆU
                      </span>
                      <span className="text-on-surface-variant font-medium">Trang 04</span>
                    </div>
                    <div
                      onClick={() => {
                        setCurrentPage(6)
                        setViewMode('pdf')
                        viewerContainerRef.current?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="py-2.5 px-3 flex justify-between items-center hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <span className="text-on-surface pl-4">
                        1.1. Hiện trạng chia sẻ tài liệu tại Khoa CNTT - ĐH Giao thông Vận tải
                      </span>
                      <span className="text-on-surface-variant">Trang 06</span>
                    </div>
                    <div
                      onClick={() => {
                        setCurrentPage(11)
                        setViewMode('pdf')
                        viewerContainerRef.current?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="py-2.5 px-3 flex justify-between items-center hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <span className="text-on-surface pl-4">
                        1.2. Mục tiêu nghiên cứu và phạm vi triển khai học phần
                      </span>
                      <span className="text-on-surface-variant">Trang 11</span>
                    </div>

                    <div
                      onClick={() => {
                        setCurrentPage(15)
                        setViewMode('pdf')
                        viewerContainerRef.current?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="py-2.5 px-3 bg-surface-container-low flex justify-between items-center hover:bg-surface-container transition-colors cursor-pointer mt-1"
                    >
                      <span className="font-bold text-on-surface">
                        CHƯƠNG 2: KIẾN TRÚC HỆ THỐNG VÀ THIẾT KẾ CƠ SỞ DỮ LIỆU
                      </span>
                      <span className="text-on-surface-variant font-medium">Trang 15</span>
                    </div>
                    <div
                      onClick={() => {
                        setCurrentPage(18)
                        setViewMode('pdf')
                        viewerContainerRef.current?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="py-2.5 px-3 flex justify-between items-center hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <span className="text-on-surface pl-4">
                        2.1. Phân tích mô hình Client-Server &amp; RESTful API Spring Boot
                      </span>
                      <span className="text-on-surface-variant">Trang 18</span>
                    </div>
                    <div
                      onClick={() => {
                        setCurrentPage(24)
                        setViewMode('pdf')
                        viewerContainerRef.current?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="py-2.5 px-3 flex justify-between items-center hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <span className="text-on-surface pl-4">
                        2.2. Thiết kế ERD và cơ chế lưu trữ phân tán Supabase Storage
                      </span>
                      <span className="text-on-surface-variant">Trang 24</span>
                    </div>

                    <div
                      onClick={() => {
                        setCurrentPage(29)
                        setViewMode('pdf')
                        viewerContainerRef.current?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="py-2.5 px-3 bg-surface-container-low flex justify-between items-center hover:bg-surface-container transition-colors cursor-pointer mt-1"
                    >
                      <span className="font-bold text-on-surface">
                        CHƯƠNG 3: HIỆN THỰC HÓA CÁC PHÂN HỆ VÀ TÍCH HỢP UI/UX
                      </span>
                      <span className="text-on-surface-variant font-medium">Trang 29</span>
                    </div>

                    <div
                      onClick={() => {
                        setCurrentPage(42)
                        setViewMode('pdf')
                        viewerContainerRef.current?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="py-2.5 px-3 bg-surface-container-low flex justify-between items-center hover:bg-surface-container transition-colors cursor-pointer mt-1"
                    >
                      <span className="font-bold text-on-surface">
                        CHƯƠNG 4: THỬ NGHIỆM ĐÁNH GIÁ VÀ HƯỚNG PHÁT TRIỂN
                      </span>
                      <span className="text-on-surface-variant font-medium">Trang 42</span>
                    </div>
                  </div>
                </div>

                {/* 5. HỌC LIỆU CÙNG MẠCH HỌC THUẬT & CÙNG HƯỚNG NGHIÊN CỨU */}
                {relatedDocs.length > 0 && (
                  <div className="bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">hub</span>
                        Học liệu cùng mạch học thuật &amp; Hướng nghiên cứu
                      </span>
                      <span className="font-label-code text-label-code text-on-surface-variant font-medium">
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
                          className="p-4 bg-surface-container-low hover:bg-surface-container border border-surface-container hover:border-primary/40 transition-all flex flex-col justify-between gap-3 cursor-pointer group rounded-xl shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded tracking-wider">
                                {item.documentTypeLabel}
                              </span>
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                {item.similarityScore}% tương quan
                              </span>
                            </div>
                            <h4 className="font-bold text-body-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                              {item.title}
                            </h4>
                            <p className="text-caption text-on-surface-variant mt-1">
                              {item.subjectName} • {item.academicYearName}
                            </p>
                            {item.advisorName && (
                              <p className="text-[11px] text-indigo-700 font-medium mt-0.5 flex items-center gap-1">
                                <span className="text-[9px] bg-indigo-50 border border-indigo-100 px-1 rounded font-bold">GVHD</span>
                                <span>{item.advisorName}</span>
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-surface-container flex items-center justify-between text-[11px]">
                            <span className="text-secondary font-semibold text-[10px]">
                              {item.matchReason}
                            </span>
                            <span className="text-primary font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              Xem chi tiết →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: ~32% (4 cols) Sticky Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-6 sticky top-20">
                {/* CARD 1: HÀNH ĐỘNG HỌC THUẬT */}
                <div className="bg-surface-container-lowest p-6 shadow-sm rounded-xl border border-surface-container flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                    <span className="font-label-code text-label-code font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
                      THAO TÁC HỌC THUẬT
                    </span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded">
                      FIT-UTC
                    </span>
                  </div>

                  {/* Nút đọc toàn màn hình */}
                  <button
                    onClick={handleToggleFullscreen}
                    className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-on-primary font-headline-sm text-sm font-bold flex items-center justify-center gap-2 rounded-lg shadow-sm transition-all group cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                      fullscreen
                    </span>
                    <span>ĐỌC TOÀN MÀN HÌNH</span>
                  </button>

                  {/* Nút Tải xuống PDF */}
                  <button
                    onClick={() => handleDownload()}
                    disabled={dlLoading}
                    className="w-full py-2.5 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-code text-xs font-bold flex items-center justify-between rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">cloud_download</span>
                      <span>{dlLoading ? 'Đang chuẩn bị...' : 'Tải tài liệu chính thức'}</span>
                    </span>
                    {primaryFile?.fileSize && (
                      <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface text-[11px] font-semibold rounded">
                        {formatFileSize(primaryFile.fileSize)}
                      </span>
                    )}
                  </button>

                  {/* Nút Trích dẫn học thuật */}
                  <button
                    onClick={() => setShowCitation(true)}
                    className="w-full py-2.5 px-4 bg-surface-container hover:bg-surface-container-high text-primary font-label-code text-xs font-bold flex items-center justify-center gap-2 rounded-lg transition-colors cursor-pointer border border-primary/20"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">format_quote</span>
                    <span>TRÍCH DẪN (IEEE / APA / BIBTEX)</span>
                  </button>

                  {/* Bookmark button */}
                  <button
                    onClick={handleBookmark}
                    disabled={bmLoading}
                    className="w-full py-2.5 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-code text-xs font-bold flex items-center justify-center gap-2 rounded-lg transition-colors cursor-pointer"
                    type="button"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        bookmarked ? 'text-amber-500' : 'text-on-surface-variant'
                      }`}
                    >
                      {bookmarked ? 'bookmark' : 'bookmark_border'}
                    </span>
                    <span>
                      {bookmarked ? 'Đã lưu trong tủ sách cá nhân' : 'Lưu vào danh sách đọc sau'}
                    </span>
                  </button>

                  {/* Report button */}
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full py-1.5 px-3 text-error hover:bg-error-container/40 font-label-code text-xs font-semibold flex items-center justify-center gap-1.5 rounded transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">flag</span>
                    <span>Báo cáo vi phạm / Bản quyền</span>
                  </button>
                </div>

                {/* CARD 2: THÔNG TIN HỌC THUẬT & ĐÁNH GIÁ */}
                <div className="bg-surface-container-lowest p-6 shadow-sm rounded-xl border border-surface-container flex flex-col gap-4">
                  <div className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-2 pb-2 border-b border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px]">school</span>
                    Thông tin học thuật &amp; Độc giả
                  </div>

                  <div className="flex flex-col gap-3 font-body-sm text-body-sm">
                    {doc.advisorName && (
                      <div className="flex flex-col bg-surface-container-low p-3 rounded-lg">
                        <span className="font-label-meta text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                          GIẢNG VIÊN HƯỚNG DẪN
                        </span>
                        <span className="font-bold text-on-surface text-sm mt-0.5">
                          {doc.advisorName}
                        </span>
                        <span className="text-on-surface-variant text-xs">
                          {doc.majorName ? `Bộ môn ${doc.majorName} · Khoa CNTT` : 'Khoa Công nghệ Thông tin - UTC'}
                        </span>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-center pt-1 font-label-code text-xs">
                      <div className="p-2.5 bg-surface-container rounded-lg">
                        <span className="text-on-surface-variant block text-[11px]">LƯỢT XEM</span>
                        <span className="font-bold text-on-surface text-base">
                          {doc.viewCount || 0}
                        </span>
                      </div>
                      <div className="p-2.5 bg-surface-container rounded-lg">
                        <span className="text-on-surface-variant block text-[11px]">LƯỢT TẢI</span>
                        <span className="font-bold text-on-surface text-base">
                          {doc.downloadCount || 0}
                        </span>
                      </div>
                    </div>

                    {/* Rating display & Action */}
                    <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-500 font-bold font-label-code text-xs">
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="text-on-surface">
                          {doc.avgRating > 0 ? doc.avgRating.toFixed(1) : 'Chưa có'} / 5.0
                        </span>
                        <span className="text-on-surface-variant text-[11px] font-normal">
                          ({doc.ratingCount || 0} đánh giá)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (!isAuthenticated) navigate('/login')
                          else setShowRateModal(true)
                        }}
                        className="font-label-code text-xs text-primary hover:underline font-bold cursor-pointer"
                      >
                        Đánh giá ngay
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD 3: CHÍNH SÁCH BẢO HỘ & BẢN QUYỀN HỌC THUẬT */}
                <div className="bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-secondary">gavel</span>
                    <span className="font-headline-sm text-headline-sm font-bold">
                      Chính sách &amp; Pháp lý
                    </span>
                  </div>

                  <div className="p-3 bg-secondary-fixed text-on-secondary-fixed font-label-code text-label-code font-bold">
                    LƯU HÀNH NỘI BỘ KHOA CNTT - UTC
                  </div>

                  <p className="font-body-sm text-body-sm text-on-surface leading-relaxed text-justify">
                    Tài liệu thuộc quyền sở hữu trí tuệ của Khoa Công nghệ Thông tin - Trường ĐH Giao
                    thông Vận tải và nhóm nghiên cứu sinh viên. Mọi hành vi sao chép, trích dẫn cho mục
                    đích thương mại mà không có sự đồng ý của đơn vị bảo trợ đều vi phạm quy định đào
                    tạo.
                  </p>

                  <div className="pt-2 flex flex-col gap-1.5 font-label-code text-label-code text-on-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        check_circle
                      </span>
                      <span>Cho phép tham khảo đồ án</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        check_circle
                      </span>
                      <span>Cho phép trích dẫn học thuật (APA/IEEE)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-error">
                        cancel
                      </span>
                      <span>Nghiêm cấm đạo văn hoặc nộp lại</span>
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
          <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-surface max-w-lg w-full p-6 shadow-2xl rounded-2xl border border-surface-container flex flex-col gap-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 bg-surface-container-low -mx-6 -mt-6 p-4 rounded-t-2xl">
                <span className="font-headline-sm text-headline-sm font-bold text-error flex items-center gap-2">
                  <span className="material-symbols-outlined">warning</span>
                  Báo cáo vi phạm tài liệu
                </span>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg hover:bg-surface-container"
                  type="button"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <p className="font-body-sm text-body-sm text-on-surface">
                Gửi yêu cầu kiểm tra tới Hội đồng Thẩm định Khoa CNTT - ĐH GTVT nếu phát hiện nội dung có
                vi phạm:
              </p>

              <form
                onSubmit={handleReportSubmit}
                className="flex flex-col gap-3 font-label-code text-label-code"
              >
                {reportReasons.length > 0 ? (
                  reportReasons.map((r) => (
                    <label
                      key={r.code}
                      className="flex items-center gap-2 cursor-pointer p-2.5 bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg"
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.code}
                        checked={reportReason === r.code}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="accent-primary"
                      />
                      <span className="text-on-surface font-semibold">{r.label}</span>
                    </label>
                  ))
                ) : (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg">
                      <input
                        type="radio"
                        name="reportReason"
                        value="COPYRIGHT"
                        checked={reportReason === 'COPYRIGHT'}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="accent-primary"
                      />
                      <span className="text-on-surface font-semibold">
                        Trùng lặp ý tưởng / Đạo văn không trích dẫn
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg">
                      <input
                        type="radio"
                        name="reportReason"
                        value="INAPPROPRIATE"
                        checked={reportReason === 'INAPPROPRIATE'}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="accent-primary"
                      />
                      <span className="text-on-surface font-semibold">
                        Vi phạm quyền sở hữu tài sản doanh nghiệp đối tác
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg">
                      <input
                        type="radio"
                        name="reportReason"
                        value="WRONG_INFO"
                        checked={reportReason === 'WRONG_INFO'}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="accent-primary"
                      />
                      <span className="text-on-surface font-semibold">
                        Tài liệu giả mạo, nội dung độc hại hoặc sai lệch
                      </span>
                    </label>
                  </>
                )}

                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface">
                      Ghi chú cụ thể (Trang vi phạm, tài liệu đối chứng) *:
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-medium">Tối thiểu 10 ký tự</span>
                  </div>
                  <textarea
                    required
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Ví dụ: Trang 18 trích nguyên văn mã nguồn từ repository ABC..."
                    rows={3}
                    className="w-full p-2.5 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary border border-surface-container rounded-lg resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowReport(false)}
                    className="px-4 py-2 bg-surface-container text-on-surface font-bold hover:bg-surface-container-high transition-colors cursor-pointer rounded-lg"
                    type="button"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="submit"
                    disabled={reportLoading}
                    className="px-4 py-2 bg-error text-on-error font-bold hover:bg-on-error-container transition-colors shadow-sm cursor-pointer disabled:opacity-50 rounded-lg"
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
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 bg-surface-container-low -mx-6 -mt-6 p-4">
              <span className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">star</span>
                Đánh giá chất lượng tài liệu
              </span>
              <button
                onClick={() => setShowRateModal(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface">
              Chia sẻ đánh giá của bạn giúp sinh viên và giảng viên dễ dàng tham khảo tài liệu phù hợp:
            </p>

            <div className="flex flex-col items-center justify-center py-4 bg-surface-container-low gap-2">
              <StarRating rating={rateScore} onRate={(s) => setRateScore(s)} size={32} />
              <span className="font-label-code text-label-code text-secondary font-bold">
                {rateScore} / 5 Sao
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-label-code text-label-code">
              <button
                onClick={() => setShowRateModal(false)}
                className="px-4 py-2 bg-surface-container text-on-surface font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
                type="button"
              >
                HỦY
              </button>
              <button
                onClick={handleRateSubmit}
                disabled={rateLoading}
                className="px-4 py-2 bg-primary text-on-primary font-bold hover:bg-primary-container transition-colors shadow-sm cursor-pointer disabled:opacity-50"
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
    </div>
  )
}
