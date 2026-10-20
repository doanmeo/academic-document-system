import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
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
  SearchX,
  LayoutGrid,
  List,
  Filter,
  SlidersHorizontal,
  FolderGit2,
  UserCheck,
  Calendar,
  Check,
  X,
  Eye,
  Download,
  Share2,
  Bookmark,
  ArrowLeft
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import type { DocumentSummary, Subject, AcademicYear, Technology, Major } from '../types'
import { OFFICIAL_DOCUMENT_TYPES } from '../types/document'
import { documentApi } from '../api/documentApi'
import { catalogApi } from '../api/catalogApi'
import { addBookmark, removeBookmark } from '../api/interactionApi'
import DocumentCard from '../components/document/DocumentCard'
import DocumentQuickCardModal from '../components/document/DocumentQuickCardModal'
import PdfViewerModal from '../components/PdfViewerModal'
import CitationModal from '../components/CitationModal'
import ReportModal from '../components/ReportModal'
import CustomSelect from '../components/ui/CustomSelect'
import CustomCheckbox from '../components/ui/CustomCheckbox'
import Pagination from '../components/ui/Pagination'
import TopicNoveltyChecker from '../components/TopicNoveltyChecker'

const HOT_SUBJECTS = [
  { name: 'Kỹ thuật phần mềm', color: 'border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/40' },
  { name: 'Trí tuệ nhân tạo (AI)', color: 'border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50/70 dark:bg-purple-950/40' },
  { name: 'Khóa luận tốt nghiệp', type: 'THESIS', color: 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/40' },
  { name: 'Lập trình Hướng đối tượng', color: 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40' },
  { name: 'Kiểm thử PM (Testing)', color: 'border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 bg-cyan-50/70 dark:bg-cyan-950/40' },
  { name: 'An ninh mạng & ATTT', color: 'border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 bg-red-50/70 dark:bg-red-950/40' },
  { name: 'Unix / Linux', color: 'border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/40' },
]

export default function Search() {
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  const paramTab = searchParams.get('tab')
  const initialTab: 'search' | 'novelty' = paramTab === 'novelty' ? 'novelty' : 'search'

  const [activeTab, setActiveTab] = useState<'search' | 'novelty'>(initialTab)
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [selectedDoc, setSelectedDoc] = useState<DocumentSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [totalElements, setTotalElements] = useState<number>(0)

  // View mode: 'grid' vs 'ledger' (table list)
  const [viewMode, setViewMode] = useState<'grid' | 'ledger'>('grid')

  // Catalogs
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [advisors, setAdvisors] = useState<string[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])

  // Search Filters
  const [keyword, setKeyword] = useState(initialQ)
  const [selectedSubject, setSelectedSubject] = useState<string>(searchParams.get('subjectId') || '')
  const [selectedMajor, setSelectedMajor] = useState<string>(searchParams.get('majorId') || '')
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || '')
  const [selectedTargetYear, setSelectedTargetYear] = useState<string>('')
  const [onlySourceCode, setOnlySourceCode] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'downloads'>('newest')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Modals
  const [viewerModal, setViewerModal] = useState<{ isOpen: boolean; doc: DocumentSummary | null }>({
    isOpen: false,
    doc: null,
  })
  const [citationModal, setCitationModal] = useState<{ isOpen: boolean; doc: DocumentSummary | null }>({
    isOpen: false,
    doc: null,
  })
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; doc: DocumentSummary | null }>({
    isOpen: false,
    doc: null,
  })

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

  // Sync keyword & tab when searchParams changes
  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null && q !== keyword) {
      setKeyword(q)
    }
    const t = searchParams.get('tab')
    if (t === 'novelty') {
      setActiveTab('novelty')
    } else {
      setActiveTab('search')
    }
    const subId = searchParams.get('subjectId')
    if (subId) setSelectedSubject(subId)
    const majId = searchParams.get('majorId')
    if (majId) setSelectedMajor(majId)
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
  }, [keyword, selectedSubject, selectedMajor, selectedAdvisor, selectedYear, selectedType, selectedTargetYear, onlySourceCode, sortBy])

  // Search documents
  useEffect(() => {
    if (activeTab !== 'search') return

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
        let list: DocumentSummary[] = res?.content || (Array.isArray(res) ? res : [])
        if (onlySourceCode) {
          list = list.filter((d) => Boolean(d.repositoryUrl || d.documentTypeCode === 'SAMPLE_CODE'))
        }
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
  }, [keyword, selectedSubject, selectedMajor, selectedAdvisor, selectedYear, selectedType, selectedTargetYear, onlySourceCode, sortBy, page, activeTab])

  const handleResetFilters = () => {
    setKeyword('')
    setSelectedSubject('')
    setSelectedMajor('')
    setSelectedAdvisor('')
    setSelectedYear('')
    setSelectedType('')
    setSelectedTargetYear('')
    setOnlySourceCode(false)
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

      if (primaryFile?.id) {
        window.open(`/api/files/${primaryFile.id}/download`, '_blank')
        toast.success(`Đang bắt đầu tải tệp: ${doc.title}`)
      } else {
        toast.info('Tài liệu này xem trực tuyến hoặc liên kết mã nguồn.')
      }
    } catch {
      toast.error('Không thể tải tệp tin lúc này. Vui lòng thử lại sau.')
    }
  }

  const handleBookmarkToggle = async (doc: DocumentSummary) => {
    try {
      if (doc.bookmarked) {
        await removeBookmark(doc.id)
        toast.info('Đã bỏ lưu tài liệu khỏi Bộ sưu tập')
        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, bookmarked: false } : d)))
        if (selectedDoc?.id === doc.id) {
          setSelectedDoc({ ...selectedDoc, bookmarked: false })
        }
      } else {
        await addBookmark(doc.id)
        toast.success('Đã lưu tài liệu vào Bộ sưu tập cá nhân!')
        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, bookmarked: true } : d)))
        if (selectedDoc?.id === doc.id) {
          setSelectedDoc({ ...selectedDoc, bookmarked: true })
        }
      }
    } catch {
      toast.error('Vui lòng đăng nhập để lưu tài liệu vào Bộ sưu tập!')
    }
  }

  // Active filter count and tags
  const activeFiltersList: { label: string; onRemove: () => void }[] = []
  if (keyword) {
    activeFiltersList.push({
      label: `Từ khóa: "${keyword}"`,
      onRemove: () => setKeyword(''),
    })
  }
  if (selectedSubject) {
    const s = subjects.find((x) => String(x.id) === selectedSubject)
    activeFiltersList.push({
      label: `Môn: ${s ? s.name : selectedSubject}`,
      onRemove: () => setSelectedSubject(''),
    })
  }
  if (selectedMajor) {
    const m = majors.find((x) => String(x.id) === selectedMajor)
    activeFiltersList.push({
      label: `Ngành: ${m ? m.name : selectedMajor}`,
      onRemove: () => setSelectedMajor(''),
    })
  }
  if (selectedAdvisor) {
    activeFiltersList.push({
      label: `GVHD: ${selectedAdvisor}`,
      onRemove: () => setSelectedAdvisor(''),
    })
  }
  if (selectedType) {
    const t = OFFICIAL_DOCUMENT_TYPES.find((x) => x.code === selectedType)
    activeFiltersList.push({
      label: `Loại: ${t ? t.label : selectedType}`,
      onRemove: () => setSelectedType(''),
    })
  }
  if (selectedTargetYear) {
    activeFiltersList.push({
      label: `Sinh viên Năm ${selectedTargetYear}`,
      onRemove: () => setSelectedTargetYear(''),
    })
  }
  if (selectedYear) {
    const y = academicYears.find((x) => String(x.id) === selectedYear)
    activeFiltersList.push({
      label: `Niên khóa: ${y ? y.name : selectedYear}`,
      onRemove: () => setSelectedYear(''),
    })
  }
  if (onlySourceCode) {
    activeFiltersList.push({
      label: 'Có Source Code',
      onRemove: () => setOnlySourceCode(false),
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] dark:bg-[#0c1017] text-stone-900 dark:text-stone-100 antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-grow pt-16 flex flex-col bg-paper-grid">

        {/* ─── DEDICATED SUB-VIEW: TOPIC NOVELTY CHECKER ───────────────────── */}
        {activeTab === 'novelty' && (
          <div className="flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 space-y-4">
            <div className="pb-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('search')
                  setSearchParams({})
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại Tra cứu tài liệu</span>
              </button>

              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                Chuyên mục: Thẩm định Đề cương &amp; Đồ án tốt nghiệp
              </span>
            </div>
            <TopicNoveltyChecker />
          </div>
        )}

        {/* ─── MAIN DEDICATED WORKSPACE: TRA CỨU TÀI LIỆU ──────────────────── */}
        {activeTab === 'search' && (
          <div className="flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
            {/* Header: Title, Academic Meta & View Switcher */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-stone-300 dark:border-stone-800">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="stamp-seal text-blue-700 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/60 text-[10px]">
                    CỔNG TRA CỨU VIP Pr0
                  </span>
                  <span className="text-stone-400">/</span>
                  <span className="font-mono text-xs text-stone-500">KHOA CNTT · ĐH GIAO THÔNG VẬN TẢI</span>
                </div>

                <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 tracking-tight">
                  Tra Cứu Tài Liệu
                </h1>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl font-sans">
                  Hệ thống tra cứu học liệu đa chiều theo 6 tiêu chuẩn học thuật: Môn học, Chuyên ngành, Giảng viên hướng dẫn, Loại tài liệu, Năm đào tạo và Niên khóa.
                </p>
              </div>

              {/* Ledger Counter & View Mode Switcher */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-xs font-bold text-stone-700 dark:text-stone-300">
                  <span className="text-blue-600 dark:text-blue-400">{totalElements}</span> TÀI LIỆU
                </div>

                {/* View Mode Buttons */}
                <div className="flex items-center p-1 rounded-lg bg-stone-200/80 dark:bg-stone-900 border border-stone-300 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    title="Chế độ Lưới (Card Grid)"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-stone-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('ledger')}
                    title="Chế độ Sổ tay Mục lục (Table / Ledger)"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'ledger'
                        ? 'bg-white dark:bg-stone-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Search Command Card */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-stone-300 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
              {/* Omnisearch Input */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600 dark:text-blue-400">
                    <SearchIcon className="w-5 h-5" />
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm theo tên tài liệu, môn học, tác giả, GVHD, công nghệ (#React, #Python, #AI)... (Ctrl + K)"
                    className="w-full pl-11 pr-24 py-3 text-sm font-mono bg-stone-100/80 dark:bg-stone-950 border border-stone-300 dark:border-stone-700/80 text-stone-900 dark:text-stone-100 rounded-xl focus:bg-white dark:focus:bg-stone-950 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-stone-400"
                  />
                  {keyword && (
                    <button
                      type="button"
                      onClick={() => setKeyword('')}
                      className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none select-none">
                    <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold border border-stone-300 dark:border-stone-700">
                      Ctrl
                    </kbd>
                    <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold border border-stone-300 dark:border-stone-700">
                      K
                    </kbd>
                  </div>
                </div>

                {/* Reset Filters button */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-3 text-xs font-mono font-bold text-stone-700 dark:text-stone-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại bộ lọc</span>
                </button>
              </div>

              {/* Hot Subject Quick Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mr-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  MÔN HOT:
                </span>
                {HOT_SUBJECTS.map((pill) => {
                  const isSelected = pill.type ? selectedType === pill.type : keyword === pill.name
                  return (
                    <button
                      key={pill.name}
                      type="button"
                      onClick={() => {
                        if (pill.type) {
                          setSelectedType(isSelected ? '' : pill.type)
                        } else {
                          setKeyword(isSelected ? '' : pill.name)
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : `${pill.color} hover:brightness-95`
                      }`}
                    >
                      #{pill.name}
                    </button>
                  )
                })}
              </div>

              {/* 6 Dimension Selectors Grid */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* 1. Môn học */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1">
                    MÔN HỌC ({subjects.length})
                  </label>
                  <CustomSelect
                    value={selectedSubject}
                    onChange={(val) => setSelectedSubject(val)}
                    options={[
                      { value: '', label: 'Tất cả môn học' },
                      ...subjects.map((s) => ({ value: String(s.id), label: `${s.name} (${s.code || ''})` })),
                    ]}
                    placeholder="Tất cả môn học"
                    className="w-full text-xs"
                  />
                </div>

                {/* 2. Chuyên ngành */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1">
                    CHUYÊN NGÀNH
                  </label>
                  <CustomSelect
                    value={selectedMajor}
                    onChange={(val) => setSelectedMajor(val)}
                    options={[
                      { value: '', label: 'Tất cả chuyên ngành' },
                      ...majors.map((m) => ({ value: String(m.id), label: `${m.name} (${m.code})` })),
                    ]}
                    placeholder="Tất cả chuyên ngành"
                    className="w-full text-xs"
                  />
                </div>

                {/* 3. Giảng viên hướng dẫn */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1">
                    GV HƯỚNG DẪN
                  </label>
                  <CustomSelect
                    value={selectedAdvisor}
                    onChange={(val) => setSelectedAdvisor(val)}
                    options={[
                      { value: '', label: 'Tất cả giảng viên' },
                      ...advisors.map((adv) => ({ value: adv, label: adv })),
                    ]}
                    placeholder="Tất cả giảng viên"
                    className="w-full text-xs"
                  />
                </div>

                {/* 4. Loại tài liệu (8 loại chuẩn) */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1">
                    LOẠI TÀI LIỆU
                  </label>
                  <CustomSelect
                    value={selectedType}
                    onChange={(val) => setSelectedType(val)}
                    options={[
                      { value: '', label: 'Tất cả 8 loại' },
                      ...OFFICIAL_DOCUMENT_TYPES.map((t) => ({ value: t.code, label: `[${t.code}] ${t.label}` })),
                    ]}
                    placeholder="Tất cả loại học liệu"
                    className="w-full text-xs"
                  />
                </div>

                {/* 5. Năm học sinh viên */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1">
                    NĂM SINH VIÊN
                  </label>
                  <CustomSelect
                    value={selectedTargetYear}
                    onChange={(val) => setSelectedTargetYear(val)}
                    options={[
                      { value: '', label: 'Tất cả các năm' },
                      { value: '1', label: 'Năm 1 (Đại cương)' },
                      { value: '2', label: 'Năm 2 (Cơ sở ngành)' },
                      { value: '3', label: 'Năm 3 (Chuyên ngành)' },
                      { value: '4', label: 'Năm 4 (Đồ án KTPM)' },
                      { value: '5', label: 'Năm 5 (Kỹ sư KLTN)' },
                    ]}
                    placeholder="Năm sinh viên"
                    className="w-full text-xs"
                  />
                </div>

                {/* 6. Niên khóa */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1">
                    NIÊN KHÓA
                  </label>
                  <CustomSelect
                    value={selectedYear}
                    onChange={(val) => setSelectedYear(val)}
                    options={[
                      { value: '', label: 'Tất cả niên khóa' },
                      ...academicYears.map((ay) => ({ value: String(ay.id), label: ay.name })),
                    ]}
                    placeholder="Tất cả niên khóa"
                    className="w-full text-xs"
                  />
                </div>
              </div>

              {/* Secondary Options: Source code toggle & Sorting */}
              <div className="pt-3 border-t border-dashed border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                {/* Source code checkbox */}
                <div className="flex items-center gap-2">
                  <CustomCheckbox
                    checked={onlySourceCode}
                    onChange={setOnlySourceCode}
                    label={
                      <span className="inline-flex items-center gap-1.5 font-bold">
                        <FolderGit2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Chỉ tài liệu có mã nguồn GitHub / GitLab
                      </span>
                    }
                    color="emerald"
                    size="md"
                  />
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <span className="text-stone-500">SẮP XẾP:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { key: 'newest', label: 'Mới nhất' },
                      { key: 'views', label: 'Lượt đọc' },
                      { key: 'downloads', label: 'Lượt tải' },
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setSortBy(s.key as any)}
                        className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer whitespace-nowrap ${
                          sortBy === s.key
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Tag Strip */}
            {activeFiltersList.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                <span className="text-stone-500 font-bold uppercase text-[10px]">ĐANG LỌC THEO:</span>
                {activeFiltersList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-200/90 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700"
                  >
                    <span>{tag.label}</span>
                    <button
                      type="button"
                      onClick={tag.onRemove}
                      className="hover:text-red-600 dark:hover:text-red-400 ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-red-600 dark:text-red-400 hover:underline font-bold text-[11px] ml-2"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Results Section */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div
                    key={n}
                    className="bg-white dark:bg-stone-900 rounded-xl p-5 border-2 border-stone-200 dark:border-stone-800 h-64 animate-pulse flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
                      <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
                      <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-1/2" />
                    </div>
                    <div className="h-8 bg-stone-100 dark:bg-stone-800 rounded" />
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-800 p-12 text-center shadow-xs space-y-4">
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 text-stone-400 rounded-2xl flex items-center justify-center mx-auto">
                  <SearchX className="w-8 h-8" />
                </div>
                <h3 className="font-serif-academic text-xl font-bold text-stone-900 dark:text-stone-100">
                  Không tìm thấy tài liệu phù hợp
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto font-sans leading-relaxed">
                  Không có tài liệu nào khớp với các tiêu chí tìm kiếm hiện tại. Bạn hãy thử từ khóa khác hoặc bấm đặt lại toàn bộ bộ lọc.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại bộ lọc</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ─── GRID VIEW ───────────────────────────────────────────── */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {documents.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        doc={doc}
                        isSelected={selectedDoc?.id === doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        onPreviewPdf={() => {
                          setSelectedDoc(doc)
                          setViewerModal({ isOpen: true, doc })
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* ─── LEDGER / TABLE VIEW ─────────────────────────────────── */}
                {viewMode === 'ledger' && (
                  <div className="bg-white dark:bg-stone-900 rounded-xl border-2 border-stone-300 dark:border-stone-800 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-800 font-mono text-[10px] text-stone-500 uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-4">MÃ LƯU TRỮ</th>
                            <th className="py-3 px-4">TIÊU ĐỀ BẢN THẢO / TÀI LIỆU</th>
                            <th className="py-3 px-4">LOẠI HỌC LIỆU</th>
                            <th className="py-3 px-4">MÔN HỌC</th>
                            <th className="py-3 px-4">GVHD / TÁC GIẢ</th>
                            <th className="py-3 px-4">LƯỢT ĐỌC</th>
                            <th className="py-3 px-4 text-right">THAO TÁC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                          {documents.map((doc) => (
                            <tr
                              key={doc.id}
                              onClick={() => setSelectedDoc(doc)}
                              className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors cursor-pointer group"
                            >
                              <td className="py-3 px-4 font-mono text-[11px] font-bold text-stone-500 whitespace-nowrap">
                                UTC-FIT-{doc.id.toString().padStart(4, '0')}
                              </td>
                              <td className="py-3 px-4 font-serif-academic font-bold text-sm text-stone-950 dark:text-stone-50 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                <div className="line-clamp-1">{doc.title}</div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                                <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 font-bold">
                                  {doc.documentTypeCode}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-stone-700 dark:text-stone-300 whitespace-nowrap">
                                {doc.subjectName || '—'}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-stone-600 dark:text-stone-400 font-mono text-[11px]">
                                {doc.advisorName ? `GV: ${doc.advisorName}` : doc.authorName || 'Sinh viên CNTT'}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap font-mono text-stone-500">
                                {doc.viewCount || 0}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedDoc(doc)}
                                  className="px-2.5 py-1 rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-mono text-[11px] font-bold uppercase hover:bg-blue-600 transition-colors cursor-pointer"
                                >
                                  Xem nhanh
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pt-4 border-t border-stone-300 dark:border-stone-800">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={(p) => {
                        setPage(p)
                        window.scrollTo({ top: 120, behavior: 'smooth' })
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── CENTERED QUICK DOCUMENT MODAL (POPUPS INSTEAD OF RIGHT DRAWER) ── */}
        <DocumentQuickCardModal
          isOpen={!!selectedDoc}
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onReadPdf={(doc) => setViewerModal({ isOpen: true, doc })}
          onCite={(doc) => setCitationModal({ isOpen: true, doc })}
          onDownload={handleDownload}
          onReport={(doc) => setReportModal({ isOpen: true, doc })}
          onBookmarkToggle={handleBookmarkToggle}
          isBookmarked={selectedDoc?.bookmarked || false}
        />

        {/* ─── AUXILIARY MODALS: PDF VIEWER, CITATION, REPORT ─────────────── */}
        <PdfViewerModal
          isOpen={viewerModal.isOpen}
          onClose={() => setViewerModal({ isOpen: false, doc: null })}
          fileId={viewerModal.doc?.primaryFileId}
          fileUrl={viewerModal.doc?.fileUrl}
          title={viewerModal.doc?.title || 'Tài liệu khoa học'}
          fileName={viewerModal.doc ? `${viewerModal.doc.title}.pdf` : undefined}
        />

        <CitationModal
          isOpen={citationModal.isOpen}
          onClose={() => setCitationModal({ isOpen: false, doc: null })}
          doc={citationModal.doc}
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
      </main>

      <Footer />
    </div>
  )
}
