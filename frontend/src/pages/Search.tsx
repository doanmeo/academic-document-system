import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search as SearchIcon,
  BookOpen,
  ShieldCheck,
  Layers,
  FileCheck2,
  FileText,
  Flame,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  SearchX
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import type { DocumentSummary, Subject, AcademicYear, Technology, Major } from '../types'
import { documentApi } from '../api/documentApi'
import { catalogApi } from '../api/catalogApi'
import { fileApi } from '../api/fileApi'
import BookCard from '../components/BookCard'
import BookDetailDrawer from '../components/BookDetailDrawer'
import PdfViewerModal from '../components/PdfViewerModal'
import ReportModal from '../components/ReportModal'
import CustomSelect from '../components/ui/CustomSelect'
import Pagination from '../components/ui/Pagination'
import CourseHubView from '../components/CourseHubView'
import TopicNoveltyChecker from '../components/TopicNoveltyChecker'
import CoverageHeatmap from '../components/CoverageHeatmap'

const HOT_SUBJECTS = [
  'Kỹ thuật phần mềm',
  'Mã nguồn mở',
  'Trí tuệ nhân tạo (AI)',
  'Lập trình Hướng đối tượng',
  'Kiểm thử PM',
  'An ninh mạng',
  'Unix / Linux',
]

