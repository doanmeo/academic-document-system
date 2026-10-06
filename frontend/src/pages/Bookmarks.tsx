import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyBookmarks, removeBookmark } from '../api/interactionApi';
import { DocumentSummary, PageResponse } from '../types/document';
import { getErrorMessage } from '../utils/errorMessages';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import CustomSelect from '../components/ui/CustomSelect';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const GRADIENTS = [
  { bg: 'from-primary via-primary-container to-primary', icon: 'terminal', tag: 'KLTN.RESEARCH' },
  { bg: 'from-primary-container via-primary to-secondary', icon: 'dataset', tag: 'DB.ARCHIVE' },
  { bg: 'from-[#0f172a] via-[#1e293b] to-[#334155]', icon: 'hub', tag: 'EDGE.MESH' },
  { bg: 'from-primary via-primary-container to-secondary-container', icon: 'local_library', tag: 'CURRICULUM' },
];

export default function Bookmarks() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<DocumentSummary> | null>(null);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const navigate = useNavigate();

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await getMyBookmarks({ page, size: 12 });
      setData(res);
    } catch (error) {
      console.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [page]);

  const handleRemoveBookmark = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setRemovingId(id);
    try {
      await removeBookmark(id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.filter((d) => d.id !== id),
              totalElements: prev.totalElements - 1,
            }
          : null
      );
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setRemovingId(null);
    }
  };

  const filteredData = useMemo(() => {
    if (!data?.content) return [];
    let list = [...data.content];
    if (localSearch) {
      const lower = localSearch.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(lower) ||
          d.subjectName?.toLowerCase().includes(lower) ||
          d.uploaderName?.toLowerCase().includes(lower)
      );
    }
    if (sortBy === 'views') {
      list.sort((a, b) => b.viewCount - a.viewCount);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.avgRating - a.avgRating);
    }
    return list;
  }, [data, localSearch, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow bg-surface">
        <div className="max-w-7xl mx-auto px-4 lg:px-gutter-desktop space-y-6">
          {/* Header Ribbon */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-surface-container">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-secondary font-label-code text-caption font-bold tracking-widest uppercase mb-1">
                <span className="material-symbols-outlined text-[18px]">bookmark_heart</span>
                <span>CƠ SỞ DỮ LIỆU HỌC TẬP CÁ NHÂN</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
                Bộ Sưu Tập Tài Liệu Đã Lưu
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Kho tài liệu, đề tài nghiên cứu &amp; giáo trình được bạn đánh dấu lưu trữ chuẩn học thuật UTC.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-surface-container-lowest px-4 py-2 rounded-xl shadow-xs border border-surface-container flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">bookmarks</span>
                <div className="flex flex-col">
                  <span className="font-label-code text-body-sm font-bold text-primary">
                    {data ? data.totalElements : 0} tài liệu
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">Tổng số đã lưu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Sort Filter Bar */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Tìm nhanh trong danh sách đã lưu..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <CustomSelect
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                options={[
                  { value: 'recent', label: 'Mới lưu gần đây' },
                  { value: 'rating', label: 'Điểm cao nhất (★)' },
                  { value: 'views', label: 'Lượt xem nhiều nhất' },
                ]}
                icon="sort"
                className="w-full sm:w-[190px]"
                menuClassName="min-w-[190px]"
              />
            </div>
          </div>

          {/* Main Content Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 bg-surface-container text-secondary rounded-2xl flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">bookmark_border</span>
              </div>
              <h3 className="font-headline-sm font-bold text-primary text-base">
                Chưa có tài liệu nào trong bộ sưu tập
              </h3>
              <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
                Khi duyệt kho học liệu hoặc xem chi tiết tài liệu, bạn có thể nhấn nút &quot;Lưu tài liệu&quot; để thêm vào đây.
              </p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-body-sm font-bold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Khám phá kho tài liệu ngay
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map((doc, idx) => {
                  const gradient = GRADIENTS[Math.abs(doc.id % GRADIENTS.length)];
                  return (
                    <article
                      key={doc.id}
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      className="doc-card flex flex-col bg-surface-container-lowest rounded-xl shadow-xs hover:shadow-md transition-all border border-surface-container overflow-hidden cursor-pointer group"
                    >
                      {/* Card Top Bar */}
                      <div className="p-3.5 flex items-center justify-between bg-surface-container-low border-b border-surface-container">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-primary text-on-primary font-label-code text-[11px] px-2 py-0.5 rounded font-bold uppercase">
                            {doc.documentTypeLabel || 'KLTN'}
                          </span>
                          <span className="bg-surface-container text-on-surface-variant font-label-code text-[11px] px-2 py-0.5 rounded">
                            {doc.academicYearName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveBookmark(e, doc.id)}
                          disabled={removingId === doc.id}
                          className="p-1 text-secondary hover:text-error hover:bg-error-container/20 rounded transition-colors"
                          title="Bỏ lưu tài liệu"
                        >
                          <span className="material-symbols-outlined text-[20px]">bookmark</span>
                        </button>
                      </div>

                      {/* Academic Cover */}
                      <div
                        className={`bg-gradient-to-br ${gradient.bg} text-on-primary p-4 min-h-[120px] relative overflow-hidden flex flex-col justify-between`}
                      >
                        <div className="absolute -right-3 -bottom-5 opacity-10 pointer-events-none">
                          <span className="material-symbols-outlined text-[100px]">{gradient.icon}</span>
                        </div>
                        <span className="text-secondary-fixed font-label-code text-[11px] font-bold z-10">
                          {gradient.tag}
                        </span>
                        <h3 className="font-headline-sm text-body-md text-white font-bold line-clamp-2 z-10">
                          {doc.title}
                        </h3>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                        <div className="flex flex-col gap-1 text-on-surface-variant text-body-sm">
                          <div className="flex items-center gap-1.5 text-on-surface font-semibold truncate">
                            <span className="material-symbols-outlined text-secondary text-[16px]">person</span>
                            <span>{doc.uploaderName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] truncate">
                            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">school</span>
                            <span>GVHD: {doc.advisorName || 'Khoa CNTT'}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-surface-container flex items-center justify-between font-caption text-caption text-on-surface-variant">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">visibility</span> {doc.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">star</span> {doc.avgRating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-primary font-label-code font-bold group-hover:text-secondary transition-colors">
                            Xem chi tiết &rarr;
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {data && data.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onChange={(p) => setPage(p)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export { Bookmarks };
