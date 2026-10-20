import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  BookOpen,
  Code2,
  GraduationCap,
  Eye,
  Download,
  Star,
  Layers,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react'
import { DocumentSummary } from '../../types/document'

interface DocumentCardProps {
  doc: DocumentSummary
  isSelected?: boolean
  onClick?: () => void
  onPreviewPdf?: () => void
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  isSelected,
  onClick,
  onPreviewPdf,
}) => {
  const navigate = useNavigate()

  const typeConfig: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
    THESIS: {
      label: 'Khóa luận tốt nghiệp',
      badge: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
    },
    ASSIGNMENT: {
      label: 'Bài tập lớn (BTL)',
      badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/40',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    CAPSTONE: {
      label: 'Đồ án chuyên ngành',
      badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/40',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    PROJECT: {
      label: 'Bài tập lớn',
      badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/40',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    SLIDE: {
      label: 'Slide bài giảng',
      badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    LECTURE: {
      label: 'Slide bài giảng',
      badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    NOTE: {
      label: 'Ghi chú ôn tập',
      badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    SAMPLE_CODE: {
      label: 'Mã nguồn mẫu',
      badge: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/40',
      icon: <Code2 className="w-3.5 h-3.5" />,
    },
    REFERENCE: {
      label: 'Tài liệu tham khảo',
      badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/40',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    EXAM: {
      label: 'Đề thi & Lời giải',
      badge: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/40',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    EXERCISE: {
      label: 'Bài tập thực hành',
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40',
      icon: <Code2 className="w-3.5 h-3.5" />,
    },
    LAB: {
      label: 'Hướng dẫn Lab',
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40',
      icon: <Code2 className="w-3.5 h-3.5" />,
    },
  }

  const type = (doc.documentTypeCode || '').toUpperCase()
  const conf = typeConfig[type] || {
    label: doc.documentTypeLabel || 'Học liệu Khoa',
    badge: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: <FileText className="w-3.5 h-3.5" />,
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(`/documents/${doc.id}`)
    }
  }

  const handlePreviewPdf = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPreviewPdf) {
      onPreviewPdf()
    }
  }

  const handleViewOnline = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/documents/${doc.id}`)
  }

  return (
    <article
      onClick={handleCardClick}
      className={`group bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between cursor-pointer relative select-none hover:shadow-md ${
        isSelected
          ? 'border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${conf.badge}`}
          >
            {conf.icon}
            <span>{conf.label}</span>
          </span>

          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
            {doc.academicYearName || '2024-2025'}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2.5"
          title={doc.title}
        >
          <Link
            to={`/documents/${doc.id}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:underline"
          >
            {doc.title}
          </Link>
        </h3>

        {/* Abstract snippet */}
        {doc.abstractText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {doc.abstractText}
          </p>
        )}

        {/* Academic Meta */}
        <div className="space-y-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 truncate">
            <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate font-semibold">{doc.subjectName}</span>
          </div>

          {doc.advisorName && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 truncate text-[11px]">
              <span className="font-bold text-slate-700 dark:text-slate-300">GVHD:</span>
              <span className="truncate">{doc.advisorName}</span>
            </div>
          )}

          {/* Highlights (Has solution or Code snippet) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {doc.hasSolution && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>Có đáp án</span>
              </span>
            )}
            {doc.codeLanguage && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/30 uppercase">
                <Code2 className="w-3 h-3" />
                <span>{doc.codeLanguage}</span>
              </span>
            )}
            {doc.examDifficulty && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/30">
                {doc.examDifficulty}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Lượt xem">
            <Eye className="w-3.5 h-3.5" />
            <span>{doc.viewCount || 0}</span>
          </span>
          <span className="flex items-center gap-1" title="Lượt tải">
            <Download className="w-3.5 h-3.5" />
            <span>{doc.downloadCount || 0}</span>
          </span>
          {doc.avgRating > 0 && (
            <span className="flex items-center gap-1 text-amber-500 font-bold" title="Đánh giá">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{doc.avgRating.toFixed(1)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onPreviewPdf && (
            <button
              type="button"
              onClick={handlePreviewPdf}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Xem nhanh bản PDF trong cửa sổ popup"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Xem PDF</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleViewOnline}
            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Đọc toàn văn và chi tiết tài liệu trực tuyến"
          >
            <span>Xem online</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </article>
  )
}
export default DocumentCard
