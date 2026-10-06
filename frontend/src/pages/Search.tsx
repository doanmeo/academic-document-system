import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { DocumentSummary, Subject, AcademicYear, Technology } from '../types'
import { documentApi } from '../api/documentApi'
import { catalogApi } from '../api/catalogApi'
import { fileApi } from '../api/fileApi'
import BookCard from '../components/BookCard'
import BookDetailDrawer from '../components/BookDetailDrawer'
import PdfViewerModal from '../components/PdfViewerModal'
import ReportModal from '../components/ReportModal'
import CustomSelect from '../components/ui/CustomSelect'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') || ''

  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [selectedDoc, setSelectedDoc] = useState<DocumentSummary | null>(null)
  const [loading, setLoading] = useState(false)

  // Catalogs
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])

  // Search Filters
  const [keyword, setKeyword] = useState(initialQ)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedTech, setSelectedTech] = useState<string>('')
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'downloads'>('newest')

  // Modals
  const [viewerModal, setViewerModal] = useState<{ isOpen: boolean; doc: DocumentSummary | null }>({
    isOpen: false,
    doc: null,
  })
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; doc: DocumentSummary | null }>({
    isOpen: false,
    doc: null,
  })

  // Sync keyword when searchParams changes (e.g. from navbar navigation)
  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null && q !== keyword) {
      setKeyword(q)
    }
  }, [searchParams])

  // Load catalogs on mount
  useEffect(() => {
    catalogApi.getSubjects().then((res) => res.success && setSubjects(res.data)).catch(() => {})
    catalogApi.getAcademicYears().then((res) => res.success && setAcademicYears(res.data)).catch(() => {})
    catalogApi.getTechnologies().then((res) => res.success && setTechnologies(res.data)).catch(() => {})
  }, [])

  // Search documents
  useEffect(() => {
    setLoading(true)
    documentApi
      .search({
        keyword: keyword || undefined,
        subjectId: selectedSubject ? Number(selectedSubject) : undefined,
        academicYearId: selectedYear ? Number(selectedYear) : undefined,
        documentTypeCode: selectedType || undefined,
        technologyId: selectedTech ? Number(selectedTech) : undefined,
        size: 24,
      })
      .then((res) => {
        if (res.success && res.data) {
          let list = res.data.content || []
          if (sortBy === 'views') {
            list = [...list].sort((a, b) => b.viewCount - a.viewCount)
          } else if (sortBy === 'downloads') {
            list = [...list].sort((a, b) => b.downloadCount - a.downloadCount)
          }
          setDocuments(list)
        } else {
          setDocuments([])
        }
      })
      .catch(() => {
        setDocuments([])
      })
      .finally(() => setLoading(false))
  }, [keyword, selectedSubject, selectedYear, selectedType, selectedTech, sortBy])

  const handleResetFilters = () => {
    setKeyword('')
    setSelectedSubject('')
    setSelectedYear('')
    setSelectedType('')
    setSelectedTech('')
    setSortBy('newest')
    setSearchParams({})
  }

  const handleDownload = async (doc: DocumentSummary) => {
    try {
      const detailRes = await documentApi.getById(doc.id)
      const primaryFile =
        detailRes.data?.files?.find((f) => f.isPrimary) || detailRes.data?.files?.[0]
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

  return (
    <div className="flex-1 flex overflow-hidden min-h-[calc(100vh-65px)]">
      {/* LEFT CONTENT: Search Filters Header + 4-column Results Grid */}
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
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm tài liệu theo từ khóa, đề tài, tên giảng viên..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            {/* Quick reset */}
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shrink-0"
            >
              Đặt lại bộ lọc
            </button>
          </div>

          {/* Filter Selectors Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100">
            {/* Subject */}
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

            {/* Technology */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Công nghệ
              </label>
              <CustomSelect
                value={selectedTech}
                onChange={(val) => setSelectedTech(val)}
                options={[
                  { value: '', label: 'Tất cả công nghệ' },
                  ...technologies.map((t) => ({ value: String(t.id), label: t.name })),
                ]}
                placeholder="Tất cả công nghệ"
                className="w-full"
              />
            </div>

            {/* Academic Year */}
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

            {/* Document Type */}
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
                ]}
                placeholder="Tất cả phân loại"
                className="w-full"
              />
            </div>

            {/* Sort by */}
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
                <option value="downloads">Tải nhiều nhất</option>
              </select>
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
          onSuccess={() => alert('Đã gửi báo cáo vi phạm thành công tới Ban Quản trị!')}
        />
      )}
    </div>
  )
}
