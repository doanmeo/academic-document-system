import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import {
  getDocument,
  updateDocument,
  submitDocument,
} from '../api/documentApi'
import { uploadFile, deleteFile } from '../api/fileApi'
import {
  getSubjects,
  getAcademicYears,
  getMajors,
  getTechnologies,
} from '../api/catalogApi'
import { getDocumentReviews } from '../api/adminApi'
import type { UploadedFile, DocumentTypeCode } from '../types/document'
import type { Subject, AcademicYear, Major, Technology } from '../types/catalog'
import type { ReviewHistory } from '../types/admin'
import { getErrorMessage } from '../utils/errorMessages'
import { useAuth } from '../contexts/AuthContext'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import CustomSelect from '../components/ui/CustomSelect'

export default function EditDocument() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ title: string; subtitle?: string } | null>(null)
  
  const [status, setStatus] = useState<string>('')
  const [rejectionNote, setRejectionNote] = useState<string | null>(null)
  
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [reviews, setReviews] = useState<ReviewHistory[]>([])
  
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [academicYearId, setAcademicYearId] = useState<number | ''>('')
  const [advisorName, setAdvisorName] = useState('')
  const [abstractText, setAbstractText] = useState('')
  const [documentTypeCode, setDocumentTypeCode] = useState<DocumentTypeCode | ''>('')
  const [majorId, setMajorId] = useState<number | ''>('')
  const [selectedTechIds, setSelectedTechIds] = useState<number[]>([])
  const [githubUrl, setGithubUrl] = useState('')
  const [gitlabUrl, setGitlabUrl] = useState('')
  const [description, setDescription] = useState('')
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null)

  // Checklist state for the compliance sidebar
  const [checklist, setChecklist] = useState({
    c1: true,
    c2: true,
    c3: true,
    c4: false,
  })

  const checklistCount = Object.values(checklist).filter(Boolean).length

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [toast])
  
  useEffect(() => {
    if (!id) return
    Promise.all([
      getSubjects(),
      getMajors(),
      getAcademicYears(),
      getTechnologies(),
      getDocument(Number(id)),
      getDocumentReviews(Number(id)).catch(() => [] as ReviewHistory[]),
    ]).then(([subs, majs, ays, techs, doc, revs]) => {
      setSubjects(subs)
      setMajors(majs)
      setAcademicYears(ays)
      setTechnologies(techs)
      setReviews(revs || [])
      
      setTitle(doc.title || '')
      setSubjectId(doc.subjectId || '')
      setAcademicYearId(doc.academicYearId || '')
      setAdvisorName(doc.advisorName || '')
      setAbstractText(doc.abstractText || '')
      setDocumentTypeCode(doc.documentTypeCode || '')
      setMajorId(doc.majorId || '')
      setSelectedTechIds(doc.technologies?.map(t => t.id) || [])
      setGithubUrl(doc.githubUrl || '')
      setGitlabUrl(doc.gitlabUrl || '')
      setDescription(doc.description || '')
      
      setFiles(doc.files || [])
      setStatus(doc.status || '')
      setRejectionNote(doc.rejectionNote || null)
      
      setLoading(false)
    }).catch(err => {
      setError(getErrorMessage(err))
      setLoading(false)
    })
  }, [id])
  
  const handleSaveDraft = async () => {
    if (!id) return
    if (!title || !subjectId || !academicYearId || !abstractText || !documentTypeCode || !majorId) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.')
      return
    }
    setError('')
    setSaving(true)
    try {
      await updateDocument(Number(id), {
        title,
        subjectId: Number(subjectId),
        academicYearId: Number(academicYearId),
        abstractText,
        documentTypeCode: documentTypeCode as DocumentTypeCode,
        majorId: Number(majorId),
        advisorName: advisorName || undefined,
        githubUrl: githubUrl || undefined,
        gitlabUrl: gitlabUrl || undefined,
        description: description || undefined,
        technologyIds: selectedTechIds,
      })
      setToast({
        title: 'Đã lưu bản nháp chỉnh sửa!',
        subtitle: 'Dữ liệu được lưu trữ an toàn trong phiên làm việc.',
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!id) return
    if (files.length === 0 && !selectedUploadFile) {
      setError('Vui lòng đính kèm ít nhất một tệp tài liệu.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      // If user selected a new file in dropzone, upload it first
      if (selectedUploadFile) {
        setUploading(true)
        const uploaded = await uploadFile(selectedUploadFile, Number(id), true, (progress) => {
          setUploadProgress(progress)
        })
        setFiles(prev => [...prev, uploaded])
        setSelectedUploadFile(null)
        setUploading(false)
      }

      // Save document updates
      await updateDocument(Number(id), {
        title,
        subjectId: Number(subjectId),
        academicYearId: Number(academicYearId),
        abstractText,
        documentTypeCode: documentTypeCode as DocumentTypeCode,
        majorId: Number(majorId),
        advisorName: advisorName || undefined,
        githubUrl: githubUrl || undefined,
        gitlabUrl: gitlabUrl || undefined,
        description: description || undefined,
        technologyIds: selectedTechIds,
      })

      // Submit for review
      await submitDocument(Number(id))
      setToast({
        title: 'Đã gửi thẩm định lại thành công!',
        subtitle: 'Hồ sơ đã chuyển sang hàng đợi của GVHD và Hội đồng.',
      })
      setTimeout(() => {
        navigate('/me/documents')
      }, 1500)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleFileDrop = (file: File) => {
    setSelectedUploadFile(file)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !id) return
    const file = e.target.files[0]
    handleFileDrop(file)
  }

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tệp này?')) return
    try {
      await deleteFile(fileId)
      setFiles(prev => prev.filter(f => f.id !== fileId))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }
  
  const toggleTech = (techId: number) => {
    setSelectedTechIds(prev => 
      prev.includes(techId) ? prev.filter(tid => tid !== techId) : [...prev, techId]
    )
  }

  const isRejectedOrRevision = status === 'REJECTED' || status === 'REVISION_REQUIRED' || Boolean(rejectionNote)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-gutter-desktop pt-24 pb-16 flex flex-col justify-center items-center">
          <Spinner />
          <p className="mt-3 font-body-sm text-on-surface-variant">Đang tải hồ sơ đề tài...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface font-body-md text-on-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow bg-surface">
        <div className="max-w-7xl mx-auto px-4 lg:px-gutter-desktop py-space-lg">
          <div className="flex flex-col w-full">

            {/* BREADCRUMB & CONTEXT META */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
              <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <Link to="/me/documents" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Tài liệu của tôi
                </Link>
                <span>/</span>
                <span className="font-label-code text-caption px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-bold">
                  DOC-{id}
                </span>
                <span>/</span>
                <span className="text-on-surface font-medium">Chỉnh sửa hồ sơ</span>
              </div>

              <div className="flex items-center gap-space-sm">
                {isRejectedOrRevision ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-badge text-label-badge font-bold">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                    TRẠNG THÁI: YÊU CẦU CHỈNH SỬA
                  </span>
                ) : (
                  <Badge status={status} />
                )}
                <span className="font-label-code text-caption text-on-surface-variant hidden sm:inline-block">
                  Phiên bản hiệu chỉnh
                </span>
              </div>
            </div>

            {/* CRITICAL REJECTION BANNER (TONAL ELEGANT AMBER-ROSE NOTICE) */}
            {isRejectedOrRevision && (
              <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-error-container/80 via-error-container/40 to-surface-container-high p-space-lg shadow-xs mb-space-lg">
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-error/5 pointer-events-none blur-xl"></div>
                <div className="relative flex flex-col md:flex-row items-start gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-error text-on-error flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[28px]">assignment_late</span>
                  </div>
                  <div className="flex-grow space-y-space-xs">
                    <div className="flex flex-wrap items-center justify-between gap-space-xs">
                      <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                        <span>Yêu cầu điều chỉnh từ Ban Quản trị / Giảng viên hướng dẫn</span>
                      </h2>
                      <span className="font-label-badge text-caption font-bold text-on-surface-variant bg-surface-container-lowest/90 px-2.5 py-1 rounded-lg">
                        Người duyệt: {reviews[0]?.reviewerName || advisorName || 'Hội đồng Khoa CNTT'}
                      </span>
                    </div>

                    <p className="font-body-md text-body-md text-on-surface leading-relaxed pt-1">
                      "{rejectionNote || 'Vui lòng bổ sung đầy đủ link kho mã nguồn công khai (GitHub repo) và tài liệu hoàn chỉnh trước khi gửi duyệt lại.'}"
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-space-sm font-caption text-caption text-on-surface-variant">
                      <span className="flex items-center gap-1 font-semibold text-error">
                        <span className="material-symbols-outlined text-[15px]">timer</span>
                        Yêu cầu hoàn thiện ưu tiên
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">mail</span>
                        Hỗ trợ giải đáp: <a className="text-primary hover:underline font-label-code font-bold" href="mailto:fit@utc.edu.vn">fit@utc.edu.vn</a>
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-body-sm">
                <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* MAIN WORKSPACE 2-COLUMN GRID */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              
              {/* LEFT COLUMN: PRIMARY METADATA EDITORS (8 COLS) */}
              <div className="lg:col-span-8 flex flex-col gap-space-lg">
                
                {/* SECTION 1: CORE ACADEMIC CONTEXT */}
                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xs border border-surface-container space-y-space-md">
                  <div className="flex items-center justify-between pb-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-primary">Thông tin học thuật đề tài</h3>
                        <p className="font-caption text-caption text-on-surface-variant">Hiệu chỉnh các mục bắt buộc đã được đồng bộ với biểu mẫu K64</p>
                      </div>
                    </div>
                    <span className="font-label-code text-caption text-secondary font-bold bg-surface-container px-2.5 py-1 rounded">UTF-8 • VIETNAMESE</span>
                  </div>

                  {/* Document Title */}
                  <div className="space-y-1.5">
                    <label className="font-headline-sm text-body-sm text-on-surface flex items-center justify-between" htmlFor="docTitle">
                      <span>Tiêu đề đề tài / Báo cáo <span className="text-error">*</span></span>
                      <span className="font-caption text-caption text-on-surface-variant">{title.length}/350 ký tự</span>
                    </label>
                    <div className="relative">
                      <input
                        id="docTitle"
                        type="text"
                        required
                        maxLength={350}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary transition-all"
                        placeholder="Nhập tiêu đề đề tài..."
                      />
                      <span className="absolute right-3 top-3.5 material-symbols-outlined text-secondary text-[20px]">verified</span>
                    </div>
                  </div>

                  {/* Subject & Academic Year Pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <div className="space-y-1.5">
                      <label className="font-headline-sm text-body-sm text-on-surface" htmlFor="subjectSelect">
                        Môn học / Học phần <span className="text-error">*</span>
                      </label>
                      <CustomSelect
                        value={subjectId ? String(subjectId) : ''}
                        onChange={(val) => setSubjectId(Number(val))}
                        options={[
                          { value: '', label: 'Chọn môn học' },
                          ...subjects.map((s) => ({ value: String(s.id), label: `${s.name} (${s.code})` })),
                        ]}
                        placeholder="Chọn môn học"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-headline-sm text-body-sm text-on-surface" htmlFor="academicYear">
                        Khóa &amp; Niên khóa <span className="text-error">*</span>
                      </label>
                      <CustomSelect
                        value={academicYearId ? String(academicYearId) : ''}
                        onChange={(val) => setAcademicYearId(Number(val))}
                        options={[
                          { value: '', label: 'Chọn năm học' },
                          ...academicYears.map((ay) => ({ value: String(ay.id), label: ay.name })),
                        ]}
                        placeholder="Chọn năm học"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Document Type & Major */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <div className="space-y-1.5">
                      <label className="font-headline-sm text-body-sm text-on-surface" htmlFor="docType">
                        Loại tài liệu / Đề tài <span className="text-error">*</span>
                      </label>
                      <CustomSelect
                        value={documentTypeCode}
                        onChange={(val) => setDocumentTypeCode(val as DocumentTypeCode)}
                        options={[
                          { value: '', label: 'Chọn loại' },
                          { value: 'THESIS', label: 'Khóa luận Tốt nghiệp (KLTN)' },
                          { value: 'CAPSTONE', label: 'Đồ án Chuyên ngành' },
                          { value: 'PROJECT', label: 'Bài tập lớn (BTL)' },
                          { value: 'LECTURE', label: 'Giáo trình & Slide' },
                        ]}
                        placeholder="Chọn loại"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-headline-sm text-body-sm text-on-surface" htmlFor="major">
                        Chuyên ngành đào tạo <span className="text-error">*</span>
                      </label>
                      <CustomSelect
                        value={majorId ? String(majorId) : ''}
                        onChange={(val) => setMajorId(Number(val))}
                        options={[
                          { value: '', label: 'Chọn chuyên ngành' },
                          ...majors.map((m) => ({ value: String(m.id), label: m.name })),
                        ]}
                        placeholder="Chọn chuyên ngành"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Instructor Assigned */}
                  <div className="space-y-1.5">
                    <label className="font-headline-sm text-body-sm text-on-surface" htmlFor="advisor">
                      Giảng viên hướng dẫn (GVHD) <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="advisor"
                        type="text"
                        required
                        value={advisorName}
                        onChange={(e) => setAdvisorName(e.target.value)}
                        className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary transition-all"
                        placeholder="Ví dụ: ThS. Hoàng Tuấn Minh (Bộ môn Hệ thống thông tin)"
                      />
                      <span className="absolute right-3 top-3.5 material-symbols-outlined text-on-surface-variant text-[20px]">school</span>
                    </div>
                  </div>

                  {/* Abstract / Overview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-headline-sm text-body-sm text-on-surface" htmlFor="abstract">
                        Tóm tắt đề tài (Abstract) <span className="text-error">*</span>
                      </label>
                      <span className="font-label-code text-caption text-secondary font-semibold">Đạt chuẩn ISO-214</span>
                    </div>
                    <textarea
                      id="abstract"
                      required
                      rows={5}
                      value={abstractText}
                      onChange={(e) => setAbstractText(e.target.value)}
                      className="w-full rounded-lg bg-surface-container-low p-4 text-body-md font-body-md text-on-surface leading-relaxed focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary transition-all"
                      placeholder="Mô tả bối cảnh, mục tiêu nghiên cứu, phương pháp giải quyết và kết quả đạt được..."
                    />
                  </div>

                  {/* Technology Stack Tags */}
                  <div className="space-y-2">
                    <label className="font-headline-sm text-body-sm text-on-surface flex items-center justify-between">
                      <span>Danh mục công nghệ &amp; Thẻ định danh (Tags)</span>
                      <span className="font-caption text-caption text-on-surface-variant">Bấm để chọn hoặc bỏ chọn thẻ</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 p-space-sm rounded-lg bg-surface-container-low border border-surface-container">
                      {technologies.map(tech => {
                        const isSelected = selectedTechIds.includes(tech.id)
                        return (
                          <button
                            key={tech.id}
                            type="button"
                            onClick={() => toggleTech(tech.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-2xs font-label-code text-caption font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {isSelected ? 'check' : 'terminal'}
                            </span>
                            <span>{tech.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: CRITICAL FILE & CODE MODIFICATIONS */}
                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xs border border-surface-container space-y-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">attachment</span>
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-primary">Tệp đính kèm &amp; Kho mã nguồn</h3>
                        <p className="font-caption text-caption text-on-surface-variant">Cập nhật tài liệu mới thay thế và liên kết xác thực</p>
                      </div>
                    </div>
                    <span className="font-label-badge text-caption font-bold text-error bg-error-container/60 px-2.5 py-1 rounded">MỤC BẮT BUỘC</span>
                  </div>

                  {/* CURRENT FILES LIST */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-headline-sm text-body-sm text-on-surface">Tệp tài liệu hiện tại:</p>
                      {files.map(f => (
                        <div key={f.id} className="p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border border-surface-container">
                          <div className="flex items-start gap-space-sm">
                            <div className="w-12 h-14 rounded-lg bg-primary text-on-primary flex flex-col items-center justify-center shrink-0 shadow-2xs">
                              <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                              <span className="font-label-code text-[9px] font-bold tracking-widest mt-0.5">PDF</span>
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-headline-sm text-body-md text-on-surface truncate max-w-xs">{f.fileName}</span>
                                {f.isPrimary && (
                                  <span className="px-2 py-0.5 rounded text-caption font-label-badge font-bold bg-secondary/15 text-secondary">
                                    Tệp chính
                                  </span>
                                )}
                              </div>
                              <p className="font-label-code text-caption text-on-surface-variant">
                                Kích thước: {(f.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-space-xs self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteFile(f.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-error hover:text-white text-error font-headline-sm text-caption transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* NEW FILE DROPZONE */}
                  <div className="space-y-2">
                    <label className="font-headline-sm text-body-sm text-on-surface flex items-center justify-between">
                      <span>Tải lên tệp thay thế mới <span className="text-error">*</span></span>
                      <span className="font-caption text-caption text-secondary font-semibold">Chấp nhận .PDF, .DOCX, .ZIP (Tối đa 50MB)</span>
                    </label>
                    
                    <div className="relative group cursor-pointer rounded-xl bg-surface-container-low hover:bg-surface-container p-space-lg text-center transition-all border border-dashed border-outline-variant">
                      <input
                        id="fileUploader"
                        type="file"
                        accept=".pdf,.docx,.pptx,.zip"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      
                      {!selectedUploadFile ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[26px]">upload</span>
                          </div>
                          <p className="font-headline-sm text-body-md text-primary">
                            Kéo thả tệp PDF đã chỉnh sửa vào đây, hoặc <span className="text-secondary underline">chọn từ thiết bị</span>
                          </p>
                          <p className="font-body-sm text-caption text-on-surface-variant">
                            Đảm bảo đã nhúng font chữ vector và sơ đồ hệ thống đạt độ phân giải cao
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-row items-center justify-between text-left p-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
                              <span className="material-symbols-outlined text-[22px]">check</span>
                            </div>
                            <div>
                              <p className="font-headline-sm text-body-md text-primary">{selectedUploadFile.name}</p>
                              <p className="font-label-code text-caption text-secondary">
                                {(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB • Sẵn sàng cập nhật khi nộp
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedUploadFile(null)
                            }}
                            className="relative z-20 px-3 py-1.5 rounded-lg text-caption font-headline-sm text-error hover:bg-error-container transition-colors cursor-pointer"
                          >
                            Hủy chọn
                          </button>
                        </div>
                      )}

                      {uploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GITHUB & GITLAB REPO INPUTS */}
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-headline-sm text-body-sm text-on-surface flex items-center gap-1.5" htmlFor="githubUrl">
                          <span>Đường dẫn Kho mã nguồn (GitHub Repo công khai)</span>
                        </label>
                        <span className="font-label-badge text-caption text-primary font-bold">KHUYẾN NGHỊ</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 material-symbols-outlined text-on-surface-variant text-[20px]">code</span>
                        <input
                          id="githubUrl"
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/vudoan-utc/..."
                          className="w-full rounded-lg bg-surface-container-low pl-11 pr-4 py-3 text-body-md font-label-code text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary transition-all"
                        />
                      </div>
                      <p className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-secondary">info</span>
                        Kho lưu trữ nên có file README.md, mã nguồn hoàn chỉnh và hướng dẫn cài đặt.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-headline-sm text-body-sm text-on-surface" htmlFor="gitlabUrl">
                        Đường dẫn GitLab hoặc máy chủ nội bộ (tùy chọn)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 material-symbols-outlined text-on-surface-variant text-[20px]">link</span>
                        <input
                          id="gitlabUrl"
                          type="url"
                          value={gitlabUrl}
                          onChange={(e) => setGitlabUrl(e.target.value)}
                          placeholder="https://gitlab.com/..."
                          className="w-full rounded-lg bg-surface-container-low pl-11 pr-4 py-3 text-body-md font-label-code text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* EXPLANATION NOTE TO REVIEWER */}
                  <div className="space-y-1.5 pt-2">
                    <label className="font-headline-sm text-body-sm text-on-surface flex items-center justify-between" htmlFor="rebuttalNotes">
                      <span>Giải trình các điểm đã điều chỉnh với Giảng viên / Hội đồng</span>
                      <span className="font-caption text-caption text-secondary">Lời nhắn thẩm định</span>
                    </label>
                    <textarea
                      id="rebuttalNotes"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả cụ thể: Em đã bổ sung sơ đồ ERD dạng vector tại Chương 3 và cập nhật repository GitHub đính kèm..."
                      className="w-full rounded-lg bg-surface-container-low p-4 text-body-md font-body-md text-on-surface leading-relaxed focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: SIDEBAR INSPECTOR / COMPLIANCE CHECKLIST (4 COLS) */}
              <div className="lg:col-span-4 flex flex-col gap-space-lg">
                
                {/* PREVIEW & SUBMISSION SUMMARY (CHECKLIST) */}
                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xs border border-surface-container space-y-space-md">
                  <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-secondary">fact_check</span>
                    Kiểm tra trước khi nộp
                  </h3>

                  <div className="space-y-2.5">
                    <label className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                      <input
                        type="checkbox"
                        checked={checklist.c1}
                        onChange={(e) => setChecklist(prev => ({ ...prev, c1: e.target.checked }))}
                        className="mt-1 w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface leading-tight">
                        Đã nhúng sơ đồ ERD vector chuẩn tại Chương 3
                      </span>
                    </label>

                    <label className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                      <input
                        type="checkbox"
                        checked={checklist.c2}
                        onChange={(e) => setChecklist(prev => ({ ...prev, c2: e.target.checked }))}
                        className="mt-1 w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface leading-tight">
                        Repository GitHub ở chế độ Công khai (Public)
                      </span>
                    </label>

                    <label className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                      <input
                        type="checkbox"
                        checked={checklist.c3}
                        onChange={(e) => setChecklist(prev => ({ ...prev, c3: e.target.checked }))}
                        className="mt-1 w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface leading-tight">
                        Đã kiểm tra đạo văn theo quy chế UTC (&lt; 20%)
                      </span>
                    </label>

                    <label className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                      <input
                        type="checkbox"
                        checked={checklist.c4}
                        onChange={(e) => setChecklist(prev => ({ ...prev, c4: e.target.checked }))}
                        className="mt-1 w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface leading-tight">
                        Giữ nguyên cấu trúc bìa chuẩn Khoa CNTT
                      </span>
                    </label>
                  </div>

                  <div className="p-space-sm rounded-lg bg-surface-container-high/60 flex items-center justify-between text-on-surface-variant font-caption text-caption">
                    <span>Tiến độ hoàn thiện hồ sơ:</span>
                    <span className="font-label-code font-bold text-secondary text-body-sm">
                      {checklistCount}/4 Tiêu chí
                    </span>
                  </div>
                </div>

                {/* INSTRUCTOR PROFILE MINI-CARD */}
                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xs border border-surface-container space-y-space-sm">
                  <span className="font-label-badge text-caption text-on-surface-variant font-bold uppercase tracking-wider">
                    Hội đồng thẩm định
                  </span>
                  
                  <div className="flex items-center gap-space-sm pt-1">
                    <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold">
                      {advisorName ? advisorName.split(' ').pop()?.charAt(0) : 'GV'}
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-body-md text-on-surface leading-tight font-bold">
                        {advisorName || 'Giảng viên hướng dẫn'}
                      </h4>
                      <p className="font-caption text-caption text-secondary font-semibold">Giảng viên hướng dẫn trực tiếp</p>
                      <p className="font-label-code text-[11px] text-on-surface-variant">Khoa CNTT • ĐH Giao thông Vận tải</p>
                    </div>
                  </div>

                  <div className="p-space-sm rounded-lg bg-surface-container-low text-body-sm font-body-sm text-on-surface-variant leading-relaxed border border-surface-container">
                    <div className="flex items-center gap-1.5 text-primary font-semibold mb-1">
                      <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                      Thông báo tự động:
                    </div>
                    Hệ thống sẽ gửi email kèm thông báo đến GVHD và Hội đồng thẩm định ngay sau khi sinh viên ấn nút gửi duyệt.
                  </div>
                </div>

                {/* AUDIT LOG HISTORY */}
                {reviews.length > 0 && (
                  <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xs border border-surface-container space-y-space-sm">
                    <h4 className="font-headline-sm text-body-md text-primary flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-[18px]">history</span>
                      Lịch sử thẩm định
                    </h4>
                    
                    <div className="relative pl-6 space-y-4 pt-2">
                      <div className="absolute left-2.5 top-3 bottom-2 w-0.5 bg-surface-container-high"></div>
                      {reviews.map((rev) => (
                        <div key={rev.id} className="relative">
                          <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-surface-container-lowest ${rev.action === 'APPROVE' ? 'bg-emerald-500' : rev.action === 'REJECT' ? 'bg-error' : 'bg-amber-500'}`}></div>
                          <p className="font-label-code text-caption text-on-surface-variant font-bold">
                            {new Date(rev.createdAt).toLocaleString('vi-VN')}
                          </p>
                          <p className="font-body-sm text-body-sm font-semibold text-on-surface">
                            {rev.reviewerName} • {rev.action}
                          </p>
                          {rev.note && (
                            <p className="font-caption text-caption text-on-surface-variant italic">
                              "{rev.note}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* STICKY ACTION TRAY AT BOTTOM OF EDIT PAGE */}
              <div className="lg:col-span-12 mt-space-md">
                <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-md border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn hủy bỏ các thay đổi vừa nhập?')) {
                          navigate('/me/documents')
                        }
                      }}
                      className="w-full sm:w-auto px-space-md py-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-headline-sm text-body-sm transition-all cursor-pointer"
                    >
                      Hủy bỏ thay đổi
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveDraft}
                      className="w-full sm:w-auto px-space-md py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-headline-sm text-body-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span>{saving ? 'Đang lưu...' : 'Lưu bản nháp'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-space-sm w-full sm:w-auto">
                    <div className="hidden md:flex flex-col text-right">
                      <span className="font-headline-sm text-caption text-primary font-bold">Sẵn sàng thẩm định</span>
                      <span className="font-caption text-[11px] text-on-surface-variant">Thời gian xem xét dự kiến: 24h</span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-space-xl py-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-headline-sm text-body-md transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">send</span>
                      <span>{submitting ? 'Đang nộp...' : 'Gửi thẩm định lại (Submit for Re-review)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* SUCCESS TOAST OVERLAY */}
            {toast && (
              <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
                <div className="flex items-center gap-3 bg-primary text-on-primary px-5 py-3.5 rounded-xl shadow-xl">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary">
                    <span className="material-symbols-outlined text-[20px]">task_alt</span>
                  </div>
                  <div>
                    <p className="font-headline-sm text-body-sm font-bold">{toast.title}</p>
                    {toast.subtitle && (
                      <p className="font-caption text-caption text-on-primary-container">{toast.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
