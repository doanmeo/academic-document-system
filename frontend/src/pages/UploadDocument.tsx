import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { createDocument, submitDocument } from '../api/documentApi'
import { uploadFile, deleteFile } from '../api/fileApi'
import { getSubjects, getAcademicYears, getMajors, getTechnologies } from '../api/catalogApi'
import type { UploadedFile, DocumentTypeCode } from '../types/document'
import type { Subject, AcademicYear, Major, Technology } from '../types/catalog'
import { getErrorMessage } from '../utils/errorMessages'
import CustomSelect from '../components/ui/CustomSelect'

type Step = 'form' | 'files'

export default function UploadDocument() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('form')
  const [documentId, setDocumentId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState('')

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])

  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [academicYearId, setAcademicYearId] = useState<number | ''>('')
  const [advisorName, setAdvisorName] = useState('')
  const [abstractText, setAbstractText] = useState('')
  const [documentTypeCode, setDocumentTypeCode] = useState<DocumentTypeCode | ''>('THESIS')
  const [majorId, setMajorId] = useState<number | ''>('')
  const [selectedTechIds, setSelectedTechIds] = useState<number[]>([])
  const [githubUrl, setGithubUrl] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    Promise.all([getSubjects(), getMajors(), getAcademicYears(), getTechnologies()])
      .then(([subs, majs, ays, techs]) => {
        setSubjects(subs || [])
        setMajors(majs || [])
        setAcademicYears(ays || [])
        setTechnologies(techs || [])
        if (subs && subs.length > 0) setSubjectId(subs[0].id)
        if (ays && ays.length > 0) setAcademicYearId(ays[0].id)
        if (majs && majs.length > 0) setMajorId(majs[0].id)
      })
      .catch(console.error)
  }, [])

  const toggleTech = (id: number) => {
    setSelectedTechIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề tài liệu.')
      return
    }
    if (!subjectId || !academicYearId || !documentTypeCode) {
      setError('Vui lòng chọn đầy đủ môn học, niên khóa và loại tài liệu.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const created = await createDocument({
        title,
        subjectId: Number(subjectId),
        academicYearId: Number(academicYearId),
        documentTypeCode,
        majorId: majorId ? Number(majorId) : undefined,
        advisorName,
        abstractText,
        description,
        githubUrl: githubUrl || undefined,
        technologyIds: selectedTechIds,
      })
      setDocumentId(created.id)
      setStep('files')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!documentId || !e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setUploading(true)
    setUploadProgress(20)
    try {
      const uploaded = await uploadFile(documentId, file, (progress) => {
        setUploadProgress(progress)
      })
      setFiles((prev) => [...prev, uploaded])
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteFile = async (fileId: number) => {
    if (!documentId) return
    try {
      await deleteFile(documentId, fileId)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  const handleSubmitForReview = async () => {
    if (!documentId) return
    setSubmitting(true)
    try {
      await submitDocument(documentId)
      alert('Đã gửi đề tài lên Ban Quản trị xét duyệt thành công!')
      navigate('/me/documents')
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow bg-surface">
        <div className="max-w-7xl mx-auto px-4 lg:px-gutter-desktop space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-surface-container">
            <div>
              <div className="flex items-center gap-1.5 text-secondary font-label-code text-caption font-bold tracking-widest uppercase mb-1">
                <span className="material-symbols-outlined text-[18px]">publish</span>
                <span>BIÊN SOẠN &amp; ĐĂNG TẢI HỌC LIỆU SỐ</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
                {step === 'form' ? 'Tạo Hồ Sơ Đề Tài Học Thuật' : 'Tải Lên Tệp Đính Kèm (PDF / DOCX)'}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Khai báo thông tin đồ án, báo cáo KLTN hoặc tài liệu học tập theo quy chuẩn Khoa CNTT UTC.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-surface-container text-primary font-label-code text-caption font-bold px-3 py-1 rounded">
                BƯỚC {step === 'form' ? '1 / 2' : '2 / 2'}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form Step */}
          {step === 'form' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 cols): Input Fields */}
              <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-6 md:p-8 space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">edit_note</span>
                    <h3 className="font-headline-sm font-bold text-primary">Thông tin học thuật đề tài</h3>
                  </div>
                  <span className="font-label-code text-caption text-secondary font-bold bg-surface-container px-2.5 py-1 rounded">
                    UTF-8 • VIETNAMESE
                  </span>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="font-headline-sm text-body-sm text-on-surface font-semibold flex items-center justify-between" htmlFor="title">
                    <span>Tiêu đề đề tài / Báo cáo <span className="text-error">*</span></span>
                    <span className="font-caption text-caption text-on-surface-variant">Tối đa 250 ký tự</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Nghiên cứu Xây dựng Hệ thống Quản lý Học liệu Số..."
                    className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-body-md text-on-surface outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
                  />
                </div>

                {/* Subject & Term & Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-headline-sm text-body-sm text-on-surface font-semibold" htmlFor="docType">
                      Loại tài liệu <span className="text-error">*</span>
                    </label>
                    <CustomSelect
                      value={documentTypeCode}
                      onChange={(val) => setDocumentTypeCode(val as DocumentTypeCode)}
                      options={[
                        { value: 'THESIS', label: 'Đồ án tốt nghiệp (KLTN)' },
                        { value: 'PROJECT', label: 'Bài tập lớn (BTL)' },
                        { value: 'CAPSTONE', label: 'Đồ án chuyên ngành' },
                        { value: 'LECTURE', label: 'Giáo trình / Slide' },
                      ]}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-headline-sm text-body-sm text-on-surface font-semibold" htmlFor="subject">
                      Học phần / Môn học <span className="text-error">*</span>
                    </label>
                    <CustomSelect
                      value={subjectId ? String(subjectId) : ''}
                      onChange={(val) => setSubjectId(Number(val))}
                      options={[
                        { value: '', label: '-- Chọn môn học --' },
                        ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
                      ]}
                      placeholder="-- Chọn môn học --"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-headline-sm text-body-sm text-on-surface font-semibold" htmlFor="year">
                      Niên khóa <span className="text-error">*</span>
                    </label>
                    <CustomSelect
                      value={academicYearId ? String(academicYearId) : ''}
                      onChange={(val) => setAcademicYearId(Number(val))}
                      options={[
                        { value: '', label: '-- Niên khóa --' },
                        ...academicYears.map((ay) => ({ value: String(ay.id), label: ay.name })),
                      ]}
                      placeholder="-- Niên khóa --"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Advisor & Major */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-headline-sm text-body-sm text-on-surface font-semibold" htmlFor="advisor">
                      Giảng viên hướng dẫn (GVHD) <span className="text-error">*</span>
                    </label>
                    <input
                      id="advisor"
                      type="text"
                      required
                      value={advisorName}
                      onChange={(e) => setAdvisorName(e.target.value)}
                      placeholder="VD: PGS. TS. Đào Thị Lệ Thủy"
                      className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-body-md text-on-surface outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-headline-sm text-body-sm text-on-surface font-semibold" htmlFor="major">
                      Chuyên ngành đào tạo
                    </label>
                    <CustomSelect
                      value={majorId ? String(majorId) : ''}
                      onChange={(val) => setMajorId(Number(val))}
                      options={[
                        { value: '', label: '-- Chọn chuyên ngành --' },
                        ...majors.map((m) => ({ value: String(m.id), label: m.name })),
                      ]}
                      placeholder="-- Chọn chuyên ngành --"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Abstract */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-headline-sm text-body-sm text-on-surface font-semibold" htmlFor="abstract">
                      Tóm tắt đề tài (Abstract) <span className="text-error">*</span>
                    </label>
                    <span className="font-label-code text-caption text-secondary font-bold">Chuẩn ISO-214</span>
                  </div>
                  <textarea
                    id="abstract"
                    rows={5}
                    required
                    value={abstractText}
                    onChange={(e) => setAbstractText(e.target.value)}
                    placeholder="Mô tả mục tiêu, bài toán giải quyết, kiến trúc hệ thống và kết quả đạt được..."
                    className="w-full rounded-lg bg-surface-container-low p-4 text-body-md text-on-surface outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all leading-relaxed"
                  />
                </div>

                {/* Tech Badges Picker */}
                <div className="space-y-2">
                  <label className="font-headline-sm text-body-sm text-on-surface font-semibold">
                    Công nghệ ứng dụng (Tech stack tags)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((t) => {
                      const selected = selectedTechIds.includes(t.id)
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTech(t.id)}
                          className={`px-3 py-1.5 rounded-lg font-label-code text-caption font-bold transition-all cursor-pointer ${
                            selected
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          {selected ? '✓ ' : '+ '}
                          {t.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* GitHub Url */}
                <div className="space-y-1.5">
                  <label className="font-headline-sm text-body-sm text-on-surface font-semibold" htmlFor="github">
                    Liên kết mã nguồn GitHub Repository
                  </label>
                  <input
                    id="github"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/utc-fit/..."
                    className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-body-md text-on-surface outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all font-label-code text-body-sm"
                  />
                </div>
              </div>

              {/* Right Column (4 cols): Action & Checklist */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-6 space-y-4">
                  <h3 className="font-headline-sm font-bold text-primary">Tiến trình chuẩn hóa</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-caption font-semibold">
                      <span>HOÀN THIỆN HỒ SƠ</span>
                      <span className="text-secondary font-bold">BƯỚC 1/2</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: '50%' }}></div>
                    </div>
                  </div>

                  <ul className="text-caption text-on-surface-variant space-y-2 pt-2 border-t border-surface-container">
                    <li className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${title ? 'text-secondary' : 'text-outline'}`}>
                        {title ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Tiêu đề đề tài &amp; Học phần</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${advisorName ? 'text-secondary' : 'text-outline'}`}>
                        {advisorName ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Giảng viên hướng dẫn</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${abstractText ? 'text-secondary' : 'text-outline'}`}>
                        {abstractText ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Tóm tắt nội dung (Abstract)</span>
                    </li>
                  </ul>

                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="w-full py-3 bg-primary text-on-primary font-headline-sm text-body-sm font-bold rounded-lg shadow-sm hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <span>Lưu &amp; Sang bước tải tệp</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Files Upload Step */
            <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[24px]">cloud_upload</span>
                  <h3 className="font-headline-sm font-bold text-primary">Tải lên tệp tài liệu chính (PDF)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-body-sm text-on-surface-variant hover:text-primary font-semibold"
                >
                  &larr; Sửa lại thông tin
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-surface-container rounded-xl p-8 text-center bg-surface-container-low flex flex-col items-center justify-center space-y-3">
                <span className="material-symbols-outlined text-[48px] text-primary">picture_as_pdf</span>
                <div>
                  <h4 className="font-headline-sm font-bold text-primary">Chọn file PDF toàn văn đề tài</h4>
                  <p className="text-caption text-on-surface-variant mt-1">
                    Định dạng hỗ trợ: .PDF, .DOCX, .ZIP (Dung lượng tối đa 20MB)
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-bold text-body-sm cursor-pointer transition-colors shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  <span>{uploading ? `Đang tải lên... ${uploadProgress}%` : 'Chọn file từ máy tính'}</span>
                  <input
                    type="file"
                    disabled={uploading}
                    accept=".pdf,.docx,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-label-code text-caption uppercase text-on-surface-variant font-bold">
                    Tệp đính kèm đã nạp:
                  </h4>
                  {files.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-surface-container"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-[20px]">description</span>
                        <span className="font-body-sm font-semibold text-primary">{f.fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(f.id)}
                        className="p-1 text-on-surface-variant hover:text-error transition-colors"
                        title="Xóa tệp"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-surface-container">
                <Link
                  to="/me/documents"
                  className="px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Lưu nháp &amp; Về danh sách
                </Link>
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-secondary hover:bg-secondary/90 text-on-secondary rounded-lg font-bold text-body-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Nộp hồ sơ duyệt hội đồng</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
