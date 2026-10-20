import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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
  FolderOpen,
  Search,
  SlidersHorizontal,
  Filter,
  Sparkles,
  Copy,
  Edit3,
  Save,
  X,
  Eye,
  Download,
  Star,
  Tag,
  ArrowUpDown,
  GraduationCap,
  UserCheck,
  RefreshCw,
  Quote,
  Layers,
  ArrowRight,
  FileCheck2,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Collection, CollectionItem, CitationFormat } from '../types/document'
import { collectionApi } from '../api/collectionApi'
import { generateClientCitation } from '../api/documentApi'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import PdfViewerModal from '../components/PdfViewerModal'
import CustomSelect from '../components/ui/CustomSelect'
import CustomCheckbox from '../components/ui/CustomCheckbox'

// Preset templates for quick collection creation
const ACADEMIC_PRESETS = [
  {
    title: 'Ôn thi KTHP Kỳ này',
    description: 'Tổng hợp Đề thi các năm, Slide bài giảng và Đề cương ôn tập trọng tâm.',
    icon: '🎓',
  },
  {
    title: 'Hồ sơ Đồ án / BTL Nhóm',
    description: 'Tài liệu tham khảo, khung báo cáo kỹ thuật và bài mẫu điểm A của khóa trước.',
    icon: '💻',
  },
  {
    title: 'Nghiên cứu Khóa luận Tốt nghiệp',
    description: 'Kho tư liệu cơ sở lý thuyết, bài báo khoa học và các luận văn điểm cao cùng chuyên ngành.',
    icon: '📜',
  },
]

