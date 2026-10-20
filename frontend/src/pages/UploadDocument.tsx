import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { createDocument, submitDocument, checkSimilarity, documentApi } from '../api/documentApi'
import { uploadFile } from '../api/fileApi'
import { getSubjects, getAcademicYears, getMajors, getTechnologies } from '../api/catalogApi'
import type { DocumentTypeCode, RelatedDocument } from '../types/document'
import type { Subject, AcademicYear, Major, Technology } from '../types/catalog'
import { getErrorMessage } from '../utils/errorMessages'
import { useToast } from '../contexts/ToastContext'
import CustomSelect from '../components/ui/CustomSelect'
import CustomCheckbox from '../components/ui/CustomCheckbox'
import { Sparkles, Loader2 } from 'lucide-react'

export default function UploadDocument() {
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Catalogs
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])

  // Form states
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [majorId, setMajorId] = useState<number | ''>('')
  const [academicYearId, setAcademicYearId] = useState<number | ''>('')
  const [targetYear, setTargetYear] = useState<string>('YEAR_3')
  const [documentTypeCode, setDocumentTypeCode] = useState<DocumentTypeCode>('CAPSTONE')
  const [advisorName, setAdvisorName] = useState('')
  const [abstractText, setAbstractText] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [selectedTechIds, setSelectedTechIds] = useState<number[]>([])
  const [pledgeAccepted, setPledgeAccepted] = useState(false)

  // AI Abstract generation state (F4)
  const [generatingAiAbstract, setGeneratingAiAbstract] = useState(false)

  // Academic similarity & check states
  const [similarDocs, setSimilarDocs] = useState<RelatedDocument[]>([])
  const [checkingSimilarity, setCheckingSimilarity] = useState(false)
  const [showTechAccordion, setShowTechAccordion] = useState(false)

  // Status
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getSubjects(), getMajors(), getAcademicYears(), getTechnologies()])
      .then(([subs, majs, ays, techs]) => {
        setSubjects(subs || [])
        setMajors(majs || [])
        setAcademicYears(ays || [])
        setTechnologies(techs || [])
        if (subs && subs.length > 0) setSubjectId(subs[0].id)
        if (majs && majs.length > 0) setMajorId(majs[0].id)
        if (ays && ays.length > 0) {
          const newest = ays.find((y) => y.name?.includes('2026') || y.startYear === 2026) || ays[0]
          setAcademicYearId(newest.id)
        }
      })
      .catch(console.error)
  }, [])

  // Auto clean filename to document title
  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile)
    setError('')
    // Auto-fill title if empty
    if (!title) {
      const cleanName = selectedFile.name
        .replace(/\.[^/.]+$/, '') // remove extension
        .replace(/[_-]/g, ' ') // replace underscore/dash with space
        .trim()
      setTitle(cleanName)
    }
  }

  // Debounced real-time academic similarity check (Tránh trùng lặp hướng đề tài)
  useEffect(() => {
    if (!title.trim() || title.trim().length < 4) {
      setSimilarDocs([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        setCheckingSimilarity(true)
        const res = await checkSimilarity({
          title: title.trim(),
          subjectId: subjectId ? Number(subjectId) : undefined,
          majorId: majorId ? Number(majorId) : undefined,
          advisorName: advisorName.trim() || undefined,
          documentTypeCode,
        })
        setSimilarDocs(res || [])
      } catch {
        setSimilarDocs([])
      } finally {
        setCheckingSimilarity(false)
      }
    }, 450)
    return () => clearTimeout(timer)
  }, [title, subjectId, majorId, advisorName, documentTypeCode])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  const toggleTech = (id: number) => {
    setSelectedTechIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Checklist Validation Statuses
  const isAdvisorRequired = ['THESIS', 'ASSIGNMENT', 'CAPSTONE', 'PROJECT'].includes(documentTypeCode)
  const isAdvisorValid = !isAdvisorRequired || advisorName.trim().length > 0
  const isAbstractValid = abstractText.trim().length >= 15
  const isFileValid = !!file
  const isTitleValid = title.trim().length >= 5
  const isSubjectValid = !!subjectId
  const isYearValid = !!academicYearId
  const isPledgeValid = pledgeAccepted
  const isAllValid = isFileValid && isTitleValid && isSubjectValid && isYearValid && isAdvisorValid && isAbstractValid && isPledgeValid

  // AI Generate Abstract (Gemini với OpenRouter failover + Đọc các trang đầu tài liệu PDF, Word DOCX)
  const handleGenerateAiAbstract = async () => {
    if (!title.trim() && !file) {
      toast.warning('Cần tên đề tài hoặc tệp đính kèm', 'Vui lòng nhập Tên đề tài hoặc tải lên tệp tài liệu trước khi yêu cầu AI sinh tóm tắt.')
      return
    }
    const currentSub = subjects.find((s) => s.id === Number(subjectId))
    setGeneratingAiAbstract(true)
    try {
      let res
      if (file) {
        res = await documentApi.generateAbstractFromFile(
          file,
          title.trim(),
          currentSub ? currentSub.name : undefined,
          documentTypeCode
        )
      } else {
        res = await documentApi.generateAbstract({
          title: title.trim() || (file ? file.name.replace(/\.[^/.]+$/, '') : 'Tài liệu học tập'),
          subjectName: currentSub ? currentSub.name : undefined,
          documentType: documentTypeCode,
        })
      }

      if (res?.abstractText) {
        setAbstractText(res.abstractText)
        if (res.suggestedTargetYear && ['YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4', 'YEAR_5'].includes(res.suggestedTargetYear)) {
          setTargetYear(res.suggestedTargetYear)
        }
        if (file) {
          toast.success(
            'Đã đọc tài liệu & sinh tóm tắt!',
            'AI đã đọc nội dung các trang/slide đầu của tài liệu (PDF, Word, PowerPoint) để tóm tắt chính xác bài toán và giải pháp.'
          )
        } else {
          toast.success(
            'Đã sinh gợi ý tóm tắt học thuật!',
            'AI đã đúc kết tóm tắt ngắn gọn (50-90 từ), đúng cấu trúc học thuật Khoa CNTT.'
          )
        }
      }
    } catch {
      toast.error('Không thể sinh tóm tắt tự động', 'Vui lòng nhập tóm tắt thủ công hoặc thử lại.')
    } finally {
      setGeneratingAiAbstract(false)
    }
  }

  const handleFormSubmit = async (shouldSubmitToPending = true) => {
    const effectiveTitle = title.trim() || (file ? file.name.replace(/\.[^/.]+$/, '').trim() : 'Bản nháp tài liệu mới')
    const effectiveSubjectId = subjectId ? Number(subjectId) : (subjects[0]?.id || 1)
    const effectiveYearId = academicYearId ? Number(academicYearId) : (academicYears[0]?.id || 7)

    if (shouldSubmitToPending) {
      if (!isFileValid) {
        setError('Vui lòng kéo thả hoặc tải lên tệp tài liệu (PDF, Word, PowerPoint).')
        toast.warning('Thiếu tệp đính kèm', 'Vui lòng chọn tệp tài liệu trước khi nộp.')
        return
      }

      if (!isTitleValid) {
        setError('Vui lòng nhập tên đề tài / tài liệu (tối thiểu 5 ký tự).')
        toast.warning('Tiêu đề quá ngắn', 'Tên đề tài cần tối thiểu 5 ký tự.')
        return
      }

      if (!isSubjectValid || !isYearValid) {
        setError('Vui lòng chọn đầy đủ Môn học và Niên khóa.')
        toast.warning('Thiếu thông tin phân loại', 'Vui lòng chọn Môn học và Niên khóa.')
        return
      }

      if (isAdvisorRequired && !isAdvisorValid) {
        setError('Vui lòng nhập Giảng viên hướng dẫn cho Khóa luận tốt nghiệp / Đồ án / BTL.')
        toast.warning('Yêu cầu Giảng viên hướng dẫn', 'Đồ án và Khóa luận bắt buộc phải có Giảng viên hướng dẫn.')
        return
      }

      if (!isAbstractValid) {
        setError('Tóm tắt nội dung (Abstract) cần tối thiểu 15 ký tự để đảm bảo chất lượng tra cứu.')
        toast.warning('Tóm tắt quá ngắn', 'Vui lòng viết tóm tắt tối thiểu 15 ký tự mô tả nội dung đề tài.')
        return
      }

      if (!isPledgeValid) {
        setError('Bạn cần đồng ý với Cam kết Liêm chính Học thuật UTC trước khi nộp bài.')
        toast.warning('Yêu cầu cam kết liêm chính', 'Vui lòng tích vào ô cam kết quyền tác giả.')
        return
      }
    }

    setSubmitting(true)
    setError('')
    setUploadProgress(15)

    try {
      // 1. Tạo tài liệu DRAFT
      const created = await createDocument({
        title: effectiveTitle,
        subjectId: effectiveSubjectId,
        majorId: majorId ? Number(majorId) : (majors[0]?.id || undefined),
        academicYearId: effectiveYearId,
        targetYear: targetYear || undefined,
        documentTypeCode,
        advisorName: advisorName || undefined,
        abstractText: abstractText || `Học liệu môn học do sinh viên UTC thực hiện.`,
        githubUrl: githubUrl || undefined,
        pledgeAccepted: pledgeAccepted ?? true,
        technologyIds: selectedTechIds,
      })

      const docId = created.id
      setUploadProgress(40)

      // 2. Upload tệp đính kèm (nếu có file)
      if (file) {
        await uploadFile(file, docId, true, (progress) => {
          setUploadProgress(40 + Math.round((progress * 40) / 100))
        })
      }

      setUploadProgress(85)

      // 3. Nếu là nộp phê duyệt -> Chuyển sang PENDING
      if (shouldSubmitToPending) {
        await submitDocument(docId)
        setUploadProgress(100)
        toast.success(
          'Đăng tải & Nộp bài thành công!',
          'Đề tài đã chuyển sang Hàng đợi kiểm duyệt của Ban Quản trị Khoa CNTT.'
        )
      } else {
        toast.info('Đã lưu bản nháp thành công', 'Bạn có thể chỉnh sửa và nộp lại sau.')
      }

      navigate('/me/documents')
    } catch (err) {
      const msg = getErrorMessage(err)
      setError(msg)
      toast.error('Không thể hoàn tất đăng tải', msg)
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  const DOC_TYPE_OPTIONS: { value: DocumentTypeCode; label: string }[] = [
    { value: 'SLIDE', label: '[Slide] Slide bài giảng' },
    { value: 'NOTE', label: '[Ghi chú] Ghi chú ôn tập' },
    { value: 'ASSIGNMENT', label: '[BTL] Bài tập lớn & Đồ án môn học' },
    { value: 'SAMPLE_CODE', label: '[Source Code] Mã nguồn mẫu' },
    { value: 'REFERENCE', label: '[Tham khảo] Tài liệu tham khảo & Giáo trình' },
    { value: 'THESIS', label: '[KLTN] Khóa luận tốt nghiệp' },
    { value: 'EXAM', label: '[Đề thi] Đề thi & Lời giải mẫu' },
    { value: 'LAB', label: '[Lab] Hướng dẫn thực hành Lab' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow bg-paper-grid">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container">
            <div>
              <div className="flex items-center gap-1.5 text-secondary font-label-code text-caption font-bold uppercase tracking-widest mb-1">
                <span className="material-symbols-outlined text-[18px]">publish</span>
                <span>TÀI LIỆU SỐ NỘI BỘ • FRICTIONLESS UPLOAD</span>
              </div>
              <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-primary">
                Đăng Tải Tài Liệu &amp; Đồ Án Mới
              </h1>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Quy trình nộp bài nhanh 30 giây: Tải lên PDF, chọn phân loại và ký cam kết liêm chính học thuật.
              </p>
            </div>

            <Link
              to="/me/documents"
              className="inline-flex items-center gap-1 text-body-sm font-semibold text-secondary hover:underline shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">folder</span>
              <span>Tủ tài liệu của tôi</span>
            </Link>
          </div>

          {/* Error banner if any */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-800 text-body-sm">
              <span className="material-symbols-outlined text-[20px] text-red-600 shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* ─── 1. Frictionless Dropzone (Top & Centered) ────────────────── */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : file
                ? 'border-emerald-400 bg-emerald-50/50'
                : 'border-surface-container-high hover:border-primary/60 bg-surface-container-lowest hover:bg-surface-container-low'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.pptx,.ppt,.zip"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelected(e.target.files[0])
                }
              }}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[32px]">
                    {file.name.toLowerCase().endsWith('.pptx') || file.name.toLowerCase().endsWith('.ppt')
                      ? 'slideshow'
                      : file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')
                      ? 'description'
                      : file.name.toLowerCase().endsWith('.zip')
                      ? 'folder_zip'
                      : 'picture_as_pdf'}
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-body-md text-primary truncate max-w-md">{file.name}</p>
                  <p className="text-caption text-on-surface-variant font-mono mt-0.5">
                    {formatFileSize(file.size)} • Sẵn sàng nộp
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="mt-1 px-3 py-1 bg-surface-container hover:bg-red-50 text-red-600 text-caption font-semibold rounded-lg transition-colors"
                >
                  Chọn tệp khác
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                </div>
                <div>
                  <p className="font-bold text-body-md text-primary">
                    Kéo thả tệp PDF, Word, PowerPoint vào đây, hoặc <span className="text-secondary underline">duyệt tệp từ máy tính</span>
                  </p>
                  <p className="text-caption text-on-surface-variant mt-1">
                    Hỗ trợ tệp PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX) (Tối đa 50MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ─── 2. Metadata Form ─────────────────────────────────────────── */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-6 shadow-xs space-y-5">
            {/* Title */}
            {/* Title */}
            <div>
              <label className="block text-body-sm font-bold text-primary mb-1">
                Tên đề tài / Tiêu đề học liệu <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Nghiên cứu Xây dựng Hệ thống Quản lý Học liệu Khoa CNTT UTC"
                className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl border border-surface-container text-body-md focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* ─── Real-time Similarity & Overlap Detection Box ─────────────── */}
            {title.trim().length >= 4 && (
              <div className="p-4 rounded-xl border transition-all text-xs space-y-2 bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="text-sm">🔍</span>
                    <span>Đối soát đề tài trùng lặp &amp; Học liệu cùng mạch trong Khoa</span>
                  </div>
                  {checkingSimilarity && (
                    <span className="text-[11px] text-indigo-600 font-medium animate-pulse flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      Đang phân tích...
                    </span>
                  )}
                </div>

                {!checkingSimilarity && similarDocs.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Phát hiện {similarDocs.length} tài liệu / đề tài có liên quan mật thiết (tránh trùng lặp hướng nghiên cứu):</span>
                    </p>
                    <div className="space-y-1.5">
                      {similarDocs.map((sim) => (
                        <div
                          key={sim.id}
                          className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900/50 flex items-start justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{sim.title}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {sim.subjectName} • {sim.academicYearName} {sim.advisorName ? `• GVHD: ${sim.advisorName}` : ''}
                            </p>
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[9px] font-bold rounded border border-amber-200 dark:border-amber-800">
                              {sim.matchReason}
                            </span>
                          </div>
                          <span className="shrink-0 px-2 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md">
                            {sim.similarityScore}% tương đồng
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!checkingSimilarity && similarDocs.length === 0 && title.trim().length >= 8 && (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <span>✅</span>
                    <span>Ý tưởng đề tài độc lập: Chưa phát hiện trùng lặp tiêu đề với các đề tài đã nghiệm thu trong Khoa.</span>
                  </p>
                )}
              </div>
            )}

            {/* Categorization Grid: Document Type, Subject, Major, Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-semibold text-on-surface mb-1">
                  Thể loại học liệu <span className="text-error">*</span>
                </label>
                <CustomSelect
                  value={documentTypeCode}
                  onChange={(val) => setDocumentTypeCode(val as DocumentTypeCode)}
                  options={DOC_TYPE_OPTIONS}
                  placeholder="Chọn thể loại"
                  icon="category"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface mb-1">
                  Môn học / Học phần <span className="text-error">*</span>
                </label>
                <CustomSelect
                  value={subjectId ? String(subjectId) : ''}
                  onChange={(val) => setSubjectId(val ? Number(val) : '')}
                  options={[
                    { value: '', label: '-- Chọn môn học --' },
                    ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
                  ]}
                  placeholder="Chọn môn học"
                  icon="book"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface mb-1">
                  Chuyên ngành
                </label>
                <CustomSelect
                  value={majorId ? String(majorId) : ''}
                  onChange={(val) => setMajorId(val ? Number(val) : '')}
                  options={[
                    { value: '', label: '-- Chọn chuyên ngành --' },
                    ...majors.map((m) => ({ value: String(m.id), label: m.name })),
                  ]}
                  placeholder="Chọn chuyên ngành"
                  icon="apartment"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface mb-1">
                  Niên khóa <span className="text-error">*</span>
                </label>
                <CustomSelect
                  value={academicYearId ? String(academicYearId) : ''}
                  onChange={(val) => setAcademicYearId(val ? Number(val) : '')}
                  options={[
                    { value: '', label: '-- Chọn niên khóa --' },
                    ...academicYears.map((y) => ({ value: String(y.id), label: y.name })),
                  ]}
                  placeholder="Chọn niên khóa"
                  icon="calendar_month"
                  className="w-full"
                />
              </div>

              {/* F3: Target Year (Năm sinh viên) */}
              <div>
                <label className="block text-body-sm font-semibold text-on-surface mb-1">
                  Phù hợp cho sinh viên năm
                </label>
                <CustomSelect
                  value={targetYear}
                  onChange={(val) => setTargetYear(val)}
                  options={[
                    { value: 'YEAR_1', label: 'Năm 1 (Đại cương & Nhập môn)' },
                    { value: 'YEAR_2', label: 'Năm 2 (Cơ sở ngành)' },
                    { value: 'YEAR_3', label: 'Năm 3 (Chuyên ngành)' },
                    { value: 'YEAR_4', label: 'Năm 4 (Đồ án / Thực tập)' },
                    { value: 'YEAR_5', label: 'Năm 5 (Khóa luận tốt nghiệp)' },
                  ]}
                  placeholder="Chọn năm sinh viên"
                  icon="school"
                  className="w-full"
                />
              </div>
            </div>

            {/* Advisor & Github */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-semibold text-on-surface mb-1">
                  Giảng viên hướng dẫn {isAdvisorRequired && <span className="text-error">* (Bắt buộc cho Đồ án/KLTN)</span>}
                </label>
                <input
                  type="text"
                  value={advisorName}
                  onChange={(e) => setAdvisorName(e.target.value)}
                  placeholder="Ví dụ: PGS. TS. Đào Thị Lệ Thủy"
                  className={`w-full px-4 py-2 bg-surface-container-low rounded-xl border text-body-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                    isAdvisorRequired && !isAdvisorValid ? 'border-amber-400 bg-amber-50/30' : 'border-surface-container'
                  }`}
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface mb-1">
                  Kho mã nguồn GitHub (nếu có)
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/utc-fit/..."
                  className="w-full px-4 py-2 bg-surface-container-low rounded-xl border border-surface-container text-body-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Abstract with AI Assistant (F4) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <label className="block text-body-sm font-semibold text-on-surface">
                  Tóm tắt nội dung (Abstract) <span className="text-error">* (Tối thiểu 15 ký tự)</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateAiAbstract}
                    disabled={generatingAiAbstract || !title.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer border border-indigo-200 shadow-2xs"
                    title="Dùng trợ lý AI sinh tóm tắt học thuật tự động từ tên đề tài & môn học"
                  >
                    {generatingAiAbstract ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>AI đang soạn thảo...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>✨ Gợi ý tóm tắt bằng AI</span>
                      </>
                    )}
                  </button>

                  <span className={`text-[11px] ${abstractText.trim().length >= 15 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    {abstractText.trim().length} / 15 ký tự
                  </span>
                </div>
              </div>
              <textarea
                rows={3}
                value={abstractText}
                onChange={(e) => setAbstractText(e.target.value)}
                placeholder="Tóm tắt mục tiêu, phương pháp nghiên cứu và kết quả đạt được của đề tài đồ án..."
                className="w-full px-4 py-2 bg-surface-container-low rounded-xl border border-surface-container text-body-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Collapsible Tech Tags (De-emphasized / Optional) */}
            {technologies.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setShowTechAccordion(!showTechAccordion)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>⚙️</span>
                    <span>Thẻ công nghệ phụ trợ ({selectedTechIds.length} đã chọn - Tùy chọn)</span>
                  </span>
                  <span className="text-slate-400 font-mono">{showTechAccordion ? '▲ Đóng' : '▼ Mở rộng'}</span>
                </button>
                {showTechAccordion && (
                  <div className="p-3 pt-1 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex flex-wrap gap-1.5">
                      {technologies.map((tech) => {
                        const selected = selectedTechIds.includes(tech.id)
                        return (
                          <button
                            key={tech.id}
                            type="button"
                            onClick={() => toggleTech(tech.id)}
                            className={`px-2.5 py-1 rounded-lg text-caption font-semibold transition-all cursor-pointer border ${
                              selected
                                ? 'bg-primary text-on-primary border-primary shadow-xs'
                                : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                            }`}
                          >
                            {selected ? '✓ ' : '+ '}
                            {tech.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── 3. Academic Integrity Pledge (Mandatory) ─────────────── */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
              <CustomCheckbox
                checked={pledgeAccepted}
                onChange={setPledgeAccepted}
                label={<span className="font-bold text-primary">Cam kết Liêm chính Học thuật UTC:</span>}
                description="Tôi cam kết toàn bộ nội dung trong tệp học liệu này là sản phẩm học thuật chính chủ của nhóm tác giả, không sao chép trái phép hay vi phạm bản quyền theo Quy chế Đào tạo của Trường Đại học Giao thông Vận tải."
                color="blue"
                size="md"
              />
            </div>

            {/* ─── Academic Checklist Status Widget ─────────────── */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📋</span>
                  <span>Checklist Tiêu chuẩn nộp học liệu Khoa CNTT</span>
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isAllValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isAllValid ? 'Đủ điều kiện nộp' : 'Chưa hoàn thiện'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1">
                <div className={`flex items-center gap-1.5 ${isFileValid ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                  <span>{isFileValid ? '✓' : '○'}</span>
                  <span>Tệp PDF học liệu đính kèm</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isTitleValid ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                  <span>{isTitleValid ? '✓' : '○'}</span>
                  <span>Tên đề tài rõ ràng (≥ 5 ký tự)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isSubjectValid && isYearValid ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                  <span>{isSubjectValid && isYearValid ? '✓' : '○'}</span>
                  <span>Môn học &amp; Niên khóa xác thực</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isAdvisorValid ? 'text-emerald-700 font-medium' : 'text-amber-700 font-semibold'}`}>
                  <span>{isAdvisorValid ? '✓' : '○'}</span>
                  <span>Giảng viên hướng dẫn {isAdvisorRequired ? '(Bắt buộc)' : '(Tùy chọn)'}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isAbstractValid ? 'text-emerald-700 font-medium' : 'text-amber-700 font-semibold'}`}>
                  <span>{isAbstractValid ? '✓' : '○'}</span>
                  <span>Tóm tắt Abstract (≥ 15 ký tự)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isPledgeValid ? 'text-emerald-700 font-medium' : 'text-amber-700 font-semibold'}`}>
                  <span>{isPledgeValid ? '✓' : '○'}</span>
                  <span>Cam kết Liêm chính Học thuật</span>
                </div>
              </div>
            </div>

            {/* Progress bar if uploading */}
            {submitting && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-caption font-semibold text-primary">
                  <span>Đang xử lý nộp bài...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* ─── 4. Action Buttons ────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => handleFormSubmit(false)}
                disabled={submitting}
                className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-bold text-body-sm transition-colors cursor-pointer"
              >
                Lưu bản nháp
              </button>

              <button
                type="button"
                onClick={() => handleFormSubmit(true)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-bold text-body-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang nộp bài...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Nộp phê duyệt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
