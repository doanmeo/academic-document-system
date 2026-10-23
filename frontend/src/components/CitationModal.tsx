// === LUỒNG 3: XEM CHI TIẾT & TƯƠNG TÁC HỌC LIỆU (Citation Modal) ===
// Hộp thoại tạo và sao chép trích dẫn học thuật tự động (IEEE, APA, BibTeX)
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { CitationFormat, DocumentDetail, DocumentSummary } from '../types/document'
import { getCitation } from '../api/documentApi'
import { useToast } from '../contexts/ToastContext'

interface CitationModalProps {
  isOpen: boolean
  onClose: () => void
  doc: DocumentSummary | DocumentDetail | null
}

const CITATION_TABS: { format: CitationFormat; label: string; desc: string }[] = [
  { format: 'IEEE', label: 'IEEE', desc: 'Chuẩn kỹ thuật điện & CNTT quốc tế' },
  { format: 'APA', label: 'APA 7th', desc: 'Chuẩn học thuật phổ biến cho báo cáo & đồ án' },
  { format: 'BIBTEX', label: 'BibTeX', desc: 'Dành cho báo cáo viết bằng LaTeX / Overleaf' },
]

export default function CitationModal({ isOpen, onClose, doc }: CitationModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<CitationFormat>('IEEE')
  const [citationText, setCitationText] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (!isOpen || !doc) return
    setLoading(true)
    setCopied(false)

    getCitation(doc.id, selectedFormat, doc as any)
      .then((res) => {
        setCitationText(res.citation)
      })
      .catch(() => {
        setCitationText('')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isOpen, doc, selectedFormat])

  if (!isOpen || !doc) return null

  const handleCopy = async () => {
    if (!citationText) return
    try {
      await navigator.clipboard.writeText(citationText)
      setCopied(true)
      toast.success(
        `Đã sao chép trích dẫn chuẩn ${selectedFormat}!`,
        'Bạn có thể dán trực tiếp vào danh mục tài liệu tham khảo.'
      )
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Không thể tự động sao chép', 'Vui lòng chọn văn bản và nhấn Ctrl+C.')
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tiêu đề hộp thoại trích dẫn */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl">
              ❝
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Trích Dẫn Học Thuật Chuẩn
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                {doc.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* LUỒNG 3: Chọn định dạng trích dẫn (IEEE, APA, BibTeX) */}
        <div>
          <label className="block text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            Chọn định dạng trích dẫn:
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            {CITATION_TABS.map((tab) => {
              const active = selectedFormat === tab.format
              return (
                <button
                  key={tab.format}
                  onClick={() => setSelectedFormat(tab.format)}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0B2847] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  <span className="font-bold">{tab.label}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-slate-500 mt-2 italic">
            💡 {CITATION_TABS.find((t) => t.format === selectedFormat)?.desc}
          </p>
        </div>

        {/* Khung hiển thị nội dung văn bản trích dẫn */}
        <div className="relative">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 font-mono text-xs text-slate-800 leading-relaxed min-h-[110px] break-words whitespace-pre-wrap select-all">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
                <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Đang sinh trích dẫn...</span>
              </div>
            ) : (
              citationText
            )}
          </div>
        </div>

        {/* Nút bấm sao chép và đóng hộp thoại */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-xs text-emerald-600 font-medium hidden sm:inline">
            ✓ 1-Click Copy vào Clipboard
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              onClick={handleCopy}
              disabled={loading || !citationText}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0B2847] text-white hover:bg-[#1A4D80] active:scale-95'
              }`}
            >
              <span>{copied ? '✓ Đã sao chép!' : 'Sao chép trích dẫn'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