export default function Search() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  const initialTab = (searchParams.get('tab') as 'search' | 'hub' | 'novelty' | 'heatmap') || 'search'

  const [activeTab, setActiveTab] = useState<'search' | 'hub' | 'novelty' | 'heatmap'>(initialTab)
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [selectedDoc, setSelectedDoc] = useState<DocumentSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [totalElements, setTotalElements] = useState<number>(0)

  // Catalogs
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [advisors, setAdvisors] = useState<string[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])

  // Search Filters (môn · ngành · năm · loại · GVHD · năm sinh viên)
  const [keyword, setKeyword] = useState(initialQ)
  const [selectedSubject, setSelectedSubject] = useState<string>(searchParams.get('subjectId') || '')
  const [selectedMajor, setSelectedMajor] = useState<string>('')
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || '')
  const [selectedTargetYear, setSelectedTargetYear] = useState<string>('')
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'downloads'>('newest')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Hotkey Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Modals
  const [viewerModal, setViewerModal] = useState<{ isOpen: boolean; doc: DocumentSummary | null }>({
    isOpen: false,
    doc: null,
  })
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; doc: DocumentSummary | null }>({
    isOpen: false,
    doc: null,
  })

  // Sync keyword & tab when searchParams changes
  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null && q !== keyword) {
      setKeyword(q)
    }
    const t = searchParams.get('tab') as 'search' | 'hub' | 'novelty' | 'heatmap'
    if (t && ['search', 'hub', 'novelty', 'heatmap'].includes(t)) {
      setActiveTab(t)
    }
    const subId = searchParams.get('subjectId')
    if (subId) setSelectedSubject(subId)
    const typeCode = searchParams.get('type')
    if (typeCode) setSelectedType(typeCode)
  }, [searchParams])

  // Load catalogs on mount
  useEffect(() => {
    catalogApi.getSubjects().then((res: any) => setSubjects(Array.isArray(res) ? res : res?.data || [])).catch(() => {})
    catalogApi.getMajors().then((res: any) => setMajors(Array.isArray(res) ? res : res?.data || [])).catch(() => {})
    catalogApi.getAcademicYears().then((res: any) => setAcademicYears(Array.isArray(res) ? res : res?.data || [])).catch(() => {})
    catalogApi.getAdvisors().then((res: any) => setAdvisors(Array.isArray(res) ? res : res?.data || [])).catch(() => {})
    catalogApi.getTechnologies().then((res: any) => setTechnologies(Array.isArray(res) ? res : res?.data || [])).catch(() => {})
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [keyword, selectedSubject, selectedMajor, selectedAdvisor, selectedYear, selectedType, selectedTargetYear, sortBy])

  // Search documents
  useEffect(() => {
    setLoading(true)
    documentApi
      .search({
        keyword: keyword || undefined,
        subjectId: selectedSubject ? Number(selectedSubject) : undefined,
        majorId: selectedMajor ? Number(selectedMajor) : undefined,
        advisorName: selectedAdvisor || undefined,
        academicYearId: selectedYear ? Number(selectedYear) : undefined,
        documentTypeCode: selectedType || undefined,
        targetYear: selectedTargetYear || undefined,
        sortBy: sortBy,
        page: page,
        size: 16,
      })
      .then((res: any) => {
        const list = res?.content || (Array.isArray(res) ? res : [])
        setDocuments(list)
        setTotalPages(res?.totalPages ?? (list.length > 0 ? 1 : 0))
        setTotalElements(res?.totalElements ?? list.length)
      })
      .catch(() => {
        setDocuments([])
        setTotalPages(0)
        setTotalElements(0)
      })
      .finally(() => setLoading(false))
  }, [keyword, selectedSubject, selectedMajor, selectedAdvisor, selectedYear, selectedType, selectedTargetYear, sortBy, page])

  const handleResetFilters = () => {
    setKeyword('')
    setSelectedSubject('')
    setSelectedMajor('')
    setSelectedAdvisor('')
    setSelectedYear('')
    setSelectedType('')
    setSelectedTargetYear('')
    setSortBy('newest')
    setPage(0)
    setSearchParams({})
  }

  const handleDownload = async (doc: DocumentSummary) => {
    try {
      const detailRes: any = await documentApi.getById(doc.id)
      const primaryFile =
        detailRes?.files?.find((f: any) => f.isPrimary) ||
        detailRes?.files?.[0] ||
        detailRes?.data?.files?.find((f: any) => f.isPrimary) ||
        detailRes?.data?.files?.[0]
      if (primaryFile) {
        const downloadRes = await fileApi.getDownloadUrl(primaryFile.id)
        if (downloadRes.success && downloadRes.data?.url) {
          window.open(downloadRes.data.url, '_blank')
          return
        }
      }
      toast.error('Tài liệu chưa có tệp đính kèm')
    } catch {
      toast.error('Lỗi khi tải tệp. Vui lòng thử lại.')
    }
  }

  const handleTabChange = (tab: 'search' | 'hub' | 'novelty' | 'heatmap') => {
    setActiveTab(tab)
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      p.set('tab', tab)
      return p
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-150">
      <Navbar />

      <main className="w-full pt-16 pb-16 flex-grow flex flex-col min-h-[calc(100vh-65px)]">
        {/* TOP ACADEMIC MODE NAVIGATION TABS */}
        <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-2.5 sticky top-16 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                onClick={() => handleTabChange('search')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'search'
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SearchIcon className="w-3.5 h-3.5" />
                <span>Tra cứu Học liệu</span>
              </button>
              <button
                onClick={() => handleTabChange('hub')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'hub'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Sổ tay Học phần</span>
              </button>
              <button
                onClick={() => handleTabChange('novelty')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'novelty'
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Đối soát Đề tài</span>
              </button>
              <button
                onClick={() => handleTabChange('heatmap')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'heatmap'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Bản đồ Phủ Môn</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>HỆ THỐNG HỌC LIỆU KHOA CNTT · ĐH GIAO THÔNG VẬN TẢI</span>
            </div>
          </div>
        </div>

        {/* TAB 1: COURSE HUB VIEW */}
        {activeTab === 'hub' && (
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <CourseHubView
              onSelectDoc={(doc) => setSelectedDoc(doc)}
              onViewPdf={(doc) => setViewerModal({ isOpen: true, doc })}
              initialSubjectId={selectedSubject ? Number(selectedSubject) : undefined}
            />
          </div>
        )}

        {/* TAB 2: TOPIC NOVELTY CHECKER */}
        {activeTab === 'novelty' && (
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <TopicNoveltyChecker />
          </div>
        )}

        {/* TAB 3: COVERAGE HEATMAP (F1) */}
        {activeTab === 'heatmap' && (
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <CoverageHeatmap />
          </div>
        )}

        {/* TAB 3: TRADITIONAL 6-DIMENSION SEARCH */}
        {activeTab === 'search' && (
          <div className="flex-1 flex overflow-hidden">
            <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              {/* ACADEMIC QUICK SHORTCUTS BANNER */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Link
                  to="/exams"
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/80 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Kho Đề Thi & Đáp Án</h4>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase">Hot</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Đề thi cũ kèm đáp án & lời bình giảng viên</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-all" />
                </Link>

                <Link
                  to="/templates"
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-200/80 dark:border-blue-800/40 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Biểu Mẫu Chuẩn UTC</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Template Word, LaTeX BTL & KLTN chuẩn Khoa</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleTabChange('hub')}
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-xs flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sổ Tay Học Phần</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Gộp trọn gói Slide, Lab, Đồ án theo từng môn</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all" />
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs mb-6">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                  {/* Search Keyword */}
                  <div className="relative flex-1 w-full">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <SearchIcon className="w-4 h-4" />
                    </span>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Tìm kiếm tài liệu theo từ khóa, đề tài, tên giảng viên... (Ctrl + K)"
                      className="w-full pl-10 pr-20 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none select-none">
                      <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                        Ctrl
                      </kbd>
                      <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                        K
                      </kbd>
                    </div>
                  </div>

                  {/* Quick reset */}
                  <button
                    onClick={handleResetFilters}
                    className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại bộ lọc</span>
                  </button>
                </div>

                {/* Quick Pills for Hot Subjects */}
                <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Môn học hot:</span>
                  </span>
                  {HOT_SUBJECTS.map((name) => {
                    const isSelected = keyword === name
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setKeyword(isSelected ? '' : name)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {name}
                      </button>
                    )
                  })}
                </div>

          {/* Filter Selectors Row (6 academic dimensions) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-100">
            {/* 1. Subject */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Môn học
              </label>
              <CustomSelect
                value={selectedSubject}
                onChange={(val) => setSelectedSubject(val)}
                options={[
                  { value: '', label: 'Tất cả môn học' },
                  ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
                ]}
                placeholder="Tất cả môn học"
                className="w-full"
              />
            </div>

            {/* 2. Major */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Chuyên ngành
              </label>
              <CustomSelect
                value={selectedMajor}
                onChange={(val) => setSelectedMajor(val)}
                options={[
                  { value: '', label: 'Tất cả chuyên ngành' },
                  ...majors.map((m) => ({ value: String(m.id), label: `${m.name} (${m.code})` })),
                ]}
                placeholder="Tất cả ngành"
                className="w-full"
              />
            </div>

            {/* 3. Advisor */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                GVHD
              </label>
              <CustomSelect
                value={selectedAdvisor}
                onChange={(val) => setSelectedAdvisor(val)}
                options={[
                  { value: '', label: 'Tất cả GVHD' },
                  ...advisors.map((adv) => ({ value: adv, label: adv })),
                ]}
                placeholder="Tất cả GVHD"
                className="w-full"
              />
            </div>

            {/* 4. Document Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Loại tài liệu
              </label>
              <CustomSelect
                value={selectedType}
                onChange={(val) => setSelectedType(val)}
                options={[
                  { value: '', label: 'Tất cả phân loại' },
                  { value: 'SLIDE', label: 'Slide bài giảng' },
                  { value: 'EXAM_REVIEW', label: 'Đề thi & Ôn tập' },
                  { value: 'ASSIGNMENT', label: 'Bài tập lớn (BTL)' },
                  { value: 'SAMPLE_CODE', label: 'Mã nguồn mẫu' },
                  { value: 'THESIS', label: 'Khóa luận tốt nghiệp' },
                  { value: 'REFERENCE', label: 'Tài liệu tham khảo / Sách' },
                  { value: 'CAPSTONE', label: 'Đồ án chuyên ngành' },
                  { value: 'LECTURE', label: 'Bài giảng' },
                  { value: 'EXAM', label: 'Đề cương ôn tập' },
                  { value: 'LAB', label: 'Hướng dẫn Thực hành' },
                ]}
                placeholder="Tất cả phân loại"
                className="w-full"
              />
            </div>

            {/* 5. Target Year (F3: Năm sinh viên) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Năm học sinh viên
              </label>
              <CustomSelect
                value={selectedTargetYear}
                onChange={(val) => setSelectedTargetYear(val)}
                options={[
                  { value: '', label: 'Tất cả các năm' },
                  { value: 'YEAR_1', label: 'Năm 1 (Đại cương)' },
                  { value: 'YEAR_2', label: 'Năm 2 (Cơ sở ngành)' },
                  { value: 'YEAR_3', label: 'Năm 3 (Chuyên ngành)' },
                  { value: 'YEAR_4', label: 'Năm 4 (Đồ án / Thực tập)' },
                  { value: 'YEAR_5', label: 'Năm 5 (Khóa luận tốt nghiệp)' },
                ]}
                placeholder="Năm sinh viên"
                className="w-full"
              />
            </div>

            {/* 6. Academic Year */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Niên khóa
              </label>
              <CustomSelect
                value={selectedYear}
                onChange={(val) => setSelectedYear(val)}
                options={[
                  { value: '', label: 'Tất cả niên khóa' },
                  ...academicYears.map((y) => ({ value: String(y.id), label: y.name })),
                ]}
                placeholder="Tất cả niên khóa"
                className="w-full"
              />
            </div>

            {/* 7. Sort by */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Sắp xếp theo
              </label>
              <CustomSelect
                value={sortBy}
                onChange={(val) => setSortBy(val as 'newest' | 'views' | 'downloads')}
                options={[
                  { value: 'newest', label: 'Mới nhất' },
                  { value: 'views', label: 'Xem nhiều nhất' },
                  { value: 'downloads', label: 'Tải nhiều nhất' },
                ]}
                placeholder="Sắp xếp"
                icon="sort"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tìm thấy <span className="text-blue-600 dark:text-blue-400 font-bold">{totalElements}</span> tài liệu học tập
          </p>
        </div>

        {/* 4-column Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 h-80 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-full h-36 rounded-xl bg-slate-100 dark:bg-slate-800" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                </div>
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Không tìm thấy tài liệu phù hợp</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Không có kết quả nào khớp với các tiêu chí tìm kiếm hiện tại. Hãy thử tìm kiếm với từ khóa khác hoặc thiết lập lại bộ lọc.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thiết lập lại bộ lọc</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {documents.map((doc) => (
                <BookCard
                  key={doc.id}
                  doc={doc}
                  isSelected={selectedDoc?.id === doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  onQuickView={() => {
                    setSelectedDoc(doc)
                    setViewerModal({ isOpen: true, doc })
                  }}
                />
              ))}
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="pt-4 border-t border-slate-100">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setPage(p)
                    window.scrollTo({ top: 180, behavior: 'smooth' })
                  }}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* RIGHT PANEL: Document Detail Sidebar */}
      {selectedDoc && (
        <BookDetailDrawer
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onReadOnline={(doc) => setViewerModal({ isOpen: true, doc })}
          onDownload={handleDownload}
          onReport={(doc) => setReportModal({ isOpen: true, doc })}
          onBookmarkChanged={(docId, isBookmarked) => {
            setDocuments((prev) =>
              prev.map((d) => (d.id === docId ? { ...d, bookmarked: isBookmarked } : d))
            )
          }}
        />
      )}

      {/* PDF Viewer & Report Modals */}
      <PdfViewerModal
        isOpen={viewerModal.isOpen}
        onClose={() => setViewerModal({ isOpen: false, doc: null })}
        fileId={viewerModal.doc?.primaryFileId}
        title={viewerModal.doc?.title || 'Tài liệu khoa học'}
        fileName={viewerModal.doc ? `${viewerModal.doc.title}.pdf` : undefined}
      />

      {reportModal.doc && (
        <ReportModal
          isOpen={reportModal.isOpen}
          onClose={() => setReportModal({ isOpen: false, doc: null })}
          documentId={reportModal.doc.id}
          documentTitle={reportModal.doc.title}
          onSuccess={() => toast.success('Đã gửi báo cáo vi phạm thành công tới Ban Quản trị!')}
        />
      )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
