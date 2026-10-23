// === LUỒNG 5: NGÂN HÀNG ĐỀ THI & BIỂU MẪU HỌC THUẬT (TemplateCenter Flow) ===
// Cung cấp các biểu mẫu chuẩn UTC: Mẫu Word BTL/Đồ án, Khóa luận LaTeX Overleaf, Slide PPTX 16:9, Quy chuẩn căn lề
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileCode2,
  FileText,
  Presentation,
  CheckSquare,
  Download,
  ExternalLink,
  ShieldCheck,
  BookmarkCheck,
  Sparkles,
  ChevronRight,
  School,
  Copy,
  Check,
  Filter,
  Eye,
  BookOpen,
  Info,
  Layers,
  FileCheck2,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Hash,
  AlignLeft,
  Scissors
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PdfViewerModal from '../components/PdfViewerModal'
import CustomCheckbox from '../components/ui/CustomCheckbox'
import { useToast } from '../contexts/ToastContext'

// LUỒNG 5: Các phân loại danh mục biểu mẫu chuẩn UTC
type CategoryType = 'ALL' | 'WORD' | 'LATEX' | 'PPTX' | 'FORM' | 'GUIDE'

interface AcademicTemplate {
  id: number
  title: string
  category: 'WORD' | 'LATEX' | 'PPTX' | 'FORM' | 'GUIDE'
  categoryLabel: string
  badgeClass: string
  desc: string
  features: string[]
  format: string
  fileSize: string
  filePath: string
  isHot?: boolean
  overleafUrl?: string
  previewPdfUrl?: string
}

