import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllDocuments, hideDocument } from '../../api/adminApi'
import type { PageResponse, DocumentSummary } from '../../types/document'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'

export default function AllDocuments() {
  const [data, setData] = useState<PageResponse<DocumentSummary> | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [hideModal, setHideModal] = useState<{ docId: number; reason: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const fetchDocs = () => {
    setLoading(true)
    getAllDocuments({ page, keyword, status: statusFilter })
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDocs()
  }, [page, keyword, statusFilter])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleHide = async () => {
    if (!hideModal || !hideModal.reason.trim()) {
      alert('Vui lòng nhập lý do ẩn tài liệu')
      return
    }
    setActionLoading(true)
    try {
      await hideDocument(hideModal.docId, { reason: hideModal.reason })
      setToast({ type: 'success', msg: `Đã ẩn tài liệu #DOC-${hideModal.docId} thành công!` })
      setHideModal(null)
      fetchDocs()
    } catch (e) {
      console.error(e)
      setToast({ type: 'error', msg: 'Có lỗi xảy ra khi ẩn tài liệu' })
    } finally {
      setActionLoading(false)
    }
  }

  const statusTabs = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đã duyệt', value: 'APPROVED' },
    { label: 'Chờ duyệt', value: 'PENDING' },
    { label: 'Nháp', value: 'DRAFT' },
    { label: 'Từ chối', value: 'REJECTED' },
    { label: 'Đã ẩn', value: 'HIDDEN' },
    { label: 'Yêu cầu sửa', value: 'REVISION_REQUIRED' },
  ]

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border text-body-sm flex items-center gap-2.5 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-surface-container">
        <div>
          <div className="flex items-center gap-1.5 text-secondary font-label-code text-caption font-bold tracking-widest uppercase mb-1">
            <span className="material-symbols-outlined text-[18px]">library_books</span>
            <span>CƠ SỞ DỮ LIỆU ĐỒ ÁN &amp; HỌC LIỆU TOÀN TRƯỜNG</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
            Quản Lý Tất Cả Tài Liệu &amp; Đề Tài
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Khoa CNTT - UTC • Giám sát, tra cứu và điều chỉnh trạng thái lưu hành của toàn bộ học liệu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-xs border border-surface-container flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">article</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-code text-body-sm font-bold text-primary">
                {data ? data.totalElements : 0} tài liệu
              </span>
              <span className="font-caption text-caption text-on-surface-variant">Tổng tài liệu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.value
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setStatusFilter(tab.value)
                  setPage(0)
                }}
                className={`px-3.5 py-1.5 rounded-lg text-body-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  active
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, tác giả..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
          />
        </div>
      </div>

      {/* Documents Table Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-code text-caption uppercase tracking-wider border-b border-surface-container">
              <tr>
                <th className="py-3 px-4">Mã số</th>
                <th className="py-3 px-4">Tiêu đề đề tài</th>
                <th className="py-3 px-4">Loại đề tài</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Người nộp</th>
                <th className="py-3 px-4">Lượt xem</th>
                <th className="py-3 px-4">Ngày tạo</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : !data || data.content.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-outline mx-auto mb-2 block">
                      folder_off
                    </span>
                    <p className="font-semibold text-primary">Không tìm thấy tài liệu phù hợp</p>
                  </td>
                </tr>
              ) : (
                data.content.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-surface-container-low/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-secondary text-caption">
                      #DOC-{doc.id}
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="font-headline-sm font-semibold text-primary hover:text-secondary line-clamp-2 transition-colors"
                        title={doc.title}
                      >
                        {doc.title}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant font-label-code text-[11px] font-semibold">
                        {doc.documentTypeLabel || doc.documentTypeCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={doc.status} />
                    </td>

                    <td className="py-3.5 px-4 text-on-surface">
                      {doc.uploaderName}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-on-surface-variant">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        <span>{doc.viewCount}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-label-code text-caption text-on-surface-variant whitespace-nowrap">
                      {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-center space-x-1.5">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="px-2.5 py-1 bg-surface-container hover:bg-primary hover:text-on-primary text-primary rounded-lg font-label-code text-caption font-bold transition-colors inline-block"
                      >
                        Xem
                      </Link>

                      {doc.status === 'APPROVED' && (
                        <button
                          onClick={() => setHideModal({ docId: doc.id, reason: '' })}
                          className="px-2.5 py-1 bg-red-50 hover:bg-error hover:text-white text-error rounded-lg font-label-code text-caption font-bold transition-colors cursor-pointer"
                        >
                          Ẩn
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-surface-container bg-surface-container-lowest">
            <Pagination
              page={page}
              totalPages={data.totalPages}
              onChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Hide Document Modal */}
      {hideModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-surface-container">
              <span className="material-symbols-outlined text-error text-[24px]">visibility_off</span>
              <h3 className="font-headline-md font-bold text-primary">
                Ẩn tài liệu #DOC-{hideModal.docId}
              </h3>
            </div>

            <p className="font-body-sm text-on-surface leading-relaxed">
              Tài liệu này sẽ bị ẩn khỏi kho tra cứu công khai. Vui lòng nêu rõ lý do để lưu vào lịch sử thẩm định.
            </p>

            <div className="space-y-1.5">
              <label className="font-headline-sm text-body-sm text-primary font-bold">
                Lý do ẩn tài liệu *
              </label>
              <textarea
                className="w-full border border-outline-variant/60 rounded-xl p-3 min-h-[100px] font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                placeholder="Ví dụ: Có khiếu nại bản quyền, tài liệu sai lệch số liệu..."
                value={hideModal.reason}
                onChange={(e) => setHideModal({ ...hideModal, reason: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setHideModal(null)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-body-sm font-semibold transition-all cursor-pointer"
                disabled={actionLoading}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleHide}
                disabled={actionLoading}
                className="px-5 py-2 bg-error hover:bg-error-container text-on-error hover:text-on-error-container rounded-xl font-body-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận Ẩn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
