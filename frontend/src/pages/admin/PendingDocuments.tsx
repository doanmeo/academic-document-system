import { useState, useEffect } from 'react'
import type { DocumentSummary } from '../../types'
import { adminApi } from '../../api/adminApi'
import { toast } from 'sonner'

export default function PendingDocuments() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')

  // Modal states
  const [activeModal, setActiveModal] = useState<{
    type: 'APPROVE' | 'REJECT' | 'REVISE' | null
    doc: DocumentSummary | null
  }>({ type: null, doc: null })
  const [note, setNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    adminApi
      .getPendingDocuments(0, 20, keyword)
      .then((res) => {
        if (res.success && res.data) {
          setDocuments(res.data.content || [])
        } else {
          setDocuments([])
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Không thể tải danh sách tài liệu chờ duyệt'
        toast.error(msg)
        setDocuments([])
      })
      .finally(() => setLoading(false))
  }, [keyword])

  const handleAction = async () => {
    if (!activeModal.doc || !activeModal.type) return

    if (activeModal.type === 'REJECT' && (!note.trim() || note.length < 5)) {
      setError('Vui lòng nhập lý do từ chối (tối thiểu 5 ký tự) để sinh viên nắm được thông tin.')
      return
    }

    try {
      setActionLoading(true)
      setError(null)
      const docId = activeModal.doc.id

      if (activeModal.type === 'APPROVE') {
        await adminApi.approveDocument(docId, note)
        toast.success('Thao tác phê duyệt tài liệu thành công!')
      } else if (activeModal.type === 'REJECT') {
        await adminApi.rejectDocument(docId, note)
        toast.success('Đã từ chối tài liệu và gửi phản hồi cho sinh viên!')
      } else if (activeModal.type === 'REVISE') {
        await adminApi.requestRevision(docId, note)
        toast.success('Đã gửi yêu cầu chỉnh sửa tài liệu!')
      }

      // Remove from pending list
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      closeModal()
    } catch (err: unknown) {
      const errResponse = err as { response?: { data?: { message?: string } }; message?: string }
      const msg = errResponse.response?.data?.message || errResponse.message || 'Thao tác xét duyệt thất bại'
      setError(msg)
      toast.error(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const closeModal = () => {
    setActiveModal({ type: null, doc: null })
    setNote('')
    setError(null)
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Xét duyệt tài liệu chờ nộp
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kiểm tra tính hợp lệ của tài liệu khoa học trước khi cho phép hiển thị công khai.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
          {documents.length} tài liệu chờ xử lý
        </span>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc tên sinh viên..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
          />
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Pending List Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400 animate-pulse">
          Đang tải danh sách chờ duyệt...
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 text-base">Hàng đợi xét duyệt đã trống</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tất cả tài liệu nộp lên đã được xem xét và xử lý hoàn tất!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Tài liệu & Tóm tắt</th>
                  <th className="py-4 px-6">Sinh viên nộp</th>
                  <th className="py-4 px-6">Môn học / Hướng dẫn</th>
                  <th className="py-4 px-6">Thời gian nộp</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 max-w-sm">
                      <p className="font-bold text-slate-900 line-clamp-1">{doc.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {doc.abstractText}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                        {doc.documentTypeLabel}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{doc.uploaderName}</p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-800">{doc.subjectName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        GVHD: {doc.advisorName || 'Chưa có'}
                      </p>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-slate-500">
                      {new Date(doc.createdAt).toLocaleString('vi-VN')}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveModal({ type: 'APPROVE', doc })}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Phê duyệt
                        </button>
                        <button
                          onClick={() => setActiveModal({ type: 'REJECT', doc })}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => setActiveModal({ type: 'REVISE', doc })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Yêu cầu sửa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Dialog Modal */}
      {activeModal.type && activeModal.doc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {activeModal.type === 'APPROVE' && 'Xác nhận Phê duyệt tài liệu'}
                {activeModal.type === 'REJECT' && 'Từ chối tài liệu'}
                {activeModal.type === 'REVISE' && 'Yêu cầu sinh viên chỉnh sửa lại'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Đề tài:</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{activeModal.doc.title}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {activeModal.type === 'APPROVE' && 'Ghi chú phê duyệt (tùy chọn)'}
                  {activeModal.type === 'REJECT' && 'Lý do từ chối (bắt buộc) *'}
                  {activeModal.type === 'REVISE' && 'Nội dung cần chỉnh sửa (bắt buộc) *'}
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    activeModal.type === 'REJECT'
                      ? 'Nêu rõ lý do từ chối để sinh viên sửa đổi...'
                      : 'Nhập ghi chú cho quyết định...'
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden resize-none"
                />
              </div>

              {error && <p className="text-xs text-rose-600">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAction}
                  disabled={actionLoading}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs cursor-pointer ${
                    activeModal.type === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : activeModal.type === 'REJECT'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
