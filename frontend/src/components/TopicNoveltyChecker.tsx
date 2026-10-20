import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Search,
  RotateCcw,
  BookOpen,
  Eye,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  Wand2,
  FileText,
  Upload,
} from 'lucide-react'
import type { Subject, Major, TopicComparisonResult, TopicComparisonRequest } from '../types'
import { documentApi } from '../api/documentApi'
import { catalogApi } from '../api/catalogApi'
import LoadingSpinner from './LoadingSpinner'
import CustomSelect from './ui/CustomSelect'
import PdfViewerModal from './PdfViewerModal'

export default function TopicNoveltyChecker() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [advisors, setAdvisors] = useState<string[]>([])

  // Main Topic & Content Inputs
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Secondary Metadata Inputs (<= 20% weight)
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [majorId, setMajorId] = useState<number | ''>('')
  const [advisorName, setAdvisorName] = useState('')

  // State
  const [loading, setLoading] = useState(false)
  const [generatingAbstract, setGeneratingAbstract] = useState(false)
  const [result, setResult] = useState<TopicComparisonResult | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // PDF Preview Modal
  const [pdfModal, setPdfModal] = useState<{
    isOpen: boolean
    docId?: number
    title?: string
  }>({ isOpen: false })

  // Catalog loading
  useEffect(() => {
    Promise.all([catalogApi.getSubjects(), catalogApi.getMajors(), catalogApi.getAdvisors()])
      .then(([subRes, majRes, advRes]: any[]) => {
        setSubjects(Array.isArray(subRes) ? subRes : subRes?.data || [])
        setMajors(Array.isArray(majRes) ? majRes : majRes?.data || [])
        setAdvisors(Array.isArray(advRes) ? advRes : advRes?.data || [])
      })
      .catch((err) => console.error('Lỗi tải danh mục tra cứu:', err))
  }, [])

  const pdfInputRef = useRef<HTMLInputElement>(null)
  const [readingPdf, setReadingPdf] = useState(false)

  // AI-assisted Abstract Generation từ Tiêu đề
  const handleGenerateAbstract = async () => {
    if (!title.trim() || title.trim().length < 4) return
    setGeneratingAbstract(true)
    try {
      const selectedSub = subjects.find((s) => s.id === subjectId)
      const res = await documentApi.generateAbstract({
        title: title.trim(),
        subjectName: selectedSub ? selectedSub.name : 'Công nghệ Thông tin',
        documentTypeCode: 'THESIS',
      })
      if (res && res.abstractText) {
        setDescription(res.abstractText)
      }
    } catch (err) {
      console.error('Lỗi sinh tóm tắt đề cương AI:', err)
    } finally {
      setGeneratingAbstract(false)
    }
  }

  // Đọc 2-3 trang đầu tài liệu PDF tải lên và dùng AI tóm tắt chính xác
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setReadingPdf(true)
    try {
      if (!title.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim()
        setTitle(cleanName)
      }
      const selectedSub = subjects.find((s) => s.id === subjectId)
      const res = await documentApi.generateAbstractFromFile(
        file,
        title.trim() || file.name.replace(/\.[^/.]+$/, ''),
        selectedSub ? selectedSub.name : 'Công nghệ Thông tin',
        'THESIS'
      )
      if (res && res.abstractText) {
        setDescription(res.abstractText)
      }
    } catch (err) {
      console.error('Lỗi đọc và tóm tắt file PDF:', err)
    } finally {
      setReadingPdf(false)
      if (pdfInputRef.current) pdfInputRef.current.value = ''
    }
  }

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!title.trim() || title.trim().length < 4) return

    setLoading(true)
    setHasSearched(true)
    try {
      const payload: TopicComparisonRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId ? Number(subjectId) : undefined,
        majorId: majorId ? Number(majorId) : undefined,
        advisorName: advisorName.trim() || undefined,
      }
      const data = await documentApi.compareTopics(payload)
      setResult(data)
    } catch (err) {
      console.error('Lỗi phân tích tính mới:', err)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setTitle('')
    setDescription('')
    setSubjectId('')
    setMajorId('')
    setAdvisorName('')
    setResult(null)
    setHasSearched(false)
  }

  const getRiskDisplay = (level: string) => {
    if (level === 'HIGH_DUPLICATION_RISK') {
      return {
        label: 'CẢNH BÁO TRÙNG LẶP CAO',
        badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        textColor: 'text-rose-600 dark:text-rose-400',
        desc: 'Đề tài và nội dung tóm tắt có sự trùng khớp lớn với đồ án đã bảo vệ các khóa trước tại Khoa. Cần đổi mới bài toán hoặc phương pháp giải quyết.',
        icon: AlertTriangle,
      }
    }
    if (level === 'MEDIUM_SIMILARITY' || level === 'MODERATE_OVERLAP') {
      return {
        label: 'TRÙNG LẶP MỨC TRUNG BÌNH',
        badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        textColor: 'text-amber-600 dark:text-amber-400',
        desc: 'Đề tài có nét tương đồng về bài toán hoặc công nghệ. Sinh viên nên kế thừa và mở rộng thêm các tính năng đột phá mới.',
        icon: Info,
      }
    }
    return {
      label: 'TÍNH MỚI HỌC THUẬT CAO',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      desc: 'Ý tưởng đề tài có hướng tiếp cận riêng biệt, chưa có đồ án trùng lặp đáng kể trong kho lưu trữ của Khoa.',
      icon: CheckCircle2,
    }
  }

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER WITH ARCHIVAL METADATA ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-stone-300 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="stamp-seal text-blue-700 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/60 text-[10px]">
              [ HỆ THỐNG ĐỐI SOÁT ĐỀ TÀI AI ]
            </span>
            <span className="text-stone-400">/</span>
            <span className="font-mono text-xs text-stone-500">KHOA CNTT · ĐH GIAO THÔNG VẬN TẢI</span>
          </div>

          <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 tracking-tight">
            Đối Soát Trùng Lặp &amp; Tính Mới Đề Tài
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl font-sans">
            Hệ thống AI đối chiếu tự động nội dung tóm tắt, tên đề tài với kho lưu trữ Khóa luận &amp; Đồ án tốt nghiệp của Khoa CNTT - ĐH Giao thông Vận tải.
          </p>
        </div>

        {/* Total Documents in Archive Counter */}
        <div className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-xs font-bold text-stone-700 dark:text-stone-300 shrink-0">
          KHO ĐỐI CHIẾU: <span className="text-blue-600 dark:text-blue-400">50+ ĐỒ ÁN &amp; KLTN</span>
        </div>
      </div>

      {/* ── WORKSPACE GRID: FORM (5 COLS) + RESULTS (7 COLS) ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl border-2 border-stone-300 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide font-sans">
              Thông tin đề tài cần kiểm tra
            </span>

            {title.trim().length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-mono text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Làm mới</span>
              </button>
            )}
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            {/* 1. Title Input (Core) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                  <span>Tên đề tài / Khóa luận dự kiến</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-stone-400">
                  {title.trim().length} ký tự
                </span>
              </div>
              <textarea
                rows={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Nghiên cứu kỹ thuật phòng thủ tấn công DDoS trên mạng SDN sử dụng mô hình học máy..."
                className="w-full p-3 text-xs font-sans bg-stone-100/80 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:bg-white dark:focus:bg-stone-950 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none leading-relaxed text-stone-900 dark:text-stone-100 transition-all"
              />
            </div>

            {/* 2. Abstract / Description Input (Core) with AI Generator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                  <span>Mô tả nội dung / Tóm tắt đề cương</span>
                  <span className="text-[10px] text-stone-400 font-normal">(Rất quan trọng)</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={pdfInputRef}
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={readingPdf}
                    title="Tải lên tệp đề cương/bản thảo PDF hoặc Word DOCX để AI đọc các trang đầu và tự động sinh tóm tắt chuẩn xác"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {readingPdf ? (
                      <>
                        <span className="w-2.5 h-2.5 border border-amber-600 border-t-transparent rounded-full animate-spin" />
                        <span>Đang đọc tệp...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>📄 Đọc từ tệp (PDF/Word)</span>
                      </>
                    )}
                  </button>

                  {/* AI Draft Button */}
                  <button
                    type="button"
                    onClick={handleGenerateAbstract}
                    disabled={generatingAbstract || title.trim().length < 4}
                    title="Nhấn để AI tự động soạn tóm tắt đề cương học thuật dựa trên tên đề tài"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {generatingAbstract ? (
                      <>
                        <span className="w-2.5 h-2.5 border border-purple-600 border-t-transparent rounded-full animate-spin" />
                        <span>AI đang soạn...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span>✨ AI sinh tóm tắt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả tóm tắt bài toán nghiên cứu, công nghệ áp dụng, tập dữ liệu hoặc bấm '✨ AI sinh tóm tắt' ở trên để hệ thống tự động soạn thảo..."
                className="w-full p-3 text-xs font-sans bg-stone-100/80 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:bg-white dark:focus:bg-stone-950 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none leading-relaxed text-stone-900 dark:text-stone-100 transition-all"
              />
              <span className="text-[10px] text-stone-400 block mt-1">
                Thuật toán sẽ so sánh ngữ nghĩa nội dung tóm tắt này với bản tóm tắt học thuật của các KLTN đã bảo vệ.
              </span>
            </div>

            {/* 3. Secondary Context Options (< 20% weight) */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-3">
              <span className="text-[11px] font-mono font-bold text-stone-500 uppercase block">
                Thông tin bổ trợ (tùy chọn):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Môn học
                  </label>
                  <CustomSelect
                    value={subjectId ? String(subjectId) : ''}
                    onChange={(val) => setSubjectId(val ? Number(val) : '')}
                    options={[
                      { value: '', label: '-- Môn học (tất cả) --' },
                      ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
                    ]}
                    placeholder="Chọn môn học"
                    className="w-full text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Chuyên ngành
                  </label>
                  <CustomSelect
                    value={majorId ? String(majorId) : ''}
                    onChange={(val) => setMajorId(val ? Number(val) : '')}
                    options={[
                      { value: '', label: '-- Chuyên ngành (tất cả) --' },
                      ...majors.map((m) => ({ value: String(m.id), label: `${m.name} (${m.code})` })),
                    ]}
                    placeholder="Chọn chuyên ngành"
                    className="w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Giảng viên hướng dẫn dự kiến
                </label>
                <CustomSelect
                  value={advisorName}
                  onChange={(val) => setAdvisorName(val)}
                  options={[
                    { value: '', label: '-- Giảng viên hướng dẫn (tất cả) --' },
                    ...advisors.map((adv) => ({ value: adv, label: adv })),
                  ]}
                  placeholder="Chọn GVHD"
                  className="w-full text-xs font-mono"
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading || title.trim().length < 4}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang đối soát kho học liệu...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-blue-200" />
                  <span>Kiểm Tra Mức Độ Trùng Lặp</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Results View (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {!hasSearched && (
            <div className="bg-white dark:bg-stone-900 border-2 border-dashed border-stone-300 dark:border-stone-800 rounded-2xl p-8 sm:p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800 shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-serif-academic text-lg font-bold text-stone-900 dark:text-stone-100">
                  Đối Soát Tính Mới &amp; Tránh Trùng Đề Tài
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                  Nhập tên đề tài và nội dung tóm tắt ở cột bên trái (hoặc bấm <strong>✨ AI sinh tóm tắt</strong>) rồi bấm <strong>Kiểm Tra Mức Độ Trùng Lặp</strong> để hệ thống đối chiếu với kho đồ án tốt nghiệp của Khoa.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white dark:bg-stone-900 p-12 rounded-2xl border-2 border-stone-300 dark:border-stone-800 text-center space-y-4 shadow-sm">
              <LoadingSpinner />
              <div className="space-y-1">
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100 font-sans">
                  Đang đối chiếu ngữ nghĩa tên đề tài và nội dung tóm tắt...
                </p>
                <p className="text-xs font-mono text-stone-500 dark:text-stone-400">
                  So khớp từ khóa cốt lõi • Đối chiếu bản tóm tắt học thuật KLTN
                </p>
              </div>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-5">
              {/* Verdict Summary Card */}
              {(() => {
                const risk = getRiskDisplay(result.riskLevel)
                const Icon = risk.icon
                const noveltyScore = Math.max(0, 100 - result.overallOverlapScore)

                return (
                  <div className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-stone-300 dark:border-stone-800 p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 ${risk.badge}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{risk.label}</span>
                          </span>
                        </div>
                        <h3 className="font-serif-academic text-lg font-bold text-stone-950 dark:text-stone-50">
                          {result.verdict}
                        </h3>
                        <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
                          {risk.desc}
                        </p>
                      </div>

                      {/* Scores */}
                      <div className="flex items-center gap-3 shrink-0 bg-stone-50 dark:bg-stone-800/80 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                        <div className="text-center px-2">
                          <span className="text-[10px] font-mono text-stone-500 uppercase block">Độ trùng lặp</span>
                          <span className={`text-2xl font-mono font-bold block mt-0.5 ${risk.textColor}`}>
                            {result.overallOverlapScore}%
                          </span>
                        </div>
                        <div className="h-8 w-px bg-stone-300 dark:bg-stone-700" />
                        <div className="text-center px-2">
                          <span className="text-[10px] font-mono text-stone-500 uppercase block">Chỉ số tính mới</span>
                          <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                            {noveltyScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Matched Highlights */}
                    {result.extractedTokens && result.extractedTokens.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                        <span className="text-stone-500 text-[11px]">Từ khóa nhận diện:</span>
                        {result.extractedTokens.map((tok, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                          >
                            {tok}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* ── MATCHED PAST THESES LIST ─────────────────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold font-sans text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Đồ án / Khóa luận tương đồng trong kho lưu trữ ({result.matchedDocuments.length})</span>
                  </h4>
                </div>

                {result.matchedDocuments.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-white dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-800 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 font-sans">
                      Không tìm thấy công trình nào trùng lặp đáng kể!
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                      Đề tài và nội dung nghiên cứu của bạn có tính mới học thuật cao, chưa từng có đồ án tương tự được bảo vệ tại Khoa.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.matchedDocuments.map((m) => (
                      <div
                        key={m.id}
                        className="bg-white dark:bg-stone-900 rounded-xl border-2 border-stone-300 dark:border-stone-800 p-4 sm:p-5 shadow-xs space-y-3"
                      >
                        {/* Title and Overlap Score */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <h5 className="text-xs sm:text-sm font-bold font-serif-academic text-stone-950 dark:text-stone-50 leading-snug">
                              {m.title}
                            </h5>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-stone-500 dark:text-stone-400">
                              <span>Môn: <strong>{m.subjectName || 'Chung'}</strong></span>
                              {m.academicYearName && <span>• {m.academicYearName}</span>}
                              {m.advisorName && (
                                <span className="text-blue-600 dark:text-blue-400">
                                  • GVHD: <strong>{m.advisorName}</strong>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 self-start">
                            <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-mono font-bold text-xs rounded-lg border border-amber-300 dark:border-amber-800">
                              {m.similarityScore}% trùng khớp
                            </span>
                          </div>
                        </div>

                        {/* Abstract Snippet from Matched Thesis */}
                        {m.abstractSnippet && (
                          <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 text-xs font-sans text-stone-700 dark:text-stone-300 leading-relaxed space-y-1">
                            <span className="text-[10px] font-mono uppercase font-bold text-stone-500 block">
                              Trích dẫn tóm tắt nội dung khóa trước:
                            </span>
                            <p className="italic text-stone-600 dark:text-stone-400">
                              "{m.abstractSnippet}"
                            </p>
                          </div>
                        )}

                        {/* Matched Keywords & Overlapping Aspects */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-amber-700 dark:text-amber-300">
                          <span className="text-stone-500 text-[11px]">Điểm giao thoa:</span>
                          <span>{m.overlappingAspects}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-700">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPdfModal({ isOpen: true, docId: m.id, title: m.title })}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-[11px] font-mono font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Xem Đề cương PDF</span>
                            </button>

                            <a
                              href={`/documents/${m.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white text-[11px] font-mono transition-colors flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Chi tiết tài liệu</span>
                            </a>
                          </div>

                          {m.githubUrl && (
                            <a
                              href={m.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-blue-600 text-[11px] font-mono font-bold transition-colors flex items-center gap-1"
                            >
                              <span>Mã nguồn GitHub</span>
                              <span className="text-[10px]">↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PDF PREVIEW MODAL ─────────────────────────────────────────────────── */}
      <PdfViewerModal
        isOpen={pdfModal.isOpen}
        onClose={() => setPdfModal({ isOpen: false })}
        title={pdfModal.title || 'Đề cương Đồ án Tốt nghiệp'}
        fileId={pdfModal.docId}
      />
    </div>
  )
}
