import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Code2,
  Database,
  Network,
  Cpu,
  BrainCircuit,
  FileText,
  FolderGit2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Flame,
  Eye,
  Download,
  Share2,
  Layers,
  FileCheck2,
  Bookmark,
  FileCode2,
  Award,
  Compass,
  FileSpreadsheet,
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
  Laptop,
  HelpCircle,
  Clock,
  UserCheck,
  Building2,
  FileSearch,
  BarChart3,
  BookMarked,
  Tag,
  Paperclip,
  BookmarkCheck,
  Stamp
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PdfViewerModal from '../components/PdfViewerModal'
import CitationModal from '../components/CitationModal'
import { searchDocuments } from '../api/documentApi'
import { catalogApi } from '../api/catalogApi'
import { OFFICIAL_DOCUMENT_TYPES, DocumentSummary, DocumentTypeCode } from '../types/document'
import type { Subject, Major } from '../types/catalog'
import { useToast } from '../contexts/ToastContext'

// 6 Ngành đào tạo chính quy Khoa CNTT - UTC (Archival Dossier Format với Color Systems nổi bật)
const UTC_MAJORS = [
  {
    code: 'CNTT',
    dossierNo: 'DOSSIER / IT-7480201',
    name: 'Công nghệ Thông tin',
    sub: 'Đại trà & Chất lượng cao (Việt - Anh)',
    idCode: '7480201',
    icon: Laptop,
    stamp: 'CHUẨN ABET',
    accent: 'blue',
    cardBorder: 'border-blue-200 dark:border-blue-800/80 hover:border-blue-500 dark:hover:border-blue-400',
    cardBg: 'bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-blue-950/30 dark:via-stone-900 dark:to-stone-900',
    iconBg: 'bg-blue-600 text-white shadow-md shadow-blue-500/20',
    tabBg: 'bg-blue-600 text-white',
    stampColor: 'text-blue-700 dark:text-blue-300 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/60',
    tagColor: 'bg-blue-100/80 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50',
    btnColor: 'text-blue-700 dark:text-blue-400 group-hover:text-blue-900 dark:group-hover:text-blue-200',
    desc: 'Đào tạo kỹ sư CNTT toàn diện theo chuẩn kiểm định quốc tế ABET, làm chủ quy trình phát triển phần mềm, hạ tầng đám mây và hệ thống kết nối.',
    focus: ['Cloud Computing', 'Web/Mobile Fullstack', 'System Integration'],
  },
  {
    code: 'KHMT',
    dossierNo: 'DOSSIER / CS-7480101',
    name: 'Khoa học Máy tính',
    sub: 'Thuật toán nâng cao & Lý thuyết tính toán',
    idCode: '7480101',
    icon: Cpu,
    stamp: 'CHUYÊN SÂU',
    accent: 'purple',
    cardBorder: 'border-purple-200 dark:border-purple-800/80 hover:border-purple-500 dark:hover:border-purple-400',
    cardBg: 'bg-gradient-to-b from-purple-50/60 via-white to-white dark:from-purple-950/30 dark:via-stone-900 dark:to-stone-900',
    iconBg: 'bg-purple-600 text-white shadow-md shadow-purple-500/20',
    tabBg: 'bg-purple-600 text-white',
    stampColor: 'text-purple-700 dark:text-purple-300 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-950/60',
    tagColor: 'bg-purple-100/80 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50',
    btnColor: 'text-purple-700 dark:text-purple-400 group-hover:text-purple-900 dark:group-hover:text-purple-200',
    desc: 'Nghiên cứu cấu trúc dữ liệu và giải thuật nâng cao, mô hình hóa toán học, hệ thống tính toán song song, mật mã học và lý thuyết độ phức tạp.',
    focus: ['Algorithms', 'Distributed Systems', 'Cryptography'],
  },
  {
    code: 'KTPM',
    dossierNo: 'DOSSIER / SE-7480103',
    name: 'Kỹ thuật Phần mềm',
    sub: 'Kiến trúc hệ thống, DevOps & QA/QC',
    idCode: '7480103',
    icon: Code2,
    stamp: 'KỸ SƯ PM',
    accent: 'emerald',
    cardBorder: 'border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-500 dark:hover:border-emerald-400',
    cardBg: 'bg-gradient-to-b from-emerald-50/60 via-white to-white dark:from-emerald-950/30 dark:via-stone-900 dark:to-stone-900',
    iconBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20',
    tabBg: 'bg-emerald-600 text-white',
    stampColor: 'text-emerald-700 dark:text-emerald-300 border-emerald-600 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    tagColor: 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50',
    btnColor: 'text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-900 dark:group-hover:text-emerald-200',
    desc: 'Quy trình kỹ nghệ phần mềm chuyên nghiệp (Agile/Scrum), thiết kế kiến trúc Clean/Microservices, tự động hóa CI/CD và kiểm thử bảo đảm chất lượng.',
    focus: ['Clean Architecture', 'DevOps / Docker', 'Software QA/QC'],
  },
  {
    code: 'HTTT',
    dossierNo: 'DOSSIER / IS-7480104',
    name: 'Hệ thống Thông tin',
    sub: 'Cơ sở dữ liệu doanh nghiệp & Business Analytics',
    idCode: '7480104',
    icon: Database,
    stamp: 'DỮ LIỆU LỚN',
    accent: 'amber',
    cardBorder: 'border-amber-200 dark:border-amber-800/80 hover:border-amber-500 dark:hover:border-amber-400',
    cardBg: 'bg-gradient-to-b from-amber-50/60 via-white to-white dark:from-amber-950/30 dark:via-stone-900 dark:to-stone-900',
    iconBg: 'bg-amber-600 text-white shadow-md shadow-amber-500/20',
    tabBg: 'bg-amber-600 text-white',
    stampColor: 'text-amber-700 dark:text-amber-300 border-amber-600 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/60',
    tagColor: 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50',
    btnColor: 'text-amber-700 dark:text-amber-400 group-hover:text-amber-900 dark:group-hover:text-amber-200',
    desc: 'Thiết kế cơ sở dữ liệu quan hệ và NoSQL quy mô lớn, tích hợp hệ thống hoạch định nguồn lực ERP doanh nghiệp và phân tích nghiệp vụ chuyên sâu.',
    focus: ['Enterprise ERP', 'Database Design', 'Business Analytics'],
  },
  {
    code: 'MMT_ATTT',
    dossierNo: 'DOSSIER / NET-7480102',
    name: 'Mạng MT & An toàn TT',
    sub: 'Hạ tầng mạng Cisco & An ninh mạng',
    idCode: '7480102 / 7480202',
    icon: Network,
    stamp: 'BẢO MẬT',
    accent: 'rose',
    cardBorder: 'border-rose-200 dark:border-rose-800/80 hover:border-rose-500 dark:hover:border-rose-400',
    cardBg: 'bg-gradient-to-b from-rose-50/60 via-white to-white dark:from-rose-950/30 dark:via-stone-900 dark:to-stone-900',
    iconBg: 'bg-rose-600 text-white shadow-md shadow-rose-500/20',
    tabBg: 'bg-rose-600 text-white',
    stampColor: 'text-rose-700 dark:text-rose-300 border-rose-600 dark:border-rose-400 bg-rose-50 dark:bg-rose-950/60',
    tagColor: 'bg-rose-100/80 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50',
    btnColor: 'text-rose-700 dark:text-rose-400 group-hover:text-rose-900 dark:group-hover:text-rose-200',
    desc: 'Quản trị hạ tầng mạng Cisco, phòng thủ và tấn công mạng (Red/Blue team), giám sát an toàn thông tin (SOC), điều tra số và bảo mật đám mây.',
    focus: ['Cisco Routing', 'Cyber Security', 'Digital Forensics'],
  },
  {
    code: 'AI_DS',
    dossierNo: 'DOSSIER / AI-7480107',
    name: 'Trí tuệ Nhân tạo & KH Dữ liệu',
    sub: 'Deep Learning, Xử lý ảnh & Mô hình ngôn ngữ lớn',
    idCode: '7480107',
    icon: BrainCircuit,
    stamp: 'TIÊN PHONG',
    accent: 'cyan',
    cardBorder: 'border-cyan-200 dark:border-cyan-800/80 hover:border-cyan-500 dark:hover:border-cyan-400',
    cardBg: 'bg-gradient-to-b from-cyan-50/60 via-white to-white dark:from-cyan-950/30 dark:via-stone-900 dark:to-stone-900',
    iconBg: 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20',
    tabBg: 'bg-cyan-600 text-white',
    stampColor: 'text-cyan-700 dark:text-cyan-300 border-cyan-600 dark:border-cyan-400 bg-cyan-50 dark:bg-cyan-950/60',
    tagColor: 'bg-cyan-100/80 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/50',
    btnColor: 'text-cyan-700 dark:text-cyan-400 group-hover:text-cyan-900 dark:group-hover:text-cyan-200',
    desc: 'Xây dựng mô hình học máy tiên tiến, mạng nơ-ron tích chập (CNN), thị giác máy tính, xử lý ngôn ngữ tự nhiên (NLP/LLMs) và khai phá dữ liệu lớn.',
    focus: ['Deep Learning', 'Computer Vision', 'NLP & LLMs'],
  },
]