const TEMPLATES: AcademicTemplate[] = [
  {
    id: 1,
    title: 'Mẫu Báo Cáo Bài Tập Lớn & Đồ Án Môn Học Chuẩn Khoa CNTT (Word)',
    category: 'WORD',
    categoryLabel: 'Word (.docx)',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    desc: 'Quy chuẩn trang bìa chính thức có logo Trường ĐH Giao thông Vận tải & Khoa CNTT, trang phụ bìa, mục lục tự động, danh mục bảng biểu và định dạng căn lề chuẩn học thuật.',
    features: [
      'Font Times New Roman 13pt, giãn dòng 1.3 line, before 6pt',
      'Định dạng căn lề chuẩn: Trái 3.5cm, Phải 2.0cm, Trên 2.0cm, Dưới 2.0cm',
      'Đánh số hình ảnh & bảng biểu tự động theo từng chương (Chương 1: Hình 1.1, 1.2)',
      'Trang bìa chính in khung viền chuẩn & trang nhận xét của giảng viên'
    ],
    format: 'DOCX',
    fileSize: '2.4 MB',
    filePath: '/documents/DacTaPM_BaoCao_DoAn_KTPM.docx',
    previewPdfUrl: '/sample.pdf',
    isHot: true
  },
  {
    id: 2,
    title: 'Mẫu Đặc Tả Yêu Cầu Phần Mềm SRS Chuẩn IEEE 830 (Software Requirements)',
    category: 'WORD',
    categoryLabel: 'Word (.docx)',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    desc: 'Khung tài liệu đặc tả yêu cầu phần mềm chi tiết dành cho các học phần Công nghệ phần mềm, Phân tích thiết kế HTTT và Đồ án tốt nghiệp kỹ sư CNTT.',
    features: [
      'Cấu trúc IEEE 830 chuẩn: Giới thiệu, Mô tả tổng quan, Yêu cầu cụ thể',
      'Bảng biểu mẫu mô tả ca sử dụng (Use Case Specification template)',
      'Phần đặc tả yêu cầu phi chức năng (Hiệu năng, Bảo mật, Độ tin cậy)',
      'Khung ma trận truy vết yêu cầu (Traceability Matrix)'
    ],
    format: 'DOCX',
    fileSize: '18 KB',
    filePath: '/documents/DacTaPM_BTL_SRS_FlashSale_Ticketing.docx',
    previewPdfUrl: '/sample.pdf',
    isHot: true
  },
  {
    id: 3,
    title: 'Khung Khóa Luận Tốt Nghiệp Kỹ Sư / Cử Nhân LaTeX (Overleaf Template)',
    category: 'LATEX',
    categoryLabel: 'LaTeX (Overleaf)',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    desc: 'Bộ mã nguồn LaTeX chuẩn IEEE & Khoa CNTT UTC tích hợp sẵn gói thuật toán (algorithm2e), tô màu mã nguồn (minted/listings) và quản lý trích dẫn BibTeX tự động.',
    features: [
      'Sẵn sàng clone và biên dịch trực tiếp trên nền tảng Overleaf',
      'Định dạng chuẩn phong cách xuất bản kỹ thuật & toán tin',
      'Tích hợp môi trường chứng minh định lý, công thức KaTeX/AMS-LaTeX',
      'Tự động đồng bộ danh mục trích dẫn tài liệu tham khảo file .bib'
    ],
    format: 'ZIP / LaTeX',
    fileSize: '1.2 MB',
    filePath: '/sample.pdf',
    overleafUrl: 'https://www.overleaf.com/latex/templates',
    previewPdfUrl: '/sample.pdf',
    isHot: true
  },
  {
    id: 4,
    title: 'Slide Thuyết Trình Hội Đồng Chấm Bảo Vệ Khóa Luận & Đồ Án (PowerPoint)',
    category: 'PPTX',
    categoryLabel: 'PowerPoint (.pptx)',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    desc: 'Bộ slide 16:9 thiết kế hiện đại tông xanh Navy & Trắng nhận diện thương hiệu UTC FIT, tối ưu cho 15 phút báo cáo trước hội đồng chấm bảo vệ khóa luận và đồ án.',
    features: [
      '25 layouts thiết kế theo logic báo cáo khoa học 15 phút',
      'Slide giới thiệu bài toán, kiến trúc hệ thống, demo và kết quả thực nghiệm',
      'Sẵn các icon công nghệ, sơ đồ phân cấp microservices & biểu đồ so sánh',
      'Animation nhẹ nhàng, chuyên nghiệp, không gây rối mắt hội đồng'
    ],
    format: 'PPTX',
    fileSize: '905 KB',
    filePath: '/documents/CNPM_Slide_CongNghePhanMem.pptx',
    previewPdfUrl: '/sample.pdf',
    isHot: true
  },
  {
    id: 5,
    title: 'Slide Báo Cáo Tiến Độ Nghiên Cứu & Hướng Dẫn Lựa Chọn Đề Tài',
    category: 'PPTX',
    categoryLabel: 'PowerPoint (.pptx)',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    desc: 'Khung slide báo cáo tuần định kỳ với giảng viên hướng dẫn (GVHD), theo dõi milestone thực hiện dự án và đánh giá tính khả thi kỹ thuật.',
    features: [
      'Khung bảng tiến độ Gantt Chart theo từng tuần',
      'Slide phân tích rủi ro kỹ thuật (Technical Risks & Mitigation)',
      'Slide tổng hợp tài liệu tham khảo đọc trong tuần'
    ],
    format: 'PPTX',
    fileSize: '881 KB',
    filePath: '/documents/Project01_HuongDan_LuaChonDeTai.pptx',
    previewPdfUrl: '/sample.pdf'
  },
  {
    id: 6,
    title: 'Bộ Biểu Mẫu Hành Chính: BM-01 (Phiếu Giao Đề Tài) & BM-02 (Nhận Xét GVHD)',
    category: 'FORM',
    categoryLabel: 'Biểu mẫu hành chính',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    desc: 'Biểu mẫu chính thức ban hành năm học 2024-2025 theo quy định đào tạo Khoa CNTT: Phiếu đăng ký đề tài, theo dõi tiến độ tuần và phiếu đánh giá của GVHD/GVPB.',
    features: [
      'Chuẩn mẫu ban hành mới nhất của Bộ môn & Khoa CNTT',
      'Khung chấm điểm theo thang rubric 10 điểm rõ ràng',
      'Đầy đủ các trường xác nhận chữ ký số hoặc chữ ký tay'
    ],
    format: 'DOCX / PDF',
    fileSize: '120 KB',
    filePath: '/sample.pdf',
    previewPdfUrl: '/sample.pdf'
  },
  {
    id: 7,
    title: 'Mẫu Báo Cáo Thực Tập Tốt Nghiệp Doanh Nghiệp (Internship Report)',
    category: 'WORD',
    categoryLabel: 'Word (.docx)',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    desc: 'Khung báo cáo thực tập tại doanh nghiệp đối tác CNTT, kèm giấy tiếp nhận thực tập và phiếu nhận xét năng lực của Mentor doanh nghiệp.',
    features: [
      'Bìa tiếp nhận thực tập có chữ ký và con dấu doanh nghiệp',
      'Nhật ký ghi chép công việc thực tập theo tuần',
      'Báo cáo giải pháp công nghệ đã trực tiếp tham gia phát triển'
    ],
    format: 'DOCX',
    fileSize: '2.4 MB',
    filePath: '/documents/DacTaPM_BaoCao_DoAn_KTPM.docx',
    previewPdfUrl: '/sample.pdf'
  },
  {
    id: 8,
    title: 'Quy Chuẩn Trích Dẫn Học Thuật & Chống Đạo Văn (IEEE & APA 7th Edition)',
    category: 'GUIDE',
    categoryLabel: 'Hướng dẫn & Quy chuẩn',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    desc: 'Cẩm nang hướng dẫn định dạng trích dẫn nguồn sách, bài báo khoa học, luận văn và nguồn dữ liệu internet để tránh bị trừ điểm hoặc vi phạm liêm chính học thuật.',
    features: [
      'Hướng dẫn chi tiết định dạng trích dẫn chuẩn IEEE và APA 7th',
      'Quy định về tỷ lệ tương đồng văn bản (Turnitin / DoIT < 20%)',
      'Quy chuẩn công bố mã nguồn mở kèm giấy phép (MIT / Apache 2.0)'
    ],
    format: 'PDF',
    fileSize: '350 KB',
    filePath: '/sample.pdf',
    previewPdfUrl: '/sample.pdf'
  }
]

