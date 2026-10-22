import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { DocumentSummary } from '../../types/document';
import { getPreviewUrl, getDownloadUrl } from '../../api/fileApi';
import { addBookmark, removeBookmark, reportDocument } from '../../api/interactionApi';
import { getLov } from '../../api/catalogApi';
import { getErrorMessage } from '../../utils/errorMessages';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import CustomSelect from '../ui/CustomSelect';
import CitationModal from '../CitationModal';

interface DocumentDetailPanelProps {
  doc: DocumentSummary | null;
  onClose: () => void;
  onOpenPdf: (url: string) => void;
}

export default function DocumentDetailPanel({ doc, onClose, onOpenPdf }: DocumentDetailPanelProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showCitation, setShowCitation] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('COPYRIGHT');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reasons, setReasons] = useState<{ code: string; label: string }[]>([]);

  useEffect(() => {
    if (doc) {
      setBookmarked(Boolean(doc.bookmarked || doc.isBookmarked));
    }
  }, [doc]);

  useEffect(() => {
    if (showReportDialog && reasons.length === 0) {
      getLov('REPORT_REASON')
        .then((res) => {
          if (Array.isArray(res)) {
            setReasons(res.map((r) => ({ code: r.code, label: r.label })));
          }
        })
        .catch(console.error);
    }
  }, [showReportDialog, reasons.length]);

  if (!doc) {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg text-center border border-surface-container">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mx-auto mb-2">
          local_library
        </span>
        <h3 className="font-headline-sm text-primary font-bold">Chọn tài liệu để xem nhanh</h3>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Nhấp vào bất kỳ tài liệu nào ở danh sách để xem tóm tắt, trích dẫn, công nghệ và đọc online.
        </p>
      </div>
    );
  }

  const handleOpenPdf = async () => {
    try {
      const res = await getPreviewUrl(doc.id);
      onOpenPdf(res.url || '/sample.pdf');
    } catch {
      onOpenPdf('/sample.pdf');
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      const res = await getDownloadUrl(doc.id);
      const url = res?.url || '/sample.pdf';
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title}.pdf`;
      a.target = '_blank';
      a.click();
      toast.success('Bắt đầu tải xuống tệp học liệu!', 'Lượt tải của tài liệu đã được ghi nhận.');
    } catch (error) {
      toast.error('Lỗi khi tải file', getErrorMessage(error));
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.info('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để lưu tài liệu vào Tủ cá nhân.');
      navigate('/login');
      return;
    }
    try {
      setBookmarkLoading(true);
      if (bookmarked) {
        await removeBookmark(doc.id);
        setBookmarked(false);
        toast.info('Đã xóa khỏi Tủ tài liệu');
      } else {
        await addBookmark(doc.id);
        setBookmarked(true);
        toast.success('Đã lưu vào Tủ tài liệu cá nhân!');
      }
    } catch (error) {
      toast.error('Lỗi thao tác', getErrorMessage(error));
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('Yêu cầu đăng nhập', 'Bạn cần đăng nhập tài khoản sinh viên/giảng viên để gửi báo cáo vi phạm.');
      setShowReportDialog(false);
      navigate('/login');
      return;
    }
    const reason = reportReason || (reasons.length > 0 ? reasons[0].code : 'COPYRIGHT');
    if (!reportDesc.trim() || reportDesc.trim().length < 10) {
      toast.error('Thiếu thông tin chi tiết', 'Mô tả vi phạm phải có tối thiểu 10 ký tự để Ban Kiểm duyệt xác minh.');
      return;
    }
    try {
      setReportLoading(true);
      await reportDocument(doc.id, { reasonCode: reason, description: reportDesc });
      toast.success('Báo cáo vi phạm đã được gửi!', 'Ban Thanh tra Học thuật Khoa CNTT sẽ thẩm định.');
      setShowReportDialog(false);
      setReportReason('COPYRIGHT');
      setReportDesc('');
    } catch (error) {
      toast.error('Không thể gửi báo cáo', getErrorMessage(error));
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-md border border-surface-container">
      {/* Drawer Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[22px]">quick_reference</span>
          <span className="font-headline-sm text-headline-sm text-primary font-bold">Xem Nhanh Học Liệu</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-surface-container text-primary font-label-code text-caption font-bold px-2 py-0.5 rounded">
            {doc.documentTypeLabel || 'KLTN'}-{doc.academicYearName || '2025'}
          </span>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            title="Đóng bản xem trước"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Selected Document Header Title */}
      <div className="flex flex-col gap-1">
        <h2 className="font-headline-md text-headline-md text-primary leading-tight font-bold">
          {doc.title}
        </h2>
        <div className="flex items-center gap-space-sm text-on-surface-variant font-caption text-caption mt-1 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">school</span>
            {doc.subjectName || 'Khoa CNTT'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {doc.academicYearName || 'Niên khóa 2024-2025'}
          </span>
        </div>
      </div>

      {/* Mentorship & Authorship Matrix */}
      <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs text-body-sm">
        <div className="flex items-start justify-between">
          <span className="text-on-surface-variant font-caption text-caption uppercase tracking-wider font-semibold">
            Tác giả sinh viên
          </span>
          <span className="font-headline-sm text-body-sm text-on-surface text-right font-semibold">
            {doc.uploaderName || 'Sinh viên UTC'}
          </span>
        </div>
        <div className="flex items-start justify-between">
          <span className="text-on-surface-variant font-caption text-caption uppercase tracking-wider font-semibold">
            GV hướng dẫn
          </span>
          <span className="font-headline-sm text-body-sm text-secondary text-right font-bold">
            {doc.advisorName || 'Khoa CNTT - UTC'}
          </span>
        </div>
        <div className="flex items-start justify-between">
          <span className="text-on-surface-variant font-caption text-caption uppercase tracking-wider font-semibold">
            Đánh giá độc giả
          </span>
          <span className="font-label-code text-body-sm text-primary font-bold text-right">
            ⭐ {doc.avgRating > 0 ? `${doc.avgRating.toFixed(1)} / 5.0` : 'Chưa có đánh giá'}
          </span>
        </div>
      </div>

      {/* Abstract Block */}
      <div className="flex flex-col gap-1">
        <span className="font-headline-sm text-body-sm text-primary flex items-center gap-1 font-bold">
          <span className="material-symbols-outlined text-secondary text-[16px]">subject</span>
          Tóm tắt nội dung (Abstract)
        </span>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed bg-surface rounded-lg p-space-sm max-h-32 overflow-y-auto">
          {doc.abstractText || 'Tài liệu nghiên cứu chuyên sâu, tổng hợp kiến thức học thuật và mã nguồn đồ án hoàn chỉnh.'}
        </p>
      </div>

      {/* Tech Stack Pill Group (only when exists) */}
      {doc.technologies && doc.technologies.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-caption text-caption text-on-surface-variant uppercase font-bold tracking-wider">
            Công nghệ ứng dụng
          </span>
          <div className="flex flex-wrap gap-1.5">
            {doc.technologies.map((t) => (
              <span key={t.id} className="px-2.5 py-1 bg-surface-container text-primary font-label-code text-caption font-bold rounded">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Command Buttons */}
      <div className="flex flex-col gap-space-xs pt-space-xs">
        <div className="grid grid-cols-2 gap-space-xs">
          <button
            onClick={handleOpenPdf}
            className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 px-space-md rounded-lg font-headline-sm text-body-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
            title="Xem nhanh bản PDF"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>Xem PDF</span>
          </button>

          <button
            onClick={() => setShowCitation(true)}
            className="w-full bg-surface-container hover:bg-surface-container-high text-primary py-2.5 px-space-md rounded-lg font-headline-sm text-body-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">format_quote</span>
            <span>Trích dẫn</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-space-xs">
          <button
            onClick={handleDownload}
            disabled={downloadLoading}
            className="bg-secondary hover:bg-secondary/90 text-on-secondary py-2 px-space-sm rounded-lg font-headline-sm text-body-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 font-semibold"
          >
            {downloadLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Tải file gốc</span>
              </>
            )}
          </button>

          <button
            onClick={handleToggleBookmark}
            disabled={bookmarkLoading}
            className={`py-2 px-space-sm rounded-lg font-headline-sm text-body-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              bookmarked
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-surface-container hover:bg-surface-container-high text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {bookmarked ? 'bookmark_added' : 'bookmark_add'}
            </span>
            <span className="font-semibold">{bookmarked ? 'Đã lưu' : 'Lưu vào tủ'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => navigate(`/documents/${doc.id}`)}
            className="text-body-sm text-secondary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            title="Xem trực tuyến đầy đủ"
          >
            <span>Xem online (Toàn văn)</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>

          <button
            onClick={() => {
              if (!user) {
                toast.info('Yêu cầu đăng nhập', 'Bạn cần đăng nhập tài khoản sinh viên/giảng viên để gửi báo cáo vi phạm.');
                navigate('/login');
                return;
              }
              setShowReportDialog(true);
            }}
            className="text-caption text-on-surface-variant hover:text-error transition-colors py-1 flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">flag</span>
            <span>Báo cáo vi phạm</span>
          </button>
        </div>
      </div>

      {/* Citation Modal */}
      <CitationModal
        isOpen={showCitation}
        onClose={() => setShowCitation(false)}
        doc={doc}
      />

      {/* Report Dialog Modal via Portal to avoid sticky sidebar bleed-through */}
      {showReportDialog &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-headline-md font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600">report_problem</span>
                  Báo cáo vi phạm học liệu
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReportDialog(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Đóng hộp thoại"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-semibold text-slate-800">Lý do báo cáo *:</label>
                  <CustomSelect
                    value={reportReason || 'COPYRIGHT'}
                    onChange={(val) => setReportReason(val)}
                    options={
                      reasons.length > 0
                        ? reasons.map((r) => ({ value: r.code, label: r.label }))
                        : [
                            { value: 'COPYRIGHT', label: 'Vi phạm bản quyền / Đạo văn' },
                            { value: 'INAPPROPRIATE', label: 'Nội dung không phù hợp' },
                            { value: 'SPAM', label: 'Spam / Trùng lặp' },
                            { value: 'WRONG_INFO', label: 'Thông tin sai lệch' },
                            { value: 'OTHER', label: 'Lý do khác' },
                          ]
                    }
                    placeholder="-- Chọn lý do --"
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-body-sm font-semibold text-slate-800">Mô tả chi tiết vi phạm *:</label>
                    <span className="text-[11px] text-slate-400 font-medium">Tối thiểu 10 ký tự</span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Vui lòng nêu rõ lý do cụ thể hoặc tài liệu đối chứng để Ban Quản trị xử lý..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-body-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowReportDialog(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-body-sm font-semibold transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={reportLoading}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-body-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {reportLoading ? 'Đang gửi...' : 'Gửi báo cáo'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
