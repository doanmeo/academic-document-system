import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { DocumentSummary } from '../types'

interface DocumentRevisionModalProps {
  doc: DocumentSummary | null
  isOpen: boolean
  onClose: () => void
  onSubmitRevision: (data: {
    title: string
    abstractText: string
    githubUrl: string
    justification: string
    file?: File
  }) => Promise<void> | void
}

export default function DocumentRevisionModal({
  doc,
  isOpen,
  onClose,
  onSubmitRevision,
}: DocumentRevisionModalProps) {
  const [title, setTitle] = useState(doc?.title || '')
  const [abstractText, setAbstractText] = useState(doc?.abstractText || '')
  const [githubUrl, setGithubUrl] = useState('')
  const [justification, setJustification] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Checklist state
  const [check1, setCheck1] = useState(true)
  const [check2, setCheck2] = useState(true)
  const [check3, setCheck3] = useState(true)
  const [check4, setCheck4] = useState(true)

  useEffect(() => {
    if (doc) {
      setTitle(doc.title || '')
      setAbstractText(doc.abstractText || '')
      setGithubUrl('')
      setJustification('')
      setNewFile(null)
    }
  }, [doc])

  if (!isOpen || !doc) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmitRevision({
        title,
        abstractText,
        githubUrl,
        justification,
        file: newFile || undefined,
      })
      onClose()
    } catch {
      // Handled in parent
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#f8fafc] rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top bar */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs font-semibold">
              ← Quay lại
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-mono font-bold text-slate-700">MÃ ĐƠN: UTC-K64-0199</span>
            <span className="text-xs text-slate-500 hidden sm:inline">/ Chỉnh sửa hồ sơ</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              TRẠNG THÁI: YÊU CẦU CHỈNH SỬA
            </span>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
        </div>

        {/* Warning Review Box (Screen 12) */}
        <div className="p-6">
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <span className="p-1 rounded-lg bg-rose-200 text-rose-800">⚠️</span>
                <span>Yêu cầu điều chỉnh từ Ban Quản trị / Giảng viên hướng dẫn</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200/80 font-mono">
                  HẠN XỬ LÝ: 17:00 - 28/03/2026
                </span>
              </div>
              <span className="text-[11px] text-slate-600 font-medium">
                Người duyệt: <strong className="text-rose-900">ThS. Đào Thị Lệ Thủy (Bộ môn HTTT)</strong>
              </span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-rose-100">
              "Đề án thiếu link kho mã nguồn công khai (GitHub repo) và sơ đồ kiến trúc ERD chỉ để ở định dạng vector độ phân giải cao tại Chương 2. Vui lòng bổ sung trước 17:00 ngày 28/03/2026 để kịp phiên thẩm định bảo vệ đợt 1."
            </p>
            <div className="flex items-center gap-4 text-[11px] text-rose-700 font-mono">
              <span>⏱ Còn lại: 36 ngày 14 giờ</span>
              <span>•</span>
              <span>Hỗ trợ phản hồi: thuy.dtl@utc.edu.vn</span>
            </div>
          </div>
        </div>

        {/* Form Body: Left Form (7 cols) + Right Checklist (5 cols) */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 8 cols */}
          <div className="lg:col-span-8 space-y-5">
            {/* Academic Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Thông tin học thuật đề tài
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">UTC-IT • KHOAHOC64</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề đề tài (Bản sửa) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Môn học / Học phần
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Cơ sở dữ liệu Nâng cao (MC: IT-CSDL2)"
                    className="w-full text-xs bg-slate-100 text-slate-600 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khóa & Niên khóa
                  </label>
                  <input
                    type="text"
                    disabled
                    value="K64 (2024 - 2025)"
                    className="w-full text-xs bg-slate-100 text-slate-600 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giảng viên hướng dẫn (GVHD)
                </label>
                <input
                  type="text"
                  disabled
                  value="ThS. Hoàng Tuấn Minh (Bộ môn Hệ thống thông tin)"
                  className="w-full text-xs bg-slate-100 text-slate-600 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tóm tắt đề tài (Abstract) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={abstractText}
                  onChange={(e) => setAbstractText(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden resize-none"
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Danh mục công nghệ & Thư viện (Tags)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Java 21', 'Cassandra', 'Docker', 'Kafka', 'Spring Boot'].map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Attached Files & Source Code (Screen 12) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Tệp đính kèm & Kho mã nguồn [Theo yêu cầu sửa đổi]
                </h3>
                <span className="text-[10px] font-bold text-rose-600 uppercase">MỤC BẮT BUỘC ĐỔI</span>
              </div>

              {/* Old file item */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">report_cassandra_v1.pdf</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                        BẢN CŨ
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">15.2 MB • 42 Trang • Có lỗi sơ đồ Chương 2</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info('Xem lại tệp đính kèm phiên bản trước')}
                  className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
                >
                  Xem lại
                </button>
              </div>

              {/* Replacement Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tải lên tệp PDF thay thế mới (Version 2.0) *
                </label>
                <div className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-5 text-center bg-blue-50/20 cursor-pointer">
                  <input
                    type="file"
                    id="replace-pdf"
                    accept=".pdf"
                    onChange={(e) => e.target.files && setNewFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="replace-pdf" className="cursor-pointer block">
                    <p className="text-xs font-bold text-blue-800">
                      {newFile ? `✓ Đã chọn: ${newFile.name}` : 'Kéo thả tệp PDF đã chỉnh sửa vào đây, hoặc chọn từ thiết bị'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Cam kết đã dung hòa sơ đồ vector và ERD dpi cao (&gt; 300 DPI)
                    </p>
                  </label>
                </div>
              </div>

              {/* GitHub Repo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn kho mã nguồn (GitHub Repo công khai) *
                </label>
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Justification Box (Screen 12) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Giải trình các điểm đã điều chỉnh với ThS. Đào Thị Lệ Thủy
                  </label>
                  <span className="text-[10px] text-blue-700 font-bold uppercase">LỜI NHẮN KÈM ĐƠN</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Mô tả cụ thể những nội dung em đã sửa đổi theo yêu cầu của thầy/cô..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Checklist: 4 cols */}
          <div className="lg:col-span-4 space-y-5">
            {/* Checklist */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>☑️</span> Kiểm tra trước khi nộp
              </h3>

              <div className="space-y-2.5 text-xs text-slate-700">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={check1}
                    onChange={(e) => setCheck1(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600"
                  />
                  <span>Đã nhúng sơ đồ ERD vector chuẩn tại Chương 2</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={check2}
                    onChange={(e) => setCheck2(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600"
                  />
                  <span>Repo có file README hướng dẫn chạy Docker/K8s</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={check3}
                    onChange={(e) => setCheck3(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600"
                  />
                  <span>Điểm đạo văn đạt chuẩn quy chế UTC (&lt; 20%)</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={check4}
                    onChange={(e) => setCheck4(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600"
                  />
                  <span>Đã gắn quyền sở hữu trí tuệ học thuật Khoa CNTT</span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>TIÊU CHÍ HOÀN TẤT:</span>
                <span>4/4 TIÊU CHÍ</span>
              </div>
            </div>

            {/* Advisor Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase">HỒ SƠ THẨM ĐỊNH:</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  TM
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">ThS. Hoàng Tuấn Minh</p>
                  <p className="text-[11px] text-slate-500">Giảng viên hướng dẫn trực tiếp</p>
                  <p className="text-[10px] text-slate-400">Khoa CNTT - Bộ môn Hệ thống Thông tin</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase">Lịch sử thẩm định:</h4>
              <div className="space-y-3 text-xs">
                <div className="border-l-2 border-rose-500 pl-3 space-y-0.5">
                  <p className="font-bold text-rose-700">14/02/2026 • 09:20</p>
                  <p className="font-medium text-slate-800">Yêu cầu chỉnh sửa</p>
                  <p className="text-[11px] text-slate-500">ThS. Đào Thị Lệ Thủy thẩm định bản sơ thảo</p>
                </div>
                <div className="border-l-2 border-slate-300 pl-3 space-y-0.5">
                  <p className="font-bold text-slate-500">10/01/2026 • 15:00</p>
                  <p className="font-medium text-slate-800">Nộp bản thảo v1</p>
                  <p className="text-[11px] text-slate-500">Sinh viên khởi tạo đề tài đăng ký</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="lg:col-span-12 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Hủy thay đổi
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  toast.success('Đã lưu bản nháp thành công!')
                  onClose()
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Lưu bản nháp
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi Thẩm định lại [Submit for Re-review]'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
