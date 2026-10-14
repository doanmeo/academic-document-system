import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import DocumentCard from '../components/document/DocumentCard';
import DocumentDetailPanel from '../components/document/DocumentDetailPanel';
import PdfViewerModal from '../components/PdfViewerModal';
import CitationModal from '../components/CitationModal';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import CustomSelect from '../components/ui/CustomSelect';

import { searchDocuments } from '../api/documentApi';
import { getSubjects, getAcademicYears, getMajors, getAdvisors } from '../api/catalogApi';
import { DocumentSummary, SearchDocumentParams, PageResponse, DocumentTypeCode } from '../types/document';
import { Subject, AcademicYear, Major } from '../types/catalog';
import { getErrorMessage } from '../utils/errorMessages';

// Hot subject Quick Pills for 1-touch filtering
const QUICK_PILLS = [
  { label: 'Kỹ thuật phần mềm', keyword: 'Kỹ thuật phần mềm' },
  { label: 'Phát triển PM Mã nguồn mở', keyword: 'Mã nguồn mở' },
  { label: 'Trí tuệ nhân tạo (AI)', keyword: 'Trí tuệ nhân tạo' },
  { label: 'Lập trình Hướng đối tượng', keyword: 'Hướng đối tượng' },
  { label: 'Kiểm thử PM (Testing)', keyword: 'Kiểm thử' },
  { label: 'An ninh mạng & ATTT', keyword: 'An ninh mạng' },
  { label: 'Hệ điều hành Unix/Linux', keyword: 'Unix' },
];

