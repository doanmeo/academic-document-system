import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  getPendingDocuments, 
  approveDocument, 
  rejectDocument, 
  requestRevision,
  getDocumentReviews
} from '../../api/adminApi'
import { getDocument } from '../../api/documentApi'
import type { PageResponse, DocumentSummary, DocumentDetail } from '../../types/document'
import type { ReviewHistory } from '../../types/admin'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'

export default function PendingList() {
  const [docs, setDocs] = useState<PageResponse<DocumentSummary> | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<DocumentDetail | null>(null)
  const [reviews, setReviews] = useState<ReviewHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  
  const [modal, setModal] = useState<'approve' | 'reject' | 'revision' | null>(null)
  const [modalNote, setModalNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const fetchDocs = () => {
    setLoading(true)
    getPendingDocuments({ page, keyword })
      .then((res) => {
        setDocs(res)
        // If there's content and no item selected yet on desktop, auto-select first item
        if (res.content.length > 0 && selectedId === null) {
          handleSelect(res.content[0].id)
        } else if (res.content.length === 0) {
          setSelectedId(null)
          setSelectedDetail(null)
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải danh sách chờ duyệt:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDocs()
  }, [page, keyword])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleSelect = async (id: number) => {
    setSelectedId(id)
    setDetailLoading(true)
    try {
      const [detail, revs] = await Promise.all([getDocument(id), getDocumentReviews(id)])
      setSelectedDetail(detail)
      setReviews(revs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedId || !modal) return
    if (modal === 'reject' && modalNote.trim().length < 5) {
      alert('Vui lòng nhập lý do từ chối (tối thiểu 5 ký tự)')
      return
    }
    if (modal === 'revision' && modalNote.trim().length === 0) {
      alert('Vui lòng nhập nội dung yêu cầu chỉnh sửa')
      return
    }

    setActionLoading(true)
    try {
      if (modal === 'approve') await approveDocument(selectedId, { note: modalNote })
      if (modal === 'reject') await rejectDocument(selectedId, { note: modalNote })
      if (modal === 'revision') await requestRevision(selectedId, { note: modalNote })

      setToast({
        type: 'success',
        msg:
          modal === 'approve'
            ? 'Đã phê duyệt tài liệu thành công!'
            : modal === 'revision'
            ? 'Đã gửi yêu cầu chỉnh sửa tới tác giả!'
            : 'Đã từ chối tài liệu!',
      })
      setModal(null)
      setModalNote('')
      setSelectedId(null)
      setSelectedDetail(null)
      fetchDocs()
    } catch {
      setToast({ type: 'error', msg: 'Có lỗi xảy ra khi thực hiện thao tác' })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>HỘI ĐỒNG THẨM ĐỊNH &amp; KIỂM DUYỆT HỌC THUẬT</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
            Hàng Đợi Duyệt Tài Liệu
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Thẩm định chất lượng học thuật, kiểm duyệt nội dung đồ án tốt nghiệp, bài tập lớn và giáo trình trước khi công bố.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-xs border border-surface-container flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-code text-body-sm font-bold text-primary">
                {docs ? docs.totalElements : 0} tài liệu
              </span>
              <span className="font-caption text-caption text-on-surface-variant">Chờ thẩm định</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Refresh Bar */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, tác giả, môn học, MSSV..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
          />
        </div>

        <button
          onClick={fetchDocs}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-surface-container-low hover:bg-surface-container text-primary font-body-sm font-semibold rounded-xl transition-all cursor-pointer border border-surface-container"
          title="Làm mới danh sách"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span>Làm mới</span>
        </button>
      </div>

      {/* Main Workspace */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs">
          <Spinner />
          <p className="mt-3 font-body-sm text-on-surface-variant">Đang tải danh sách tài liệu chờ duyệt...</p>
        </div>
      ) : !docs || docs.content.length === 0 ? (
        /* Empty State */
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[36px]">task_alt</span>
          </div>
          <div>
            <h3 className="font-headline-md font-bold text-primary">
              {keyword ? 'Không tìm thấy tài liệu phù hợp' : 'Hàng đợi kiểm duyệt đang trống'}
            </h3>
            <p className="font-body-md text-on-surface-variant max-w-md mx-auto mt-1 leading-relaxed">
              {keyword
                ? `Không có đề tài chờ duyệt nào khớp với từ khóa "${keyword}". Thử tìm với từ khóa khác.`
                : 'Tất cả các tài liệu, đề tài và khóa luận gửi lên đã được hội đồng thẩm định xử lý hoàn tất! Hiện tại không có đề tài nào cần phê duyệt.'}
            </p>
          </div>
          {keyword ? (
            <button
              onClick={() => setKeyword('')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-body-sm font-semibold rounded-xl shadow-xs hover:bg-primary-hover transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">clear</span>
              <span>Xóa bộ lọc tìm kiếm</span>
            </button>
          ) : (
            <Link
              to="/admin/documents"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-body-sm font-semibold rounded-xl shadow-xs hover:bg-primary-hover transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              <span>Xem tất cả tài liệu</span>
            </Link>
          )}
        </div>
      ) : (
        /* Master - Detail Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Documents List (4 cols) */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-surface-container bg-surface-container-low/60 flex items-center justify-between">
              <span className="font-headline-sm font-bold text-primary text-body-sm">
                Đề tài chờ duyệt ({docs.totalElements})
              </span>
              <span className="font-label-code text-caption text-secondary font-bold uppercase tracking-wider">
                UTC • FIT
              </span>
            </div>

            <div className="divide-y divide-surface-container max-h-[640px] overflow-y-auto">
              {docs.content.map((doc) => {
                const isSelected = selectedId === doc.id
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelect(doc.id)}
                    className={`p-4 cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-xs'
                        : 'border-transparent hover:bg-surface-container-low/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-label-code text-caption font-bold text-secondary">
                        #DOC-{doc.id}
                      </span>
                      <span className="font-label-code text-[11px] text-on-surface-variant">
                        {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <h4
                      className={`font-headline-sm text-body-sm font-bold line-clamp-2 ${
                        isSelected ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {doc.title}
                    </h4>

                    <div className="mt-2 flex items-center justify-between gap-2 text-caption font-body-sm text-on-surface-variant">
                      <div className="flex items-center gap-1 truncate">
                        <span className="material-symbols-outlined text-[14px] text-outline">person</span>
                        <span className="truncate">{doc.uploaderName}</span>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-code text-[11px] font-semibold">
                        {doc.subjectName || 'CNTT'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {docs.totalPages > 1 && (
              <div className="p-3 border-t border-surface-container bg-surface-container-lowest">
                <Pagination
                  page={page}
                  totalPages={docs.totalPages}
                  onChange={(p) => setPage(p)}
                />
              </div>
            )}
          </div>

          {/* Right Column: Document Details & Actions (8 cols) */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs p-6 md:p-8">
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary/60">
                  <span className="material-symbols-outlined text-[30px]">touch_app</span>
                </div>
                <h3 className="font-headline-sm font-bold text-primary">Chọn đề tài để thẩm định</h3>
                <p className="font-body-sm text-on-surface-variant max-w-sm leading-relaxed">
                  Click vào một tài liệu từ danh sách bên trái để kiểm tra nội dung và thực hiện phê duyệt.
                </p>
              </div>
            ) : detailLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <Spinner />
                <p className="font-body-sm text-on-surface-variant">Đang tải thông tin chi tiết đề tài...</p>
              </div>
            ) : selectedDetail ? (
              <div className="space-y-6">
                {/* Detail Header */}
                <div className="flex flex-col gap-2 pb-4 border-b border-surface-container">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-label-badge text-caption font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>CHỜ PHÊ DUYỆT</span>
                    </span>

                    <Link
                      to={`/documents/${selectedDetail.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 font-body-sm text-body-sm font-semibold text-secondary hover:underline"
                    >
                      <span>Xem toàn văn PDF</span>
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </Link>
                  </div>

                  <h2 className="font-headline-lg text-headline-lg font-bold text-primary leading-tight mt-1">
                    {selectedDetail.title}
                  </h2>
                </div>

                {/* Academic Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    </div>
                    <div>
                      <span className="font-caption uppercase text-on-surface-variant font-bold text-[11px]">Học phần / Môn học</span>
                      <p className="font-headline-sm text-body-sm font-semibold text-primary">{selectedDetail.subjectName}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    </div>
                    <div>
                      <span className="font-caption uppercase text-on-surface-variant font-bold text-[11px]">Năm học &amp; Khóa</span>
                      <p className="font-headline-sm text-body-sm font-semibold text-primary">{selectedDetail.academicYearName}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <div>
                      <span className="font-caption uppercase text-on-surface-variant font-bold text-[11px]">Người nộp</span>
                      <p className="font-headline-sm text-body-sm font-semibold text-primary">{selectedDetail.uploaderName}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">supervisor_account</span>
                    </div>
                    <div>
                      <span className="font-caption uppercase text-on-surface-variant font-bold text-[11px]">Giảng viên hướng dẫn</span>
                      <p className="font-headline-sm text-body-sm font-semibold text-primary">{selectedDetail.advisorName || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>

                {/* Abstract */}
                <div className="space-y-2">
                  <h3 className="font-headline-sm text-body-sm font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-secondary">description</span>
                    <span>Tóm tắt đề tài (Abstract)</span>
                  </h3>
                  <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container text-body-sm text-on-surface leading-relaxed whitespace-pre-line">
                    {selectedDetail.abstractText || 'Chưa có thông tin tóm tắt.'}
                  </div>
                </div>

                {/* Technologies */}
                {selectedDetail.technologies && selectedDetail.technologies.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-headline-sm text-body-sm font-bold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">code</span>
                      <span>Công nghệ &amp; Thẻ kỹ thuật</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDetail.technologies.map((tech) => (
                        <span
                          key={tech.id}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-label-code text-caption font-semibold"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Members */}
                {selectedDetail.members && selectedDetail.members.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-headline-sm text-body-sm font-bold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">group</span>
                      <span>Thành viên nhóm sinh viên</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedDetail.members.map((m) => (
                        <div
                          key={m.userId}
                          className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                              {m.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-headline-sm text-body-sm font-bold text-primary">{m.fullName}</p>
                              <span className="font-label-code text-caption text-on-surface-variant font-mono">
                                {m.studentCode || 'MSSV'}
                              </span>
                            </div>
                          </div>
                          {m.isLeader && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-label-code text-[11px] font-bold">
                              Trưởng nhóm
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {selectedDetail.files && selectedDetail.files.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-headline-sm text-body-sm font-bold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">attach_file</span>
                      <span>Tệp đính kèm ({selectedDetail.files.length})</span>
                    </h3>
                    <div className="space-y-1.5">
                      {selectedDetail.files.map((f) => (
                        <div
                          key={f.id}
                          className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="material-symbols-outlined text-primary text-[20px]">picture_as_pdf</span>
                            <span className="font-body-sm font-semibold text-on-surface truncate">{f.fileName}</span>
                          </div>
                          <span className="font-label-code text-caption text-on-surface-variant shrink-0 ml-2">
                            {(f.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review History */}
                {reviews.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-surface-container">
                    <h3 className="font-headline-sm text-body-sm font-bold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">history</span>
                      <span>Lịch sử đánh giá của Hội đồng</span>
                    </h3>
                    <div className="space-y-2.5">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-headline-sm text-body-sm font-bold text-primary">
                              {rev.reviewerName}
                            </span>
                            <span className="font-label-code text-caption text-on-surface-variant">
                              {new Date(rev.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-body-sm text-on-surface-variant">
                            Chuyển trạng thái từ <b className="text-primary">{rev.fromStatus}</b> sang{' '}
                            <b className="text-primary">{rev.toStatus}</b>
                          </p>
                          {rev.comment && (
                            <p className="p-2.5 bg-white rounded-lg text-body-sm italic text-on-surface border border-surface-container">
                              "{rev.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-6 border-t border-surface-container flex flex-wrap gap-3">
                  <button
                    onClick={() => setModal('approve')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-headline-sm text-body-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Phê duyệt đề tài</span>
                  </button>

                  <button
                    onClick={() => setModal('revision')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-headline-sm text-body-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">sync</span>
                    <span>Yêu cầu chỉnh sửa</span>
                  </button>

                  <button
                    onClick={() => setModal('reject')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-error hover:bg-error-container text-on-error hover:text-on-error-container font-headline-sm text-body-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    <span>Từ chối đề tài</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Action Dialog Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-surface-container">
              <span
                className={`material-symbols-outlined text-[24px] ${
                  modal === 'approve'
                    ? 'text-emerald-600'
                    : modal === 'revision'
                    ? 'text-amber-500'
                    : 'text-error'
                }`}
              >
                {modal === 'approve' ? 'check_circle' : modal === 'revision' ? 'sync' : 'cancel'}
              </span>
              <h3 className="font-headline-md font-bold text-primary">
                {modal === 'approve' && 'Phê duyệt tài liệu'}
                {modal === 'revision' && 'Yêu cầu sinh viên chỉnh sửa'}
                {modal === 'reject' && 'Từ chối tài liệu'}
              </h3>
            </div>

            <p className="font-body-sm text-on-surface-variant">
              {modal === 'approve' && 'Tài liệu sẽ được chuyển sang trạng thái APPROVED và công khai trên toàn hệ thống.'}
              {modal === 'revision' && 'Sinh viên sẽ nhận được thông báo yêu cầu chỉnh sửa và có thể cập nhật lại tài liệu.'}
              {modal === 'reject' && 'Vui lòng cung cấp lý do từ chối rõ ràng để sinh viên nắm được thông tin.'}
            </p>

            <div className="space-y-1.5">
              <label className="font-headline-sm text-body-sm text-primary font-bold">
                {modal === 'approve' ? 'Ghi chú phê duyệt (tùy chọn)' : 'Lý do / Hướng dẫn điều chỉnh *'}
              </label>
              <textarea
                className="w-full border border-outline-variant/60 rounded-xl p-3 min-h-[110px] font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                placeholder={
                  modal === 'approve'
                    ? 'Nhập nhận xét hoặc lời khen ngợi (nếu có)...'
                    : 'Nhập nội dung chi tiết cần bổ sung, sửa chữa...'
                }
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setModal(null)
                  setModalNote('')
                }}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-body-sm font-semibold transition-all cursor-pointer"
                disabled={actionLoading}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`px-5 py-2 text-white rounded-xl font-body-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  modal === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : modal === 'revision'
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-error hover:bg-error-container text-on-error hover:text-on-error-container'
                }`}
              >
                {actionLoading ? <Spinner size={4} /> : 'Xác nhận thực hiện'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
