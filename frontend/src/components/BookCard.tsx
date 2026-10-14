import React from 'react'
import type { DocumentSummary } from '../types'

interface BookCardProps {
  doc: DocumentSummary
  isSelected?: boolean
  onClick?: () => void
  onQuickView?: () => void
  onPreviewPdf?: () => void
}

// Muted, tasteful academic styling for each document type
const TYPE_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: string }
> = {
  LECTURE: {
    label: 'Slide bài giảng',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/70',
    icon: 'menu_book',
  },
  LAB: {
    label: 'Hướng dẫn Lab',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/70',
    icon: 'biotech',
  },
  EXERCISE: {
    label: 'Bài tập',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200/70',
    icon: 'edit_note',
  },
  CAPSTONE: {
    label: 'Bài tập lớn',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    icon: 'code_blocks',
  },
  PROJECT: {
    label: 'Đồ án môn học',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/70',
    icon: 'folder_special',
  },
  THESIS: {
    label: 'Khóa luận tốt nghiệp',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/70',
    icon: 'school',
  },
  EXAM: {
    label: 'Đề thi & Đề cương',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/70',
    icon: 'quiz',
  },
}

export default function BookCard({
  doc,
  isSelected,
  onClick,
  onQuickView,
  onPreviewPdf,
}: BookCardProps) {
  const typeKey = (doc.documentTypeCode || '').toUpperCase()
  const typeInfo = TYPE_CONFIG[typeKey] || {
    label: doc.documentTypeLabel || 'Học liệu',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: 'description',
  }

  const handleQuickPreview = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPreviewPdf) onPreviewPdf()
    else if (onQuickView) onQuickView()
    else if (onClick) onClick()
  }

  return (
    <article
      onClick={onClick}
      className={`group bg-white rounded-xl p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer border relative select-none ${
        isSelected
          ? 'border-blue-600 shadow-md ring-2 ring-blue-100'
          : 'border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div className="space-y-3">
        {/* Top Header: Document Type Badge + Academic Year */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border ${typeInfo.badgeClass}`}
          >
            <span className="material-symbols-outlined text-[13px]">{typeInfo.icon}</span>
            <span>{typeInfo.label}</span>
          </span>

          <span className="text-[11px] font-medium text-slate-400 font-mono">
            {doc.academicYearName || 'K64'}
          </span>
        </div>

        {/* Title: Clean 2-line clamp with high contrast & no redundancy */}
        <div>
          <h3
            className="text-[14px] sm:text-[15px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
            title={doc.title}
          >
            {doc.title}
          </h3>
        </div>

        {/* Academic Context (Subject, Major, Advisor) */}
        <div className="space-y-1.5 pt-1 text-xs text-slate-600 border-t border-slate-100">
          <div className="flex items-center gap-1.5 truncate">
            <span className="material-symbols-outlined text-[15px] text-slate-400 shrink-0">
              book
            </span>
            <span className="truncate font-medium text-slate-700">
              {doc.subjectName || 'Khoa Công nghệ Thông tin'}
            </span>
          </div>

          {doc.advisorName && (
            <div className="flex items-center gap-1.5 truncate">
              <span className="material-symbols-outlined text-[15px] text-slate-400 shrink-0">
                supervisor_account
              </span>
              <span className="truncate text-slate-600">
                GVHD: <span className="font-semibold text-slate-800">{doc.advisorName}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 truncate text-[11px] text-slate-500">
            <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0">
              person
            </span>
            <span className="truncate">{doc.uploaderName || 'Sinh viên CNTT - UTC'}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Metrics & Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 hover:text-slate-700 transition-colors" title="Lượt xem">
            <span className="material-symbols-outlined text-[14px] text-slate-400">visibility</span>
            <span>{doc.viewCount || 0}</span>
          </span>

          <span className="flex items-center gap-1 hover:text-slate-700 transition-colors" title="Lượt tải về">
            <span className="material-symbols-outlined text-[14px] text-slate-400">download</span>
            <span>{doc.downloadCount || 0}</span>
          </span>

          {doc.avgRating > 0 && (
            <span className="flex items-center gap-0.5 text-amber-600 font-semibold" title="Đánh giá">
              <span className="material-symbols-outlined text-[13px] fill-current">star</span>
              <span>{doc.avgRating.toFixed(1)}</span>
            </span>
          )}
        </div>

        {/* Quick Preview Button */}
        <button
          type="button"
          onClick={handleQuickPreview}
          className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[13px]">visibility</span>
          <span>Xem nhanh</span>
        </button>
      </div>
    </article>
  )
}
