import { useState } from 'react'
import { documentApi } from '../api/documentApi'
import CustomSelect from './ui/CustomSelect'

interface ReportModalProps {
  documentId: number
  documentTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ReportModal({
  documentId,
  documentTitle,
  isOpen,
  onClose,
  onSuccess,
}: ReportModalProps) {
  const [reasonCode, setReasonCode] = useState('COPYRIGHT')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || description.length < 10) {
      setError('Vui lòng nhập lý do cụ thể tối thiểu 10 ký tự.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await documentApi.report(documentId, reasonCode, description)
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      setError(errorObj.response?.data?.message || 'Có lỗi xảy ra khi gửi báo cáo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="font-bold text-slate-900">Báo cáo vi phạm</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Tài liệu bị báo cáo
            </label>
            <p className="text-sm font-medium text-slate-800 line-clamp-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
              {documentTitle}
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Lý do vi phạm *</label>
            <CustomSelect
              value={reasonCode}
              onChange={(val) => setReasonCode(val)}
              options={[
                { value: 'COPYRIGHT', label: 'Vi phạm bản quyền' },
                { value: 'INAPPROPRIATE', label: 'Nội dung không phù hợp / xúc phạm' },
                { value: 'MISLEADING', label: 'Thông tin sai lệch / gian lận học thuật' },
                { value: 'SPAM', label: 'Spam / Trùng lặp' },
                { value: 'OTHER', label: 'Lý do khác' },
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả chi tiết vi phạm *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vui lòng cung cấp chi tiết vi phạm để Ban quản trị hỗ trợ xử lý nhanh nhất..."
              className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden resize-none"
            />
            <span className="text-[11px] text-slate-400">Tối thiểu 10 ký tự</span>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
