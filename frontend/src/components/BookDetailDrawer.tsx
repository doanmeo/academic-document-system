import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

const TYPE_CONFIG: Record<string, { label: string; badgeClass: string; icon: string }> = {
  THESIS: { label: 'Khóa luận', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200', icon: 'school' },
  CAPSTONE: { label: 'Bài tập lớn', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'assignment' },
  LECTURE: { label: 'Bài giảng', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'slideshow' },
  EXAM: { label: 'Đề thi', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'quiz' },
  EXERCISE: { label: 'Bài tập', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200', icon: 'task' },
  LAB: { label: 'Lab Guide', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'biotech' },
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

  const typeInfo = TYPE_CONFIG[doc.documentTypeCode || ''] || {
    label: doc.documentTypeLabel || 'Tài liệu',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: 'description',
  }

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
      className="w-full lg:w-[32%] xl:w-[30%] min-w-[340px] max-w-[440px] bg-white border-l border-slate-200 flex flex-col h-full shadow-xs overflow-y-auto shrink-0 z-20"
      data-purpose="document-detail-sidebar"
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            BẢN XEM TRƯỚC CHI TIẾT
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            to={`/documents/${doc.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition-colors"
            title="Mở toàn màn hình"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng sidebar"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-5">
        {/* Type & Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${typeInfo.badgeClass}`}>
              <span className="material-symbols-outlined text-[14px]">{typeInfo.icon}</span>
              {typeInfo.label}
            </span>
            {doc.subjectName && (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                {doc.subjectName}
              </span>
            )}
            {doc.academicYearName && (
              <span className="text-[11px] text-slate-400 font-mono">
                {doc.academicYearName}
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {doc.title}
          </h2>

          <div className="text-xs text-slate-600 space-y-1 pt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
            {doc.uploaderName && (
              <p className="flex items-center justify-between">
                <span className="text-slate-400">Người đăng:</span>
                <strong className="text-slate-800">{doc.uploaderName}</strong>
              </p>
            )}
            {doc.advisorName && (
              <p className="flex items-center justify-between">
                <span className="text-slate-400">GVHD:</span>
                <strong className="text-blue-700 font-semibold">{doc.advisorName}</strong>
              </p>
            )}
            {doc.majorName && (
              <p className="flex items-center justify-between">
                <span className="text-slate-400">Ngành:</span>
                <span className="text-slate-700 font-medium">{doc.majorName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Abstract Box */}
        {doc.abstractText && (
          <div className="space-y-1.5 pt-1">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              TÓM TẮT NỘI DUNG (ABSTRACT)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed text-justify bg-slate-50/80 p-3 rounded-xl border border-slate-100 max-h-40 overflow-y-auto">
              {doc.abstractText}
            </p>
          </div>
        )}

        {/* Technologies (if any) */}
        {doc.technologies && doc.technologies.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              CÔNG NGHỆ ỨNG DỤNG
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {doc.technologies.map((tech) => (
                <span
                  key={tech.id}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100 text-xs">
          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Lượt xem</span>
            <span className="font-bold text-slate-800">{doc.viewCount || 0}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Lượt tải</span>
            <span className="font-bold text-slate-800">{doc.downloadCount || 0}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Đánh giá</span>
            <span className="font-bold text-amber-600">
              {doc.avgRating > 0 ? `${doc.avgRating.toFixed(1)} ★` : '—'}
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 pt-2">
          {/* Primary CTA */}
          <button
            onClick={() => onReadOnline(doc)}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>Đọc Trực Tuyến / Xem PDF</span>
          </button>

          {/* Download CTA */}
          <button
            onClick={() => onDownload(doc)}
            className="w-full py-2 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>Tải xuống tài liệu</span>
          </button>

          {/* Bookmark CTA */}
          <button
            onClick={handleToggleBookmark}
            disabled={bookmarkLoading}
            className={`w-full py-2 px-4 border text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
            }`}
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${isBookmarked ? 'text-amber-500' : 'text-slate-400'}`}>
              {isBookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
            <span>{isBookmarked ? 'Đã lưu trong tủ cá nhân' : 'Lưu vào tủ tài liệu'}</span>
          </button>

          {/* Report Link */}
          <div className="pt-2 text-center">
            <button
              onClick={() => onReport(doc)}
              className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">flag</span>
              <span>Báo cáo vi phạm bản quyền / nội dung</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