export default function Home() {
  const [filters, setFilters] = useState<SearchDocumentParams>({ page: 0, size: 12 });
  const [documents, setDocuments] = useState<PageResponse<DocumentSummary> | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeQuickPill, setActiveQuickPill] = useState<string | null>(null);

  // Modals
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfTargetUrl, setPdfTargetUrl] = useState<string | null>(null);
  const [pdfDocTitle, setPdfDocTitle] = useState<string>('Tài liệu PDF');
  const [citationModalOpen, setCitationModalOpen] = useState(false);

  // Catalogs
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [advisors, setAdvisors] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load catalogs
  useEffect(() => {
    Promise.all([getSubjects(), getMajors(), getAcademicYears(), getAdvisors()])
      .then(([subRes, majRes, ayRes, advRes]) => {
        setSubjects(subRes || []);
        setMajors(majRes || []);
        setAcademicYears(ayRes || []);
        setAdvisors(advRes || []);
      })
      .catch(console.error);
  }, []);

  // Hotkey Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === 'F8' && selectedDoc) {
        e.preventDefault();
        setPdfDocTitle(selectedDoc.title);
        setPdfTargetUrl('/sample.pdf');
        setPdfModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDoc]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, keyword: searchInput, page: 0 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch documents
  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await searchDocuments(filters);
        setDocuments(res);
        if (res && res.content && res.content.length > 0) {
          // If selectedDoc is not in content, pick first
          if (!selectedDoc || !res.content.some((d) => d.id === selectedDoc.id)) {
            setSelectedDoc(res.content[0]);
          }
        } else {
          setSelectedDoc(null);
        }
      } catch (error) {
        console.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [filters]);

  const handleTypeFilter = (type?: DocumentTypeCode) => {
    setFilters((prev) => ({
      ...prev,
      documentTypeCode: type,
      page: 0,
    }));
  };

  const handleSubjectFilter = (val: string) => {
    const num = val ? Number(val) : undefined;
    setActiveQuickPill(null);
    setFilters((prev) => ({ ...prev, subjectId: num, page: 0 }));
  };

  const handleMajorFilter = (val: string) => {
    const num = val ? Number(val) : undefined;
    setFilters((prev) => ({ ...prev, majorId: num, page: 0 }));
  };

  const handleYearFilter = (val: string) => {
    const num = val ? Number(val) : undefined;
    setFilters((prev) => ({ ...prev, academicYearId: num, page: 0 }));
  };

  const handleAdvisorFilter = (val: string) => {
    setFilters((prev) => ({ ...prev, advisorName: val || undefined, page: 0 }));
  };

  const handleSortFilter = (val: string) => {
    setFilters((prev) => ({ ...prev, sortBy: val || undefined, page: 0 }));
  };

  const handleQuickPillClick = (pill: typeof QUICK_PILLS[0]) => {
    if (activeQuickPill === pill.label) {
      // Toggle off
      setActiveQuickPill(null);
      setSearchInput('');
      setFilters((prev) => ({ ...prev, keyword: undefined, subjectId: undefined, page: 0 }));
    } else {
      setActiveQuickPill(pill.label);
      setSearchInput('');
      // Match subject if found in catalog
      const pillKwLower = pill.keyword.toLowerCase();
      const pillLabelLower = pill.label.toLowerCase();
      const matchedSub = subjects.find(
        (s) =>
          s.name.toLowerCase().includes(pillKwLower) ||
          pillLabelLower.includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(pillLabelLower)
      );
      setFilters((prev) => ({
        ...prev,
        keyword: matchedSub ? undefined : pill.keyword,
        subjectId: matchedSub ? matchedSub.id : undefined,
        page: 0,
      }));
    }
  };

  // 6 standard academic types as per Phase 2 Master Plan
  const tabs: { label: string; value?: DocumentTypeCode }[] = [
    { label: 'Tất cả' },
    { label: '[KLTN] Khóa luận tốt nghiệp', value: 'THESIS' },
    { label: '[BTL] Bài tập lớn', value: 'CAPSTONE' },
    { label: '[Slide] Bài giảng & Slide', value: 'LECTURE' },
    { label: '[Đề thi] Đề thi & Lời giải', value: 'EXAM' },
    { label: '[Bài tập] Bài tập & Lời giải', value: 'EXERCISE' },
    { label: '[Lab] Hướng dẫn Lab', value: 'LAB' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow bg-surface">
        <div className="max-w-7xl mx-auto px-4 lg:px-gutter-desktop py-space-md space-y-6">
          {/* ─── Hero "Smart Search First" ─────────────────────────────────── */}
          <div className="bg-gradient-to-b from-primary/10 via-surface-container-lowest to-surface-container-lowest rounded-3xl p-6 sm:p-10 border border-surface-container shadow-xs text-center flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-surface-container-high text-secondary font-label-code text-caption font-bold tracking-widest uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>Cổng Học Liệu Số Nội Bộ Khoa CNTT — UTC</span>
              </div>

              <h1 className="font-headline-xl text-3xl sm:text-4xl text-primary tracking-tight font-extrabold leading-tight">
                Kho Tài Liệu Học Thuật &amp; Đồ Án Kỹ Thuật Số
              </h1>

              <p className="font-body-md text-on-surface-variant mt-2 text-sm sm:text-base max-w-xl">
                Tra cứu toàn văn Khóa luận tốt nghiệp, Bài tập lớn, Đề thi có đáp án và Slide bài giảng chuẩn kiểm định của Trường Đại học Giao thông Vận tải.
              </p>

              {/* Central Omnisearch Bar with Ctrl + K */}
              <div className="relative w-full max-w-2xl mt-6 shadow-md rounded-2xl">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[24px]">
                  search
                </span>
                <input
                  ref={searchInputRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm theo tên đề tài, tác giả, GV hướng dẫn (PGS. TS. Đào Thị Lệ Thủy...), công nghệ..."
                  type="text"
                  className="w-full bg-surface-container-lowest pl-12 pr-24 py-4 rounded-2xl font-body-md text-on-surface placeholder:text-on-surface-variant/80 focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container transition-all text-sm sm:text-base"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none select-none">
                  <kbd className="font-label-code text-[11px] px-2 py-1 rounded-md bg-surface-container text-primary font-bold shadow-xs border border-surface-container-high">
                    Ctrl
                  </kbd>
                  <kbd className="font-label-code text-[11px] px-2 py-1 rounded-md bg-surface-container text-primary font-bold shadow-xs border border-surface-container-high">
                    K
                  </kbd>
                </div>
              </div>

              {/* Quick Pills (1-Touch Subject Selection) */}
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap max-w-2xl">
                <span className="text-caption font-semibold text-on-surface-variant/80 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-amber-500">local_fire_department</span>
                  Môn học hot:
                </span>
                {QUICK_PILLS.map((pill) => {
                  const isActive = activeQuickPill === pill.label;
                  return (
                    <button
                      key={pill.label}
                      onClick={() => handleQuickPillClick(pill)}
                      className={`px-3 py-1 rounded-full text-caption font-semibold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-primary text-on-primary border-primary shadow-xs'
                          : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border-surface-container'
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── Filters Bar & Category Pills Strip ───────────────────────── */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-surface-container p-4 space-y-4">
            {/* Document Type Tabs Strip */}
            <div className="flex items-center gap-1.5 flex-wrap pb-1">
              {tabs.map((tab) => {
                const active = filters.documentTypeCode === tab.value;
                return (
                  <button
                    key={tab.label}
                    onClick={() => handleTypeFilter(tab.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-body-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Selectors: Subject, Major, Year, Sorting */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-surface-container">
              {/* Subject */}
              <CustomSelect
                value={filters.subjectId ? String(filters.subjectId) : ''}
                onChange={handleSubjectFilter}
                options={[
                  { value: '', label: 'Tất cả Môn học / Học phần' },
                  ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
                ]}
                placeholder="Tất cả Môn học / Học phần"
                icon="book"
                className="min-w-[200px]"
              />

              {/* Major */}
              <CustomSelect
                value={filters.majorId ? String(filters.majorId) : ''}
                onChange={handleMajorFilter}
                options={[
                  { value: '', label: 'Tất cả Chuyên ngành' },
                  ...majors.map((m) => ({ value: String(m.id), label: m.name })),
                ]}
                placeholder="Tất cả Chuyên ngành"
                icon="apartment"
                className="min-w-[180px]"
              />

              {/* Academic Year */}
              <CustomSelect
                value={filters.academicYearId ? String(filters.academicYearId) : ''}
                onChange={handleYearFilter}
                options={[
                  { value: '', label: 'Tất cả Niên khóa' },
                  ...academicYears.map((y) => ({ value: String(y.id), label: y.name })),
                ]}
                placeholder="Tất cả Niên khóa"
                icon="calendar_month"
                className="min-w-[150px]"
              />

              {/* Advisor (GVHD) */}
              <CustomSelect
                value={filters.advisorName || ''}
                onChange={handleAdvisorFilter}
                options={[
                  { value: '', label: 'Tất cả GV Hướng dẫn' },
                  ...advisors.map((adv) => ({ value: adv, label: `GVHD: ${adv}` })),
                ]}
                placeholder="Giảng viên hướng dẫn"
                icon="school"
                className="min-w-[190px]"
              />

              {/* Sort By */}
              <CustomSelect
                value={filters.sortBy || 'newest'}
                onChange={handleSortFilter}
                options={[
                  { value: 'newest', label: 'Mới nhất' },
                  { value: 'views', label: 'Xem nhiều nhất' },
                  { value: 'downloads', label: 'Tải nhiều nhất' },
                  { value: 'rating', label: 'Đánh giá cao nhất' },
                ]}
                placeholder="Sắp xếp"
                icon="sort"
                className="min-w-[160px] ml-auto"
              />
            </div>
          </div>

          {/* ─── Main Content: Documents Grid & Live Reader Panel ──────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Documents Grid */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-body-md font-bold text-primary">
                  Danh sách học liệu ({documents?.totalElements || 0} tài liệu)
                </span>
                <span className="text-caption text-on-surface-variant font-medium">
                  Trang {(filters.page || 0) + 1} / {documents?.totalPages || 1}
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container animate-pulse h-64 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="h-4 bg-surface-container rounded w-1/3" />
                        <div className="h-6 bg-surface-container rounded w-3/4" />
                        <div className="h-4 bg-surface-container rounded w-1/2" />
                      </div>
                      <div className="h-8 bg-surface-container rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : !documents || documents.content.length === 0 ? (
                <EmptyState
                  title="Không tìm thấy tài liệu phù hợp"
                  message="Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc chuyên ngành, niên khóa."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.content.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      selected={selectedDoc?.id === doc.id}
                      onClick={() => setSelectedDoc(doc)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {documents && documents.totalPages > 1 && (
                <div className="pt-4 flex justify-center">
                  <Pagination
                    currentPage={filters.page || 0}
                    totalPages={documents.totalPages}
                    onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                  />
                </div>
              )}
            </div>

            {/* Right 4 Cols: DocumentDetailPanel */}
            <div className="lg:col-span-4 sticky top-24">
              <DocumentDetailPanel
                doc={selectedDoc}
                onClose={() => setSelectedDoc(null)}
                onOpenPdf={(url) => {
                  setPdfTargetUrl(url);
                  setPdfDocTitle(selectedDoc?.title || 'Tài liệu PDF');
                  setPdfModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Online PDF Focus Viewer Modal */}
      <PdfViewerModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        title={pdfDocTitle}
        url={pdfTargetUrl}
        fileUrl={pdfTargetUrl || undefined}
      />

      {/* Citation Modal */}
      <CitationModal
        isOpen={citationModalOpen}
        onClose={() => setCitationModalOpen(false)}
        doc={selectedDoc}
      />

      <Footer />
    </div>
  );
}
