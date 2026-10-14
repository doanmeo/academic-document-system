import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import CourseHubView from '../components/CourseHubView'
import TopicNoveltyChecker from '../components/TopicNoveltyChecker'

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
  const initialTab = (searchParams.get('tab') as 'search' | 'hub' | 'novelty') || 'search'

  const [activeTab, setActiveTab] = useState<'search' | 'hub' | 'novelty'>(initialTab)
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [selectedDoc, setSelectedDoc] = useState<DocumentSummary | null>(null)
  const [loading, setLoading] = useState(false)

  // Catalogs
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [advisors, setAdvisors] = useState<string[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])

  // Search Filters (môn · ngành · năm · loại · GVHD)
  const [keyword, setKeyword] = useState(initialQ)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedMajor, setSelectedMajor] = useState<string>('')
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
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
    const t = searchParams.get('tab') as 'search' | 'hub' | 'novelty'
    if (t && ['search', 'hub', 'novelty'].includes(t)) {
      setActiveTab(t)
    }
  }, [searchParams])

  // Load catalogs on mount
  useEffect(() => {
    catalogApi.getSubjects().then((res: any) => setSubjects(Array.isArray(res) ? res : res?.data || [])).catch(() => {})
    catalogApi.getMajors().then((res: any) => setMajors(Array.isArray(res) ? res : res?.data || [])).catch(() => {})
    catalogApi.getAcademicYears().then((res: any) => setAcademicYears(Array.isArray(res) ? res : res?.data || [])).catch(() => {})
    catalogApi.getAdvisors().then((res: any) => setAdvisors(Array.isArray(res) ? res : res?.data || [])).catch(() => {})
    catalogApi.getTechnologies().then((res: any) => setTechnologies(Array.isArray(res) ? res : res?.data || [])).catch(() => {})
  }, [])

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
        size: 24,
      })
      .then((res: any) => {
        let list = res?.content || res?.data?.content || (Array.isArray(res) ? res : [])
        if (sortBy === 'views') {
          list = [...list].sort((a: any, b: any) => b.viewCount - a.viewCount)
        } else if (sortBy === 'downloads') {
          list = [...list].sort((a: any, b: any) => b.downloadCount - a.downloadCount)
        }
        setDocuments(list)
      })
      .catch(() => {
        setDocuments([])
      })
      .finally(() => setLoading(false))
  }, [keyword, selectedSubject, selectedMajor, selectedAdvisor, selectedYear, selectedType, sortBy])

  const handleResetFilters = () => {
    setKeyword('')
    setSelectedSubject('')
    setSelectedMajor('')
    setSelectedAdvisor('')
    setSelectedYear('')
    setSelectedType('')
    setSortBy('newest')
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

  const handleTabChange = (tab: 'search' | 'hub' | 'novelty') => {
    setActiveTab(tab)
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      p.set('tab', tab)
      return p
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased">
      <Navbar />

      <main className="w-full pt-18 pb-16 flex-grow flex flex-col overflow-hidden min-h-[calc(100vh-65px)]">
        {/* TOP ACADEMIC MODE NAVIGATION TABS */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 sticky top-16 z-20 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => handleTabChange('search')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'search'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🔍</span>
                <span>Tra cứu Học liệu Đa chiều</span>
              </button>
              <button
                onClick={() => handleTabChange('hub')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'hub'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📚</span>
                <span>Sổ tay Học phần (Course Hub)</span>
              </button>
              <button
                onClick={() => handleTabChange('novelty')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'novelty'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🛡️</span>
                <span>Đối soát Tính mới Đề tài</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>HỆ THỐNG HỌC LIỆU KHOA CNTT · UTC</span>
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

        {/* TAB 3: TRADITIONAL 6-DIMENSION SEARCH */}
        {activeTab === 'search' && (
          <div className="flex-1 flex overflow-hidden">
            <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Keyword */}
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm tài liệu theo từ khóa, đề tài, tên giảng viên... (Ctrl + K)"
                className="w-full pl-10 pr-20 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none select-none">
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold border border-slate-300">
                  Ctrl
                </kbd>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold border border-slate-300">
                  K
                </kbd>
              </div>
            </div>

            {/* Quick reset */}
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>

          {/* Quick Pills for Hot Subjects */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-amber-500">local_fire_department</span>
              Môn học hot:
            </span>
            {HOT_SUBJECTS.map((name) => {
              const isSelected = keyword === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setKeyword(isSelected ? '' : name)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
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
                  { value: 'THESIS', label: 'Khóa luận tốt nghiệp' },
                  { value: 'CAPSTONE', label: 'Đồ án chuyên ngành' },
                  { value: 'PROJECT', label: 'Bài tập lớn' },
                  { value: 'LECTURE', label: 'Bài giảng / Slide' },
                  { value: 'EXAM', label: 'Đề thi / Đề cương' },
                  { value: 'LAB', label: 'Hướng dẫn Thực hành' },
                ]}
                placeholder="Tất cả phân loại"
                className="w-full"
              />
            </div>

            {/* 5. Academic Year */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Năm học
              </label>
              <CustomSelect
                value={selectedYear}
                onChange={(val) => setSelectedYear(val)}
                options={[
                  { value: '', label: 'Tất cả năm học' },
                  ...academicYears.map((y) => ({ value: String(y.id), label: y.name })),
                ]}
                placeholder="Tất cả năm học"
                className="w-full"
              />
            </div>

            {/* 6. Sort by */}
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
          <p className="text-xs font-semibold text-slate-700">
            Tìm thấy <span className="text-indigo-600 font-bold">{documents.length}</span> kết quả
          </p>
        </div>

        {/* 4-column Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-3 border border-slate-200 h-72">
                <div className="w-full h-44 rounded-xl bg-slate-100" />
                <div className="mt-3 h-4 bg-slate-200 rounded w-3/4" />
                <div className="mt-2 h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              🔍
            </div>
            <h3 className="font-bold text-slate-800 text-base">Không tìm thấy tài liệu phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Không có kết quả nào khớp với các tiêu chí tìm kiếm hiện tại. Hãy thử tìm kiếm với từ khóa khác hoặc thiết lập lại bộ lọc.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Thiết lập lại bộ lọc
            </button>
          </div>
        ) : (
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
