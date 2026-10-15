import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Download,
  Bookmark,
  Flag,
  Maximize2,
  X,
  GraduationCap,
  FileText,
  Code2,
  CheckCircle2,
  Cpu,
  Eye,
  Star,
  User,
  School
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import type { DocumentSummary } from '../types'
import { documentApi } from '../api/documentApi'

interface BookDetailDrawerProps {
  doc: DocumentSummary | null
  onClose: () => void
  onReadOnline: (doc: DocumentSummary) => void
  onDownload: (doc: DocumentSummary) => void
  onReport: (doc: DocumentSummary) => void
  onBookmarkChanged?: (docId: number, isBookmarked: boolean) => void
}

const TYPE_CONFIG: Record<string, { label: string; badgeClass: string; icon: any }> = {
  THESIS: {
    label: 'Khóa luận',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: GraduationCap
  },
  CAPSTONE: {
    label: 'Bài tập lớn',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: FileText
  },
  LECTURE: {
    label: 'Bài giảng',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: BookOpen
  },
  EXAM: {
    label: 'Đề thi',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: CheckCircle2
  },
  EXERCISE: {
    label: 'Bài tập',
    badgeClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    icon: FileText
  },
  LAB: {
    label: 'Lab Guide',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: Code2
  },
}

export default function BookDetailDrawer({
  doc,
  onClose,
  onReadOnline,
  onDownload,
  onReport,
  onBookmarkChanged,
}: BookDetailDrawerProps) {
  const toast = useToast()
  const [isBookmarked, setIsBookmarked] = useState<boolean>(doc?.bookmarked || false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    setIsBookmarked(doc?.bookmarked || false)
  }, [doc?.id, doc?.bookmarked])

  if (!doc) return null

  const typeConfig = TYPE_CONFIG[doc.documentTypeCode || ''] || {
    label: doc.documentTypeLabel || 'Tài liệu',
    badgeClass: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: FileText,
  }
  const TypeIcon = typeConfig.icon

  const handleToggleBookmark = async () => {
    try {
      setBookmarkLoading(true)
      if (isBookmarked) {
        await documentApi.unbookmark(doc.id)
        setIsBookmarked(false)
        onBookmarkChanged?.(doc.id, false)
        toast.success('Đã bỏ lưu tài liệu')
      } else {
        await documentApi.bookmark(doc.id)
        setIsBookmarked(true)
        onBookmarkChanged?.(doc.id, true)
        toast.success('Đã lưu tài liệu vào kho cá nhân')
      }
    } catch {
      toast.error('Không thể cập nhật trạng thái lưu tài liệu')
    } finally {
      setBookmarkLoading(false)
    }
  }

  return (
    <aside
      className="w-full lg:w-[32%] xl:w-[30%] min-w-[340px] max-w-[440px] bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-xs overflow-y-auto shrink-0 z-20 transition-colors"
      data-purpose="document-detail-sidebar"
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xs z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            BẢN XEM TRƯỚC CHI TIẾT
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            to={`/documents/${doc.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Mở toàn màn hình"
          >
            <Maximize2 className="w-4 h-4" />
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng sidebar"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-5">
        {/* Type & Title */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${typeConfig.badgeClass}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              {typeConfig.label}
            </span>
            {doc.subjectName && (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {doc.subjectName}
              </span>
            )}
            {doc.academicYearName && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {doc.academicYearName}
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {doc.title}
          </h2>

          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-1 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            {doc.uploaderName && (
              <p className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Người đăng:
                </span>
                <strong className="text-slate-800 dark:text-slate-200">{doc.uploaderName}</strong>
              </p>
            )}
            {doc.advisorName && (
              <p className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  GVHD:
                </span>
                <strong className="text-blue-700 dark:text-blue-400 font-semibold">{doc.advisorName}</strong>
              </p>
            )}
            {doc.majorName && (
              <p className="flex items-center justify-between">
                <span className="text-slate-400">Ngành:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{doc.majorName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Abstract Box */}
        {doc.abstractText && (
          <div className="space-y-1.5 pt-1">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              TÓM TẮT NỘI DUNG (ABSTRACT)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify bg-slate-50/80 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 max-h-40 overflow-y-auto">
              {doc.abstractText}
            </p>
          </div>
        )}

        {/* Technologies (if any) */}
        {doc.technologies && doc.technologies.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              CÔNG NGHỆ ỨNG DỤNG
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {doc.technologies.map((tech) => (
                <span
                  key={tech.id}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">Lượt xem</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{doc.viewCount || 0}</span>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">Lượt tải</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{doc.downloadCount || 0}</span>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">Đánh giá</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
              {doc.avgRating > 0 ? `${doc.avgRating.toFixed(1)} ★` : '—'}
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 pt-2">
          {/* Primary CTA */}
          <button
            onClick={() => onReadOnline(doc)}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <BookOpen className="w-4 h-4" />
            <span>Đọc Trực Tuyến / Xem PDF</span>
          </button>

          {/* Download CTA */}
          <button
            onClick={() => onDownload(doc)}
            className="w-full py-2 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Tải xuống tài liệu</span>
          </button>

          {/* Bookmark CTA */}
          <button
            onClick={handleToggleBookmark}
            disabled={bookmarkLoading}
            className={`w-full py-2 px-4 border text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            type="button"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>{isBookmarked ? 'Đã lưu trong tủ cá nhân' : 'Lưu vào tủ tài liệu'}</span>
          </button>

          {/* Report Link */}
          <div className="pt-2 text-center">
            <button
              onClick={() => onReport(doc)}
              className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Báo cáo vi phạm bản quyền / nội dung</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
