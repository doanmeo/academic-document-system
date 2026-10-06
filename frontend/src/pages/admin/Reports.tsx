import React, { useEffect, useState } from 'react'
import { getAdminReports, handleReport } from '../../api/adminApi'
import type { PageResponse } from '../../types/document'
import type { Report, ReportStatus } from '../../types/admin'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'

export default function Reports() {
  const [data, setData] = useState<PageResponse<Report> | null>(null)
  const [selected, setSelected] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [adminNote, setAdminNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const fetchReports = () => {
    setLoading(true)
    getAdminReports({ page, status: statusFilter })
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReports()
  }, [page, statusFilter])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const onHandle = async (decision: ReportStatus, hide: boolean) => {
    if (!selected) return
    setActionLoading(true)
    try {
      await handleReport(selected.id, { decision, note: adminNote, hideDocument: hide })
      setToast({ type: 'success', msg: 'Xử lý báo cáo thành công' })
      setSelected(null)
      setAdminNote('')
      fetchReports()
    } catch {
      setToast({ type: 'error', msg: 'Có lỗi xảy ra khi xử lý báo cáo' })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error text-on-error font-label-badge text-caption font-bold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>CHỜ XỬ LÝ</span>
          </span>
        )
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-label-badge text-caption font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>ĐANG DUYỆT</span>
          </span>
        )
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-badge text-caption font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>ĐÃ XỬ LÝ</span>
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-label-badge text-caption font-bold">
            <span>TỪ CHỐI</span>
          </span>
        )
      default:
        return null
    }
  }

  const tabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ xử lý', value: 'PENDING' },
    { label: 'Đang xem xét', value: 'IN_REVIEW' },
    { label: 'Đã giải quyết', value: 'RESOLVED' },
    { label: 'Bác bỏ', value: 'REJECTED' },
  ]

  const filteredReports = data?.content.filter((r) => {
    if (!keyword) return true
    const kw = keyword.toLowerCase()
    return (
      r.documentTitle?.toLowerCase().includes(kw) ||
      r.reporterName?.toLowerCase().includes(kw) ||
      r.reasonName?.toLowerCase().includes(kw)
    )
  })

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border text-body-sm flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-surface-container">
        <div>
          <div className="flex items-center gap-1.5 text-secondary font-label-code text-caption font-bold tracking-widest uppercase mb-1">
            <span className="material-symbols-outlined text-[18px]">policy</span>
            <span>HỆ THỐNG AN NINH &amp; BẢN QUYỀN HỌC THUẬT</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
            Quản Lý &amp; Kiểm Duyệt Báo Cáo Vi Phạm
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Hội đồng Khoa CNTT UTC — Xử lý khiếu nại bản quyền, học liệu sai lệch &amp; đạo văn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface-container-lowest px-4 py-2 rounded-xl shadow-xs border border-surface-container flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-[22px]">report</span>
            <div className="flex flex-col">
              <span className="font-label-code text-body-sm font-bold text-primary">
                {data ? data.totalElements : 0} báo cáo
              </span>
              <span className="font-caption text-caption text-on-surface-variant">Tổng số khiếu nại</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto">
          {tabs.map((tab) => {
            const active = statusFilter === tab.value
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setStatusFilter(tab.value)
                  setPage(0)
                }}
                className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  active
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo đề tài, người gửi..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
          />
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : filteredReports && filteredReports.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-12 text-center shadow-xs space-y-3">
          <span className="material-symbols-outlined text-[48px] text-secondary mx-auto">check_circle</span>
          <h3 className="font-headline-sm font-bold text-primary">Không có báo cáo vi phạm nào</h3>
          <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
            Hiện tại không có khiếu nại hoặc báo cáo vi phạm nào trong mục này.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low text-on-surface-variant font-label-code text-caption uppercase tracking-wider border-b border-surface-container">
                <tr>
                  <th className="py-3 px-4">Mã &amp; Thời gian</th>
                  <th className="py-3 px-4">Tài liệu / Đề tài</th>
                  <th className="py-3 px-4">Loại vi phạm</th>
                  <th className="py-3 px-4">Người báo cáo</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredReports?.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => setSelected(report)}
                    className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-label-code text-body-sm font-bold text-primary">
                        #REP-{report.id}
                      </span>
                      <div className="font-label-code text-caption text-on-surface-variant mt-0.5">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <span className="font-headline-sm text-body-sm font-semibold text-primary line-clamp-2 hover:text-secondary">
                        {report.documentTitle}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-error-container text-on-error-container font-label-badge text-[12px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        <span>{report.reasonName || 'Vi phạm nội dung'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <span className="font-semibold text-on-surface">{report.reporterName}</span>
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>

                    <td className="py-3.5 px-4 align-top text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelected(report)
                        }}
                        className="px-3 py-1 bg-surface-container hover:bg-primary hover:text-on-primary text-primary rounded-lg font-label-code text-caption font-bold transition-colors"
                      >
                        Xử lý &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="p-4 border-t border-surface-container">
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Report Resolution Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-surface-container space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[24px]">gavel</span>
                <h3 className="font-headline-md font-bold text-primary">
                  Xử lý Báo cáo #REP-{selected.id}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 bg-surface-container-low p-4 rounded-xl">
              <div>
                <span className="font-caption uppercase text-on-surface-variant font-bold">Tài liệu bị báo cáo:</span>
                <h4 className="font-headline-sm font-bold text-primary mt-0.5">{selected.documentTitle}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-body-sm pt-2 border-t border-surface-container">
                <div>
                  <span className="font-caption uppercase text-on-surface-variant font-bold">Người gửi:</span>
                  <p className="font-semibold">{selected.reporterName}</p>
                </div>
                <div>
                  <span className="font-caption uppercase text-on-surface-variant font-bold">Lý do:</span>
                  <p className="text-error font-semibold">{selected.reasonName}</p>
                </div>
              </div>

              <div>
                <span className="font-caption uppercase text-on-surface-variant font-bold">Mô tả chi tiết vi phạm:</span>
                <p className="p-3 bg-white rounded-lg text-body-sm text-on-surface mt-1 border border-surface-container leading-relaxed">
                  {selected.description || 'Không có mô tả chi tiết kèm theo.'}
                </p>
              </div>
            </div>

            {/* Admin Note Input */}
            <div className="space-y-1.5">
              <label className="font-headline-sm text-body-sm text-on-surface font-semibold" htmlFor="adminNote">
                Ghi chú quyết định của Hội đồng Khoa:
              </label>
              <textarea
                id="adminNote"
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Nhập lý do duyệt hoặc ghi chú phản hồi cho tác giả và người báo cáo..."
                className="w-full bg-surface-container-low p-3 rounded-lg text-body-sm outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
              />
            </div>

            {/* Action Decision Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-body-sm font-semibold transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onHandle('REJECTED', false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-body-sm font-semibold transition-colors cursor-pointer"
              >
                Bác bỏ khiếu nại (Không vi phạm)
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onHandle('RESOLVED', false)}
                className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary rounded-lg text-body-sm font-semibold transition-colors cursor-pointer"
              >
                Đã xử lý (Cảnh báo tác giả)
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onHandle('RESOLVED', true)}
                className="px-4 py-2 bg-error hover:bg-error/90 text-on-error rounded-lg text-body-sm font-semibold transition-colors cursor-pointer"
              >
                Xác nhận vi phạm &amp; Ẩn tài liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
