import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FolderArchive,
  Plus,
  Share2,
  Trash2,
  ExternalLink,
  BookOpen,
  Check,
  Calendar,
  Lock,
  Globe,
  Loader2,
  FileText,
  ChevronRight,
  FolderOpen
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Collection } from '../types/document'
import { collectionApi } from '../api/collectionApi'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export const Collections: React.FC = () => {
  const { shareToken } = useParams<{ shareToken?: string }>()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCol, setSelectedCol] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Create Modal
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (shareToken) {
      loadPublicCollection(shareToken)
    } else {
      loadUserCollections()
    }
  }, [shareToken])

  const loadPublicCollection = async (token: string) => {
    try {
      setLoading(true)
      const col = await collectionApi.getPublicCollection(token)
      setSelectedCol(col)
    } catch {
      addToast('error', 'Không tìm thấy bộ sưu tập hoặc liên kết đã hết hạn')
    } finally {
      setLoading(false)
    }
  }

  const loadUserCollections = async () => {
    try {
      setLoading(true)
      const list = await collectionApi.getUserCollections()
      setCollections(list)
      if (list.length > 0) {
        const detail = await collectionApi.getCollectionDetail(list[0].id)
        setSelectedCol(detail)
      }
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCollection = async (col: Collection) => {
    try {
      setLoading(true)
      const detail = await collectionApi.getCollectionDetail(col.id)
      setSelectedCol(detail)
    } catch {
      addToast('error', 'Không thể tải chi tiết bộ sưu tập')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      setSubmitting(true)
      await collectionApi.createCollection({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        isPublic,
      })
      addToast('success', 'Đã tạo bộ sưu tập mới!')
      setShowCreate(false)
      setNewTitle('')
      setNewDesc('')
      loadUserCollections()
    } catch {
      addToast('error', 'Lỗi khi tạo bộ sưu tập')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCollection = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bộ sưu tập này?')) return
    try {
      await collectionApi.deleteCollection(id)
      addToast('success', 'Đã xóa bộ sưu tập')
      setSelectedCol(null)
      loadUserCollections()
    } catch {
      addToast('error', 'Không thể xóa bộ sưu tập')
    }
  }

  const handleRemoveItem = async (colId: number, docId: number) => {
    try {
      await collectionApi.removeItemFromCollection(colId, docId)
      addToast('success', 'Đã xóa tài liệu khỏi bộ sưu tập')
      if (selectedCol) {
        const updated = await collectionApi.getCollectionDetail(selectedCol.id)
        setSelectedCol(updated)
      }
    } catch {
      addToast('error', 'Lỗi khi xóa tài liệu')
    }
  }

  const handleCopyShareLink = () => {
    if (!selectedCol?.shareToken) return
    const url = `${window.location.origin}/collections/public/${selectedCol.shareToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    addToast('success', 'Đã sao chép liên kết chia sẻ bộ sưu tập!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-150">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
            <Link to="/search" className="hover:text-blue-600 dark:hover:text-blue-400">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Bộ Sưu Tập Cá Nhân &amp; Nhóm</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <span>Bộ Sưu Tập &amp; Góc Học Tập Nhóm</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Gom nhóm tài liệu học tập theo từng môn thi, đề tài đồ án tốt nghiệp hoặc chia sẻ cho các thành viên trong nhóm.
              </p>
            </div>

            {!shareToken && (
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo bộ sưu tập mới</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: List of collections */}
            {!shareToken && (
              <div className="lg:col-span-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  Bộ sưu tập của bạn ({collections.length})
                </h3>
                {collections.length === 0 ? (
                  <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500 shadow-xs">
                    Chưa có bộ sưu tập nào. Nhấn nút tạo phía trên để bắt đầu gom nhóm học liệu!
                  </div>
                ) : (
                  collections.map((col) => (
                    <div
                      key={col.id}
                      onClick={() => handleSelectCollection(col)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedCol?.id === col.id
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{col.title}</h4>
                        {col.isPublic ? (
                          <Globe className="w-4 h-4 text-blue-500 shrink-0" title="Công khai" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" title="Riêng tư" />
                        )}
                      </div>
                      {col.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{col.description}</p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-mono">
                        <span>{col.itemCount || 0} tài liệu</span>
                        <span>{new Date(col.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Right side: Items in collection */}
            <div className={shareToken ? 'lg:col-span-12' : 'lg:col-span-8'}>
              {loading ? (
                <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Đang tải tài liệu trong bộ sưu tập...</span>
                </div>
              ) : selectedCol ? (
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
                  {/* Detail Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{selectedCol.title}</h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                          {selectedCol.items?.length || 0} tài liệu
                        </span>
                      </div>
                      {selectedCol.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedCol.description}</p>
                      )}
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Người tạo: {selectedCol.userFullName} • Cập nhật: {new Date(selectedCol.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyShareLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        title="Sao chép liên kết chia sẻ cho bạn bè"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Đã chép link' : 'Chia sẻ link'}</span>
                      </button>

                      {!shareToken && (
                        <button
                          onClick={() => handleDeleteCollection(selectedCol.id)}
                          className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-xs transition-colors cursor-pointer"
                          title="Xóa bộ sưu tập"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  {(!selectedCol.items || selectedCol.items.length === 0) ? (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                      <FolderOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bộ sưu tập này hiện chưa có tài liệu nào.</p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Hãy bấm vào biểu tượng "Thêm vào bộ sưu tập" tại trang chi tiết bất kỳ tài liệu nào để lưu trữ vào đây!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCol.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-blue-400 dark:hover:border-blue-500 transition-all gap-4"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0 mt-0.5">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/documents/${item.documentId}`}
                                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 transition-colors block"
                              >
                                {item.documentTitle}
                              </Link>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                                <span>Môn: {item.subjectName}</span>
                                <span>•</span>
                                <span>{item.documentTypeLabel}</span>
                              </div>
                              {item.note && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 italic mt-1">
                                  Ghi chú: {item.note}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              to={`/documents/${item.documentId}`}
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Xem chi tiết"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            {!shareToken && (
                              <button
                                onClick={() => handleRemoveItem(selectedCol.id, item.documentId)}
                                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Xóa khỏi bộ sưu tập"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 text-xs">
                  Chọn một bộ sưu tập bên trái để xem nội dung
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Tạo Bộ Sưu Tập Mới</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên bộ sưu tập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Vd: Ôn tập môn CSDL phân tán, Đề tài tốt nghiệp..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mô tả mục đích</label>
                <textarea
                  rows={2}
                  placeholder="Vd: Bộ tài liệu phục vụ ôn thi kết thúc học phần và làm bài tập lớn nhóm 3."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="colPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-600"
                />
                <label htmlFor="colPublic" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Cho phép chia sẻ công khai qua đường link bí mật
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo bộ sưu tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Collections
