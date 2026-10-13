import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { createDocument, submitDocument } from '../api/documentApi'
import { uploadFile } from '../api/fileApi'
import { getSubjects, getAcademicYears, getMajors, getTechnologies } from '../api/catalogApi'
import type { DocumentTypeCode } from '../types/document'
import type { Subject, AcademicYear, Major, Technology } from '../types/catalog'
import { getErrorMessage } from '../utils/errorMessages'
import { useToast } from '../contexts/ToastContext'
import CustomSelect from '../components/ui/CustomSelect'

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
  const [documentTypeCode, setDocumentTypeCode] = useState<DocumentTypeCode>('CAPSTONE')
  const [advisorName, setAdvisorName] = useState('')
  const [abstractText, setAbstractText] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [selectedTechIds, setSelectedTechIds] = useState<number[]>([])
  const [pledgeAccepted, setPledgeAccepted] = useState(false)

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
        if (ays && ays.length > 0) setAcademicYearId(ays[0].id)
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

  const handleFormSubmit = async (shouldSubmitToPending = true) => {
    if (!file) {
      setError('Vui lòng kéo thả hoặc tải lên tệp tài liệu PDF.')
      toast.warning('Thiếu tệp đính kèm', 'Vui lòng chọn tệp PDF học liệu trước khi nộp.')
      return
    }

    if (!title.trim()) {
      setError('Vui lòng nhập tên đề tài học liệu.')
      toast.warning('Thiếu tiêu đề', 'Vui lòng nhập tên đề tài học liệu.')
      return
    }

    if (!subjectId || !academicYearId) {
      setError('Vui lòng chọn đầy đủ Môn học và Niên khóa.')
      toast.warning('Thiếu thông tin phân loại', 'Vui lòng chọn Môn học và Niên khóa.')
      return
    }

    if (shouldSubmitToPending && !pledgeAccepted) {
      setError('Bạn cần đồng ý với Cam kết Liêm chính Học thuật UTC trước khi nộp bài.')
      toast.warning('Yêu cầu cam kết liêm chính', 'Vui lòng tích vào ô cam kết quyền tác giả.')
      return
    }

    setSubmitting(true)
    setError('')
    setUploadProgress(15)

    try {
      // 1. Tạo tài liệu DRAFT
      const created = await createDocument({
        title,
        subjectId: Number(subjectId),
        majorId: majorId ? Number(majorId) : undefined,
        academicYearId: Number(academicYearId),
        documentTypeCode,
        advisorName: advisorName || undefined,
        abstractText: abstractText || `Học liệu môn học do sinh viên UTC thực hiện.`,
        githubUrl: githubUrl || undefined,
        pledgeAccepted,
        technologyIds: selectedTechIds,
      })

      const docId = created.id
      setUploadProgress(40)

      // 2. Upload tệp đính kèm
      await uploadFile(file, docId, true, (progress) => {
        setUploadProgress(40 + Math.round((progress * 40) / 100))
      })

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
    { value: 'THESIS', label: '[KLTN] Khóa luận tốt nghiệp' },
    { value: 'CAPSTONE', label: '[BTL] Bài tập lớn / Đồ án môn học' },
    { value: 'LECTURE', label: '[Slide] Slide Bài giảng' },
    { value: 'EXAM', label: '[Đề thi] Đề thi & Lời giải mẫu' },
    { value: 'EXERCISE', label: '[Bài tập] Bài tập & Thực hành' },
    { value: 'LAB', label: '[Lab] Hướng dẫn thực hành Lab' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container">
            <div>
              <div className="flex items-center gap-1.5 text-secondary font-label-code text-caption font-bold uppercase tracking-widest mb-1">
                <span className="material-symbols-outlined text-[18px]">publish</span>
                <span>HỌC LIỆU SỐ NỘI BỘ • FRICTIONLESS UPLOAD</span>
              </div>
              <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-primary">
                Đăng Tải Học Liệu &amp; Đồ Án Mới
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
              accept=".pdf,.docx,.pptx,.zip"
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
                  <span className="material-symbols-outlined text-[32px]">picture_as_pdf</span>
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
                    Kéo thả tệp PDF vào đây, hoặc <span className="text-secondary underline">duyệt tệp từ máy tính</span>
                  </p>
                  <p className="text-caption text-on-surface-variant mt-1">
                    Hỗ trợ tệp PDF, Word, PowerPoint (Tối đa 25MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ─── 2. Metadata Form ─────────────────────────────────────────── */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-6 shadow-xs space-y-5">
            {/* Title */}
            <div>
              <label className="block text-body-sm font-bold text-primary mb-1">
                Tên đề tài / Tiêu đề học liệu <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Đồ án Xây dựng Website Bán sách Spring Boot & React"
                className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl border border-surface-container text-body-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

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
            </div>

            {/* Advisor & Github */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-semibold text-on-surface mb-1">
                  Giảng viên hướng dẫn
                </label>
                <input
                  type="text"
                  value={advisorName}
                  onChange={(e) => setAdvisorName(e.target.value)}
                  placeholder="Ví dụ: ThS. Nguyễn Duy Hưng"
                  className="w-full px-4 py-2 bg-surface-container-low rounded-xl border border-surface-container text-body-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
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
                  className="w-full px-4 py-2 bg-surface-container-low rounded-xl border border-surface-container text-body-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-body-sm font-semibold text-on-surface mb-1">
                Tóm tắt nội dung (Abstract)
              </label>
              <textarea
                rows={3}
                value={abstractText}
                onChange={(e) => setAbstractText(e.target.value)}
                placeholder="Tóm tắt mục tiêu, kiến trúc và kết quả đạt được của đề tài đồ án..."
                className="w-full px-4 py-2 bg-surface-container-low rounded-xl border border-surface-container text-body-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Tech Tags Selection */}
            {technologies.length > 0 && (
              <div>
                <label className="block text-body-sm font-semibold text-on-surface mb-1.5">
                  Công nghệ ứng dụng trong đồ án:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {technologies.map((tech) => {
                    const selected = selectedTechIds.includes(tech.id)
                    return (
                      <button
                        key={tech.id}
                        type="button"
                        onClick={() => toggleTech(tech.id)}
                        className={`px-3 py-1 rounded-lg text-caption font-semibold transition-all cursor-pointer border ${
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

            {/* ─── 3. Academic Integrity Pledge (Mandatory) ─────────────── */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pledgeAccepted}
                  onChange={(e) => setPledgeAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <div className="text-body-sm leading-snug">
                  <span className="font-bold text-primary">Cam kết Liêm chính Học thuật UTC:</span>
                  <p className="text-on-surface-variant text-caption mt-0.5">
                    Tôi cam kết toàn bộ nội dung trong tệp học liệu này là sản phẩm học thuật chính chủ của nhóm tác giả, không sao chép trái phép hay vi phạm bản quyền theo Quy chế Đào tạo của Trường Đại học Giao thông Vận tải.
                  </p>
                </div>
              </label>
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
