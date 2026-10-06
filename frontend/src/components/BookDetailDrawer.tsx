import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import type { DocumentSummary } from '../types'
import { UTC_BOOK_THEMES } from './BookCard'
import { documentApi } from '../api/documentApi'

interface BookDetailDrawerProps {
  doc: DocumentSummary | null
  onClose: () => void
  onReadOnline: (doc: DocumentSummary) => void
  onDownload: (doc: DocumentSummary) => void
  onReport: (doc: DocumentSummary) => void
  onBookmarkChanged?: (docId: number, isBookmarked: boolean) => void
}

export default function BookDetailDrawer({
  doc,
  onClose,
  onReadOnline,
  onDownload,
  onReport,
  onBookmarkChanged,
}: BookDetailDrawerProps) {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(doc?.bookmarked || false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    setIsBookmarked(doc?.bookmarked || false)
  }, [doc?.id, doc?.bookmarked])

  if (!doc) return null

  const themeIndex = Math.abs(doc.id % UTC_BOOK_THEMES.length)
  const theme = UTC_BOOK_THEMES[themeIndex]

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
        {/* Cover Thumbnail & Header Info */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-20 h-28 rounded-xl ${theme.bg} ${theme.border} border shrink-0 p-2 flex flex-col items-center justify-between shadow-2xs text-center`}
          >
            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
              UTC DOC
            </span>
            <span
              className={`text-[10px] font-bold leading-tight line-clamp-2 ${
                theme.isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {theme.title}
            </span>
            <div className="scale-75">{theme.graphic}</div>
          </div>

          <div className="flex-1 space-y-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Đã duyệt bởi Hội đồng Khoa
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
              {doc.title}
            </h2>
            <div className="text-xs text-slate-600 space-y-0.5 pt-1">
              <p>
                <span className="text-slate-400">Tác giả: </span>
                <strong className="text-slate-800">{doc.uploaderName}</strong>
              </p>
              <p>
                <span className="text-slate-400">GVHD: </span>
                <strong className="text-blue-700">{doc.advisorName || 'PGS. TS. Đào Thị Lệ Thủy'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Abstract Box */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            TÓM TẮT NỘI DUNG (ABSTRACT)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed text-justify bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            {doc.abstractText ||
              'Nghiên cứu tập trung giải quyết bài toán phân cụm đồ thị quy mô lớn với độ phức tạp tính toán tối ưu O(V log V). Ứng dụng kỹ thuật phân rã phổ kết hợp thuật toán tối ưu Louvain, giúp giảm 42% độ trễ xử lý các tập dữ liệu mạng lưới giao thông thông minh thời gian thực.'}
          </p>
        </div>

        {/* Tech Stack Chips */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            TECH STACK & CÔNG NGHỆ SỬ DỤNG
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['Spring Boot 3.2', 'React 18', 'MySQL 8', 'Neo4j', 'Docker'].map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Rating and Reads */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <span>⭐⭐⭐⭐⭐</span>
            <span className="text-slate-800 ml-1">4.9</span>
            <span className="text-slate-400 font-normal">(48 đánh giá)</span>
          </div>
          <span className="font-semibold text-slate-600">1,280 lượt đọc</span>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 pt-2">
          {/* Primary CTA */}
          <button
            onClick={() => onReadOnline(doc)}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Đọc Trực Tuyến / Xem PDF
          </button>

          {/* Download CTA */}
          <button
            onClick={() => onDownload(doc)}
            className="w-full py-2 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Tải xuống PDF Bản Gốc (24 MB)</span>
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
            <svg
              className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-500'}`}
              fill={isBookmarked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>{isBookmarked ? 'Đã lưu trong Bộ sưu tập' : 'Lưu vào Bộ sưu tập cá nhân'}</span>
          </button>

          {/* Report Link */}
          <div className="pt-2 text-center">
            <button
              onClick={() => onReport(doc)}
              className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Báo cáo vi phạm bản quyền / nội dung
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