// 4 Khối kiến thức đào tạo theo khung UTC FIT (Đầy đủ 55 môn học)
const KNOWLEDGE_BLOCKS = [
  {
    id: 'block1',
    sectionCode: 'SECTION § 01',
    number: '01',
    title: 'Khối Giáo dục Đại cương & Cơ sở Toán - Khoa học',
    shortTitle: 'Đại cương & Toán - Khoa học',
    colorTheme: 'sky',
    activeClass: 'bg-sky-600 text-white border-sky-600 shadow-md',
    desc: 'Nền tảng tư duy toán học giải tích, đại số, xác suất thống kê, vật lý và kỹ năng tiếng Anh chuyên ngành CNTT',
    subjects: [
      { code: 'MATH101', name: 'Giải tích 1', credit: 3, track: 'Toán học', color: 'blue' },
      { code: 'MATH102', name: 'Giải tích 2', credit: 3, track: 'Toán học', color: 'blue' },
      { code: 'MATH103', name: 'Đại số tuyến tính', credit: 3, track: 'Toán học', color: 'blue' },
      { code: 'MATH104', name: 'Xác suất thống kê', credit: 3, track: 'Toán học', color: 'blue' },
      { code: 'PHYS101', name: 'Vật lý đại cương', credit: 3, track: 'Khoa học', color: 'teal' },
      { code: 'MATH105', name: 'Toán rời rạc & Lý thuyết đồ thị', credit: 3, track: 'Toán tin', color: 'indigo' },
      { code: 'LLCT101', name: 'Triết học Mác - Lênin', credit: 3, track: 'Lý luận', color: 'rose' },
      { code: 'LLCT102', name: 'Kinh tế chính trị Mác - Lênin', credit: 2, track: 'Lý luận', color: 'rose' },
      { code: 'LLCT103', name: 'Chủ nghĩa xã hội khoa học', credit: 2, track: 'Lý luận', color: 'rose' },
      { code: 'LLCT104', name: 'Lịch sử Đảng Cộng sản Việt Nam', credit: 2, track: 'Lý luận', color: 'rose' },
      { code: 'LLCT105', name: 'Tư tưởng Hồ Chí Minh', credit: 2, track: 'Lý luận', color: 'rose' },
      { code: 'ENG101', name: 'Tiếng Anh cơ bản', credit: 4, track: 'Ngoại ngữ', color: 'purple' },
      { code: 'ENG102', name: 'Tiếng Anh chuyên ngành CNTT', credit: 3, track: 'Ngoại ngữ', color: 'purple' },
      { code: 'GDTC_QP', name: 'Giáo dục quốc phòng & Giáo dục thể chất', credit: 4, track: 'Kỹ năng', color: 'amber' },
    ],
  },
  {
    id: 'block2',
    sectionCode: 'SECTION § 02',
    number: '02',
    title: 'Khối Cơ sở nhóm ngành & Cơ sở ngành CNTT (Bắt buộc chung)',
    shortTitle: 'Cơ sở ngành CNTT',
    colorTheme: 'emerald',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-md',
    desc: 'Trang bị cốt lõi cho mọi kỹ sư CNTT: thuật toán, lập trình OOP, kiến trúc máy tính, hệ điều hành và CSDL',
    subjects: [
      { code: 'IT101', name: 'Nhập môn Công nghệ thông tin / Tin học đại cương', credit: 3, track: 'Cơ sở', color: 'blue' },
      { code: 'IT102', name: 'Kỹ thuật lập trình (C/C++)', credit: 3, track: 'Lập trình', color: 'emerald' },
      { code: 'IT201', name: 'Lập trình hướng đối tượng (OOP) (Java / C++)', credit: 3, track: 'Lập trình', color: 'emerald' },
      { code: 'IT202', name: 'Cấu trúc dữ liệu và giải thuật', credit: 3, track: 'Thuật toán', color: 'indigo' },
      { code: 'IT203', name: 'Kiến trúc máy tính và Hợp ngữ', credit: 3, track: 'Hệ thống', color: 'slate' },
      { code: 'IT204', name: 'Nguyên lý Hệ điều hành (Linux / Windows)', credit: 3, track: 'Hệ điều hành', color: 'slate' },
      { code: 'IT205', name: 'Cơ sở dữ liệu (SQL, Thiết kế CSDL quan hệ)', credit: 3, track: 'Cơ sở dữ liệu', color: 'amber' },
      { code: 'IT206', name: 'Hệ quản trị cơ sở dữ liệu (PostgreSQL, SQL Server, MySQL)', credit: 3, track: 'Cơ sở dữ liệu', color: 'amber' },
      { code: 'IT207', name: 'Mạng máy tính & Truyền thông dữ liệu', credit: 3, track: 'Mạng máy tính', color: 'rose' },
      { code: 'IT208', name: 'Công nghệ phần mềm / Nhập môn Kỹ thuật phần mềm', credit: 3, track: 'KTPM', color: 'blue' },
      { code: 'IT209', name: 'Tương tác người - máy (HCI)', credit: 2, track: 'Thiết kế', color: 'cyan' },
    ],
  },
  {
    id: 'block3',
    sectionCode: 'SECTION § 03',
    number: '03',
    title: 'Khối Chuyên ngành theo từng Định hướng (Ứng dụng & Nghiên cứu)',
    shortTitle: 'Chuyên ngành định hướng',
    colorTheme: 'purple',
    activeClass: 'bg-purple-600 text-white border-purple-600 shadow-md',
    desc: 'Phát triển chuyên sâu theo 4 định hướng: Kỹ thuật phần mềm, Hệ thống thông tin & Dữ liệu, Mạng & An toàn thông tin, Trí tuệ nhân tạo',
    subjects: [
      { code: 'SE301', name: 'Lập trình Web (React / Spring Boot / Node.js)', credit: 3, track: 'KTPM', color: 'blue' },
      { code: 'SE302', name: 'Lập trình ứng dụng di động (Android / iOS / Flutter)', credit: 3, track: 'KTPM', color: 'blue' },
      { code: 'SE303', name: 'Thiết kế & Kiến trúc phần mềm', credit: 3, track: 'KTPM', color: 'blue' },
      { code: 'SE304', name: 'Kiểm thử và đảm bảo chất lượng phần mềm (QA/QC)', credit: 3, track: 'KTPM', color: 'blue' },
      { code: 'SE305', name: 'Quản trị dự án CNTT (Agile / Scrum)', credit: 2, track: 'KTPM', color: 'blue' },
      { code: 'SE306', name: 'Điện toán đám mây & DevOps cơ bản (Docker, CI/CD)', credit: 3, track: 'KTPM', color: 'blue' },
      { code: 'IS301', name: 'Phân tích và thiết kế hệ thống thông tin', credit: 3, track: 'HTTT', color: 'amber' },
      { code: 'IS302', name: 'Khai phá dữ liệu (Data Mining) & Kho dữ liệu (Data Warehouse)', credit: 3, track: 'HTTT', color: 'amber' },
      { code: 'IS303', name: 'Cơ sở dữ liệu phân tán & NoSQL', credit: 3, track: 'HTTT', color: 'amber' },
      { code: 'IS304', name: 'Phân tích dữ liệu lớn (Big Data)', credit: 3, track: 'HTTT', color: 'amber' },
      { code: 'CN301', name: 'Quản trị mạng máy tính (Cisco / Linux Server)', credit: 3, track: 'MMT/ATTT', color: 'rose' },
      { code: 'CN302', name: 'Định tuyến và chuyển mạch (Routing & Switching)', credit: 3, track: 'MMT/ATTT', color: 'rose' },
      { code: 'CN303', name: 'Cơ sở An toàn thông tin & Mật mã học', credit: 3, track: 'MMT/ATTT', color: 'rose' },
      { code: 'CN304', name: 'An ninh mạng và điều tra số (Digital Forensics)', credit: 3, track: 'MMT/ATTT', color: 'rose' },
      { code: 'AI301', name: 'Nhập môn Trí tuệ nhân tạo', credit: 3, track: 'AI/DS', color: 'purple' },
      { code: 'AI302', name: 'Học máy (Machine Learning)', credit: 3, track: 'AI/DS', color: 'purple' },
      { code: 'AI303', name: 'Học sâu (Deep Learning) & Thị giác máy tính / NLP', credit: 3, track: 'AI/DS', color: 'purple' },
    ],
  },
  {
    id: 'block4',
    sectionCode: 'SECTION § 04',
    number: '04',
    title: 'Khối Tốt nghiệp & Thực tập Doanh nghiệp',
    shortTitle: 'Đồ án & Khóa luận',
    colorTheme: 'amber',
    activeClass: 'bg-amber-600 text-white border-amber-600 shadow-md',
    desc: 'Sản phẩm đầu ra minh chứng năng lực thực tiễn, công bố mã nguồn mẫu và báo cáo chuẩn kiểm định',
    subjects: [
      { code: 'CAP401', name: 'Thực tập cơ sở / Thực tập chuyên ngành tại doanh nghiệp', credit: 3, track: 'Thực tập', color: 'orange' },
      { code: 'CAP402', name: 'Đồ án môn học (Đồ án CSDL / KTPM / Mạng)', credit: 2, track: 'Đồ án', color: 'orange' },
      { code: 'CAP501', name: 'Đồ án tốt nghiệp / Khóa luận tốt nghiệp Kỹ sư/Cử nhân CNTT', credit: 10, track: 'Tốt nghiệp', color: 'rose' },
    ],
  },
]

