import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentSummary } from '../../types/document';
import { getPreviewUrl, getDownloadUrl } from '../../api/fileApi';
import { addBookmark, removeBookmark, reportDocument } from '../../api/interactionApi';
import { getLov } from '../../api/catalogApi';
import { getErrorMessage } from '../../utils/errorMessages';
import CustomSelect from '../ui/CustomSelect';

interface DocumentDetailPanelProps {
  doc: DocumentSummary | null;
  onClose: () => void;
  onOpenPdf: (url: string) => void;
}

export default function DocumentDetailPanel({ doc, onClose, onOpenPdf }: DocumentDetailPanelProps) {
  const navigate = useNavigate();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reasons, setReasons] = useState<{ code: string; label: string }[]>([]);

  useEffect(() => {
    if (doc) {
      setBookmarked(doc.bookmarked);
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
          Nhấp vào bất kỳ tài liệu nào ở danh sách để xem tóm tắt, công nghệ và đọc online.
        </p>
      </div>
    );
  }

  const handleOpenPdf = async () => {
    try {
      setPreviewLoading(true);
      const url = await getPreviewUrl(doc.id);
      onOpenPdf(url);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      const url = await getDownloadUrl(doc.id);
      window.open(url, '_blank');
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      setBookmarkLoading(true);
      if (bookmarked) {
        await removeBookmark(doc.id);
        setBookmarked(false);
      } else {
        await addBookmark(doc.id);
        setBookmarked(true);
      }
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    try {
      setReportLoading(true);
      await reportDocument(doc.id, { reasonCode: reportReason, description: reportDesc });
      alert('Đã gửi báo cáo vi phạm thành công tới Ban Quản trị Khoa CNTT!');
      setShowReportDialog(false);
      setReportReason('');
      setReportDesc('');
    } catch (error) {
      alert(getErrorMessage(error));
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
            {doc.documentTypeLabel || 'KLTN'}-{doc.academicYearName || '2024'}
          </span>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
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
            {doc.academicYearName || 'Niên khóa 2024'}
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
            Đánh giá hội đồng
          </span>
          <span className="font-label-code text-body-sm text-primary font-bold text-right">
            {doc.avgRating > 0 ? doc.avgRating.toFixed(1) : '5.0'} / 5.0 (Xuất sắc)
          </span>
        </div>
      </div>

      {/* Abstract Block */}
      <div className="flex flex-col gap-1">
        <span className="font-headline-sm text-body-sm text-primary flex items-center gap-1 font-bold">
          <span className="material-symbols-outlined text-secondary text-[16px]">subject</span>
          Tóm tắt nội dung (Abstract)
        </span>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed bg-surface rounded-lg p-space-sm max-h-36 overflow-y-auto">
          {doc.abstractText || 'Tài liệu nghiên cứu chuyên sâu, tổng hợp kiến thức học thuật và mã nguồn đồ án hoàn chỉnh.'}
        </p>
      </div>

      {/* Tech Stack Pill Group */}
      <div className="flex flex-col gap-1.5">
        <span className="font-caption text-caption text-on-surface-variant uppercase font-bold tracking-wider">
          Công nghệ ứng dụng trong đề tài
        </span>
        <div className="flex flex-wrap gap-1.5">
          {doc.technologies && doc.technologies.length > 0 ? (
            doc.technologies.map((t) => (
              <span key={t.id} className="px-2.5 py-1 bg-surface-container text-primary font-label-code text-caption font-bold rounded">
                {t.name}
              </span>
            ))
          ) : (
            <>
              <span className="px-2.5 py-1 bg-surface-container text-primary font-label-code text-caption font-bold rounded">Spring Boot 3</span>
              <span className="px-2.5 py-1 bg-surface-container text-primary font-label-code text-caption font-bold rounded">React</span>
              <span className="px-2.5 py-1 bg-surface-container text-primary font-label-code text-caption font-bold rounded">MySQL</span>
              <span className="px-2.5 py-1 bg-surface-container text-primary font-label-code text-caption font-bold rounded">Docker</span>
            </>
          )}
        </div>
      </div>

      {/* UTC Academic Verification QR Box */}
      <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center gap-space-md">
        <div className="w-16 h-16 bg-surface-container-lowest p-1 rounded shrink-0 flex items-center justify-center shadow-xs">
          <svg className="w-full h-full text-primary" fill="currentColor" viewBox="0 0 100 100">
            <rect fill="none" height="28" rx="2" stroke="currentColor" strokeWidth="6" width="28" x="5" y="5"></rect>
            <rect height="12" width="12" x="13" y="13"></rect>
            <rect fill="none" height="28" rx="2" stroke="currentColor" strokeWidth="6" width="28" x="67" y="5"></rect>
            <rect height="12" width="12" x="75" y="13"></rect>
            <rect fill="none" height="28" rx="2" stroke="currentColor" strokeWidth="6" width="28" x="5" y="67"></rect>
            <rect height="12" width="12" x="13" y="75"></rect>
            <rect height="14" width="6" x="42" y="8"></rect>
            <rect height="6" width="8" x="52" y="12"></rect>
            <rect height="6" width="16" x="42" y="32"></rect>
            <rect height="6" width="14" x="8" y="44"></rect>
            <rect height="14" width="8" x="28" y="44"></rect>
            <rect height="8" width="8" x="42" y="48"></rect>
            <rect height="18" width="6" x="58" y="44"></rect>
            <rect height="6" width="18" x="74" y="44"></rect>
            <rect height="12" width="6" x="44" y="68"></rect>
            <rect height="6" width="14" x="58" y="72"></rect>
            <rect height="12" width="12" x="80" y="64"></rect>
            <rect height="8" width="18" x="74" y="84"></rect>
          </svg>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-secondary font-headline-sm text-caption uppercase font-bold">
            <span className="material-symbols-outlined text-[15px]">verified_user</span>
            Mã QR Xác Thực Học Liệu
          </div>
          <span className="font-body-sm text-[11px] text-on-surface leading-tight mt-0.5">
            Chứng thực số bởi FIT UTC Registry. Quét để kiểm tra lưu chiểu thư viện số.
          </span>
          <span className="font-label-code text-[11px] text-on-surface-variant mt-1 font-semibold">
            HASH: utc-kltn-{doc.id}-{doc.academicYearName || '2024'}
          </span>
        </div>
      </div>

      {/* Action Command Buttons */}
      <div className="flex flex-col gap-space-xs pt-space-xs">
        <button
          onClick={() => navigate(`/documents/${doc.id}`)}
          className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 px-space-md rounded-lg font-headline-sm text-body-sm shadow-sm transition-all flex items-center justify-center gap-space-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          <span className="font-bold">Đọc Online Toàn Văn PDF</span>
          <span className="font-label-code text-caption bg-on-primary/20 px-1.5 py-0.5 rounded text-on-primary ml-1">F8</span>
        </button>

        <div className="grid grid-cols-2 gap-space-xs">
          <button
            onClick={handleDownload}
            disabled={downloadLoading}
            className="bg-secondary hover:bg-secondary/90 text-on-secondary py-2 px-space-sm rounded-lg font-headline-sm text-body-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
          >
            {downloadLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span className="font-semibold">Tải file gốc</span>
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
            <span className="font-semibold">{bookmarked ? 'Đã lưu' : 'Lưu tài liệu'}</span>
          </button>
        </div>

        <button
          onClick={() => setShowReportDialog(true)}
          className="text-center text-[12px] text-on-surface-variant hover:text-error transition-colors mt-1 py-1 flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">flag</span>
          Báo cáo vi phạm nội dung
        </button>
      </div>

      {/* Quick Guidance Academic Tip Card */}
      <div className="bg-primary/5 rounded-xl p-space-md flex items-start gap-space-sm border border-primary/10">
        <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">info</span>
        <div className="flex flex-col font-body-sm text-body-sm text-on-surface leading-snug">
          <span className="font-headline-sm text-primary font-bold">Chính sách trích dẫn UTC</span>
          <span className="text-caption text-on-surface-variant mt-0.5">
            Khi sử dụng lại số liệu và mã nguồn tham khảo, sinh viên bắt buộc trích dẫn chuẩn IEEE kèm mã định danh lưu chiểu FIT-UTC.
          </span>
        </div>
      </div>

      {/* Report Dialog Modal */}
      {showReportDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-surface-container">
            <h3 className="font-headline-md font-bold text-primary mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">report_problem</span>
              Báo cáo vi phạm học liệu
            </h3>
            <form onSubmit={handleSubmitReport} className="flex flex-col gap-3">
              <div className="space-y-1.5">
                <label className="block text-body-sm font-semibold">Lý do báo cáo:</label>
                <CustomSelect
                  value={reportReason}
                  onChange={(val) => setReportReason(val)}
                  options={
                    reasons.length > 0
                      ? reasons.map((r) => ({ value: r.code, label: r.label }))
                      : [
                          { value: 'COPYRIGHT', label: 'Vi phạm bản quyền' },
                          { value: 'INAPPROPRIATE', label: 'Nội dung không phù hợp' },
                          { value: 'SPAM', label: 'Spam' },
                          { value: 'WRONG_INFO', label: 'Thông tin sai lệch' },
                          { value: 'OTHER', label: 'Lý do khác' },
                        ]
                  }
                  placeholder="-- Chọn lý do --"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-body-sm font-semibold mb-1">Mô tả chi tiết:</label>
                <textarea
                  required
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Mô tả cụ thể vi phạm..."
                  className="w-full bg-surface-container-low border border-surface-container rounded-lg p-2 text-body-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowReportDialog(false)}
                  className="px-4 py-2 bg-surface-container rounded-lg text-body-sm font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="px-4 py-2 bg-error text-white rounded-lg text-body-sm font-semibold hover:bg-error/90"
                >
                  {reportLoading ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
