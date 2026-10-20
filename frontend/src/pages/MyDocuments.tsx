import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyDocuments, deleteDocument, submitDocument } from '../api/documentApi';
import { userApi } from '../api/userApi';
import { DocumentSummary, DocumentStatus, PageResponse, UserStats } from '../types/document';
import { getErrorMessage } from '../utils/errorMessages';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Award, Eye, Download, Star, Bookmark, BookOpen } from 'lucide-react';

const STATUS_CONFIG: Record<DocumentStatus, { label: string; badgeClass: string; icon: string }> = {
  APPROVED: { label: 'Đã duyệt', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: 'verified' },
  PENDING: { label: 'Đang duyệt', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200', icon: 'pending' },
  REVISION_REQUIRED: { label: 'Cần sửa', badgeClass: 'bg-orange-100 text-orange-800 border-orange-200', icon: 'change_circle' },
  REJECTED: { label: 'Bị từ chối', badgeClass: 'bg-red-100 text-red-800 border-red-200', icon: 'cancel' },
  DRAFT: { label: 'Bản nháp', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'draft' },
  HIDDEN: { label: 'Đã ẩn', badgeClass: 'bg-gray-100 text-gray-600 border-gray-200', icon: 'visibility_off' },
};

export default function MyDocuments() {
  const { user } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState<DocumentStatus | ''>('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<DocumentSummary> | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await getMyDocuments({ page, size: 10, status: status || undefined, keyword });
      setData(res);
    } catch (error) {
      console.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, status, keyword]);

  // Load User Contribution Stats (F5)
  useEffect(() => {
    userApi
      .getMyStats()
      .then((res) => setStats(res))
      .catch((err) => console.error('Failed to load user stats', err));
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    setActionLoading(id);
    try {
      await deleteDocument(id);
      toast.info('Đã xóa tài liệu khỏi danh sách');
      fetchDocuments();
    } catch (error) {
      toast.error('Lỗi khi xóa tài liệu', getErrorMessage(error));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: number) => {
    setActionLoading(id);
    try {
      await submitDocument(id);
      toast.success('Đã gửi tài liệu đi kiểm duyệt thành công!');
      fetchDocuments();
    } catch (error) {
      const msg = getErrorMessage(error);
      if (msg.includes('ít nhất 1 tệp đính kèm') || msg.includes('MISSING_ATTACHED_FILE')) {
        toast.warning(
          'Tài liệu chưa có tệp đính kèm',
          'Bản nháp này chưa có tệp đính kèm. Đang chuyển đến trang chỉnh sửa để bạn tải tệp lên.'
        );
        setTimeout(() => navigate(`/documents/${id}/edit`), 1200);
        return;
      }
      toast.error('Lỗi khi nộp tài liệu', msg);
    } finally {
      setActionLoading(null);
    }
  };

  const tabs: { label: string; value: DocumentStatus | '' }[] = [
    { label: 'Tất cả', value: '' },
    { label: 'Đã duyệt', value: 'APPROVED' },
    { label: 'Đang duyệt', value: 'PENDING' },
    { label: 'Cần sửa', value: 'REVISION_REQUIRED' },
    { label: 'Bản nháp', value: 'DRAFT' },
    { label: 'Bị từ chối', value: 'REJECTED' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow bg-paper-grid">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-6">
          {/* Main Grid: 4 Cols Profile Card + 8 Cols Documents Management */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: USER PROFILE CARD (4 Cols) */}
            <div className="lg:col-span-4 bg-[#fffdfa] dark:bg-[#12161f] rounded-2xl shadow-xs border-2 border-stone-300 dark:border-stone-800 p-6 space-y-6">
              {/* Profile Identity */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-2xl shadow-sm mb-3">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <h2 className="font-serif-academic text-xl font-bold text-stone-900 dark:text-stone-100">
                  {user?.fullName || 'Học viên CNTT UTC'}
                </h2>
                <span className="font-mono text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  MSSV: {user?.studentCode || '231230859'}
                </span>
                <span className="mt-2 px-3 py-1 bg-primary text-on-primary font-label-code text-[11px] font-bold tracking-wider uppercase rounded-full">
                  {user?.role === 'ADMIN' ? 'BAN QUẢN TRỊ KHOA' : 'SINH VIÊN K64 - CNTT'}
                </span>
              </div>

              {/* Verified Email */}
              <div className="p-3.5 bg-surface-container-low rounded-lg border border-surface-container">
                <div className="flex items-center justify-between text-caption font-bold text-on-surface-variant uppercase">
                  <span>Email UTC xác thực</span>
                  <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
                </div>
                <p className="font-mono text-xs text-stone-800 dark:text-stone-200 mt-1 break-all">
                  {user?.email || 'sinhvien@st.utc.edu.vn'}
                </p>
              </div>

              {/* Contribution Telemetry (F5: Real User Contribution Stats) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-code text-caption uppercase tracking-wider font-bold text-on-surface">
                    Đóng góp học thuật
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded uppercase tracking-wider">
                    {stats?.contributorRank || 'THÀNH VIÊN TÍCH CỰC'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-surface-container-low p-2 rounded-lg text-center" title="Số tài liệu đã được duyệt">
                    <span className="block font-headline-sm font-bold text-emerald-700">
                      {stats ? stats.totalApproved : (data ? data.totalElements : 0)}
                    </span>
                    <span className="font-caption text-[10px] text-on-surface-variant flex items-center justify-center gap-0.5">
                      <BookOpen className="w-2.5 h-2.5" /> Đã duyệt
                    </span>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-lg text-center" title="Tổng lượt xem tài liệu">
                    <span className="block font-headline-sm font-bold text-on-surface">
                      {stats?.totalViews ?? 0}
                    </span>
                    <span className="font-caption text-[10px] text-on-surface-variant flex items-center justify-center gap-0.5">
                      <Eye className="w-2.5 h-2.5" /> Lượt xem
                    </span>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-lg text-center" title="Tổng lượt tải tài liệu">
                    <span className="block font-headline-sm font-bold text-indigo-600">
                      {stats?.totalDownloads ?? 0}
                    </span>
                    <span className="font-caption text-[10px] text-on-surface-variant flex items-center justify-center gap-0.5">
                      <Download className="w-2.5 h-2.5" /> Lượt tải
                    </span>
                  </div>
                </div>

                {/* Sub-telemetry: Rating & Top Subject */}
                <div className="bg-surface-container-low p-2.5 rounded-lg text-xs space-y-1 border border-surface-container">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Đánh giá TB:
                    </span>
                    <span className="font-bold text-slate-800">{stats?.avgRating ? stats.avgRating.toFixed(1) : '5.0'} / 5.0</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Bookmark className="w-3.5 h-3.5 text-blue-500" /> Đã lưu trữ:
                    </span>
                    <span className="font-bold text-slate-800">{stats?.totalBookmarks ?? 0}</span>
                  </div>
                  {stats?.topSubject && (
                    <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-600">
                      Môn đóng góp nhiều nhất: <span className="font-bold text-slate-800">{stats.topSubject}</span>
                    </div>
                  )}
                </div>

                {/* Badges / Huy hiệu Khoa CNTT */}
                {stats?.badges && stats.badges.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Huy hiệu đạt được</span>
                    <div className="flex flex-wrap gap-1.5">
                      {stats.badges.map((b, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-bold"
                        >
                          <Award className="w-3 h-3 text-amber-600" />
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              </div>

            {/* RIGHT COLUMN: DOCUMENTS MANAGEMENT (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Top Action Ribbon */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fffdfa] dark:bg-[#12161f] p-5 rounded-2xl shadow-xs border-2 border-stone-300 dark:border-stone-800">
                <div>
                  <h1 className="font-serif-academic text-2xl sm:text-3xl font-bold text-stone-950 dark:text-stone-50 tracking-tight">
                    Tài Liệu Của Tôi
                  </h1>
                  <p className="text-body-sm text-on-surface-variant mt-0.5">
                    Quản lý các đề tài, báo cáo và học liệu số bạn đã tải lên hệ thống.
                  </p>
                </div>

                <Link
                  to="/documents/upload"
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-lg font-headline-sm text-body-sm font-bold shadow-xs transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                  <span>+ Đăng tải đề tài mới</span>
                </Link>
              </div>

              {/* Filter Tabs & Search */}
              <div className="bg-[#fffdfa] dark:bg-[#12161f] p-4 rounded-2xl shadow-xs border-2 border-stone-300 dark:border-stone-800 space-y-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {tabs.map((tab) => {
                    const active = status === tab.value;
                    return (
                      <button
                        key={tab.label}
                        onClick={() => {
                          setStatus(tab.value);
                          setPage(0);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all shrink-0 cursor-pointer ${
                          active
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setPage(0);
                    }}
                    placeholder="Tìm theo tiêu đề tài liệu của bạn..."
                    className="w-full pl-9 pr-4 py-2 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
                  />
                </div>
              </div>

              {/* Documents List */}
              {loading ? (
                <div className="flex justify-center py-16">
                  <Spinner />
                </div>
              ) : data?.content.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-12 text-center shadow-xs space-y-4">
                  <span className="material-symbols-outlined text-[48px] text-secondary mx-auto">
                    folder_open
                  </span>
                  <h3 className="font-serif-academic text-lg font-bold text-stone-900 dark:text-stone-100">Chưa có tài liệu trong mục này</h3>
                  <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
                    Bạn chưa tải lên tài liệu nào phù hợp với bộ lọc hiện tại. Bấm nút bên dưới để bắt đầu đăng tải.
                  </p>
                  <Link
                    to="/documents/upload"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-bold hover:bg-primary-container transition-colors"
                  >
                    Đăng tải tài liệu ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.content.map((doc) => {
                    const statusInfo = STATUS_CONFIG[doc.status] || STATUS_CONFIG.DRAFT;
                    return (
                      <div
                        key={doc.id}
                        className="bg-white dark:bg-stone-900 rounded-xl shadow-2xs border-2 border-stone-200/90 dark:border-stone-800/90 hover:border-stone-400 dark:hover:border-stone-600 p-4 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-code text-[11px] font-bold border ${statusInfo.badgeClass}`}
                            >
                              <span className="material-symbols-outlined text-[13px]">{statusInfo.icon}</span>
                              <span>{statusInfo.label}</span>
                            </span>
                            <span className="bg-surface-container text-primary font-label-code text-[11px] font-bold px-2 py-0.5 rounded">
                              {doc.documentTypeLabel || 'KLTN'}
                            </span>
                            <span className="text-caption text-on-surface-variant">
                              {doc.subjectName} • {doc.academicYearName}
                            </span>
                          </div>

                          <h3
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            className="font-headline-sm text-body-md font-bold text-stone-900 dark:text-stone-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer leading-snug transition-colors"
                          >
                            {doc.title}
                          </h3>

                          {doc.rejectionNote && (
                            <div className="p-2 bg-red-50 text-red-700 rounded-lg text-caption border border-red-200">
                              <strong>Lý do từ chối/yêu cầu sửa:</strong> {doc.rejectionNote}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-caption text-on-surface-variant pt-1">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">visibility</span> {doc.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">download</span> {doc.downloadCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">star</span> {doc.avgRating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          {doc.status === 'REVISION_REQUIRED' && (
                            <Link
                              to={`/documents/${doc.id}/edit`}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-caption transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit_note</span>
                              <span>Sửa &amp; Nộp lại</span>
                            </Link>
                          )}
                          {doc.status === 'DRAFT' && (
                            <button
                              onClick={() => handleSubmit(doc.id)}
                              disabled={actionLoading === doc.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-caption transition-colors cursor-pointer"
                            >
                              Nộp duyệt
                            </button>
                          )}
                          <Link
                            to={`/documents/${doc.id}/edit`}
                            className="p-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg transition-colors"
                            title="Chỉnh sửa tài liệu"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                          <Link
                            to={`/documents/${doc.id}`}
                            className="p-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Link>
                          {doc.status === 'DRAFT' && (
                            <button
                              onClick={() => handleDelete(doc.id)}
                              disabled={actionLoading === doc.id}
                              className="p-2 bg-surface-container hover:bg-error-container text-error rounded-lg transition-colors cursor-pointer"
                              title="Xóa tài liệu"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {data && data.totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        page={data.page}
                        totalPages={data.totalPages}
                        onChange={(p) => setPage(p)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export { MyDocuments };
