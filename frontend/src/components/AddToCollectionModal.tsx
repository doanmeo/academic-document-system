import React, { useEffect, useState } from 'react'
import { FolderPlus, Plus, Check, X, Loader2, BookOpen } from 'lucide-react'
import { Collection } from '../types/document'
import { collectionApi } from '../api/collectionApi'
import { useToast } from '../contexts/ToastContext'

interface AddToCollectionModalProps {
  documentId: number
  documentTitle: string
  isOpen: boolean
  onClose: () => void
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  documentId,
  documentTitle,
  isOpen,
  onClose,
}) => {
  const { addToast } = useToast()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [note, setNote] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const data = await collectionApi.getUserCollections()
      setCollections(data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCollections()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      setCreating(true)
      const created = await collectionApi.createCollection({
        title: newTitle.trim(),
        description: 'Tạo từ tài liệu: ' + documentTitle,
        isPublic: true,
      })
      addToast('success', 'Đã tạo bộ sưu tập mới!')
      setNewTitle('')
      setShowCreate(false)
      // Auto add item into newly created collection
      await collectionApi.addItemToCollection(created.id, {
        documentId,
        note: note.trim() || undefined,
      })
      addToast('success', 'Đã lưu tài liệu vào bộ sưu tập!')
      onClose()
    } catch {
      addToast('error', 'Lỗi khi tạo bộ sưu tập')
    } finally {
      setCreating(false)
    }
  }

  const handleAddToCollection = async (collectionId: number) => {
    try {
      setSavingId(collectionId)
      await collectionApi.addItemToCollection(collectionId, {
        documentId,
        note: note.trim() || undefined,
      })
      addToast('success', 'Đã thêm tài liệu vào bộ sưu tập!')
      onClose()
    } catch {
      addToast('error', 'Tài liệu đã có trong bộ sưu tập này hoặc lỗi mạng')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <FolderPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Thêm vào Bộ sưu tập</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate">
            Tài liệu: <span className="font-semibold text-slate-700 dark:text-slate-200">{documentTitle}</span>
          </p>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Ghi chú cá nhân (tùy chọn):
            </label>
            <input
              type="text"
              placeholder="Vd: Ôn chương 3, áp dụng cho phần 2 đồ án..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* List existing collections */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {loading ? (
              <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span>Đang tải bộ sưu tập...</span>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                Bạn chưa có bộ sưu tập nào. Hãy tạo bộ sưu tập đầu tiên bên dưới!
              </div>
            ) : (
              collections.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer"
                  onClick={() => handleAddToCollection(col.id)}
                >
                  <div className="flex items-center space-x-2.5">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{col.title}</h4>
                      <span className="text-[10px] text-slate-400">{col.itemCount || 0} tài liệu</span>
                    </div>
                  </div>
                  <button
                    disabled={savingId === col.id}
                    className="px-2.5 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center space-x-1"
                  >
                    {savingId === col.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    <span>Lưu vào đây</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Create new */}
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo bộ sưu tập mới</span>
            </button>
          ) : (
            <form onSubmit={handleCreateCollection} className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tên bộ sưu tập mới:
              </label>
              <input
                type="text"
                placeholder="Vd: Ôn thi cuối kỳ CSDL, Khóa luận 2026..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1 text-xs rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || creating}
                  className="px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 flex items-center space-x-1"
                >
                  {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  <span>Tạo & Lưu</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
export default AddToCollectionModal