export const Collections: React.FC = () => {
  const { shareToken } = useParams<{ shareToken?: string }>()
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCol, setSelectedCol] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [cloning, setCloning] = useState(false)

  // Collection list search
  const [colSearchQuery, setColSearchQuery] = useState('')

  // In-collection filters & sorting
  const [itemKeyword, setItemKeyword] = useState('')
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('ALL')
  const [itemSubjectFilter, setItemSubjectFilter] = useState<string>('ALL')
  const [itemSortBy, setItemSortBy] = useState<'default' | 'title' | 'rating' | 'views'>('default')

  // Modals state
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Edit Collection Modal
  const [showEdit, setShowEdit] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPublic, setEditPublic] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Edit Note Modal
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null)
  const [itemNoteText, setItemNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Batch Citation Export Modal
  const [showCitationModal, setShowCitationModal] = useState(false)
  const [citationFormat, setCitationFormat] = useState<CitationFormat>('IEEE')
  const [copiedCitations, setCopiedCitations] = useState(false)

  // PDF Viewer Modal
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean
    fileId?: number
    title?: string
    fileName?: string
  }>({
    isOpen: false,
  })

  // Load data on mount or shareToken change
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
      toast.error('Không tìm thấy bộ sưu tập hoặc liên kết đã hết hạn!')
    } finally {
      setLoading(false)
    }
  }

  const loadUserCollections = async (keepSelectedId?: number) => {
    try {
      setLoading(true)
      const list = await collectionApi.getUserCollections()
      setCollections(list)
      if (list.length > 0) {
        const targetId = keepSelectedId && list.some((c) => c.id === keepSelectedId) ? keepSelectedId : list[0].id
        loadCollectionDetail(targetId)
      } else {
        setSelectedCol(null)
      }
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  const loadCollectionDetail = async (colId: number) => {
    try {
      setDetailLoading(true)
      const detail = await collectionApi.getCollectionDetail(colId)
      setSelectedCol(detail)
    } catch {
      toast.error('Không thể tải chi tiết bộ sưu tập')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSelectCollection = (col: Collection) => {
    if (selectedCol?.id === col.id) return
    loadCollectionDetail(col.id)
  }

  // Create Collection
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      setSubmitting(true)
      const created = await collectionApi.createCollection({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        isPublic,
      })
      toast.success('Đã tạo bộ sưu tập mới!')
      setShowCreate(false)
      setNewTitle('')
      setNewDesc('')
      loadUserCollections(created.id)
    } catch {
      toast.error('Lỗi khi tạo bộ sưu tập')
    } finally {
      setSubmitting(false)
    }
  }

  // Apply Preset
  const handleApplyPreset = (preset: typeof ACADEMIC_PRESETS[0]) => {
    setNewTitle(preset.title)
    setNewDesc(preset.description)
    setShowCreate(true)
  }

  // Edit Collection
  const openEditModal = () => {
    if (!selectedCol) return
    setEditTitle(selectedCol.title)
    setEditDesc(selectedCol.description || '')
    setEditPublic(selectedCol.isPublic)
    setShowEdit(true)
  }

  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCol || !editTitle.trim()) return

    try {
      setUpdating(true)
      const updated = await collectionApi.updateCollection(selectedCol.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        isPublic: editPublic,
      })
      toast.success('Đã cập nhật thông tin bộ sưu tập!')
      setShowEdit(false)
      setSelectedCol(updated)
      setCollections((prev) => prev.map((c) => (c.id === updated.id ? { ...c, title: updated.title, description: updated.description, isPublic: updated.isPublic } : c)))
    } catch {
      toast.error('Không thể cập nhật bộ sưu tập')
    } finally {
      setUpdating(false)
    }
  }

  // Regenerate Share Token
  const handleRegenerateToken = async () => {
    if (!selectedCol) return
    if (!window.confirm('Bạn có chắc muốn tạo lại đường link chia sẻ? Đường link cũ sẽ không còn hiệu lực.')) return

    try {
      const updated = await collectionApi.regenerateShareToken(selectedCol.id)
      setSelectedCol(updated)
      toast.success('Đã cấp đường link chia sẻ mới!')
    } catch {
      toast.error('Lỗi khi tạo lại đường link')
    }
  }

  // Delete Collection
  const handleDeleteCollection = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bộ sưu tập này? Mọi liên kết học liệu trong bộ sưu tập sẽ bị hủy.')) return
    try {
      await collectionApi.deleteCollection(id)
      toast.success('Đã xóa bộ sưu tập')
      loadUserCollections()
    } catch {
      toast.error('Không thể xóa bộ sưu tập')
    }
  }

  // Remove Item
  const handleRemoveItem = async (colId: number, docId: number) => {
    try {
      await collectionApi.removeItemFromCollection(colId, docId)
      toast.success('Đã gỡ tài liệu khỏi bộ sưu tập')
      if (selectedCol) {
        const updated = await collectionApi.getCollectionDetail(selectedCol.id)
        setSelectedCol(updated)
        setCollections((prev) => prev.map((c) => (c.id === selectedCol.id ? { ...c, itemCount: (c.itemCount || 1) - 1 } : c)))
      }
    } catch {
      toast.error('Lỗi khi xóa tài liệu')
    }
  }

  // Edit Note
  const openEditNoteModal = (item: CollectionItem) => {
    setEditingItem(item)
    setItemNoteText(item.note || '')
  }

  const handleSaveItemNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCol || !editingItem) return

    try {
      setSavingNote(true)
      await collectionApi.updateCollectionItem(selectedCol.id, editingItem.documentId, {
        note: itemNoteText.trim(),
      })
      toast.success('Đã lưu ghi chú học tập!')
      setEditingItem(null)
      loadCollectionDetail(selectedCol.id)
    } catch {
      toast.error('Không thể lưu ghi chú')
    } finally {
      setSavingNote(false)
    }
  }

  // Clone Public Collection
  const handleCloneCollection = async () => {
    if (!selectedCol || !selectedCol.shareToken) return
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu bản sao bộ sưu tập vào tài khoản của bạn')
      navigate('/login')
      return
    }

    try {
      setCloning(true)
      const cloned = await collectionApi.cloneCollection(selectedCol.shareToken)
      toast.success(`Đã sao chép thành công bộ sưu tập "${cloned.title}" vào tài khoản của bạn!`)
      navigate('/collections')
    } catch {
      toast.error('Lỗi khi sao chép bộ sưu tập')
    } finally {
      setCloning(false)
    }
  }

  // Copy share URL
  const handleCopyShareLink = () => {
    if (!selectedCol?.shareToken) return
    const url = `${window.location.origin}/collections/public/${selectedCol.shareToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Đã sao chép liên kết chia sẻ bộ sưu tập!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Filter collections in left pane
  const filteredCollections = useMemo(() => {
    if (!colSearchQuery.trim()) return collections
    const q = colSearchQuery.toLowerCase()
    return collections.filter(
      (c) => c.title.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
    )
  }, [collections, colSearchQuery])

  // Distinct Subjects in current collection
  const availableSubjects = useMemo(() => {
    if (!selectedCol?.items) return []
    const set = new Set<string>()
    selectedCol.items.forEach((item) => {
      if (item.subjectName) set.add(item.subjectName)
    })
    return Array.from(set).sort()
  }, [selectedCol])

  // Distinct Types in current collection
  const availableTypes = useMemo(() => {
    if (!selectedCol?.items) return []
    const map = new Map<string, string>()
    selectedCol.items.forEach((item) => {
      map.set(item.documentTypeCode, item.documentTypeLabel || item.documentTypeCode)
    })
    return Array.from(map.entries())
  }, [selectedCol])

  // Filter & sort items in right pane
  const filteredItems = useMemo(() => {
    if (!selectedCol?.items) return []
    let list = [...selectedCol.items]

    if (itemKeyword.trim()) {
      const q = itemKeyword.toLowerCase()
      list = list.filter(
        (it) =>
          it.documentTitle.toLowerCase().includes(q) ||
          (it.note && it.note.toLowerCase().includes(q)) ||
          (it.subjectName && it.subjectName.toLowerCase().includes(q))
      )
    }

    if (itemTypeFilter !== 'ALL') {
      list = list.filter((it) => it.documentTypeCode === itemTypeFilter)
    }

    if (itemSubjectFilter !== 'ALL') {
      list = list.filter((it) => it.subjectName === itemSubjectFilter)
    }

    if (itemSortBy === 'title') {
      list.sort((a, b) => a.documentTitle.localeCompare(b.documentTitle, 'vi'))
    } else if (itemSortBy === 'rating') {
      list.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
    } else if (itemSortBy === 'views') {
      list.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    }

    return list
  }, [selectedCol, itemKeyword, itemTypeFilter, itemSubjectFilter, itemSortBy])

  // Batch citation text
  const batchCitationText = useMemo(() => {
    if (!selectedCol?.items || selectedCol.items.length === 0) return ''
    return selectedCol.items
      .map((item, idx) => {
        const citation = generateClientCitation(
          {
            id: item.documentId,
            title: item.documentTitle,
            documentTypeLabel: item.documentTypeLabel,
            academicYearName: item.academicYearName,
          },
          citationFormat
        )
        if (citationFormat === 'IEEE') {
          return `[${idx + 1}] ${citation}`
        }
        return citation
      })
      .join('\n\n')
  }, [selectedCol, citationFormat])

  const handleCopyBatchCitation = () => {
    if (!batchCitationText) return
    navigator.clipboard.writeText(batchCitationText)
    setCopiedCitations(true)
    toast.success(`Đã sao chép danh mục trích dẫn (${citationFormat}) của toàn bộ ${selectedCol?.items?.length || 0} tài liệu!`)
    setTimeout(() => setCopiedCitations(false), 2000)
  }

  // Type color badge helper
  const getTypeBadgeClass = (code: string) => {
    switch (code?.toUpperCase()) {
      case 'EXAM':
      case 'DE_THI':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
      case 'SLIDE':
      case 'LECTURE':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
      case 'LAB':
      case 'EXERCISE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
      case 'THESIS':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
      case 'CAPSTONE':
      case 'PROJECT':
      case 'BTL':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800'
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] dark:bg-[#0c1017] text-stone-900 dark:text-stone-100 antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow bg-paper-grid">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          {/* Header: Title, Academic Meta & Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-stone-300 dark:border-stone-800 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="stamp-seal text-purple-700 dark:text-purple-400 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-950/60 text-[10px]">
                  [ HỒ SƠ LƯU TRỮ &amp; BỘ SƯU TẬP HỌC THUẬT ]
                </span>
                <span className="text-stone-400">/</span>
                <span className="font-mono text-xs text-stone-500">KHOA CNTT · ĐH GIAO THÔNG VẬN TẢI</span>
              </div>

              <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 tracking-tight">
                Bộ Sưu Tập &amp; Góc Học Tập Cá Nhân
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl font-sans">
                Gom nhóm và phân loại học liệu theo từng môn học, đề tài nghiên cứu hoặc chia sẻ tài liệu ôn thi trực tiếp cho bạn bè qua đường dẫn chia sẻ an toàn.
              </p>
            </div>

            {/* Counter & Action */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <div className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-xs font-bold text-stone-700 dark:text-stone-300">
                <span className="text-purple-600 dark:text-purple-400">{collections.length}</span> BỘ SƯU TẬP
              </div>

              {!shareToken && (
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle('')
                    setNewDesc('')
                    setShowCreate(true)
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tạo bộ sưu tập mới</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ─── LEFT PANE: COLLECTIONS LIST ─────────────────────────── */}
            {!shareToken && (
              <div className="lg:col-span-4 space-y-4">
                {/* Search collections & count */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-stone-700 dark:text-stone-300 uppercase">
                      Danh mục ({filteredCollections.length}/{collections.length})
                    </span>
                    <span className="text-[11px] text-stone-500">UTC FIT</span>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm bộ sưu tập..."
                      value={colSearchQuery}
                      onChange={(e) => setColSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                {/* Presets Starter Card */}
                {collections.length < 3 && (
                  <div className="bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-stone-700 dark:text-stone-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Gợi ý tạo nhanh theo mẫu</span>
                    </div>
                    <div className="space-y-1.5">
                      {ACADEMIC_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="w-full text-left p-2 rounded-lg bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-xs transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div className="truncate">
                            <span className="mr-1.5">{preset.icon}</span>
                            <span className="font-bold text-stone-800 dark:text-stone-200">{preset.title}</span>
                          </div>
                          <Plus className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collection List */}
                <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                  {loading ? (
                    <div className="py-12 text-center text-stone-400 flex items-center justify-center gap-2 text-xs font-mono">
                      <Loader2 className="w-4 h-4 animate-spin text-stone-600 dark:text-stone-400" />
                      <span>Đang tải danh mục...</span>
                    </div>
                  ) : filteredCollections.length === 0 ? (
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 text-center text-xs text-stone-500 shadow-xs space-y-2">
                      <FolderOpen className="w-8 h-8 mx-auto text-stone-400" />
                      <p className="font-semibold text-stone-700 dark:text-stone-300">Chưa có bộ sưu tập nào</p>
                      <p className="text-[11px] text-stone-400">
                        Bấm nút tạo phía trên hoặc chọn một trong các mẫu gợi ý để bắt đầu gom nhóm học liệu.
                      </p>
                    </div>
                  ) : (
                    filteredCollections.map((col) => {
                      const isSelected = selectedCol?.id === col.id
                      return (
                        <div
                          key={col.id}
                          onClick={() => handleSelectCollection(col)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                            isSelected
                              ? 'border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-stone-800 shadow-md ring-1 ring-blue-600/20 dark:ring-blue-500/30'
                              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400 dark:hover:border-stone-700 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif-academic font-bold text-sm text-stone-950 dark:text-stone-50 line-clamp-1">
                              {col.title}
                            </h4>
                            {col.isPublic ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded shrink-0"
                                title="Đang ở chế độ chia sẻ công khai"
                              >
                                <Globe className="w-3 h-3" />
                                <span>Public</span>
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded shrink-0"
                                title="Riêng tư cá nhân"
                              >
                                <Lock className="w-3 h-3" />
                                <span>Riêng tư</span>
                              </span>
                            )}
                          </div>

                          {col.description && (
                            <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mt-1 font-sans">
                              {col.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 mt-3 pt-2 border-t border-dashed border-stone-100 dark:border-stone-800 font-mono">
                            <span className="font-bold text-stone-700 dark:text-stone-300">
                              {col.itemCount || 0} tài liệu
                            </span>
                            <span>{new Date(col.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* ─── RIGHT PANE: SELECTED COLLECTION WORKSPACE ───────────── */}
            <div className={shareToken ? 'lg:col-span-12' : 'lg:col-span-8'}>
              {detailLoading ? (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-16 text-center text-stone-400 flex flex-col items-center justify-center gap-3 shadow-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-stone-700 dark:text-stone-300" />
                  <span className="text-xs font-mono">Đang tải tài liệu trong bộ sưu tập...</span>
                </div>
              ) : selectedCol ? (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
                  {/* Detailed Header Banner */}
                  <div className="pb-5 border-b border-stone-200 dark:border-stone-800">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-serif-academic text-xl sm:text-2xl font-bold text-stone-950 dark:text-stone-50">
                            {selectedCol.title}
                          </h2>
                          {selectedCol.isPublic ? (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span>Công khai</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-300 dark:border-stone-700 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Riêng tư</span>
                            </span>
                          )}
                        </div>

                        {selectedCol.description && (
                          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans max-w-2xl">
                            {selectedCol.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 font-mono pt-1">
                          <span>
                            Người tạo: <strong className="text-stone-800 dark:text-stone-200">{selectedCol.userFullName}</strong>
                          </span>
                          <span>•</span>
                          <span>Cập nhật: {new Date(selectedCol.updatedAt).toLocaleDateString('vi-VN')}</span>
                          <span>•</span>
                          <span>Quy mô: <strong>{selectedCol.items?.length || 0} tài liệu</strong> ({availableSubjects.length} môn học)</span>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {/* Share link button */}
                        <button
                          type="button"
                          onClick={handleCopyShareLink}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                          title="Sao chép liên kết chia sẻ cho bạn bè"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-blue-600" />}
                          <span>{copied ? 'Đã sao chép!' : 'Chia sẻ'}</span>
                        </button>

                        {/* Batch citation export */}
                        {selectedCol.items && selectedCol.items.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowCitationModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                            title="Xuất danh mục tài liệu trích dẫn chuẩn IEEE / APA / BibTeX"
                          >
                            <Quote className="w-3.5 h-3.5 text-purple-600" />
                            <span>Xuất trích dẫn</span>
                          </button>
                        )}

                        {/* Clone button if viewing shared public collection */}
                        {shareToken && (
                          <button
                            type="button"
                            onClick={handleCloneCollection}
                            disabled={cloning}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs"
                            title="Lưu bản sao bộ sưu tập này về tài khoản của bạn"
                          >
                            {cloning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Lưu bản sao về BST của tôi</span>
                          </button>
                        )}

                        {/* Edit Collection (Owner only) */}
                        {!shareToken && (
                          <button
                            type="button"
                            onClick={openEditModal}
                            className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs transition-colors cursor-pointer"
                            title="Chỉnh sửa tên và cài đặt bộ sưu tập"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Collection (Owner only) */}
                        {!shareToken && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCollection(selectedCol.id)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-xs transition-colors cursor-pointer"
                            title="Xóa bộ sưu tập này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items Sub-Toolbar: Filter & Search within Collection */}
                  {selectedCol.items && selectedCol.items.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50 dark:bg-stone-950/60 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs font-mono">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Lọc tài liệu hoặc ghi chú trong BST..."
                          value={itemKeyword}
                          onChange={(e) => setItemKeyword(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Filter by Type */}
                        {availableTypes.length > 1 && (
                          <CustomSelect
                            value={itemTypeFilter}
                            onChange={(val) => setItemTypeFilter(val)}
                            options={[
                              { value: 'ALL', label: `Mọi thể loại (${availableTypes.length})` },
                              ...availableTypes.map(([code, label]) => ({ value: code, label })),
                            ]}
                            size="sm"
                            className="min-w-[140px]"
                          />
                        )}

                        {/* Filter by Subject */}
                        {availableSubjects.length > 1 && (
                          <CustomSelect
                            value={itemSubjectFilter}
                            onChange={(val) => setItemSubjectFilter(val)}
                            options={[
                              { value: 'ALL', label: `Mọi môn học (${availableSubjects.length})` },
                              ...availableSubjects.map((sub) => ({ value: sub, label: sub })),
                            ]}
                            size="sm"
                            className="min-w-[170px]"
                          />
                        )}

                        {/* Sort selector */}
                        <CustomSelect
                          value={itemSortBy}
                          onChange={(val) => setItemSortBy(val as any)}
                          options={[
                            { value: 'default', label: 'Thứ tự thêm' },
                            { value: 'title', label: 'Tên tài liệu A-Z' },
                            { value: 'rating', label: 'Đánh giá cao nhất ⭐' },
                            { value: 'views', label: 'Lượt xem nhiều nhất 👁️' },
                          ]}
                          size="sm"
                          className="min-w-[150px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  {(!selectedCol.items || selectedCol.items.length === 0) ? (
                    <div className="py-16 text-center text-stone-400 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-500">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <p className="font-serif-academic font-bold text-base text-stone-800 dark:text-stone-200">
                        Bộ sưu tập này hiện chưa có tài liệu nào
                      </p>
                      <p className="text-xs text-stone-500 max-w-md mx-auto font-sans leading-relaxed">
                        Hãy bấm vào nút <strong className="text-blue-600 dark:text-blue-400">"Thêm vào bộ sưu tập"</strong> tại trang chi tiết bất kỳ học liệu nào trong kho để lưu trữ vào đây!
                      </p>
                      <div className="pt-2">
                        <Link
                          to="/search"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-mono font-bold hover:bg-stone-800 dark:hover:bg-white transition-colors"
                        >
                          <span>Mở Cổng Tra Cứu Tài Liệu</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="py-12 text-center text-stone-400 space-y-2 font-mono text-xs">
                      <p>Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setItemKeyword('')
                          setItemTypeFilter('ALL')
                          setItemSubjectFilter('ALL')
                        }}
                        className="text-blue-600 dark:text-blue-400 underline font-bold"
                      >
                        Đặt lại bộ lọc
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400 dark:hover:border-stone-700 transition-all shadow-2xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5 min-w-0 flex-1">
                              {/* Metadata Badges */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTypeBadgeClass(item.documentTypeCode)}`}>
                                  {item.documentTypeLabel || item.documentTypeCode}
                                </span>

                                {item.subjectName && (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                                    {item.subjectCode ? `[${item.subjectCode}] ` : ''}{item.subjectName}
                                  </span>
                                )}

                                {item.advisorName && (
                                  <span className="text-[10px] font-mono text-stone-500 bg-stone-50 dark:bg-stone-900 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-800 flex items-center gap-1">
                                    <UserCheck className="w-3 h-3 text-stone-400" />
                                    <span>GVHD: {item.advisorName}</span>
                                  </span>
                                )}

                                {item.avgRating !== undefined && item.avgRating > 0 && (
                                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                    <span>{item.avgRating.toFixed(1)}</span>
                                  </span>
                                )}

                                {item.viewCount !== undefined && (
                                  <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    <span>{item.viewCount}</span>
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <Link
                                to={`/documents/${item.documentId}`}
                                className="font-serif-academic font-bold text-sm sm:text-base text-stone-950 dark:text-stone-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block line-clamp-2"
                              >
                                {item.documentTitle}
                              </Link>
                            </div>

                            {/* Item Actions */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                              {/* Inline PDF Preview */}
                              {item.fileId && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewerModal({
                                      isOpen: true,
                                      fileId: item.fileId,
                                      title: item.documentTitle,
                                      fileName: item.fileName,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-mono font-bold transition-colors cursor-pointer"
                                  title="Xem nhanh nội dung tài liệu ngay tại đây"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                  <span className="hidden sm:inline">Xem ngay</span>
                                </button>
                              )}

                              {/* Open Detail Page */}
                              <Link
                                to={`/documents/${item.documentId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
                                title="Mở trang chi tiết tài liệu (tab mới)"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              {/* Remove item from collection */}
                              {!shareToken && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(selectedCol.id, item.documentId)}
                                  className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors cursor-pointer"
                                  title="Gỡ tài liệu khỏi bộ sưu tập này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Personal Note Box */}
                          <div className="bg-stone-50 dark:bg-stone-950/60 p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800 flex items-start justify-between gap-3 text-xs">
                            <div className="flex items-start gap-2 min-w-0">
                              <span className="font-mono text-stone-400 shrink-0 mt-0.5">📝</span>
                              <div className="min-w-0">
                                {item.note ? (
                                  <p className="text-stone-700 dark:text-stone-300 font-sans italic break-words">
                                    "{item.note}"
                                  </p>
                                ) : (
                                  <span className="text-stone-400 italic font-mono text-[11px]">
                                    Chưa có ghi chú cá nhân cho tài liệu này.
                                  </span>
                                )}
                              </div>
                            </div>

                            {!shareToken && (
                              <button
                                type="button"
                                onClick={() => openEditNoteModal(item)}
                                className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline shrink-0 flex items-center gap-1 cursor-pointer font-bold"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>{item.note ? 'Sửa' : '+ Thêm ghi chú'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl py-20 text-center text-stone-400 text-xs font-mono shadow-xs space-y-2">
                  <FolderOpen className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700" />
                  <p>Chọn một bộ sưu tập ở danh sách bên trái để mở không gian học tập.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* ─── MODAL 1: CREATE COLLECTION MODAL ───────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif-academic text-base font-bold text-stone-950 dark:text-stone-50 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-blue-600" />
                <span>Tạo Bộ Sưu Tập Học Thuật Mới</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Tên bộ sưu tập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Vd: Ôn thi KTHP Cấu trúc dữ liệu & Giải thuật..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Mô tả mục đích (tùy chọn)
                </label>
                <textarea
                  rows={3}
                  placeholder="Vd: Bộ tài liệu tổng hợp slide chương 1-5, các đề thi KTHP có lời giải và biểu mẫu báo cáo bài tập lớn."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-stone-500 resize-none font-sans"
                />
              </div>

              <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <CustomCheckbox
                  id="colPublic"
                  checked={isPublic}
                  onChange={setIsPublic}
                  label="Cho phép chia sẻ qua đường link bí mật"
                  description="Bất kỳ ai nhận được đường liên kết đều có thể xem và lưu bản sao học liệu này."
                  color="blue"
                  size="md"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-xs font-mono font-bold rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || submitting}
                  className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo bộ sưu tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: EDIT COLLECTION MODAL ─────────────────────────── */}
      {showEdit && selectedCol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif-academic text-base font-bold text-stone-950 dark:text-stone-50 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Cập Nhật Thông Tin Bộ Sưu Tập</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCollection} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Tên bộ sưu tập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Mô tả mục đích
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-stone-500 resize-none font-sans"
                />
              </div>

              <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <CustomCheckbox
                  id="editColPublic"
                  checked={editPublic}
                  onChange={setEditPublic}
                  label="Cho phép chia sẻ qua đường link bí mật"
                  description="Nếu tắt, bộ sưu tập này sẽ chuyển về chế độ riêng tư và chỉ một mình bạn có thể truy cập."
                  color="blue"
                  size="md"
                />
              </div>

              {/* Share token regeneration option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRegenerateToken}
                  className="text-[11px] font-mono text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 flex items-center gap-1.5 underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tạo lại đường link chia sẻ bí mật mới</span>
                </button>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 text-xs font-mono font-bold rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!editTitle.trim() || updating}
                  className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: EDIT ITEM NOTE MODAL ──────────────────────────── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif-academic text-base font-bold text-stone-950 dark:text-stone-50 flex items-center gap-2">
                <span>📝 Ghi Chú Học Tập Cho Tài Liệu</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItemNote} className="space-y-4 text-xs">
              <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] font-mono text-stone-400 uppercase block mb-1">Tài liệu:</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 line-clamp-2">
                  {editingItem.documentTitle}
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nội dung ghi chú nhắc nhở ôn tập:
                </label>
                <textarea
                  rows={4}
                  placeholder="Vd: Đọc kỹ phần thuật toán Dijkstra trang 45; cấu trúc chương 3 áp dụng cho Báo cáo BTL nhóm..."
                  value={itemNoteText}
                  onChange={(e) => setItemNoteText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-stone-500 resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-mono font-bold rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  {savingNote ? 'Đang lưu...' : 'Lưu ghi chú'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: BATCH CITATION EXPORT MODAL ────────────────────── */}
      {showCitationModal && selectedCol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-purple-600" />
                <h3 className="font-serif-academic text-base font-bold text-stone-950 dark:text-stone-50">
                  Xuất Danh Mục Trích Dẫn Toàn Bộ Bộ Sưu Tập
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCitationModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
              Định dạng trích dẫn tài liệu tham khảo đồng loạt cho <strong>{selectedCol.items?.length || 0} tài liệu</strong> để dán trực tiếp vào báo cáo BTL hoặc Khóa luận tốt nghiệp UTC FIT.
            </p>

            {/* Format Selector Tabs */}
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-950 p-1 rounded-lg border border-stone-200 dark:border-stone-800 font-mono text-xs">
              {(['IEEE', 'APA', 'BIBTEX'] as CitationFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setCitationFormat(fmt)}
                  className={`flex-1 py-1.5 px-3 rounded text-center font-bold transition-all cursor-pointer ${
                    citationFormat === fmt
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  {fmt === 'IEEE' ? 'IEEE (Khuyên dùng FIT)' : fmt === 'APA' ? 'APA 7th' : 'BibTeX (LaTeX)'}
                </button>
              ))}
            </div>

            {/* Citation Result Box */}
            <div className="relative">
              <pre className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 text-xs font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed select-all">
                {batchCitationText}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
              <span className="text-[11px] font-mono text-stone-400">
                Chuẩn hóa trích dẫn khoa học UTC
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCitationModal(false)}
                  className="px-4 py-2 text-xs font-mono font-bold rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleCopyBatchCitation}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 transition-colors cursor-pointer shadow-xs"
                >
                  {copiedCitations ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCitations ? 'Đã sao chép vào Clipboard!' : 'Sao chép toàn bộ danh mục'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 5: PDF VIEWER MODAL ──────────────────────────────── */}
      <PdfViewerModal
        isOpen={viewerModal.isOpen}
        onClose={() => setViewerModal({ isOpen: false })}
        fileId={viewerModal.fileId}
        title={viewerModal.title}
        fileName={viewerModal.fileName}
      />
    </div>
  )
}

export default Collections
