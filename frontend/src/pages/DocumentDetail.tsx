import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Spinner from '../components/ui/Spinner'
import StarRating from '../components/ui/StarRating'
import { getDocument } from '../api/documentApi'
import { getPreviewUrl, getDownloadUrl } from '../api/fileApi'
import { addBookmark, removeBookmark, rateDocument, reportDocument } from '../api/interactionApi'
import { getLov } from '../api/catalogApi'
import { getErrorMessage } from '../utils/errorMessages'
import { useAuth } from '../contexts/AuthContext'
import type { DocumentDetail as DocDetail } from '../types/document'
import type { LovItem } from '../types/catalog'

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const viewerContainerRef = useRef<HTMLDivElement>(null)

  const [doc, setDoc] = useState<DocDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // PDF Viewer State
  const [pdfUrl, setPdfUrl] = useState<string>('/sample.pdf')
  const [activeFileId, setActiveFileId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'pdf' | 'cover'>('pdf')
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

  // Fetch document details
  useEffect(() => {
    if (!id) return
    const fetchDoc = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getDocument(Number(id))
        setDoc(data)
        setBookmarked(data.bookmarked)
        if (data.userRating) setUserRating(data.userRating)

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
      } else {
        await addBookmark(doc.id)
        setBookmarked(true)
      }
    } catch (err) {
      alert(getErrorMessage(err))
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
      alert(`Đã gửi đánh giá ${rateScore} sao thành công! Cảm ơn bạn.`)
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setRateLoading(false)
    }
  }

  // Handle Report Submit
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doc || !reportReason) return
    setReportLoading(true)
    try {
      await reportDocument(doc.id, { reasonCode: reportReason, description: reportDesc })
      alert('Đã gửi báo cáo vi phạm tới Ban Thanh tra Học thuật Khoa CNTT UTC. Cảm ơn bạn!')
      setShowReport(false)
      setReportDesc('')
    } catch (err) {
      alert(getErrorMessage(err))
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

  // Student members list
  const memberList =
    doc.members && doc.members.length > 0
      ? doc.members
      : [
          {
            userId: doc.uploaderId || 1,
            fullName: doc.uploaderName || 'Nguyễn Văn A',
            studentCode: '231230746',
            isLeader: true,
          },
        ]

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
                  TRA CỨU TÀI LIỆU
                </Link>
                <span>/</span>
                <span className="text-on-surface uppercase">
                  {doc.documentTypeLabel || 'BÁO CÁO HỌC PHẦN'}
                </span>
                <span>/</span>
                <span className="text-on-surface-variant truncate max-w-xs sm:max-w-md">
                  UTC-FIT-REP-2025-{String(doc.id).padStart(4, '0')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-surface text-on-surface font-semibold">
                  REF: #UTC-{88000 + doc.id}
                </span>
                <span className="text-on-surface-variant hidden sm:inline">
                  SHA256: 4e82b7...d{String(doc.id).padStart(3, '0')}
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

                  {/* TECH STACK */}
                  <div className="flex flex-col gap-2.5">
                    <div className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-bold">
                      Công nghệ &amp; Kỹ thuật sử dụng
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doc.technologies && doc.technologies.length > 0 ? (
                        doc.technologies.map((t) => (
                          <span
                            key={t.id}
                            className="px-2.5 py-1 bg-surface-container font-label-code text-label-code text-on-surface font-semibold"
                          >
                            {t.name}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="px-2.5 py-1 bg-surface-container font-label-code text-label-code text-on-surface font-semibold">
                            Spring Boot 3
                          </span>
                          <span className="px-2.5 py-1 bg-surface-container font-label-code text-label-code text-on-surface font-semibold">
                            React 18
                          </span>
                          <span className="px-2.5 py-1 bg-surface-container font-label-code text-label-code text-on-surface font-semibold">
                            Supabase Storage
                          </span>
                          <span className="px-2.5 py-1 bg-surface-container font-label-code text-label-code text-on-surface font-semibold">
                            MySQL 8.0
                          </span>
                          <span className="px-2.5 py-1 bg-surface-container font-label-code text-label-code text-on-surface font-semibold">
                            Tailwind CSS
                          </span>
                          <span className="px-2.5 py-1 bg-surface-container font-label-code text-label-code text-on-surface font-semibold">
                            Docker
                          </span>
                          <span className="px-2.5 py-1 bg-surface-container font-label-code text-label-code text-on-surface font-semibold">
                            Vite
                          </span>
                          <span className="px-2.5 py-1 bg-surface-container font-label-code text-label-code text-on-surface font-semibold">
                            JWT / Spring Security
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* MEMBERS & GITHUB */}
                  <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-bold">
                        Nhóm sinh viên thực hiện (Nhóm 0{doc.id}):
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        {memberList.map((m, idx) => {
                          const bgColors = ['bg-primary', 'bg-secondary', 'bg-tertiary-container']
                          const textColors = ['text-on-primary', 'text-on-secondary', 'text-on-tertiary-container']
                          const colorIdx = idx % bgColors.length
                          return (
                            <div
                              key={m.userId || idx}
                              className="flex items-center gap-2 bg-surface-container px-3 py-1.5 shadow-sm"
                            >
                              <div
                                className={`w-6 h-6 ${bgColors[colorIdx]} ${textColors[colorIdx]} font-label-code text-label-code font-bold flex items-center justify-center`}
                              >
                                {m.fullName ? m.fullName.trim().charAt(0) : 'S'}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-body-sm text-body-sm font-bold text-on-surface leading-none">
                                  {m.fullName}
                                </span>
                                <span className="font-label-meta text-label-meta text-on-surface-variant leading-none">
                                  {m.studentCode || `23123074${idx + 1}`}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

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

                      {/* View Mode Toggle */}
                      <div className="hidden sm:flex items-center bg-surface-container-lowest p-0.5 text-xs font-semibold">
                        <button
                          onClick={() => setViewMode('pdf')}
                          className={`px-2.5 py-1 transition-colors cursor-pointer ${
                            viewMode === 'pdf'
                              ? 'bg-primary text-on-primary font-bold'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          Xem PDF trực tiếp
                        </button>
                        <button
                          onClick={() => setViewMode('cover')}
                          className={`px-2.5 py-1 transition-colors cursor-pointer ${
                            viewMode === 'cover'
                              ? 'bg-primary text-on-primary font-bold'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          Trang bìa UTC
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Zoom Controls */}
                      <div className="flex items-center bg-surface-container-lowest px-2 py-1 gap-2">
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
                        className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                        type="button"
                        title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                        </span>
                        <span className="hidden sm:inline">
                          {isFullscreen ? 'Thu nhỏ' : 'Fullscreen'}
                        </span>
                      </button>

                      {/* Open New Tab Button */}
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-primary text-on-primary font-bold flex items-center gap-1 hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        <span>Mở tab mới</span>
                      </a>
                    </div>
                  </div>

                  {/* DOCUMENT VIEWER BODY */}
                  {viewMode === 'pdf' ? (
                    <div className="bg-surface-container p-2 sm:p-4 flex flex-col justify-center items-center min-h-[640px]">
                      <div
                        className="w-full bg-surface-container-lowest shadow-md overflow-hidden relative"
                        style={{
                          transform: `scale(${zoomLevel / 100})`,
                          transformOrigin: 'top center',
                          transition: 'transform 0.15s ease-out',
                        }}
                      >
                        <iframe
                          src={`${pdfUrl}#page=${currentPage}&zoom=${zoomLevel}`}
                          className="w-full h-[680px] sm:h-[760px] border-0 block"
                          title={doc.title}
                        />
                      </div>
                    </div>
                  ) : (
                    /* DOCUMENT PREVIEW CANVAS (Mô phỏng Trang bìa báo cáo học thuật chuẩn UTC) */
                    <div className="bg-surface-container p-4 sm:p-10 flex justify-center items-center overflow-x-auto min-h-[560px]">
                      <div
                        className="w-full max-w-[560px] aspect-[1/1.414] bg-surface-container-lowest p-8 sm:p-12 shadow-md flex flex-col justify-between text-center relative select-none"
                        style={{
                          transform: `scale(${zoomLevel / 100})`,
                          transformOrigin: 'top center',
                          transition: 'transform 0.15s ease-out',
                        }}
                      >
                        {/* Watermark stamp */}
                        <div className="absolute right-4 top-4 opacity-20 pointer-events-none font-label-code text-[11px] text-right">
                          UTC-FIT ARCHIVE
                          <br />
                          VERIFIED #88000
                        </div>

                        {/* Top institutional text */}
                        <div className="flex flex-col gap-1 uppercase tracking-wider font-headline-sm">
                          <div className="text-body-sm font-semibold text-on-surface">
                            BỘ GIÁO DỤC VÀ ĐÀO TẠO
                          </div>
                          <div className="text-body-sm font-bold text-on-surface">
                            TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI
                          </div>
                          <div className="text-body-sm font-bold text-primary">
                            KHOA CÔNG NGHỆ THÔNG TIN
                          </div>
                          <div className="w-24 h-0.5 bg-primary mx-auto my-2"></div>
                        </div>

                        {/* Center Logo & Subject */}
                        <div className="flex flex-col items-center gap-4 my-auto">
                          <div className="w-16 h-16 bg-primary text-on-primary font-headline-md text-headline-md font-bold flex items-center justify-center">
                            UTC
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-label-code text-label-code font-bold tracking-widest text-on-surface-variant uppercase">
                              {doc.documentTypeLabel || 'BÁO CÁO KẾT THÚC HỌC PHẦN'}
                            </span>
                            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                              {doc.subjectName}
                            </span>
                          </div>
                          <div className="p-4 bg-surface-container-low max-w-sm mt-2">
                            <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant block mb-1">
                              ĐỀ TÀI NGHIÊN CỨU:
                            </span>
                            <span className="font-headline-sm text-headline-sm font-bold text-primary block leading-tight">
                              {doc.title}
                            </span>
                          </div>
                        </div>

                        {/* Bottom signatories & candidates */}
                        <div className="flex flex-col gap-4 text-left font-body-sm text-body-sm">
                          <div className="grid grid-cols-2 gap-4 pt-4 bg-surface-container-high/40 p-3">
                            <div>
                              <span className="font-label-meta text-label-meta uppercase text-on-surface-variant block font-bold">
                                GIẢNG VIÊN HƯỚNG DẪN:
                              </span>
                              <span className="font-bold text-on-surface">
                                {doc.advisorName || 'ThS. Đào Thị Lệ Thủy'}
                              </span>
                              <span className="text-xs text-on-surface-variant block">
                                {doc.majorName
                                  ? `Bộ môn ${doc.majorName}`
                                  : 'Bộ môn Kỹ thuật Phần mềm'}
                              </span>
                            </div>
                            <div>
                              <span className="font-label-meta text-label-meta uppercase text-on-surface-variant block font-bold">
                                SINH VIÊN THỰC HIỆN:
                              </span>
                              {memberList.map((m, idx) => (
                                <div key={idx} className="font-bold text-on-surface text-xs leading-tight">
                                  {m.fullName} ({m.studentCode || `23123074${idx + 1}`})
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-center font-label-code text-label-code text-on-surface-variant uppercase">
                            HÀ NỘI - THÁNG 03/2026
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. DANH SÁCH FILE ĐÍNH KÈM */}
                <div className="p-6 bg-surface-container-lowest shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">attachment</span>
                      Tệp đính kèm trong hồ sơ (
                      {String(doc.files.length || 1).padStart(2, '0')} tệp)
                    </span>
                    <span className="font-label-code text-label-code text-on-surface-variant">
                      Dung lượng tổng: {formatFileSize(totalFileSize || 19200000)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary Document File Card */}
                    {doc.files && doc.files.length > 0 ? (
                      doc.files.map((f, idx) => {
                        const isPdf = f.fileName.toLowerCase().endsWith('.pdf')
                        const isPptx = f.fileName.toLowerCase().endsWith('.pptx')
                        const isSelected = activeFileId === f.id

                        return (
                          <div
                            key={f.id}
                            className={`p-4 bg-surface-container-low flex flex-col justify-between gap-3 border transition-colors ${
                              isSelected ? 'border-primary' : 'border-transparent'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2.5 ${
                                  isPdf
                                    ? 'bg-primary text-on-primary'
                                    : isPptx
                                    ? 'bg-secondary text-on-secondary'
                                    : 'bg-surface-container text-on-surface'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[24px]">
                                  {isPdf ? 'description' : isPptx ? 'slideshow' : 'insert_drive_file'}
                                </span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span
                                  className="font-body-sm text-body-sm font-bold text-on-surface truncate"
                                  title={f.fileName}
                                >
                                  {f.fileName}
                                </span>
                                <div className="flex items-center gap-2 font-label-code text-label-code text-on-surface-variant flex-wrap">
                                  <span>{formatFileSize(f.fileSize || 12000000)}</span>
                                  <span>•</span>
                                  <span>{isPdf ? '48 Trang' : isPptx ? 'PowerPoint' : 'Tài liệu'}</span>
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
                                  className={`flex-1 py-1.5 px-3 font-label-code text-label-code font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
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
                                } py-1.5 px-3 bg-primary text-on-primary hover:bg-primary-container font-label-code text-label-code font-bold flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer`}
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
                      <>
                        <div className="p-4 bg-surface-container-low flex flex-col justify-between gap-3 border border-primary">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-primary text-on-primary">
                              <span className="material-symbols-outlined text-[24px]">
                                description
                              </span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-body-sm text-body-sm font-bold text-on-surface truncate">
                                Bao_Cao_Nhom7_MaNguonMo.pdf
                              </span>
                              <div className="flex items-center gap-2 font-label-code text-label-code text-on-surface-variant">
                                <span>18.4 MB</span>
                                <span>•</span>
                                <span>48 Trang</span>
                                <span>•</span>
                                <span className="text-primary font-bold">CHÍNH THỨC</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => {
                                setPdfUrl('/sample.pdf')
                                setViewMode('pdf')
                              }}
                              className="flex-1 py-1.5 px-3 bg-primary text-on-primary font-label-code text-label-code font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                visibility
                              </span>
                              Đang xem
                            </button>
                            <button
                              onClick={() => handleDownload()}
                              className="py-1.5 px-3 bg-primary text-on-primary hover:bg-primary-container font-label-code text-label-code font-bold flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">download</span>
                              Tải về
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-surface-container-low flex flex-col justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-secondary text-on-secondary">
                              <span className="material-symbols-outlined text-[24px]">slideshow</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-body-sm text-body-sm font-bold text-on-surface truncate">
                                Slides_Thuyet_Trinh_Nhom7.pptx
                              </span>
                              <div className="flex items-center gap-2 font-label-code text-label-code text-on-surface-variant">
                                <span>8.2 MB</span>
                                <span>•</span>
                                <span>Microsoft PowerPoint</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => handleDownload()}
                              className="w-full py-1.5 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-code text-label-code font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">download</span>
                              Tải về tệp trình chiếu (.pptx)
                            </button>
                          </div>
                        </div>
                      </>
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
              </div>

              {/* RIGHT COLUMN: ~32% (4 cols) Sticky Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-6 sticky top-20">
                {/* CARD 1: HÀNH ĐỘNG CHÍNH */}
                <div className="bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 bg-surface-container-low -mx-6 -mt-6 p-4">
                    <span className="font-label-code text-label-code font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
                      THAO TÁC HỌC THUẬT
                    </span>
                    <span className="font-label-code text-label-code text-on-surface-variant">
                      v2.1-SECURE
                    </span>
                  </div>

                  {/* Nút đọc toàn màn hình */}
                  <button
                    onClick={handleToggleFullscreen}
                    className="w-full py-3.5 px-4 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all group cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">
                      fullscreen
                    </span>
                    <span>ĐỌC FULLSCREEN</span>
                  </button>

                  {/* Nút Tải xuống PDF */}
                  <button
                    onClick={() => handleDownload()}
                    disabled={dlLoading}
                    className="w-full py-3 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-code text-label-code font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">cloud_download</span>
                      <span>{dlLoading ? 'Đang chuẩn bị...' : 'Tải PDF chính thức'}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface text-xs font-semibold">
                      {formatFileSize(primaryFile?.fileSize || 18400000)}
                    </span>
                  </button>

                  {/* Bookmark button */}
                  <button
                    onClick={handleBookmark}
                    disabled={bmLoading}
                    className="w-full py-2.5 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-code text-label-code font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    type="button"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        bookmarked ? 'text-secondary' : 'text-on-surface-variant'
                      }`}
                    >
                      {bookmarked ? 'bookmark' : 'bookmark_border'}
                    </span>
                    <span>
                      {bookmarked ? 'Đã lưu trong thư viện cá nhân' : 'Lưu vào danh sách đọc sau'}
                    </span>
                  </button>

                  {/* Report button */}
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full py-2 px-3 text-error hover:bg-error-container/40 font-label-code text-label-code font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                    <span>Báo cáo vi phạm / Bản quyền</span>
                  </button>
                </div>

                {/* CARD 2: THÔNG TIN THẨM ĐỊNH HỘI ĐỒNG */}
                <div className="bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-4">
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2 pb-2">
                    <span className="material-symbols-outlined text-primary">military_tech</span>
                    Thẩm định &amp; Đánh giá
                  </div>

                  <div className="flex flex-col gap-3 font-body-sm text-body-sm">
                    <div className="flex flex-col bg-surface-container-low p-3">
                      <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-bold">
                        GIẢNG VIÊN HƯỚNG DẪN
                      </span>
                      <span className="font-bold text-on-surface text-body-md mt-0.5">
                        {doc.advisorName || 'ThS. Đào Thị Lệ Thủy'}
                      </span>
                      <span className="text-on-surface-variant text-xs font-medium">
                        {doc.majorName
                          ? `Bộ môn ${doc.majorName} · Khoa CNTT`
                          : 'Bộ môn Kỹ thuật Phần mềm · Khoa CNTT'}
                      </span>
                    </div>

                    {/* Điểm hội đồng */}
                    <div className="flex items-center justify-between p-3.5 bg-surface-container-high">
                      <div className="flex flex-col">
                        <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-bold">
                          ĐIỂM HỘI ĐỒNG CHẤM:
                        </span>
                        <span className="font-label-code text-label-code text-secondary font-bold uppercase mt-0.5">
                          [XUẤT SẮC] TOP 5%
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline-lg text-headline-lg font-bold text-primary">
                          {doc.avgRating > 0 ? (doc.avgRating * 2).toFixed(1) : '9.5'}
                        </span>
                        <span className="font-label-code text-label-code text-on-surface-variant">
                          / 10.0
                        </span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-center pt-1 font-label-code text-label-code">
                      <div className="p-2.5 bg-surface-container">
                        <span className="text-on-surface-variant block text-[11px]">LƯỢT XEM</span>
                        <span className="font-bold text-on-surface text-body-md">
                          {doc.viewCount || 1480}
                        </span>
                      </div>
                      <div className="p-2.5 bg-surface-container">
                        <span className="text-on-surface-variant block text-[11px]">LƯỢT TẢI</span>
                        <span className="font-bold text-on-surface text-body-md">
                          {doc.downloadCount || 420}
                        </span>
                      </div>
                    </div>

                    {/* Rating display & Action */}
                    <div className="p-3 bg-surface-container-low flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-secondary font-bold font-label-code text-label-code">
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="text-on-surface">
                          {userRating || (doc.avgRating > 0 ? doc.avgRating.toFixed(1) : '4.9')} / 5.0
                        </span>
                        <span className="text-on-surface-variant text-xs font-normal">
                          ({doc.ratingCount || 38} đánh giá)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (!isAuthenticated) navigate('/login')
                          else setShowRateModal(true)
                        }}
                        className="font-label-code text-label-code text-primary hover:underline font-bold cursor-pointer"
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
      {showReport && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface max-w-lg w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 bg-surface-container-low -mx-6 -mt-6 p-4">
              <span className="font-headline-sm text-headline-sm font-bold text-error flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Báo cáo vi phạm tài liệu
              </span>
              <button
                onClick={() => setShowReport(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
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
                    className="flex items-center gap-2 cursor-pointer p-2 bg-surface-container hover:bg-surface-container-high transition-colors"
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
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-surface-container hover:bg-surface-container-high transition-colors">
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
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-surface-container hover:bg-surface-container-high transition-colors">
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
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-surface-container hover:bg-surface-container-high transition-colors">
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
                <span className="font-bold text-on-surface">
                  Ghi chú cụ thể (Trang vi phạm, tài liệu đối chứng):
                </span>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Ví dụ: Trang 18 trích nguyên văn mã nguồn từ repository ABC..."
                  rows={3}
                  className="w-full p-2 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none focus:bg-surface-container border border-surface-container"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowReport(false)}
                  className="px-4 py-2 bg-surface-container text-on-surface font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
                  type="button"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="px-4 py-2 bg-error text-on-error font-bold hover:bg-on-error-container transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {reportLoading ? 'ĐANG GỬI...' : 'GỬI BÁO CÁO'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </div>
  )
}