export const TemplateCenter: React.FC = () => {
  const toast = useToast()
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Trạng thái các hộp thoại và công cụ phụ trợ
  const [viewerModal, setViewerModal] = useState<{ isOpen: boolean; title: string; fileUrl: string }>({
    isOpen: false,
    title: '',
    fileUrl: ''
  })
  const [rubricModalOpen, setRubricModalOpen] = useState(false)
  const [checklistModalOpen, setChecklistModalOpen] = useState(false)

  // Trạng thái bảng kiểm tra 10 tiêu chí quy chuẩn nộp báo cáo
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
    3: false,
    4: true,
    5: false,
    6: true,
    7: false,
    8: true,
    9: false,
    10: false
  })

  // Trạng thái công cụ tạo trích dẫn học thuật tự động
  const [citationType, setCitationType] = useState<'paper' | 'book' | 'web'>('paper')
  const [citeAuthors, setCiteAuthors] = useState('Trần Văn Hùng, Đào Thị Lệ Thủy')
  const [citeTitle, setCiteTitle] = useState('Nghiên cứu ứng dụng K3s và MQTT trong Điện toán Biên IoT Công nghiệp')
  const [citeYear, setCiteYear] = useState('2024')
  const [citeVenue, setCiteVenue] = useState('Kỷ yếu Hội nghị Khoa học Công nghệ Giao thông Vận tải')
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  const handleDownload = (tpl: AcademicTemplate) => {
    toast.info(`Bắt đầu tải về biểu mẫu: ${tpl.title}`)
    const link = document.createElement('a')
    link.href = tpl.filePath
    link.download = `${tpl.title.replace(/[^a-zA-Z0-9\-_]/g, '_')}.${tpl.format.toLowerCase()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreviewPdf = (tpl: AcademicTemplate) => {
    setViewerModal({
      isOpen: true,
      title: tpl.title,
      fileUrl: tpl.previewPdfUrl || '/sample.pdf'
    })
  }

  const toggleChecklistItem = (id: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const checklistScore = Object.values(checkedItems).filter(Boolean).length
  const checklistPercent = Math.round((checklistScore / 10) * 100)

  // Kết quả trích dẫn được sinh ra
  const ieeeCitation = `[1] ${citeAuthors}, "${citeTitle}," ${citeVenue}, ${citeYear}.`
  const apaCitation = `${citeAuthors} (${citeYear}). ${citeTitle}. ${citeVenue}.`
  const bibtexCitation = `@article{utc_fit_${citeYear},
  author  = {${citeAuthors.replace(/,/g, ' and')}},
  title   = {${citeTitle}},
  journal = {${citeVenue}},
  year    = {${citeYear}}
}`

  const copyToClipboard = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedFormat(formatName)
    toast.success(`Đã sao chép định dạng ${formatName}!`)
    setTimeout(() => setCopiedFormat(null), 2500)
  }

  // Thuật toán lọc danh sách biểu mẫu theo danh mục và từ khóa
  const filteredTemplates = TEMPLATES.filter((tpl) => {
    if (selectedCategory !== 'ALL' && tpl.category !== selectedCategory) {
      return false
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchTitle = tpl.title.toLowerCase().includes(q)
      const matchDesc = tpl.desc.toLowerCase().includes(q)
      const matchFormat = tpl.format.toLowerCase().includes(q)
      if (!matchTitle && !matchDesc && !matchFormat) return false
    }
    return true
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] dark:bg-[#0c1017] text-stone-900 dark:text-stone-100 antialiased transition-colors duration-150">
      <Navbar />

      <main className="w-full pt-20 pb-20 flex-grow bg-paper-grid">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          
          {/* Thanh điều hướng Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-6 pt-2">
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Trang chủ</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/search" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tra cứu học liệu</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-stone-800 dark:text-stone-200 font-semibold font-mono">/templates</span>
            </div>
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              QUY CHUẨN ĐỒ ÁN FIT-UTC • BAN HÀNH CHÍNH THỨC
            </span>
          </div>

          {/* Tiêu đề trang, thông số học thuật và các nút công cụ */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-stone-300 dark:border-stone-800 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="stamp-seal text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 text-[10px]">
                  [ TRUNG TÂM BIỂU MẪU &amp; QUY CÁCH CHUẨN UTC ]
                </span>
                <span className="text-stone-400">/</span>
                <span className="font-mono text-xs text-stone-500">KHOA CNTT · ĐH GIAO THÔNG VẬN TẢI</span>
              </div>

              <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 tracking-tight">
                Biểu Mẫu Chuẩn &amp; Quy Cách Trình Bày
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl font-sans">
                Tổng hợp đầy đủ mẫu báo cáo Bài tập lớn (Word .docx), Đồ án tốt nghiệp (LaTeX/Overleaf), Slide bảo vệ Hội đồng (PowerPoint .pptx) và bộ biểu mẫu hành chính BM-01/02 được chuẩn hóa theo quy định của Khoa Công nghệ Thông tin - Trường ĐH Giao thông Vận tải.
              </p>
            </div>

            {/* Counter & Action Modals */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <div className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-xs font-bold text-stone-700 dark:text-stone-300">
                <span className="text-emerald-600 dark:text-emerald-400">{filteredTemplates.length}</span> BIỂU MẪU CHUẨN
              </div>

              <button
                type="button"
                onClick={() => setRubricModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Quy Cách Căn Lề</span>
              </button>

              <button
                type="button"
                onClick={() => setChecklistModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Checklist Nộp Bài ({checklistScore}/10)</span>
              </button>
            </div>
          </div>

          {/* Dải thông số thống kê số lượng biểu mẫu */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border-2 border-stone-200/90 dark:border-stone-800/90 shadow-2xs">
              <div className="font-mono text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">8+</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-sans mt-0.5">Biểu mẫu chuẩn hóa</div>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border-2 border-blue-200/70 dark:border-blue-800/50 shadow-2xs">
              <div className="font-mono text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">14.8k+</div>
              <div className="text-[11px] text-blue-600/90 dark:text-blue-400/90 font-sans mt-0.5">Lượt tải sinh viên</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-200/70 dark:border-emerald-800/50 shadow-2xs">
              <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">100%</div>
              <div className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 font-sans mt-0.5">Quy chuẩn UTC FIT</div>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-200/70 dark:border-amber-800/50 shadow-2xs">
              <div className="font-mono text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300">IEEE &amp; APA</div>
              <div className="text-[11px] text-amber-600/90 dark:text-amber-400/90 font-sans mt-0.5">Trích dẫn khoa học</div>
            </div>
          </div>

          {/* LUỒNG 5: Trạm điều khiển danh mục và tìm kiếm biểu mẫu */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-stone-300 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4 mb-6">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Các nhãn chọn danh mục (Tất cả, Word, LaTeX, Slide, Biểu mẫu) */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: 'ALL' as CategoryType, label: 'Tất cả biểu mẫu' },
                  { key: 'WORD' as CategoryType, label: 'Word (.docx)' },
                  { key: 'LATEX' as CategoryType, label: 'LaTeX (Overleaf)' },
                  { key: 'PPTX' as CategoryType, label: 'Slide PowerPoint' },
                  { key: 'FORM' as CategoryType, label: 'Biểu mẫu hành chính' },
                  { key: 'GUIDE' as CategoryType, label: 'Quy chuẩn trích dẫn' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedCategory(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                      selectedCategory === tab.key
                        ? 'bg-emerald-600 border-emerald-700 text-white font-bold shadow-2xs'
                        : 'bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Ô tìm kiếm biểu mẫu */}
              <div className="relative min-w-[280px]">
                <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Lọc theo tên biểu mẫu, định dạng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-950 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-stone-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* LUỒNG 5: Lưới danh sách các biểu mẫu chuẩn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="flex flex-col justify-between bg-[#fffdfa] dark:bg-[#12161f] border border-stone-200/90 dark:border-stone-800/90 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  {/* Nhãn định dạng tệp tin và huy hiệu Nổi bật */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md font-bold border ${tpl.badgeClass}`}>
                      {tpl.categoryLabel}
                    </span>
                    {tpl.isHot && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Phổ biến nhất
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold font-serif-academic text-stone-900 dark:text-stone-100 mb-2 leading-snug">
                    {tpl.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-stone-600 dark:text-stone-400 mb-4 leading-relaxed font-sans">
                    {tpl.desc}
                  </p>

                  {/* Danh sách các đặc điểm quy chuẩn của mẫu */}
                  <div className="space-y-2 mb-6 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/60">
                    <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Đặc điểm quy chuẩn:
                    </span>
                    {tpl.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-stone-600 dark:text-stone-300 font-sans leading-tight">
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions & Meta */}
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-mono">{tpl.fileSize} • {tpl.format}</span>
                  
                  <div className="flex items-center gap-1.5">
                    {/* Xem trước bản mẫu dạng PDF */}
                    <button
                      onClick={() => handlePreviewPdf(tpl)}
                      className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                      title="Xem trước mẫu"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Nút mở trực tiếp mẫu trên Overleaf */}
                    {tpl.overleafUrl && (
                      <a
                        href={tpl.overleafUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                        title="Mở dự án trên Overleaf"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Overleaf</span>
                      </a>
                    )}

                    {/* Nút tải tệp tin mẫu về máy */}
                    <button
                      onClick={() => handleDownload(tpl)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải về</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Công cụ tạo trích dẫn học thuật tương tác (IEEE, APA, BibTeX) ─── */}
          <div className="bg-[#fffdfa] dark:bg-[#12161f] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-6 sm:p-8 mb-12 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-mono text-xs font-semibold mb-1 border border-purple-200 dark:border-purple-800">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CÔNG CỤ HỌC THUẬT FIT-UTC</span>
                </div>
                <h3 className="font-serif-academic font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-50">
                  Bộ Tạo Trích Dẫn Nhanh Chuẩn IEEE, APA 7th &amp; BibTeX
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  Nhập thông tin tài liệu tham khảo và tự động sinh chuỗi trích dẫn chuẩn cho Báo cáo BTL hoặc Đồ án LaTeX
                </p>
              </div>

              {/* Type selector */}
              <div className="inline-flex rounded-lg border border-stone-200 dark:border-stone-700 p-0.5 bg-stone-50 dark:bg-stone-900 text-xs">
                <button
                  onClick={() => setCitationType('paper')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    citationType === 'paper' ? 'bg-white dark:bg-stone-800 font-bold shadow-xs text-stone-900 dark:text-stone-100' : 'text-stone-500'
                  }`}
                >
                  Bài báo / Kỷ yếu
                </button>
                <button
                  onClick={() => setCitationType('book')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    citationType === 'book' ? 'bg-white dark:bg-stone-800 font-bold shadow-xs text-stone-900 dark:text-stone-100' : 'text-stone-500'
                  }`}
                >
                  Sách / Giáo trình
                </button>
                <button
                  onClick={() => setCitationType('web')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    citationType === 'web' ? 'bg-white dark:bg-stone-800 font-bold shadow-xs text-stone-900 dark:text-stone-100' : 'text-stone-500'
                  }`}
                >
                  Khóa luận / Luận văn
                </button>
              </div>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-[11px] font-mono font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Tác giả (Cách nhau dấu phẩy):
                </label>
                <input
                  type="text"
                  value={citeAuthors}
                  onChange={(e) => setCiteAuthors(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Tiêu đề tài liệu / Tên bài báo:
                </label>
                <input
                  type="text"
                  value={citeTitle}
                  onChange={(e) => setCiteTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Năm xuất bản:
                </label>
                <input
                  type="text"
                  value={citeYear}
                  onChange={(e) => setCiteYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-mono font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Tạp chí / NXB / Hội thảo / Trường ĐH:
                </label>
                <input
                  type="text"
                  value={citeVenue}
                  onChange={(e) => setCiteVenue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-sans"
                />
              </div>
            </div>

            {/* Generated Outputs with 1-click Copy */}
            <div className="space-y-3">
              {/* IEEE */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    CHUẨN IEEE (ĐỒ ÁN &amp; KHÓA LUẬN FIT)
                  </span>
                  <div className="font-sans text-xs text-stone-800 dark:text-stone-200">{ieeeCitation}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(ieeeCitation, 'IEEE')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  {copiedFormat === 'IEEE' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormat === 'IEEE' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* APA */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    CHUẨN APA 7TH EDITION
                  </span>
                  <div className="font-sans text-xs text-stone-800 dark:text-stone-200">{apaCitation}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(apaCitation, 'APA')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  {copiedFormat === 'APA' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormat === 'APA' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* BibTeX */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1 w-full overflow-hidden">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    MÃ BIBTEX (CHO OVERLEAF / LATEX)
                  </span>
                  <pre className="font-mono text-[11px] text-stone-700 dark:text-stone-300 overflow-x-auto bg-[#fffdfa] dark:bg-[#151a24] p-2.5 rounded-lg border border-stone-200 dark:border-stone-800">
                    {bibtexCitation}
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(bibtexCitation, 'BibTeX')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  {copiedFormat === 'BibTeX' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormat === 'BibTeX' ? 'Đã chép' : 'Sao chép BibTeX'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Academic Integrity Guidelines Callout */}
          <div className="bg-[#fffdfa] dark:bg-[#12161f] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold font-serif-academic text-stone-900 dark:text-stone-100">
                  Quy Định Định Dạng &amp; Liêm Chính Học Thuật Khoa CNTT - UTC
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                  Tất cả các bản nộp khóa luận tốt nghiệp kỹ sư/cử nhân và báo cáo bài tập lớn phải tuân thủ nghiêm ngặt định dạng mẫu được Khoa ban hành. Mọi tài liệu tham khảo trích dẫn nguyên văn phải đặt trong dấu ngoặc kép và chỉ rõ số thứ tự trong danh mục tài liệu tham khảo. Đối với các đề tài có xây dựng phần mềm, sinh viên bắt buộc phải đính kèm đường link kho lưu trữ mã nguồn (GitHub/GitLab) có commit log minh bạch qua từng tuần thực hiện.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setRubricModalOpen(true)}
                    className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem chi tiết quy chuẩn căn lề 3.5cm</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-stone-300 dark:text-stone-700">•</span>
                  <button
                    onClick={() => setChecklistModalOpen(true)}
                    className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Mở bảng tự kiểm tra 10 tiêu chí</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Hộp thoại: Bảng quy chuẩn căn lề & định dạng văn bản UTC ───────── */}
      {rubricModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#fffdfa] dark:bg-[#12161f] border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <AlignLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-academic font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                    Bảng Quy Chuẩn Định Dạng Báo Cáo Học Thuật FIT-UTC
                  </h3>
                  <p className="text-xs text-stone-500 font-sans">
                    Quy định kích thước lề giấy, phông chữ, giãn dòng và cách đánh số bảng biểu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRubricModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-sans">
              {/* Margins */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#fffdfa] dark:bg-[#151a24]">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 font-mono text-[11px] uppercase tracking-wider mb-2.5">
                  1. Căn lề trang giấy (Page Margins - Khổ A4)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40">
                    <span className="text-[10px] text-stone-500 block">Lề Trái (Left)</span>
                    <span className="font-mono font-bold text-sm text-blue-700 dark:text-blue-300">3.5 cm</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">Để đóng gáy sách</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="text-[10px] text-stone-500 block">Lề Phải (Right)</span>
                    <span className="font-mono font-bold text-sm text-stone-800 dark:text-stone-200">2.0 cm</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="text-[10px] text-stone-500 block">Lề Trên (Top)</span>
                    <span className="font-mono font-bold text-sm text-stone-800 dark:text-stone-200">2.0 cm</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="text-[10px] text-stone-500 block">Lề Dưới (Bottom)</span>
                    <span className="font-mono font-bold text-sm text-stone-800 dark:text-stone-200">2.0 cm</span>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#fffdfa] dark:bg-[#151a24] space-y-2">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 font-mono text-[11px] uppercase tracking-wider">
                  2. Phông chữ &amp; Giãn dòng
                </h4>
                <ul className="space-y-1.5 text-stone-600 dark:text-stone-300 list-disc list-inside">
                  <li><span className="font-semibold text-stone-800 dark:text-stone-200">Font chữ:</span> Times New Roman (bắt buộc đối với Word) hoặc Computer Modern (đối với LaTeX).</li>
                  <li><span className="font-semibold text-stone-800 dark:text-stone-200">Cỡ chữ nội dung:</span> 13 pt (Regular), màu đen tự nhiên.</li>
                  <li><span className="font-semibold text-stone-800 dark:text-stone-200">Giãn dòng (Line Spacing):</span> 1.3 line hoặc 1.5 line (tùy bộ môn quy định).</li>
                  <li><span className="font-semibold text-stone-800 dark:text-stone-200">Giãn đoạn (Paragraph Spacing):</span> Before 6pt, After 0pt. Thụt đầu dòng 1.0 cm.</li>
                </ul>
              </div>

              {/* Headings */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#fffdfa] dark:bg-[#151a24] space-y-2">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 font-mono text-[11px] uppercase tracking-wider">
                  3. Tiêu đề các cấp (Headings)
                </h4>
                <div className="space-y-1 text-stone-700 dark:text-stone-300">
                  <div className="p-2 rounded bg-stone-50 dark:bg-stone-900 font-bold font-serif-academic text-sm">
                    CHƯƠNG 1: TỔNG QUAN HỆ THỐNG (14pt, IN HOA, ĐẬM, CĂN GIỮA)
                  </div>
                  <div className="p-2 rounded bg-stone-50 dark:bg-stone-900 font-bold text-xs pl-4">
                    1.1. Hiện trạng bài toán thực tế (13pt, Đậm, Căn trái)
                  </div>
                  <div className="p-2 rounded bg-stone-50 dark:bg-stone-900 italic font-semibold text-xs pl-8">
                    1.1.1. Các nghiên cứu liên quan gần đây (13pt, Đậm, Nghiêng, Căn trái)
                  </div>
                </div>
              </div>

              {/* Caption Figures & Tables */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#fffdfa] dark:bg-[#151a24] space-y-2">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 font-mono text-[11px] uppercase tracking-wider">
                  4. Đánh số Hình vẽ &amp; Bảng biểu
                </h4>
                <ul className="space-y-1.5 text-stone-600 dark:text-stone-300 list-disc list-inside">
                  <li><span className="font-semibold text-stone-800 dark:text-stone-200">Hình vẽ:</span> Tên hình đặt ở <span className="underline">DƯỚI</span> hình vẽ, in nghiêng căn giữa (Ví dụ: <i>Hình 2.1: Sơ đồ khối kiến trúc hệ thống</i>).</li>
                  <li><span className="font-semibold text-stone-800 dark:text-stone-200">Bảng biểu:</span> Tên bảng đặt ở <span className="underline">TRÊN</span> bảng biểu, in nghiêng căn giữa (Ví dụ: <i>Bảng 3.2: So sánh hiệu năng giữa thuật toán A* và Dijkstra</i>).</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end bg-stone-50/80 dark:bg-stone-900">
              <button
                onClick={() => setRubricModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Đã hiểu quy chuẩn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hộp thoại: Bảng kiểm tra 10 điểm trước khi nộp đồ án / khóa luận ── */}
      {checklistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#fffdfa] dark:bg-[#12161f] border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-academic font-bold text-base sm:text-lg text-emerald-950 dark:text-emerald-100">
                    Bảng Tự Đánh Giá 10 Tiêu Chí Trước Khi Nộp
                  </h3>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 font-sans">
                    Đạt 100% để đảm bảo không bị hội đồng trừ điểm hình thức và lỗi đạo văn
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChecklistModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-6 pt-4 pb-2 bg-[#fffdfa] dark:bg-[#12161f]">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="font-bold text-stone-700 dark:text-stone-300">Tiến độ hoàn thiện:</span>
                <span className={`font-bold ${checklistPercent === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {checklistScore}/10 tiêu chí ({checklistPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    checklistPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>
            </div>

            {/* Checklist items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2.5 font-sans text-xs">
              {[
                { id: 1, text: 'Đã cập nhật mục lục tự động và danh mục bảng biểu trước khi xuất PDF' },
                { id: 2, text: 'Đã căn lề chuẩn: Lề trái 3.5cm, các lề còn lại 2.0cm theo khổ A4' },
                { id: 3, text: 'Trang bìa có đầy đủ Logo Trường ĐH Giao thông Vận tải & Khoa CNTT' },
                { id: 4, text: 'Đã đính kèm Phiếu giao đề tài (BM-01) có đầy đủ chữ ký của GVHD' },
                { id: 5, text: 'Tất cả các hình vẽ đều có số thứ tự và tên hình nằm ở DƯỚI hình' },
                { id: 6, text: 'Tất cả các bảng biểu đều có số thứ tự và tên bảng nằm ở TRÊN bảng' },
                { id: 7, text: 'Tài liệu tham khảo được đánh số thứ tự trong ngoặc vuông [1], [2] chuẩn IEEE' },
                { id: 8, text: 'Không sao chép nguyên văn quá 20% mà không ghi nguồn trích dẫn' },
                { id: 9, text: 'Đã đính kèm link kho lưu trữ mã nguồn GitHub/GitLab có commit log đầy đủ' },
                { id: 10, text: 'Đã kiểm tra lỗi chính tả tiếng Việt và ngắt trang hợp lý giữa các chương' }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    checkedItems[item.id]
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 text-stone-900 dark:text-stone-100'
                      : 'bg-[#fffdfa] dark:bg-[#151a24] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <CustomCheckbox
                    checked={Boolean(checkedItems[item.id])}
                    onChange={() => toggleChecklistItem(item.id)}
                    color="emerald"
                    size="md"
                  />
                  <span className={`text-xs leading-relaxed flex-1 ${checkedItems[item.id] ? 'font-medium' : ''}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900">
              <span className="text-[11px] text-stone-500 font-mono">
                {checklistPercent === 100 ? '🎉 Đủ điều kiện nộp bản in!' : 'Cần kiểm tra thêm các mục chưa tick'}
              </span>
              <button
                onClick={() => setChecklistModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Đóng bảng kiểm tra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PDF Viewer Modal (Previewing Template) ──────────────────────── */}
      <PdfViewerModal
        isOpen={viewerModal.isOpen}
        onClose={() => setViewerModal({ isOpen: false, title: '', fileUrl: '' })}
        title={viewerModal.title || 'Mẫu tài liệu'}
        fileUrl={viewerModal.fileUrl}
        fileName="bieu_mau_utc.pdf"
      />

      <Footer />
    </div>
  )
}

export default TemplateCenter
