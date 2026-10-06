import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import DocumentCard from '../components/document/DocumentCard';
import DocumentDetailPanel from '../components/document/DocumentDetailPanel';
import PdfViewerModal from '../components/document/PdfViewerModal';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import CustomSelect from '../components/ui/CustomSelect';

import { searchDocuments } from '../api/documentApi';
import { getSubjects, getAcademicYears } from '../api/catalogApi';
import { DocumentSummary, SearchDocumentParams, PageResponse, DocumentTypeCode } from '../types/document';
import { Subject, AcademicYear } from '../types/catalog';
import { getErrorMessage } from '../utils/errorMessages';

export default function Home() {
  const [filters, setFilters] = useState<SearchDocumentParams>({ page: 0, size: 12 });
  const [documents, setDocuments] = useState<PageResponse<DocumentSummary> | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load catalogs
  useEffect(() => {
    Promise.all([getSubjects(), getAcademicYears()])
      .then(([subRes, ayRes]) => {
        setSubjects(subRes || []);
        setAcademicYears(ayRes || []);
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
        // Trigger quick read
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDoc]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, keyword: searchInput, page: 0 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch documents
  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await searchDocuments(filters);
        setDocuments(res);
        // Auto select first document if none selected
        if (res && res.content && res.content.length > 0 && !selectedDoc) {
          setSelectedDoc(res.content[0]);
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
    setFilters((prev) => ({ ...prev, subjectId: num, page: 0 }));
  };

  const handleYearFilter = (val: string) => {
    const num = val ? Number(val) : undefined;
    setFilters((prev) => ({ ...prev, academicYearId: num, page: 0 }));
  };

  const handleSortFilter = (val: string) => {
    const sortVal = val || undefined;
    setFilters((prev) => ({ ...prev, sort: sortVal, page: 0 }));
  };

  const tabs: { label: string; value?: DocumentTypeCode }[] = [
    { label: 'Tất cả' },
    { label: 'Đồ án tốt nghiệp (KLTN)', value: 'THESIS' },
    { label: 'Bài tập lớn (BTL)', value: 'PROJECT' },
    { label: 'Giáo trình & Slide', value: 'LECTURE' },
    { label: 'Đồ án chuyên ngành', value: 'CAPSTONE' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 pb-12 flex-grow bg-surface">
        <div className="max-w-7xl mx-auto px-4 lg:px-gutter-desktop py-space-md">
          {/* Top Meta Ribbon & Stat Highlights */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs text-secondary font-label-code text-caption font-bold tracking-widest uppercase mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                <span>Hệ thống Học liệu Điện tử FIT-UTC</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">
                Kho Tài Liệu Học Thuật &amp; Đồ Án CNTT UTC
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Trường Đại học Giao thông Vận tải — Cơ sở dữ liệu KLTN, BTL và Giáo trình chuẩn kiểm định
              </p>
            </div>

            {/* Quick Stats Metric Pills */}
            <div className="flex items-center gap-space-sm flex-wrap">
              <div className="bg-surface-container-lowest px-space-md py-space-xs rounded-xl shadow-xs border border-surface-container flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">menu_book</span>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-body-sm text-primary leading-tight font-bold">12,480+</span>
                  <span className="font-caption text-caption text-on-surface-variant">Học liệu số</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest px-space-md py-space-xs rounded-xl shadow-xs border border-surface-container flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-body-sm text-primary leading-tight font-bold">100%</span>
                  <span className="font-caption text-caption text-on-surface-variant">Phê duyệt Khoa</span>
                </div>
              </div>
              <div className="bg-primary-container text-on-primary px-space-md py-space-xs rounded-xl shadow-xs flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary-fixed text-[20px]">speed</span>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-body-sm leading-tight font-bold">K61 - K65</span>
                  <span className="font-caption text-caption text-surface-container-highest">Cập nhật kỳ 2024-2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Central Command */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-space-md mb-space-lg flex flex-col gap-space-md">
            {/* Omnisearch Bar with Hotkey */}
            <div className="relative flex items-center w-full">
              <span className="material-symbols-outlined absolute left-space-md text-on-surface-variant text-[22px]">
                search
              </span>
              <input
                ref={searchInputRef}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm theo tên đề tài, tác giả, giảng viên hướng dẫn (ThS. Đào Thị Lệ Thủy...), công nghệ..."
                type="text"
                className="w-full bg-surface-container-low pl-12 pr-28 py-3 rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
              />
              <div className="absolute right-space-md flex items-center gap-1 pointer-events-none select-none">
                <kbd className="font-label-code text-caption px-2 py-1 rounded bg-surface-container-highest text-primary font-bold shadow-xs">
                  Ctrl
                </kbd>
                <kbd className="font-label-code text-caption px-2 py-1 rounded bg-surface-container-highest text-primary font-bold shadow-xs">
                  K
                </kbd>
              </div>
            </div>

            {/* Segmented Filter Matrix */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-space-xs border-t border-surface-container">
              {/* Quick Document Type Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {tabs.map((tab) => {
                  const active = filters.documentTypeCode === tab.value;
                  return (
                    <button
                      key={tab.label}
                      onClick={() => handleTypeFilter(tab.value)}
                      className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
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

              {/* Dropdown Selectors */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                {/* Subject Selector */}
                <CustomSelect
                  value={filters.subjectId ? String(filters.subjectId) : ''}
                  onChange={handleSubjectFilter}
                  options={[
                    { value: '', label: 'Tất cả Học phần / Môn học' },
                    ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
                  ]}
                  placeholder="Tất cả Học phần / Môn học"
                  icon="unfold_more"
                  className="min-w-[190px] sm:min-w-[210px] flex-1 sm:flex-initial"
                  menuClassName="min-w-[240px]"
                />

                {/* Academic Year Selector */}
                <CustomSelect
                  value={filters.academicYearId ? String(filters.academicYearId) : ''}
                  onChange={handleYearFilter}
                  options={[
                    { value: '', label: 'Niên khóa' },
                    ...academicYears.map((ay) => ({ value: String(ay.id), label: ay.name })),
                  ]}
                  placeholder="Niên khóa"
                  icon="keyboard_arrow_down"
                  className="min-w-[125px] sm:min-w-[140px]"
                  menuClassName="min-w-[160px]"
                />

                {/* Sort Selector */}
                <CustomSelect
                  value={filters.sort || ''}
                  onChange={handleSortFilter}
                  options={[
                    { value: '', label: 'Sắp xếp' },
                    { value: 'createdAt,desc', label: 'Mới nhất' },
                    { value: 'viewCount,desc', label: 'Xem nhiều nhất' },
                    { value: 'avgRating,desc', label: 'Đánh giá cao' },
                  ]}
                  placeholder="Sắp xếp"
                  icon="sort"
                  className="min-w-[125px] sm:min-w-[140px]"
                  menuClassName="min-w-[160px]"
                />
              </div>
            </div>
          </div>

          {/* Main Workstation Layout: 8 cols Documents Grid + 4 cols Interactive Detail Drawer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* LEFT: Document Grid (8 Cols) */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-space-md">
              {/* Active Subheader bar */}
              <div className="flex items-center justify-between px-space-xs">
                <span className="font-headline-sm text-body-md text-primary flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-secondary text-[20px]">folder_special</span>
                  <span>Danh sách đề tài tuyển chọn • </span>
                  <span className="text-secondary font-label-code text-body-sm font-bold">
                    {documents ? `${documents.totalElements} kết quả` : 'Đang tải...'}
                  </span>
                </span>
              </div>

              {/* Document Cards Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-surface-container-lowest rounded-xl p-space-md border border-surface-container h-80">
                      <div className="w-full h-32 rounded-lg bg-surface-container-low mb-4"></div>
                      <div className="h-5 bg-surface-container rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-surface-container-low rounded w-1/2 mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-5 w-16 bg-surface-container rounded"></div>
                        <div className="h-5 w-16 bg-surface-container rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : documents?.content.length === 0 ? (
                <EmptyState
                  title="Không tìm thấy tài liệu phù hợp"
                  description="Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc."
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md" id="document-cards-container">
                    {documents?.content.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        doc={doc}
                        selected={selectedDoc?.id === doc.id}
                        onClick={() => setSelectedDoc(doc)}
                      />
                    ))}
                  </div>

                  {/* Pagination Footer */}
                  {documents && documents.totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        page={documents.page}
                        totalPages={documents.totalPages}
                        onChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RIGHT: Split-View Quick Preview Drawer (Sticky, 4 Cols) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
              <DocumentDetailPanel
                doc={selectedDoc}
                onClose={() => setSelectedDoc(null)}
                onOpenPdf={setPdfUrl}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <PdfViewerModal url={pdfUrl} onClose={() => setPdfUrl(null)} />
    </div>
  );
}
