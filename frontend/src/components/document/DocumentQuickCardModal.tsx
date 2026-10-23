// === LUỒNG 2 & 3: HỘP THOẠI XEM NHANH HỌC LIỆU (Document Quick View Modal) ===
// Xem nhanh tóm tắt, tác giả, chỉ số tương tác và nút đọc PDF trực tiếp
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  FileText,
  BookOpen,
  GraduationCap,
  Layers,
  FolderGit2,
  Award,
  FileCode2,
  UserCheck,
  Eye,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Building2,
  CheckCircle2,
  Stamp
} from 'lucide-react'
import { DocumentSummary } from '../../types/document'

interface DocumentQuickCardModalProps {
  isOpen: boolean
  doc: DocumentSummary | null
  onClose: () => void
  onReadPdf: (doc: DocumentSummary) => void
  onCite: (doc: DocumentSummary) => void
  onReport?: (doc: DocumentSummary) => void
  onDownload?: (doc: DocumentSummary) => void
  onBookmarkToggle?: (doc: DocumentSummary) => void
  isBookmarked?: boolean
}

export default function DocumentQuickCardModal({
  isOpen,
  doc,
  onClose,
  onReadPdf,
  onCite,
  onReport,
  onDownload,
  onBookmarkToggle,
  isBookmarked = false,
}: DocumentQuickCardModalProps) {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !doc) return null

  const typeConfig: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
    THESIS: {
      label: 'Khóa luận tốt nghiệp',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      icon: <GraduationCap className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
    },
    ASSIGNMENT: {
      label: 'Bài tập lớn (BTL)',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      icon: <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    },
    CAPSTONE: {
      label: 'Đồ án chuyên ngành',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      icon: <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    },
    PROJECT: {
      label: 'Bài tập lớn',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      icon: <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    },
    SLIDE: {
      label: 'Slide bài giảng',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      icon: <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    },
    LECTURE: {
      label: 'Slide bài giảng',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      icon: <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    },
    NOTE: {
      label: 'Ghi chú ôn tập',
      badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
      icon: <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
    },
    SAMPLE_CODE: {
      label: 'Mã nguồn mẫu',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      icon: <FileCode2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    },
    EXAM_PAPER: {
      label: 'Đề thi & Lời giải',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      icon: <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    },
    EXAM: {
      label: 'Đề thi & Lời giải',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      icon: <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    },
    SYLLABUS: {
      label: 'Đề cương môn học',
      badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-800',
      icon: <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
    },
    LAB: {
      label: 'Hướng dẫn thực hành Lab',
      badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
      icon: <FolderGit2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
    },
  }

  const currentType = typeConfig[doc.documentTypeCode] || {
    label: doc.documentTypeLabel || doc.documentTypeCode || 'Học liệu',
    badge: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700',
    icon: <FileText className="w-4 h-4 text-stone-600 dark:text-stone-400" />,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Card Modal Container — Uniform Dark Theme Matching Search Page */}
      <div
        className="relative z-10 w-full max-w-xl bg-white dark:bg-[#0c1322] rounded-2xl border-2 border-stone-800 dark:border-stone-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-paper-grid animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Ledger Header */}
        <div className="px-5 py-3.5 bg-stone-100 dark:bg-[#080d18] border-b border-stone-300 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className="font-bold text-stone-600 dark:text-stone-400">
              ACCESSION:
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 font-bold">
              UTC-FIT-{doc.id.toString().padStart(4, '0')}
            </span>
            {doc.status === 'APPROVED' && (
              <span className="stamp-seal text-[9px] text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ml-1">
                ĐÃ DUYỆT
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Document Type Badge & Subject */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-bold border ${currentType.badge}`}>
              {currentType.icon}
              <span>{currentType.label}</span>
            </span>

            {doc.subjectName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-mono text-xs font-semibold border border-stone-300 dark:border-stone-700">
                <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                <span className="truncate max-w-[200px]">{doc.subjectName}</span>
              </span>
            )}

            {doc.targetYear && (
              <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold border border-amber-200 dark:border-amber-800">
                Năm {doc.targetYear}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif-academic text-xl sm:text-2xl font-bold text-stone-950 dark:text-stone-50 leading-snug">
            {doc.title}
          </h3>

          {/* Core Meta Table / Grid */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/90 border border-stone-300/80 dark:border-stone-800 text-xs font-sans space-y-2 shadow-2xs">
            {doc.advisorName && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-500 dark:text-stone-400 font-mono flex items-center gap-1.5 shrink-0">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>GV hướng dẫn:</span>
                </span>
                <span className="font-bold text-blue-700 dark:text-blue-300 text-right truncate">
                  {doc.advisorName}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <span className="text-stone-500 dark:text-stone-400 font-mono flex items-center gap-1.5 shrink-0">
                <GraduationCap className="w-3.5 h-3.5 text-stone-500" />
                <span>Tác giả:</span>
              </span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 text-right truncate">
                {doc.authorName || 'Sinh viên Khoa CNTT'}
              </span>
            </div>

            {doc.majorName && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-500 dark:text-stone-400 font-mono flex items-center gap-1.5 shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Chuyên ngành:</span>
                </span>
                <span className="text-stone-700 dark:text-stone-300 text-right truncate">
                  {doc.majorName}
                </span>
              </div>
            )}

            {doc.academicYearName && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-500 dark:text-stone-400 font-mono flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>Niên khóa:</span>
                </span>
                <span className="font-mono text-stone-700 dark:text-stone-300 text-right">
                  {doc.academicYearName}
                </span>
              </div>
            )}

            {/* Read & Download Count */}
            <div className="pt-2 border-t border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-between text-stone-500 font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{doc.viewCount || 0} lượt đọc</span>
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{doc.downloadCount || 0} lượt tải</span>
              </span>
            </div>
          </div>

          {/* Description / Abstract */}
          {doc.description && (
            <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans bg-stone-100/60 dark:bg-stone-900/60 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
              <span className="font-mono font-bold text-stone-400 text-[10px] uppercase block mb-1">
                TÓM TẮT HỌC THUẬT:
              </span>
              <p className="line-clamp-3 italic font-serif-academic text-sm text-stone-800 dark:text-stone-200">
                "{doc.description}"
              </p>
            </div>
          )}

          {/* GitHub / GitLab source code link if present */}
          {doc.repositoryUrl && (
            <a
              href={doc.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-900 text-white dark:bg-stone-800 dark:text-stone-100 text-xs font-mono font-bold hover:bg-stone-800 dark:hover:bg-stone-700 transition-colors w-full justify-center shadow-xs"
            >
              <FolderGit2 className="w-4 h-4 text-emerald-400" />
              <span>Xem mã nguồn dự án trên GitHub / GitLab</span>
              <ExternalLink className="w-3 h-3 ml-1 text-stone-400" />
            </a>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="px-5 py-3.5 bg-stone-100 dark:bg-[#080d18] border-t border-stone-300 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* Secondary Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onCite(doc)}
              title="Trích dẫn IEEE / APA / BibTeX"
              className="p-2 rounded-lg bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-blue-600 dark:hover:text-blue-400 border border-stone-300 dark:border-stone-700 transition-colors cursor-pointer shadow-2xs"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {onBookmarkToggle && (
              <button
                type="button"
                onClick={() => onBookmarkToggle(doc)}
                title={isBookmarked ? 'Bỏ lưu' : 'Lưu vào bộ sưu tập'}
                className={`p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 transition-colors cursor-pointer shadow-2xs ${
                  isBookmarked
                    ? 'text-amber-600 dark:text-amber-400 fill-amber-500'
                    : 'text-stone-700 dark:text-stone-300 hover:text-amber-600'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}

            {onReport && (
              <button
                type="button"
                onClick={() => onReport(doc)}
                title="Báo cáo vi phạm bản quyền / học thuật"
                className="p-2 rounded-lg bg-white dark:bg-stone-800 text-stone-400 hover:text-rose-600 border border-stone-300 dark:border-stone-700 transition-colors cursor-pointer shadow-2xs"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onReadPdf(doc)}
              className="px-3.5 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Xem nhanh bản PDF trong cửa sổ popup"
            >
              <Eye className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <span>Xem PDF</span>
            </button>

            <Link
              to={`/documents/${doc.id}`}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
              title="Đọc toàn văn và chi tiết tài liệu trực tuyến"
            >
              <span>Xem online</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