export default function Home() {
  const navigate = useNavigate()
  const toast = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Search input state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeQuick, setSelectedTypeQuick] = useState<DocumentTypeCode | ''>('')

  // Knowledge block active tab
  const [activeBlock, setActiveBlock] = useState('block2')
  const [subjectSearch, setSubjectSearch] = useState('')

  // Catalogs
  const [majorsList, setMajorsList] = useState<Major[]>([])
  const [subjectsList, setSubjectsList] = useState<Subject[]>([])

  // Featured documents
  const [featuredDocs, setFeaturedDocs] = useState<DocumentSummary[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)

  // Modals
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean
    doc: DocumentSummary | null
  }>({ isOpen: false, doc: null })

  const [citationModal, setCitationModal] = useState<{
    isOpen: boolean
    doc: DocumentSummary | null
  }>({ isOpen: false, doc: null })

  // Hotkey Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load catalogs and featured docs
  useEffect(() => {
    catalogApi.getMajors().then((res: any) => {
      setMajorsList(Array.isArray(res) ? res : res?.data || [])
    }).catch(() => {})

    catalogApi.getSubjects().then((res: any) => {
      setSubjectsList(Array.isArray(res) ? res : res?.data || [])
    }).catch(() => {})

    setLoadingDocs(true)
    searchDocuments({ page: 0, size: 6, sortBy: 'newest' })
      .then((res) => {
        if (res && res.content) {
          setFeaturedDocs(res.content)
        }
      })
      .catch((err) => {
        console.error('Failed to load featured documents:', err)
      })
      .finally(() => {
        setLoadingDocs(false)
      })
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (selectedTypeQuick) params.set('type', selectedTypeQuick)
    navigate(`/search?${params.toString()}`)
  }

  const handleMajorClick = (majorCode: string) => {
    const matched = majorsList.find(
      (m) => m.code.toUpperCase() === majorCode.toUpperCase() || m.name.toLowerCase().includes(majorCode.toLowerCase())
    )
    if (matched) {
      navigate(`/search?majorId=${matched.id}`)
    } else {
      navigate(`/search?q=${encodeURIComponent(majorCode)}`)
    }
  }

  const handleSubjectClick = (subName: string, subCode: string) => {
    const matched = subjectsList.find(
      (s) => s.code.toUpperCase() === subCode.toUpperCase() || s.name.toLowerCase().includes(subName.toLowerCase())
    )
    if (matched) {
      navigate(`/search?subjectId=${matched.id}`)
    } else {
      navigate(`/search?q=${encodeURIComponent(subName)}`)
    }
  }

  const currentBlockData = KNOWLEDGE_BLOCKS.find((b) => b.id === activeBlock) || KNOWLEDGE_BLOCKS[1]

  const filteredSubjects = currentBlockData.subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.track.toLowerCase().includes(subjectSearch.toLowerCase())
  )

  const getTrackBadgeClass = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'amber':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      case 'rose':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800'
      case 'cyan':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
      case 'teal':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800'
      case 'orange':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-800'
      default:
        return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] dark:bg-[#0c1017] text-stone-900 dark:text-stone-100 antialiased selection:bg-blue-600 selection:text-white dark:selection:bg-amber-400 dark:selection:text-stone-900">
      <Navbar />

      <main className="flex-grow pt-16">
        {/* ══════════════════════════════════════════════════════════════════
            1. HERO SECTION — ARCHIVAL PAPER CANVAS + VIBRANT EDITORIAL
           ══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-24 border-b border-stone-200 dark:border-stone-800 bg-[#fbfbfa] dark:bg-[#0d1117] bg-paper-grid">
          {/* Subtle colored ambient glow in the background */}
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-16 right-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Archival metadata ledger line with colorful badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-dashed border-stone-300 dark:border-stone-800 text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-3">
                <span className="stamp-seal text-rose-700 dark:text-rose-400 border-rose-600 dark:border-rose-400 bg-rose-50/80 dark:bg-rose-950/50">
                  <Stamp className="w-3 h-3" />
                  KHOA CNTT · ĐH GIAO THÔNG VẬN TẢI
                </span>
                <span className="hidden sm:inline text-stone-300 dark:text-stone-700">/</span>
                <span className="hidden sm:inline font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                  EST. 1962 · UTC FIT REPOSITORY
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  CATALOGUE: 2026/V4.2
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/80 dark:border-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                  KIỂM CHỨNG LIÊM CHÍNH
                </span>
              </div>
            </div>

            {/* Main Editorial Hero Content */}
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
              {/* Category tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-amber-100 dark:from-blue-950/70 dark:via-indigo-950/70 dark:to-amber-950/70 border border-blue-300/80 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-mono text-xs font-bold uppercase tracking-wider mb-5 shadow-2xs">
                <BookmarkCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Cổng Học Liệu Số &amp; Bản Thảo Đồ Án Khoa CNTT</span>
              </div>

              {/* Massive Editorial Headline with Warm Highlighter Ink Accent */}
              <h1 className="font-serif-academic text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-950 dark:text-stone-50 leading-[1.08] mb-5">
                Học Liệu &amp; Bản Thảo Nghiên Cứu
                <span className="block mt-2">
                  <span className="relative inline-block px-3 text-stone-950 dark:text-stone-100 font-serif-academic italic">
                    <span className="absolute inset-x-0 bottom-2 sm:bottom-3 h-4 sm:h-6 bg-gradient-to-r from-amber-300/80 via-yellow-300/80 to-amber-200/80 dark:from-amber-500/30 dark:via-yellow-500/30 dark:to-amber-500/20 -rotate-1 rounded-sm -z-10" />
                    Có Kiểm Duyệt Học Thuật
                  </span>
                </span>
              </h1>

              {/* Academic Abstract Style Paragraph */}
              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed mb-8 font-sans">
                Lưu trữ tập trung và đối soát học thuật toàn văn: Khóa luận tốt nghiệp xuất sắc,
                báo cáo Bài tập lớn, mã nguồn mẫu đính kèm GitHub/GitLab, slide bài giảng chính khóa
                và ngân hàng đề thi có lời giải chuẩn quy cách của Khoa CNTT.
              </p>

              {/* Index Card Filing Search Box with Warm Blue Border */}
              <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-xl p-2.5 shadow-lg shadow-stone-400/10 dark:shadow-black/50 border-2 border-stone-800 dark:border-stone-700 focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all mb-4 text-left relative">
                {/* Paper clip decor */}
                <div className="absolute -top-4 right-6 text-amber-600 dark:text-amber-400 pointer-events-none drop-shadow-xs">
                  <Paperclip className="w-6 h-6 rotate-45" />
                </div>

                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2.5 px-3 py-1.5">
                  <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    placeholder="Tra cứu theo môn học, giảng viên (PGS. TS...), công nghệ..."
                    className="w-full bg-transparent text-sm sm:text-base font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
                  />
                  <div className="hidden sm:flex items-center gap-1 shrink-0 px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-mono font-bold border border-stone-200 dark:border-stone-700">
                    <span>Ctrl</span>
                    <span>K</span>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                  >
                    <span>Truy vấn</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Index Card Tabs for Quick Type Selection */}
                <div className="flex items-center gap-1.5 pt-2.5 mt-2 border-t border-stone-200 dark:border-stone-800 overflow-x-auto no-scrollbar px-2 text-xs">
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest shrink-0 mr-1">
                    MỤC LỤC:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTypeQuick('')}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors shrink-0 cursor-pointer ${
                      selectedTypeQuick === ''
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    TẤT CẢ
                  </button>
                  {OFFICIAL_DOCUMENT_TYPES.slice(0, 5).map((t) => (
                    <button
                      key={t.code}
                      type="button"
                      onClick={() => setSelectedTypeQuick(t.code)}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors shrink-0 cursor-pointer ${
                        selectedTypeQuick === t.code
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Research Index Hot Pills with Color-coding */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono mt-2">
                <span className="text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  CHỦ ĐỀ HOT:
                </span>
                {[
                  { name: 'Kỹ thuật phần mềm', q: 'Kỹ thuật phần mềm', color: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' },
                  { name: 'Trí tuệ nhân tạo', q: 'Trí tuệ nhân tạo', color: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' },
                  { name: 'Khóa luận tốt nghiệp', type: 'THESIS', color: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
                  { name: 'Lập trình OOP Java', q: 'OOP', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
                  { name: 'An toàn thông tin', q: 'An toàn', color: 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800' },
                  { name: 'Đề thi cuối kỳ', type: 'EXAM', color: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
                ].map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (pill.type) navigate(`/search?type=${pill.type}`)
                      else navigate(`/search?q=${encodeURIComponent(pill.q || '')}`)
                    }}
                    className={`px-2.5 py-0.5 rounded border ${pill.color} hover:brightness-95 transition-all cursor-pointer shadow-2xs font-semibold`}
                  >
                    #{pill.name}
                  </button>
                ))}
              </div>

              {/* Swiss Minimalist Ledger — 4 High-Contrast Colored Numbers */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mt-12 pt-8 border-t border-stone-300 dark:border-stone-800 text-left">
                <div className="p-3 border-l-4 border-blue-600 bg-white/70 dark:bg-stone-900/60 rounded-r-md border-y border-r border-stone-200/60 dark:border-stone-800">
                  <span className="block font-mono text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
                    55
                  </span>
                  <span className="block text-[11px] font-mono text-stone-600 dark:text-stone-400 uppercase tracking-wider mt-0.5 font-bold">
                    Môn học UTC FIT
                  </span>
                </div>
                <div className="p-3 border-l-4 border-purple-600 bg-white/70 dark:bg-stone-900/60 rounded-r-md border-y border-r border-stone-200/60 dark:border-stone-800">
                  <span className="block font-mono text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400">
                    06
                  </span>
                  <span className="block text-[11px] font-mono text-stone-600 dark:text-stone-400 uppercase tracking-wider mt-0.5 font-bold">
                    Hồ sơ ngành học
                  </span>
                </div>
                <div className="p-3 border-l-4 border-amber-500 bg-white/70 dark:bg-stone-900/60 rounded-r-md border-y border-r border-stone-200/60 dark:border-stone-800">
                  <span className="block font-mono text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-400">
                    08
                  </span>
                  <span className="block text-[11px] font-mono text-stone-600 dark:text-stone-400 uppercase tracking-wider mt-0.5 font-bold">
                    Loại học liệu chuẩn
                  </span>
                </div>
                <div className="p-3 border-l-4 border-emerald-600 bg-white/70 dark:bg-stone-900/60 rounded-r-md border-y border-r border-stone-200/60 dark:border-stone-800">
                  <span className="block font-mono text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                    100%
                  </span>
                  <span className="block text-[11px] font-mono text-stone-600 dark:text-stone-400 uppercase tracking-wider mt-0.5 font-bold">
                    Kiểm duyệt nội bộ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            2. 6 BÌA HỒ SƠ CHUYÊN NGÀNH (COLORFUL ARCHIVAL DOSSIERS)
           ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 bg-[#faf9f5] dark:bg-[#090d14] border-b border-stone-200 dark:border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-stone-300 dark:border-stone-800">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-blue-700 dark:text-blue-400">
                  MỤC LỤC ĐÀO TẠO · KHOA CNTT UTC
                </span>
                <h2 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 mt-1">
                  6 Hồ Sơ Chuyên Ngành Đào Tạo
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl font-sans">
                  Hồ sơ học liệu phân định rõ ràng theo từng ngành: đồ án tốt nghiệp, bài tập lớn,
                  slide bài giảng và tài liệu nghiên cứu chuyên ngành.
                </p>
              </div>

              <Link
                to="/search"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 hover:underline shrink-0"
              >
                <span>Xem mục lục toàn bộ học liệu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Grid of Archival Dossiers with Rich Color Identities */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {UTC_MAJORS.map((m) => {
                const IconComponent = m.icon
                return (
                  <div
                    key={m.code}
                    onClick={() => handleMajorClick(m.code)}
                    className={`group ${m.cardBg} rounded-xl p-6 border-2 ${m.cardBorder} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between relative shadow-xs`}
                  >
                    <div>
                      {/* Top Folder Tab Header */}
                      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
                        <span className="font-mono text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                          {m.dossierNo}
                        </span>
                        <span className={`stamp-seal text-[9px] ${m.stampColor}`}>
                          {m.stamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5 mb-3">
                        <div className={`w-11 h-11 rounded-lg ${m.iconBg} flex items-center justify-center shrink-0`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif-academic text-xl font-bold text-stone-950 dark:text-stone-50 group-hover:underline">
                            {m.name}
                          </h3>
                          <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400 font-semibold">
                            Mã ngành: {m.idCode}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans mt-2 mb-4">
                        {m.desc}
                      </p>

                      {/* Focus tags with colored badges */}
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-dashed border-stone-200 dark:border-stone-800">
                        {m.focus.map((f, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${m.tagColor}`}
                          >
                            #{f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className={`pt-4 mt-5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-mono font-bold ${m.btnColor}`}>
                      <span>Mở hồ sơ học liệu</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            3. KHUNG CHƯƠNG TRÌNH 4 KHỐI KIẾN THỨC (COLOR-CODED SYLLABUS LEDGER)
           ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 bg-[#fbfbfa] dark:bg-[#0c1017] border-b border-stone-200 dark:border-stone-800 bg-paper-dots">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">
                SỔ TAY KHUNG CHƯƠNG TRÌNH ĐÀO TẠO
              </span>
              <h2 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 mt-1">
                4 Khối Kiến Thức Đào Tạo UTC FIT
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 font-sans">
                Khung phân bổ 55 môn học chuẩn theo tín chỉ. Bấm vào từng môn để tra cứu trực tiếp toàn bộ tài liệu và bài giảng.
              </p>
            </div>

            {/* Tab Navigation styled as Ledger Section Dividers with distinctive ribbon colors */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-6">
              {KNOWLEDGE_BLOCKS.map((block) => {
                const isActive = activeBlock === block.id
                return (
                  <button
                    key={block.id}
                    onClick={() => {
                      setActiveBlock(block.id)
                      setSubjectSearch('')
                    }}
                    className={`p-3.5 rounded-lg text-left border-2 transition-all cursor-pointer font-mono ${
                      isActive
                        ? block.activeClass
                        : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1 opacity-80">
                      <span>{block.sectionCode}</span>
                      <span className="font-bold">{block.subjects.length} MÔN</span>
                    </div>
                    <span className="text-xs font-bold font-sans block truncate">
                      {block.shortTitle}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Syllabus Sheet Box */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border-2 border-stone-300 dark:border-stone-700 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h3 className="font-serif-academic text-2xl font-bold text-stone-950 dark:text-stone-50">
                    {currentBlockData.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-mono">
                    {currentBlockData.desc}
                  </p>
                </div>

                {/* Filter within block */}
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Lọc môn học / mã môn..."
                    className="w-full bg-stone-50 dark:bg-stone-850 pl-9 pr-3 py-2 rounded-lg text-xs font-mono border border-stone-300 dark:border-stone-700 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Grid of subjects formatted like lined index cards with colorful category chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSubjects.map((sub: any) => (
                  <div
                    key={sub.code}
                    onClick={() => handleSubjectClick(sub.name, sub.code)}
                    className="group p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-blue-500 dark:hover:border-blue-400 bg-stone-50/60 dark:bg-stone-850/50 hover:bg-white dark:hover:bg-stone-850 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
                          {sub.code}
                        </span>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          {sub.credit} TC
                        </span>
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${getTrackBadgeClass(sub.color)}`}>
                          #{sub.track}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate font-sans">
                        {sub.name}
                      </h4>
                    </div>

                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-stone-500">
                <span>QUY CHUẨN ĐÀO TẠO TÍN CHỈ KHOA CÔNG NGHỆ THÔNG TIN · UTC</span>
                <Link
                  to="/search?tab=hub"
                  className="font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 uppercase"
                >
                  <span>Mở Sổ tay Học phần (Course Hub) →</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            4. 8 PHÂN LOẠI HỌC LIỆU CHUẨN HÓA (COLORFUL LIBRARY TILES)
           ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 bg-[#faf9f5] dark:bg-[#090d14] border-b border-stone-200 dark:border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-purple-700 dark:text-purple-400">
                DANH MỤC THỦ THƯ HỌC THUẬT
              </span>
              <h2 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 mt-1">
                8 Loại Tài Liệu Chuẩn Hóa
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 font-sans">
                Không trùng lặp, chuẩn quy chuẩn trích dẫn, phục vụ học tập và nghiên cứu thực tiễn.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {OFFICIAL_DOCUMENT_TYPES.map((type) => {
                const colorConfig: Record<string, { icon: React.ReactNode; bg: string; border: string; badge: string; text: string }> = {
                  SLIDE: {
                    icon: <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
                    bg: 'bg-gradient-to-b from-blue-50/70 to-white dark:from-blue-950/20 dark:to-stone-900',
                    border: 'border-blue-200 dark:border-blue-900 hover:border-blue-500',
                    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
                    text: 'text-blue-700 dark:text-blue-400',
                  },
                  NOTE: {
                    icon: <BookMarked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
                    bg: 'bg-gradient-to-b from-indigo-50/70 to-white dark:from-indigo-950/20 dark:to-stone-900',
                    border: 'border-indigo-200 dark:border-indigo-900 hover:border-indigo-500',
                    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
                    text: 'text-indigo-700 dark:text-indigo-400',
                  },
                  ASSIGNMENT: {
                    icon: <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
                    bg: 'bg-gradient-to-b from-amber-50/70 to-white dark:from-amber-950/20 dark:to-stone-900',
                    border: 'border-amber-200 dark:border-amber-900 hover:border-amber-500',
                    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                    text: 'text-amber-700 dark:text-amber-400',
                  },
                  SAMPLE_CODE: {
                    icon: <FolderGit2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
                    bg: 'bg-gradient-to-b from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-stone-900',
                    border: 'border-emerald-200 dark:border-emerald-900 hover:border-emerald-500',
                    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                    text: 'text-emerald-700 dark:text-emerald-400',
                  },
                  REFERENCE: {
                    icon: <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
                    bg: 'bg-gradient-to-b from-purple-50/70 to-white dark:from-purple-950/20 dark:to-stone-900',
                    border: 'border-purple-200 dark:border-purple-900 hover:border-purple-500',
                    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
                    text: 'text-purple-700 dark:text-purple-400',
                  },
                  THESIS: {
                    icon: <GraduationCap className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
                    bg: 'bg-gradient-to-b from-rose-50/70 to-white dark:from-rose-950/20 dark:to-stone-900',
                    border: 'border-rose-200 dark:border-rose-900 hover:border-rose-500',
                    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
                    text: 'text-rose-700 dark:text-rose-400',
                  },
                  EXAM: {
                    icon: <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
                    bg: 'bg-gradient-to-b from-orange-50/70 to-white dark:from-orange-950/20 dark:to-stone-900',
                    border: 'border-orange-200 dark:border-orange-900 hover:border-orange-500',
                    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
                    text: 'text-orange-700 dark:text-orange-400',
                  },
                  LAB: {
                    icon: <FileCode2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
                    bg: 'bg-gradient-to-b from-teal-50/70 to-white dark:from-teal-950/20 dark:to-stone-900',
                    border: 'border-teal-200 dark:border-teal-900 hover:border-teal-500',
                    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
                    text: 'text-teal-700 dark:text-teal-400',
                  },
                }

                const cfg = colorConfig[type.code] || colorConfig.SLIDE

                return (
                  <Link
                    key={type.code}
                    to={`/search?type=${type.code}`}
                    className={`p-5 rounded-xl ${cfg.bg} border-2 ${cfg.border} transition-all hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-stone-800 shadow-xs flex items-center justify-center border border-stone-200 dark:border-stone-700">
                          {cfg.icon}
                        </div>
                        <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded ${cfg.badge} uppercase`}>
                          [{type.code}]
                        </span>
                      </div>

                      <h3 className="font-serif-academic text-base font-bold text-stone-950 dark:text-stone-50 group-hover:underline">
                        {type.label}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2 font-sans leading-relaxed">
                        {type.description}
                      </p>
                    </div>

                    <div className={`mt-4 pt-3 border-t border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-mono font-bold ${cfg.text}`}>
                      <span>TRA CỨU</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            5. BENTO GRID: CÔNG CỤ NGHIÊN CỨU ĐỘC BẢN (RICH VIBRANT RESEARCH WORKBENCH)
           ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 bg-[#fbfbfa] dark:bg-[#0c1017] border-b border-stone-200 dark:border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-700 dark:text-amber-400">
                BÀN LÀM VIỆC NGHIÊN CỨU (RESEARCH WORKBENCH)
              </span>
              <h2 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 mt-1">
                Công Cụ Học Thuật Độc Bản
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 font-sans">
                Các tiện ích độc quyền hỗ trợ tra cứu, đối soát liêm chính và tải biểu mẫu chuẩn cho sinh viên Khoa CNTT.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Novelty Checker (Span 2) — Deep Indigo & Electric Cyan */}
              <div className="md:col-span-2 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 border-2 border-indigo-500/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="stamp-seal text-amber-300 border-amber-300 bg-amber-400/10">
                      THUẬT TOÁN ĐỐI SOÁT Ý TƯỞNG
                    </span>
                    <span className="font-mono text-xs text-blue-300 font-bold">TOOL // 01</span>
                  </div>

                  <h3 className="font-serif-academic text-2xl sm:text-3xl font-bold text-white mb-2">
                    Đối Soát Đề Tài &amp; Cảnh Báo Trùng Lặp Khóa Trước
                  </h3>
                  <p className="text-sm text-blue-100/90 leading-relaxed max-w-xl mb-6 font-sans">
                    Thuật toán đo độ tương đồng ngữ nghĩa và từ khóa cosine similarity giữa đề tài dự kiến
                    của sinh viên với toàn bộ kho lưu trữ KLTN và Bài tập lớn các năm trước,
                    giúp phát hiện hướng trùng lặp trước khi đăng ký bảo vệ với Giảng viên hướng dẫn.
                  </p>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-4 pt-4 border-t border-indigo-800/80">
                  <Link
                    to="/search?tab=novelty"
                    className="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-blue-500/30"
                  >
                    <span>Mở công cụ đối soát đề tài</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-xs font-mono text-blue-300">
                    Thuật toán Cosine + TF-IDF (Miễn phí 100%)
                  </span>
                </div>
              </div>

              {/* Feature 2: Heatmap Coverage — Rich Violet Tone */}
              <div className="bg-gradient-to-b from-purple-50/70 via-white to-white dark:from-purple-950/20 dark:via-stone-900 dark:to-stone-900 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800/80 hover:border-purple-500 transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-purple-700 dark:text-purple-400 font-bold">TOOL // 02</span>
                    <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif-academic text-xl font-bold text-stone-950 dark:text-stone-50 mb-2">
                    Bản Đồ Độ Phủ Học Liệu
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans mb-4">
                    Ma trận trực quan hóa tình trạng học liệu của 55 môn học: phát hiện môn nào đã đủ slide, đề thi, BTL; môn nào đang thiếu để ban học tập bổ sung.
                  </p>
                </div>

                <Link
                  to="/search?tab=heatmap"
                  className="pt-3 border-t border-dashed border-purple-200 dark:border-purple-800 text-xs font-mono font-bold uppercase text-purple-700 dark:text-purple-400 hover:underline flex items-center justify-between"
                >
                  <span>Xem bản đồ độ phủ</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Feature 3: Course Hub — Warm Amber Tone */}
              <div className="bg-gradient-to-b from-amber-50/70 via-white to-white dark:from-amber-950/20 dark:via-stone-900 dark:to-stone-900 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800/80 hover:border-amber-500 transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-amber-700 dark:text-amber-400 font-bold">TOOL // 03</span>
                    <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                      <Compass className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif-academic text-xl font-bold text-stone-950 dark:text-stone-50 mb-2">
                    Sổ Tay Học Phần (Course Hub)
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans mb-4">
                    Gom toàn bộ tài liệu của từng môn học trong một bảng tra cứu duy nhất: đề cương, slide giảng bài, bài tập thực hành lab và kho đề thi.
                  </p>
                </div>

                <Link
                  to="/search?tab=hub"
                  className="pt-3 border-t border-dashed border-amber-200 dark:border-amber-800 text-xs font-mono font-bold uppercase text-amber-700 dark:text-amber-400 hover:underline flex items-center justify-between"
                >
                  <span>Mở Sổ tay môn học</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Feature 4: Templates Center (Span 2) — Emerald & Forest Depth */}
              <div className="md:col-span-2 bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="stamp-seal text-emerald-300 border-emerald-400 bg-emerald-400/10">
                      QUY CÁCH CHUẨN UTC FIT
                    </span>
                    <span className="font-mono text-xs text-emerald-300 font-bold">TOOL // 04</span>
                  </div>

                  <h3 className="font-serif-academic text-2xl font-bold text-white mb-2">
                    Trung Tâm Biểu Mẫu Chuẩn (LaTeX &amp; Word)
                  </h3>
                  <p className="text-sm text-emerald-100/90 leading-relaxed max-w-xl mb-4 font-sans">
                    Template bìa báo cáo BTL, khung slide thuyết trình PowerPoint/Canva, và mẫu Khóa luận tốt nghiệp chuẩn LaTeX/Overleaf đúng quy chuẩn của Khoa CNTT - ĐH Giao thông Vận tải.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-emerald-800/80">
                  <Link
                    to="/templates"
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-emerald-600/30"
                  >
                    Tải Biểu mẫu UTC FIT
                  </Link>
                  <Link
                    to="/exams"
                    className="px-5 py-2.5 rounded-lg border border-emerald-400/60 font-mono text-xs font-bold uppercase text-emerald-200 hover:bg-emerald-900/40 transition-colors"
                  >
                    Kho Đề thi có lời giải
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            6. FEATURED & VERIFIED DOCUMENTS SHOWCASE (RESEARCH MANUSCRIPTS)
           ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 bg-[#faf9f5] dark:bg-[#090d14] border-b border-stone-200 dark:border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-stone-300 dark:border-stone-800">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-blue-700 dark:text-blue-400">
                  HỌC LIỆU MỚI KIỂM DUYỆT
                </span>
                <h2 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 mt-1">
                  Bản Thảo &amp; Đề Tài Mới Thẩm Định
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 font-sans">
                  Tất cả tài liệu hiển thị đều đã trải qua quy trình phản biện chất lượng và cam kết liêm chính học thuật.
                </p>
              </div>

              <Link
                to="/search"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 hover:underline shrink-0"
              >
                <span>Xem toàn văn kho lưu trữ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loadingDocs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-60 rounded-xl bg-stone-100 dark:bg-stone-850 animate-pulse border border-stone-200 dark:border-stone-800" />
                ))}
              </div>
            ) : featuredDocs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="group bg-white dark:bg-stone-900 rounded-xl p-5 border-2 border-stone-200 dark:border-stone-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all hover:shadow-lg flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      {/* Document Type Code & Stamp */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                          [{doc.documentTypeName || doc.documentTypeCode}]
                        </span>

                        {doc.status === 'APPROVED' && (
                          <span className="stamp-seal text-emerald-700 dark:text-emerald-300 border-emerald-600 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[9px]">
                            ĐÃ DUYỆT
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <Link
                        to={`/documents/${doc.id}`}
                        className="font-serif-academic text-lg font-bold text-stone-950 dark:text-stone-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug"
                      >
                        {doc.title}
                      </Link>

                      {/* Meta Information */}
                      <div className="mt-3 space-y-1 text-xs font-mono text-stone-500 dark:text-stone-400">
                        {doc.subjectName && (
                          <div className="truncate">
                            <span className="text-stone-400">Môn: </span>
                            <span className="text-stone-800 dark:text-stone-200 font-semibold">{doc.subjectName}</span>
                          </div>
                        )}
                        {doc.advisorName && (
                          <div className="truncate">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">GVHD: </span>
                            <span className="text-stone-800 dark:text-stone-200">{doc.advisorName}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-stone-400">Tác giả: </span>
                          <span>{doc.authorName || 'Sinh viên CNTT'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-5 pt-3 border-t border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-stone-500">
                        <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{doc.viewCount || 0} lượt đọc</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Citation button */}
                        <button
                          type="button"
                          onClick={() => setCitationModal({ isOpen: true, doc })}
                          title="Trích dẫn IEEE/APA/BibTeX"
                          className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {/* PDF Preview */}
                        <button
                          type="button"
                          onClick={() => setViewerModal({ isOpen: true, doc })}
                          className="px-3 py-1.5 rounded bg-blue-600 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                        >
                          Đọc bản thảo
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700">
                <FileSearch className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                <p className="font-mono text-xs text-stone-500">Chưa có bản thảo mới được lưu trữ</p>
                <Link
                  to="/documents/upload"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase"
                >
                  <span>Gửi tài liệu đầu tiên →</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            7. BẢN CAM KẾT LIÊM CHÍNH HỌC THUẬT (ACADEMIC HONOR COVENANT)
           ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 bg-[#f4f3ee] dark:bg-[#0a0d12] border-b border-stone-300 dark:border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-stone-900 rounded-2xl p-8 sm:p-12 border-2 border-amber-300/80 dark:border-amber-700/60 shadow-lg relative overflow-hidden">
              {/* Subtle gold ribbon top border */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-blue-600" />

              {/* Archival corner stamp */}
              <div className="absolute top-6 right-6 hidden sm:block">
                <span className="stamp-seal text-rose-700 dark:text-rose-400 border-rose-600 dark:border-rose-400 bg-rose-50 dark:bg-rose-950/50">
                  HIẾN CHƯƠNG KHOA CNTT
                </span>
              </div>

              <div className="mb-6">
                <span className="font-mono text-xs font-bold tracking-widest text-amber-700 dark:text-amber-400 uppercase">
                  QUY CHẾ HỌC THUẬT NỘI BỘ
                </span>
                <h2 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 mt-1">
                  Bản Cam Kết Liêm Chính Học Thuật
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 font-sans leading-relaxed">
                  Cổng học liệu số Khoa Công nghệ Thông tin - Trường ĐH Giao thông Vận tải hoạt động trên nguyên tắc phi lợi nhuận. Mọi thành viên khi sử dụng hệ thống đều cam kết tuân thủ các chuẩn mực:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                {[
                  {
                    no: '01',
                    title: 'Phi thương mại hóa',
                    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
                    desc: 'Nghiêm cấm mọi hành vi mua bán, thương mại hóa học liệu và đề tài nghiên cứu của Khoa dưới mọi hình thức.',
                  },
                  {
                    no: '02',
                    title: 'Minh bạch nguồn gốc & GVHD',
                    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                    desc: 'Mọi báo cáo, khóa luận công bố phải ghi danh đầy đủ tác giả, người hướng dẫn và trích dẫn theo chuẩn IEEE / APA.',
                  },
                  {
                    no: '03',
                    title: 'Thẩm định chất lượng 2 vòng',
                    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                    desc: 'Chỉ các đề tài đạt điểm giỏi, xuất sắc và được bộ môn phê duyệt mới được cấp quyền hiển thị toàn văn.',
                  },
                  {
                    no: '04',
                    title: 'Phản biện & Phòng chống đạo văn',
                    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
                    desc: 'Hệ thống tự động lưu trữ chữ ký số nội dung để đối soát và bảo vệ quyền tác giả học thuật của sinh viên.',
                  },
                ].map((item) => (
                  <div key={item.no} className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-stone-400">
                        QUY TẮC // {item.no}
                      </span>
                      <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${item.badge}`}>
                        BẮT BUỘC
                      </span>
                    </div>
                    <h4 className="font-serif-academic text-base font-bold text-stone-900 dark:text-stone-100">
                      {item.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-mono text-stone-500">
                  BAN CHỦ NHIỆM KHOA CÔNG NGHỆ THÔNG TIN · TRƯỜNG ĐH GIAO THÔNG VẬN TẢI
                </span>
                <Link
                  to="/documents/upload"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-blue-600/20 shrink-0"
                >
                  Đóng góp học liệu cho Khoa →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* PDF Viewer Modal */}
      {viewerModal.isOpen && viewerModal.doc && (
        <PdfViewerModal
          isOpen={viewerModal.isOpen}
          onClose={() => setViewerModal({ isOpen: false, doc: null })}
          title={viewerModal.doc.title}
          fileId={viewerModal.doc.fileId}
          fileUrl={viewerModal.doc.fileUrl}
          fileName={viewerModal.doc.fileName}
        />
      )}

      {/* Citation Generator Modal */}
      {citationModal.isOpen && citationModal.doc && (
        <CitationModal
          isOpen={citationModal.isOpen}
          onClose={() => setCitationModal({ isOpen: false, doc: null })}
          doc={citationModal.doc}
        />
      )}
    </div>
  )
}
