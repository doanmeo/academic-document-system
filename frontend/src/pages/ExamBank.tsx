import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  Lightbulb,
  FileText,
  Download,
  Eye,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  FileCheck2,
  ChevronRight,
  RotateCcw,
  Clock,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  LayoutGrid,
  List,
  ExternalLink,
  BookMarked,
  Share2,
  Award,
  BarChart3,
  Bookmark,
  Check,
  X
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PdfViewerModal from '../components/PdfViewerModal'
import DocumentQuickCardModal from '../components/document/DocumentQuickCardModal'
import { documentApi } from '../api/documentApi'
import { catalogApi } from '../api/catalogApi'
import { DocumentSummary } from '../types/document'
import { useToast } from '../contexts/ToastContext'
import CustomSelect from '../components/ui/CustomSelect'
import CustomCheckbox from '../components/ui/CustomCheckbox'

// ─── UTC FIT Exam Matrix Reference Data ───────────────────────────────────────
interface ExamMatrixItem {
  subjectCode: string
  subjectName: string
  format: string
  duration: string
  allowedMaterials: string
  weights: string
  structure: { part: string; weight: string; description: string }[]
  keyTraps: string[]
}

const UTC_EXAM_MATRIX: ExamMatrixItem[] = [
  {
    subjectCode: 'IT102',
    subjectName: 'Kỹ thuật lập trình (C/C++)',
    format: 'Tự luận viết code & chấm máy',
    duration: '90 phút',
    allowedMaterials: 'Không được sử dụng tài liệu',
    weights: 'CC: 10% | GK: 20% | KTHP: 70%',
    structure: [
      { part: 'Câu 1 (3.0đ)', weight: '30%', description: 'Phân tích con trỏ, cấp phát động mảng 2D và cấu trúc Struct' },
      { part: 'Câu 2 (4.0đ)', weight: '40%', description: 'Thuật toán đệ quy / Quay lui hoặc Xử lý danh sách liên kết đơn' },
      { part: 'Câu 3 (3.0đ)', weight: '30%', description: 'Đọc/ghi file nhị phân & tối ưu thuật toán sắp xếp / tìm kiếm' }
    ],
    keyTraps: [
      'Quên giải phóng vùng nhớ malloc / delete dẫn đến memory leak',
      'Lỗi sai chỉ số mảng (Off-by-one error) trong vòng lặp',
      'Quên xử lý trường hợp danh sách rỗng (head == NULL)'
    ]
  },
  {
    subjectCode: 'IT201',
    subjectName: 'Cơ sở dữ liệu (Database & SQL)',
    format: 'Tự luận trên giấy',
    duration: '75 phút',
    allowedMaterials: 'Được mang 01 tờ A4 viết tay',
    weights: 'CC: 10% | GK: 20% | KTHP: 70%',
    structure: [
      { part: 'Câu 1 (3.0đ)', weight: '30%', description: 'Đại số quan hệ & Chuẩn hóa dữ liệu về dạng 2NF, 3NF, BCNF' },
      { part: 'Câu 2 (4.0đ)', weight: '40%', description: 'Viết các câu truy vấn SQL phức tạp (GROUP BY, HAVING, Subquery, JOIN)' },
      { part: 'Câu 3 (3.0đ)', weight: '30%', description: 'Thiết kế Trigger toàn vẹn dữ liệu hoặc Stored Procedure có tham số' }
    ],
    keyTraps: [
      'Nhầm lẫn giữa điều kiện WHERE và HAVING khi dùng hàm gộp COUNT/SUM',
      'Thiếu khóa ngoại FOREIGN KEY dẫn đến vi phạm toàn vẹn tham chiếu',
      'Xác định sai tập phụ thuộc hàm dẫn đến chuẩn hóa sai dạng chuẩn BCNF'
    ]
  },
  {
    subjectCode: 'IT203',
    subjectName: 'Mạng máy tính & Truyền thông dữ liệu',
    format: 'Trắc nghiệm (40 câu) + Tự luận bài tập',
    duration: '60 phút',
    allowedMaterials: 'Được sử dụng máy tính bỏ túi',
    weights: 'CC: 10% | GK: 20% | KTHP: 70%',
    structure: [
      { part: 'Phần 1 (4.0đ)', weight: '40%', description: '20 câu trắc nghiệm mô hình OSI, TCP/IP, DNS, HTTP, ARP, ICMP' },
      { part: 'Phần 2 (4.0đ)', weight: '40%', description: 'Bài tập chia mạng con IPv4 sử dụng kỹ thuật VLSM / CIDR' },
      { part: 'Phần 3 (2.0đ)', weight: '20%', description: 'Phân tích quá trình bắt tay 3 bước TCP (SYN, SYN-ACK, ACK)' }
    ],
    keyTraps: [
      'Tính nhầm địa chỉ Broadcast thành địa chỉ Host khả dụng',
      'Nhầm số lượng bit mượn m trong công thức tính số subnet 2^m',
      'Quên trừ đi 2 địa chỉ đặc biệt (Network Address và Broadcast Address)'
    ]
  },
  {
    subjectCode: 'IT205',
    subjectName: 'Lập trình hướng đối tượng (OOP Java)',
    format: 'Tự luận & Vẽ sơ đồ UML',
    duration: '90 phút',
    allowedMaterials: 'Không được sử dụng tài liệu',
    weights: 'CC: 10% | GK: 20% | KTHP: 70%',
    structure: [
      { part: 'Câu 1 (3.0đ)', weight: '30%', description: 'Vẽ sơ đồ lớp Class Diagram thể hiện Kế thừa, Quan hệ Has-A/Is-A' },
      { part: 'Câu 2 (4.0đ)', weight: '40%', description: 'Cài đặt mã Java: Abstract class, Interface, Đa hình nạp chồng & ghi đè' },
      { part: 'Câu 3 (3.0đ)', weight: '30%', description: 'Xử lý Custom Exception, Java Collections Framework (Map, Set) & IO Stream' }
    ],
    keyTraps: [
      'Ghi đè phương thức mà quên từ khóa @Override hoặc sai chữ ký method',
      'Vi phạm tính đóng gói (Encapsulation) khi để thuộc tính ở mức public',
      'Quên gọi super(...) trong constructor của lớp con'
    ]
  },
  {
    subjectCode: 'IT304',
    subjectName: 'Kiểm thử phần mềm (Software Testing)',
    format: 'Tự luận & Thiết kế Test Case',
    duration: '75 phút',
    allowedMaterials: 'Được sử dụng 01 tờ A4 viết tay',
    weights: 'CC: 10% | GK: 20% | KTHP: 70%',
    structure: [
      { part: 'Câu 1 (3.0đ)', weight: '30%', description: 'Kiểm thử hộp đen: Phân vùng tương đương (EP) & Phân tích giá trị biên (BVA)' },
      { part: 'Câu 2 (4.0đ)', weight: '40%', description: 'Kiểm thử hộp trắng: Vẽ đồ thị dòng điều khiển (CFG), độ phức tạp Cyclomatic & độ đo C1, C2' },
      { part: 'Câu 3 (3.0đ)', weight: '30%', description: 'Viết mã kiểm thử tự động với thư viện JUnit 5 / Assertions' }
    ],
    keyTraps: [
      'Bỏ sót giá trị biên sát nút (Min - 1, Max + 1)',
      'Tính sai độ phức tạp Cyclomatic V(G) = E - N + 2P',
      'Viết Assertions JUnit nhưng không bao quát các Exception ngoại lệ'
    ]
  },
  {
    subjectCode: 'IT310',
    subjectName: 'An toàn và Bảo mật thông tin',
    format: 'Tự luận tính toán & giải mã',
    duration: '90 phút',
    allowedMaterials: 'Được sử dụng máy tính bỏ túi',
    weights: 'CC: 10% | GK: 20% | KTHP: 70%',
    structure: [
      { part: 'Câu 1 (3.0đ)', weight: '30%', description: 'Thuật toán mã hóa khóa công khai RSA: Tính d, e, n, mã hóa và giải mã' },
      { part: 'Câu 2 (4.0đ)', weight: '40%', description: 'Giao thức trao đổi khóa Diffie-Hellman và Chữ ký số ElGamal / SHA-256' },
      { part: 'Câu 3 (3.0đ)', weight: '30%', description: 'Phân tích cơ chế hộp S-Box mã hóa đối xứng AES / DES' }
    ],
    keyTraps: [
      'Tính sai modulo nghịch đảo bằng thuật toán Euclid mở rộng',
      'Nhầm hàm phi Euler phi(n) = (p-1)*(q-1) với giá trị n = p*q',
      'Tính lũy thừa modulo số lớn mà không dùng phương pháp nhân bình phương liên tiếp'
    ]
  }
]

// ─── Seed Realistic UTC Exam Documents (Enriched for Complete Coverage) ──────
const CURATED_UTC_EXAMS: Partial<DocumentSummary>[] = [
  {
    id: 101,
    title: 'Đề thi Kết thúc học phần KTHP & Lời giải: Mạng máy tính (Học kỳ 1 2024-2025)',
    abstractText: 'Đề thi chính thức đợt 1 năm học 2024-2025 kèm đáp án chi tiết từng câu: Chia mạng con VLSM 4 phòng ban, phân tích bắt tay 3 bước TCP và bảng chuyển tiếp Router.',
    status: 'APPROVED',
    documentTypeCode: 'EXAM',
    documentTypeLabel: 'Đề thi & Lời giải',
    subjectId: 23,
    subjectName: 'Mạng máy tính & Truyền thông dữ liệu',
    academicYearId: 2,
    academicYearName: 'Năm học 2024-2025',
    uploaderName: 'Ban Học tập Liên chi Đoàn FIT',
    advisorName: 'PGS. TS. Trần Văn Hùng',
    viewCount: 3820,
    downloadCount: 1250,
    avgRating: 4.9,
    ratingCount: 114,
    primaryFileMimeType: 'application/pdf',
    primaryFileName: 'Android_DeThi_OnTap_ThucHanh.pdf',
    examDifficulty: 'MEDIUM',
    examSemester: 'Kỳ 1 - 2024-2025',
    hasSolution: true,
    examTips: 'Lưu ý câu chia subnet: Cần tính số IP khả dụng trừ 2 địa chỉ mạng và broadcast, thầy rất trừ điểm nếu ghi cả dải IP không trừ.',
    createdAt: '2026-10-10T08:00:00Z'
  },
  {
    id: 102,
    title: 'Tuyển tập 5 bộ Đề thi KTHP môn Cơ sở dữ liệu kèm Lời giải chi tiết Chuẩn hóa BCNF',
    abstractText: 'Bộ đề tổng hợp qua các năm 2022 - 2024 của Bộ môn Hệ thống thông tin. Bao gồm dạng bài tìm khóa tối thiểu, thuật toán chuẩn hóa 3NF/BCNF không mất thông tin và truy vấn lồng SQL.',
    status: 'APPROVED',
    documentTypeCode: 'EXAM',
    documentTypeLabel: 'Đề thi & Lời giải',
    subjectId: 21,
    subjectName: 'Cơ sở dữ liệu (SQL)',
    academicYearId: 2,
    academicYearName: 'Năm học 2024-2025',
    uploaderName: 'CLB Tin học UTC (ITC)',
    advisorName: 'TS. Nguyễn Thị Mai',
    viewCount: 4620,
    downloadCount: 1840,
    avgRating: 5.0,
    ratingCount: 156,
    primaryFileMimeType: 'application/pdf',
    primaryFileName: 'sample.pdf',
    examDifficulty: 'HARD',
    examSemester: 'Kỳ 2 - 2023-2024',
    hasSolution: true,
    examTips: 'Đề thi CSDL UTC luôn có 1 câu 3 điểm về chuẩn hóa. Hãy nhớ kiểm tra phụ thuộc hàm có được bảo toàn hay không sau khi tách quan hệ!',
    createdAt: '2026-09-15T09:30:00Z'
  },
  {
    id: 103,
    title: 'Đề thi Giữa kỳ môn Kỹ thuật lập trình C/C++: Con trỏ & Danh sách liên kết đơn',
    abstractText: 'Đề kiểm tra giữa kỳ 60 phút gồm 2 bài toán lớn: Thao tác quản lý sinh viên bằng LinkedList (thêm, sửa, xóa, sắp xếp theo điểm) và xử lý xâu ký tự không dùng hàm thư viện.',
    status: 'APPROVED',
    documentTypeCode: 'EXAM',
    documentTypeLabel: 'Đề thi & Lời giải',
    subjectId: 16,
    subjectName: 'Kỹ thuật lập trình (C/C++)',
    academicYearId: 2,
    academicYearName: 'Năm học 2024-2025',
    uploaderName: 'Nguyen Van A',
    advisorName: 'ThS. Lê Hoàng Nam',
    viewCount: 2950,
    downloadCount: 920,
    avgRating: 4.8,
    ratingCount: 68,
    primaryFileMimeType: 'application/pdf',
    primaryFileName: 'sample.pdf',
    examDifficulty: 'EASY',
    examSemester: 'Kỳ 1 - 2024-2025',
    hasSolution: true,
    examTips: 'Viết code trên giấy cần chú ý thụt dòng rõ ràng và kiểm tra điều kiện con trỏ NULL để không bị mất điểm trình bày.',
    createdAt: '2026-10-02T14:15:00Z'
  },
  {
    id: 104,
    title: 'Đề thi Thực hành Phòng máy môn Lập trình Thiết bị Di động Android (Full Code & APK)',
    abstractText: 'Đề thi thực hành 90 phút tại phòng Lab: Xây dựng ứng dụng Todo List tích hợp SQLite/Room Database, RecyclerView, Notification và Material Design 3.',
    status: 'APPROVED',
    documentTypeCode: 'EXAM',
    documentTypeLabel: 'Đề thi & Lời giải',
    subjectId: 28,
    subjectName: 'Lập trình ứng dụng di động (Android / iOS / Flutter)',
    academicYearId: 2,
    academicYearName: 'Năm học 2024-2025',
    uploaderName: 'Ban Chuyên môn FIT',
    advisorName: 'TS. Đào Thị Lệ Thủy',
    viewCount: 3410,
    downloadCount: 1120,
    avgRating: 4.9,
    ratingCount: 88,
    primaryFileMimeType: 'application/pdf',
    primaryFileName: 'Android_DeThi_OnTap_ThucHanh.pdf',
    examDifficulty: 'MEDIUM',
    examSemester: 'Kỳ 2 - 2023-2024',
    hasSolution: true,
    examTips: 'Nhớ khai báo permission trong AndroidManifest.xml và xử lý thread khi đọc ghi Database để app không bị ANR (Application Not Responding).',
    createdAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 105,
    title: 'Đề thi KTHP môn An toàn & Bảo mật thông tin: Thuật toán RSA, ElGamal & Chữ ký số',
    abstractText: 'Đề thi cuối kỳ chính thức năm học 2023-2024. Đầy đủ các bước tính toán thuật toán Euclid mở rộng, mã hóa khối khóa đối xứng AES và phân tích bảo mật giao thức SSL/TLS.',
    status: 'APPROVED',
    documentTypeCode: 'EXAM',
    documentTypeLabel: 'Đề thi & Lời giải',
    subjectId: 38,
    subjectName: 'Cơ sở An toàn thông tin / Mật mã học',
    academicYearId: 2,
    academicYearName: 'Năm học 2024-2025',
    uploaderName: 'Nhóm Nghiên cứu An toàn thông tin',
    advisorName: 'PGS. TS. Vũ Văn Điệp',
    viewCount: 2780,
    downloadCount: 860,
    avgRating: 4.7,
    ratingCount: 72,
    primaryFileMimeType: 'application/pdf',
    primaryFileName: 'ATBMTT_BTL_RSA_ElGamal.pdf',
    examDifficulty: 'HARD',
    examSemester: 'Kỳ 1 - 2024-2025',
    hasSolution: true,
    examTips: 'Lưu ý khi tính d = e^(-1) mod phi(n): Hãy lập bảng Euclid mở rộng 6 cột để tránh nhầm dấu âm!',
    createdAt: '2026-09-10T11:45:00Z'
  },
  {
    id: 106,
    title: 'Bộ Đề thi & Lời giải môn Kiểm thử phần mềm (Testing JUnit 5 & Hộp trắng C1/C2)',
    abstractText: 'Tuyển tập đề thi cuối kỳ môn Kiểm thử phần mềm kèm ma trận kiểm thử: Phân tích đường dẫn độc lập, độ bao phủ quyết định C1, độ bao phủ nhánh C2 và bài tập viết test code JUnit.',
    status: 'APPROVED',
    documentTypeCode: 'EXAM',
    documentTypeLabel: 'Đề thi & Lời giải',
    subjectId: 30,
    subjectName: 'Kiểm thử và đảm bảo chất lượng phần mềm (QA/QC)',
    academicYearId: 2,
    academicYearName: 'Năm học 2024-2025',
    uploaderName: 'Nguyen Van A',
    advisorName: 'ThS. Nguyễn Quỳnh Chi',
    viewCount: 2210,
    downloadCount: 680,
    avgRating: 4.8,
    ratingCount: 54,
    primaryFileMimeType: 'application/pdf',
    primaryFileName: 'Testing_04_BaiTap_JUnit.pdf',
    examDifficulty: 'MEDIUM',
    examSemester: 'Kỳ 1 - 2024-2025',
    hasSolution: true,
    examTips: 'Khi vẽ đồ thị CFG (Control Flow Graph), nhớ đánh số nút từ 1 đến N và liệt kê tất cả các đường đi độc lập (Basis Paths).',
    createdAt: '2026-07-18T16:20:00Z'
  },
  {
    id: 107,
    title: 'Đề thi KTHP môn Trí tuệ nhân tạo: Thuật toán A*, Nhánh cận & Game Cờ Caro Alpha-Beta',
    abstractText: 'Đề thi chính thức đợt 2 môn Trí tuệ nhân tạo. Bài toán tìm kiếm trạng thái không gian trên đồ thị với hàm đánh giá Heuristic, giải thuật cắt tỉa Alpha-Beta Pruning và bài toán 8 quân hậu.',
    status: 'APPROVED',
    documentTypeCode: 'EXAM',
    documentTypeLabel: 'Đề thi & Lời giải',
    subjectId: 40,
    subjectName: 'Nhập môn Trí tuệ nhân tạo',
    academicYearId: 2,
    academicYearName: 'Năm học 2024-2025',
    uploaderName: 'Ban Học thuật ITC',
    advisorName: 'TS. Phạm Văn Đồng',
    viewCount: 3190,
    downloadCount: 970,
    avgRating: 4.9,
    ratingCount: 84,
    primaryFileMimeType: 'application/pdf',
    primaryFileName: 'AI_Chuong1_Giaiquyetbaitoanbang_Timkiem.pdf',
    examDifficulty: 'HARD',
    examSemester: 'Kỳ 2 - 2023-2024',
    hasSolution: true,
    examTips: 'Thuật toán A*: Nhớ lập bảng OPEN và CLOSED rõ ràng qua từng bước lặp, ghi rõ f(n) = g(n) + h(n).',
    createdAt: '2026-06-25T13:10:00Z'
  },
  {
    id: 108,
    title: 'Đề cương & Đề thi mẫu môn Lập trình Web Fullstack (React.js & Spring Boot REST API)',
    abstractText: 'Đề thi đánh giá đồ án môn học & KTHP: Xây dựng hệ thống quản lý học vụ kết nối RESTful API, xác thực JWT Token, bảo mật Spring Security và xử lý bất đồng bộ Redux/Axios.',
    status: 'APPROVED',
    documentTypeCode: 'EXAM',
    documentTypeLabel: 'Đề thi & Lời giải',
    subjectId: 27,
    subjectName: 'Lập trình Web (React.js / Spring Boot)',
    academicYearId: 2,
    academicYearName: 'Năm học 2024-2025',
    uploaderName: 'Ban Kỹ thuật Phần mềm',
    advisorName: 'TS. Đào Thị Lệ Thủy',
    viewCount: 4100,
    downloadCount: 1530,
    avgRating: 5.0,
    ratingCount: 142,
    primaryFileMimeType: 'application/pdf',
    primaryFileName: 'sample.pdf',
    examDifficulty: 'MEDIUM',
    examSemester: 'Kỳ 1 - 2024-2025',
    hasSolution: true,
    examTips: 'Phần vấn đáp đồ án: Thầy cô thường hỏi kỹ cơ chế CORS, vòng đời Component React và cách validate dữ liệu ở cả 2 phía Frontend & Backend.',
    createdAt: '2026-09-01T08:30:00Z'
  }
]

export const ExamBank: React.FC = () => {
  const toast = useToast()
  const [exams, setExams] = useState<DocumentSummary[]>([])
  const [subjects, setSubjects] = useState<{ id: number; name: string; code: string }[]>([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [selectedSemester, setSelectedSemester] = useState<string>('')
  const [selectedExamType, setSelectedExamType] = useState<string>('ALL')
  const [onlyWithSolution, setOnlyWithSolution] = useState(false)
  const [onlyWithTips, setOnlyWithTips] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'ledger'>('grid')

  // Modals
  const [matrixModalOpen, setMatrixModalOpen] = useState(false)
  const [trapsModalOpen, setTrapsModalOpen] = useState(false)
  const [selectedMatrixSubject, setSelectedMatrixSubject] = useState<ExamMatrixItem>(UTC_EXAM_MATRIX[0])
  const [viewerModal, setViewerModal] = useState<{ isOpen: boolean; doc: DocumentSummary | null }>({
    isOpen: false,
    doc: null
  })
  const [quickDocModal, setQuickDocModal] = useState<DocumentSummary | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Quick keyboard shortcut: Ctrl+K / Cmd+K focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    fetchCatalogs()
    fetchExams()
  }, [])

  const fetchCatalogs = async () => {
    try {
      const subs = await catalogApi.getSubjects()
      setSubjects(subs)
    } catch {
      // Fallback subjects if offline
      setSubjects([
        { id: 16, code: 'IT102', name: 'Kỹ thuật lập trình (C/C++)' },
        { id: 17, code: 'IT205', name: 'Lập trình hướng đối tượng (OOP) (Java / C++)' },
        { id: 18, code: 'IT103', name: 'Cấu trúc dữ liệu và giải thuật' },
        { id: 21, code: 'IT201', name: 'Cơ sở dữ liệu (SQL, Thiết kế CSDL)' },
        { id: 23, code: 'IT203', name: 'Mạng máy tính & Truyền thông dữ liệu' },
        { id: 27, code: 'IT301', name: 'Lập trình Web (Frontend & Backend)' },
        { id: 28, code: 'IT302', name: 'Lập trình ứng dụng di động' },
        { id: 30, code: 'IT304', name: 'Kiểm thử và đảm bảo chất lượng phần mềm (QA/QC)' },
        { id: 38, code: 'IT310', name: 'Cơ sở An toàn thông tin / Mật mã học' },
        { id: 40, code: 'IT312', name: 'Nhập môn Trí tuệ nhân tạo' }
      ])
    }
  }

  const fetchExams = async () => {
    try {
      setLoading(true)
      const res = await documentApi.getDocuments({
        page: 0,
        size: 50,
      })
      const backendExams = res.content.filter(
        (d) =>
          d.documentTypeCode === 'EXAM' ||
          d.documentTypeCode === 'EXERCISE' ||
          d.examDifficulty ||
          d.title.toLowerCase().includes('đề thi') ||
          d.title.toLowerCase().includes('đáp án') ||
          d.title.toLowerCase().includes('ôn tập')
      )

      // Merge backend exams with curated UTC FIT exam database
      // If backend has items, combine them, avoiding duplicate IDs
      const backendIds = new Set(backendExams.map(b => b.id))
      const combined = [
        ...backendExams,
        ...(CURATED_UTC_EXAMS.filter(c => !backendIds.has(c.id as number)) as DocumentSummary[])
      ]
      setExams(combined)
    } catch {
      // Offline fallback
      setExams(CURATED_UTC_EXAMS as DocumentSummary[])
    } finally {
      setLoading(false)
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedSubject('')
    setSelectedDifficulty('')
    setSelectedSemester('')
    setSelectedExamType('ALL')
    setOnlyWithSolution(false)
    setOnlyWithTips(false)
  }

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Keyword search
      if (search) {
        const q = search.toLowerCase()
        const matchTitle = exam.title.toLowerCase().includes(q)
        const matchSubject = exam.subjectName?.toLowerCase().includes(q)
        const matchAdvisor = exam.advisorName?.toLowerCase().includes(q)
        const matchTips = exam.examTips?.toLowerCase().includes(q)
        if (!matchTitle && !matchSubject && !matchAdvisor && !matchTips) return false
      }

      // Subject filter
      if (selectedSubject && exam.subjectId !== parseInt(selectedSubject, 10)) {
        return false
      }

      // Difficulty filter
      if (selectedDifficulty && exam.examDifficulty !== selectedDifficulty) {
        return false
      }

      // Semester filter
      if (selectedSemester && (!exam.examSemester || !exam.examSemester.includes(selectedSemester))) {
        return false
      }

      // Exam Type filter (Final / Midterm / Practice)
      if (selectedExamType !== 'ALL') {
        const titleLower = exam.title.toLowerCase()
        if (selectedExamType === 'FINAL' && !titleLower.includes('cuối kỳ') && !titleLower.includes('kthp')) return false
        if (selectedExamType === 'MIDTERM' && !titleLower.includes('giữa kỳ') && !titleLower.includes('gk')) return false
        if (selectedExamType === 'LAB' && !titleLower.includes('thực hành') && !titleLower.includes('lab') && !titleLower.includes('phòng máy')) return false
      }

      // Solution filter
      if (onlyWithSolution && !exam.hasSolution) {
        return false
      }

      // Tips filter
      if (onlyWithTips && !exam.examTips) {
        return false
      }

      return true
    })
  }, [exams, search, selectedSubject, selectedDifficulty, selectedSemester, selectedExamType, onlyWithSolution, onlyWithTips])

  // Statistics
  const stats = useMemo(() => {
    const total = exams.length
    const withSolution = exams.filter(e => e.hasSolution).length
    const withTips = exams.filter(e => !!e.examTips).length
    const hardCount = exams.filter(e => e.examDifficulty === 'HARD').length
    const solutionPercent = total > 0 ? Math.round((withSolution / total) * 100) : 0
    return { total, withSolution, withTips, hardCount, solutionPercent }
  }, [exams])

  const handleOpenPdf = (exam: DocumentSummary) => {
    setViewerModal({
      isOpen: true,
      doc: exam
    })
  }

  const handleDownload = (exam: DocumentSummary) => {
    toast.info(`Bắt đầu tải về: ${exam.title}`)
    // Open sample or primary file
    const fileUrl = exam.primaryFileName ? `/documents/${exam.primaryFileName}` : '/sample.pdf'
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = `${exam.title.replace(/[^a-zA-Z0-9\-_]/g, '_')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const hasActiveFilters = Boolean(
    search || selectedSubject || selectedDifficulty || selectedSemester || selectedExamType !== 'ALL' || onlyWithSolution || onlyWithTips
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] dark:bg-[#0c1017] text-stone-900 dark:text-stone-100 antialiased transition-colors duration-150">
      <Navbar />

      <main className="w-full pt-20 pb-20 flex-grow bg-paper-grid">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          
          {/* Breadcrumb & Accession Code */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-6 pt-2">
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <Link to="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Trang chủ</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/search" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Tra cứu tài liệu</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-stone-800 dark:text-stone-200 font-semibold font-mono">/exams</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                LƯU TRỮ HỌC PHẦN FIT-UTC • 2021-2025
              </span>
            </div>
          </div>

          {/* Header: Title, Academic Meta & Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-stone-300 dark:border-stone-800 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="stamp-seal text-amber-700 dark:text-amber-400 border-amber-600 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-[10px]">
                  [ NGÂN HÀNG ĐỀ THI &amp; MA TRẬN KTHP ]
                </span>
                <span className="text-stone-400">/</span>
                <span className="font-mono text-xs text-stone-500">KHOA CNTT · ĐH GIAO THÔNG VẬN TẢI</span>
              </div>

              <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 tracking-tight">
                Ngân Hàng Đề Thi &amp; Ma Trận Ôn Tập
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl font-sans">
                Tổng hợp đề thi chính thức qua các học kỳ, phân cấp theo thang điểm B / A / A+, kèm đáp án giải chi tiết, cấu trúc đề thi chuẩn của từng bộ môn và lời bình bẫy đề thi từ sinh viên khóa trước.
              </p>
            </div>

            {/* Counter & Action Modals */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <div className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-xs font-bold text-stone-700 dark:text-stone-300">
                <span className="text-amber-600 dark:text-amber-400">{filteredExams.length}</span> / {exams.length} ĐỀ THI
              </div>

              <button
                type="button"
                onClick={() => setMatrixModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5 text-stone-950" />
                <span>Ma Trận Đề Thi</span>
              </button>

              <button
                type="button"
                onClick={() => setTrapsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Bẫy Đề &amp; Mẹo A+</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border-2 border-stone-200/90 dark:border-stone-800/90 shadow-2xs">
              <div className="font-mono text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.total}</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-sans mt-0.5">Đề thi đã lưu trữ</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-200/70 dark:border-emerald-800/50 shadow-2xs">
              <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.solutionPercent}%</div>
              <div className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 font-sans mt-0.5">Có đáp án chi tiết</div>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-200/70 dark:border-amber-800/50 shadow-2xs">
              <div className="font-mono text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.withTips}</div>
              <div className="text-[11px] text-amber-600/90 dark:text-amber-400/90 font-sans mt-0.5">Có lời bình &amp; bẫy đề</div>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-200/70 dark:border-rose-800/50 shadow-2xs">
              <div className="font-mono text-xl sm:text-2xl font-bold text-rose-700 dark:text-rose-300">{stats.hardCount}</div>
              <div className="text-[11px] text-rose-600/90 dark:text-rose-400/90 font-sans mt-0.5">Đề phân hóa (A+)</div>
            </div>
          </div>

          {/* Main Search & Filter Command Station */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-stone-300 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4 mb-6">
            {/* Row 1: Search Omnibar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-600 dark:text-amber-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm đề thi, mã học phần, giảng viên, từ khóa ôn tập... (Ctrl + K)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 text-xs font-mono bg-stone-100/80 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:bg-white dark:focus:bg-stone-950 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-stone-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-medium text-stone-500 bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded select-none">
                Ctrl K
              </kbd>
            </div>

            {/* Quick Filter Subject Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mr-1">
                Bộ môn:
              </span>
              {[
                { label: 'Tất cả', value: '' },
                { label: 'C/C++ (IT102)', value: '16' },
                { label: 'OOP Java (IT205)', value: '17' },
                { label: 'CSDL (IT201)', value: '21' },
                { label: 'Mạng MT (IT203)', value: '23' },
                { label: 'Web Tech (IT301)', value: '27' },
                { label: 'Mobile App (IT302)', value: '28' },
              ].map((chip) => {
                const isActive = selectedSubject === chip.value
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setSelectedSubject(chip.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-amber-500 border-amber-600 text-stone-950 font-bold shadow-2xs'
                        : 'bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-amber-400 dark:hover:border-amber-600 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>

            {/* Row 2: Select Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200 dark:border-stone-800">
              <div>
                <label className="block text-[11px] font-mono font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1">
                  Môn học chi tiết:
                </label>
                <CustomSelect
                  value={selectedSubject}
                  onChange={(val) => setSelectedSubject(val)}
                  options={[
                    { value: '', label: `Tất cả học phần (${subjects.length})` },
                    ...subjects.map((sub) => ({
                      value: String(sub.id),
                      label: `${sub.code} - ${sub.name}`,
                    })),
                  ]}
                  placeholder={`Tất cả học phần (${subjects.length})`}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1">
                  Hình thức thi:
                </label>
                <CustomSelect
                  value={selectedExamType}
                  onChange={(val) => setSelectedExamType(val)}
                  options={[
                    { value: 'ALL', label: 'Tất cả hình thức thi' },
                    { value: 'FINAL', label: 'Đề Kết Thúc Học Phần (KTHP)' },
                    { value: 'MIDTERM', label: 'Đề Kiểm Tra Giữa Kỳ' },
                    { value: 'LAB', label: 'Đề Thực Hành Phòng Máy / Lab' },
                  ]}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1">
                  Độ phân hóa điểm:
                </label>
                <CustomSelect
                  value={selectedDifficulty}
                  onChange={(val) => setSelectedDifficulty(val)}
                  options={[
                    { value: '', label: 'Tất cả mức độ' },
                    { value: 'EASY', label: 'Cơ bản (Mục tiêu qua môn / Điểm B)' },
                    { value: 'MEDIUM', label: 'Trung bình (Mục tiêu Điểm B+ đến A)' },
                    { value: 'HARD', label: 'Nâng cao (Phân hóa Điểm A+)' },
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            {/* Row 3: Secondary Toggles, View Mode & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-200 dark:border-stone-800">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-500 font-mono text-[11px]">Học kỳ:</span>
                  <CustomSelect
                    value={selectedSemester}
                    onChange={(val) => setSelectedSemester(val)}
                    options={[
                      { value: '', label: 'Tất cả kỳ' },
                      { value: 'Kỳ 1', label: 'Học kỳ 1' },
                      { value: 'Kỳ 2', label: 'Học kỳ 2' },
                      { value: 'Kỳ hè', label: 'Học kỳ Hè' },
                    ]}
                    size="sm"
                    className="w-32"
                  />
                </div>

                <CustomCheckbox
                  checked={onlyWithSolution}
                  onChange={setOnlyWithSolution}
                  label="Chỉ hiện đề có đáp án"
                  color="emerald"
                  size="sm"
                />

                <CustomCheckbox
                  checked={onlyWithTips}
                  onChange={setOnlyWithTips}
                  label="Có lời bình &amp; bẫy đề thi"
                  color="amber"
                  size="sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center p-1 rounded-lg bg-stone-200/80 dark:bg-stone-900 border border-stone-300 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                    title="Hiển thị dạng thẻ bài thi (Grid)"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('ledger')}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'ledger'
                        ? 'bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                    title="Hiển thị dạng sổ lưu trữ (Ledger/Bảng)"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between mb-4 px-1 text-xs text-stone-500 dark:text-stone-400 font-mono">
            <div>
              Hiển thị <span className="font-bold text-stone-900 dark:text-stone-100">{filteredExams.length}</span> / {exams.length} đề thi học phần
              {search && <span> cho từ khóa "<span className="text-blue-600 font-sans font-medium">{search}</span>"</span>}
            </div>
            <div>
              Thứ tự: Mới nhất &amp; Điểm đánh giá
            </div>
          </div>

          {/* Main Results View */}
          {loading ? (
            <div className="py-24 text-center text-stone-400 text-xs">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Đang tải danh mục đề thi học phần Khoa CNTT...
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="py-16 text-center bg-[#fffdfa] dark:bg-[#12161f] rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-xs">
              <GraduationCap className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
              <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 font-serif-academic">Không tìm thấy đề thi phù hợp</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
                Không có đề thi nào thỏa mãn bộ lọc hiện tại. Thử đổi môn học, xóa từ khóa tìm kiếm hoặc chọn mức độ phân hóa khác.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
              >
                Xóa bộ lọc &amp; Xem tất cả đề
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ─── Grid View (Tactile Exam Notebook Cards) ───────────────── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col justify-between bg-[#fffdfa] dark:bg-[#12161f] border border-stone-200/90 dark:border-stone-800/90 hover:border-amber-500/80 dark:hover:border-amber-500/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 relative group"
                >
                  <div>
                    {/* Top accession bar */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-semibold border border-stone-200 dark:border-stone-700">
                          {exam.subjectName?.split('(')[0]?.trim() || 'Học phần FIT'}
                        </span>
                      </div>
                      
                      {/* Difficulty and Solution Badges */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {exam.hasSolution ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Có đáp án</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700">
                            Đề tự luyện
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            exam.examDifficulty === 'HARD'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : exam.examDifficulty === 'EASY'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {exam.examDifficulty === 'HARD'
                            ? 'Nâng cao [A+]'
                            : exam.examDifficulty === 'EASY'
                            ? 'Cơ bản [B]'
                            : 'Trung bình [B+/A]'}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <Link
                      to={`/documents/${exam.id}`}
                      className="font-bold font-serif-academic text-stone-900 dark:text-stone-50 hover:text-amber-600 dark:hover:text-amber-400 text-sm sm:text-base leading-snug line-clamp-2 transition-colors mb-2 block"
                    >
                      {exam.title}
                    </Link>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-stone-500 dark:text-stone-400 mb-3 font-mono">
                      {exam.examSemester && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>{exam.examSemester}</span>
                        </span>
                      )}
                      {exam.advisorName && (
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-stone-400" />
                          <span>GV: {exam.advisorName}</span>
                        </span>
                      )}
                    </div>

                    {/* Abstract text preview */}
                    {exam.abstractText && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-3.5 font-sans leading-relaxed">
                        {exam.abstractText}
                      </p>
                    )}

                    {/* Senior & Teacher Tips Callout */}
                    {exam.examTips && (
                      <div className="bg-amber-50/90 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 mb-4 shadow-xs">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-relaxed">
                            <span className="font-bold text-amber-950 dark:text-amber-300 font-sans block mb-0.5">Lời bình &amp; bẫy đề thi:</span>
                            <p className="italic text-stone-700 dark:text-stone-300 font-sans line-clamp-2">{exam.examTips}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs mt-2">
                    <div className="flex items-center gap-2 text-stone-400 text-[11px] font-mono">
                      <span>{exam.viewCount || 0} xem</span>
                      <span>•</span>
                      <span>{exam.downloadCount || 0} tải</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Quick Preview Button */}
                      <button
                        onClick={() => handleOpenPdf(exam)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
                        title="Xem nhanh nội dung PDF"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>Xem nhanh</span>
                      </button>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(exam)}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                        title="Tải về đề thi"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Link to full details */}
                      <Link
                        to={`/documents/${exam.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ─── Ledger / Table View (Sổ lưu trữ đề thi) ───────────────── */
            <div className="bg-[#fffdfa] dark:bg-[#12161f] border border-stone-200/90 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100/70 dark:bg-stone-900 text-stone-600 dark:text-stone-400 font-mono uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Học phần</th>
                      <th className="py-3 px-4">Tên đề thi &amp; Lời giải</th>
                      <th className="py-3 px-3">Học kỳ</th>
                      <th className="py-3 px-3">Độ khó</th>
                      <th className="py-3 px-3">Đáp án</th>
                      <th className="py-3 px-3">Giảng viên</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 font-sans">
                    {filteredExams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-900/40 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-semibold text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                            {exam.subjectName?.split('(')[0]?.trim() || 'Học phần'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/documents/${exam.id}`}
                            className="font-semibold text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 line-clamp-1 block transition-colors"
                          >
                            {exam.title}
                          </Link>
                          {exam.examTips && (
                            <span className="text-[11px] text-amber-700 dark:text-amber-400 italic line-clamp-1 mt-0.5">
                              Tips: {exam.examTips}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-stone-500">
                          {exam.examSemester || '—'}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              exam.examDifficulty === 'HARD'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : exam.examDifficulty === 'EASY'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {exam.examDifficulty === 'HARD' ? 'Nâng cao (A+)' : exam.examDifficulty === 'EASY' ? 'Cơ bản (B)' : 'Trung bình (B+/A)'}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {exam.hasSolution ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Có đáp án</span>
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[11px]">Tự luyện</span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-stone-600 dark:text-stone-400 text-[11px]">
                          {exam.advisorName || 'Bộ môn CNTT'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenPdf(exam)}
                              className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
                              title="Xem nhanh"
                            >
                              Xem
                            </button>
                            <button
                              onClick={() => handleDownload(exam)}
                              className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors cursor-pointer"
                              title="Tải về"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              to={`/documents/${exam.id}`}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                            >
                              Chi tiết
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Exam Study Notice Box */}
          <div className="mt-12 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-blue-950 dark:text-blue-200 font-serif-academic flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Quy định sử dụng tài liệu trong phòng thi Khoa CNTT - UTC
                </h4>
                <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed font-sans max-w-3xl">
                  Đề thi các năm học trước nhằm phục vụ mục đích tự ôn luyện và rèn luyện kỹ năng giải đề. Trong phòng thi chính thức, sinh viên chỉ được phép mang tài liệu khi đề bài quy định rõ (ví dụ: được sử dụng 01 tờ A4 viết tay đối với môn CSDL, Kiểm thử phần mềm).
                </p>
              </div>
              <button
                onClick={() => setMatrixModalOpen(true)}
                className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Xem Ma Trận Thi Các Môn
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Interactive Modal: Exam Matrix UTC FIT ────────────────────────── */}
      {matrixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#fffdfa] dark:bg-[#12161f] border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-academic font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                    Ma Trận Cấu Trúc Đề Thi Khoa CNTT - UTC
                  </h3>
                  <p className="text-xs text-stone-500 font-sans">
                    Quy chuẩn hình thức, thời gian làm bài, tỷ lệ điểm và các phần thi trọng tâm
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMatrixModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Subject Tabs (Left) */}
              <div className="space-y-2 md:border-r md:border-stone-200 dark:md:border-stone-800 md:pr-4">
                <span className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Chọn học phần tra cứu:
                </span>
                {UTC_EXAM_MATRIX.map((item) => (
                  <button
                    key={item.subjectCode}
                    onClick={() => setSelectedMatrixSubject(item)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      selectedMatrixSubject.subjectCode === item.subjectCode
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 font-bold shadow-xs'
                        : 'border-stone-200/80 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">{item.subjectCode}</span>
                      <span className="text-[10px] text-stone-400">{item.duration}</span>
                    </div>
                    <div className="line-clamp-1">{item.subjectName}</div>
                  </button>
                ))}
              </div>

              {/* Detailed Matrix Breakdown (Right) */}
              <div className="md:col-span-2 space-y-5">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold font-serif-academic text-base text-stone-900 dark:text-stone-100">
                      {selectedMatrixSubject.subjectName} ({selectedMatrixSubject.subjectCode})
                    </h4>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                      {selectedMatrixSubject.duration}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400 font-sans mt-3">
                    <div><span className="font-semibold text-stone-800 dark:text-stone-200">Hình thức:</span> {selectedMatrixSubject.format}</div>
                    <div><span className="font-semibold text-stone-800 dark:text-stone-200">Tỷ lệ điểm:</span> {selectedMatrixSubject.weights}</div>
                    <div className="sm:col-span-2"><span className="font-semibold text-stone-800 dark:text-stone-200">Quy định tài liệu:</span> {selectedMatrixSubject.allowedMaterials}</div>
                  </div>
                </div>

                {/* Structure Breakdown Table */}
                <div>
                  <h5 className="font-bold text-xs font-mono uppercase text-stone-500 mb-2.5">
                    Phân bố câu hỏi &amp; trọng số điểm:
                  </h5>
                  <div className="space-y-2">
                    {selectedMatrixSubject.structure.map((part, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#fffdfa] dark:bg-[#151a24] flex items-start gap-3">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shrink-0">
                          {part.part}
                        </span>
                        <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                          {part.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traps Callout for this subject */}
                <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Các bẫy trừ điểm phổ biến trong phòng thi:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 font-sans list-disc list-inside">
                    {selectedMatrixSubject.keyTraps.map((trap, idx) => (
                      <li key={idx} className="leading-relaxed">{trap}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end bg-stone-50/80 dark:bg-stone-900">
              <button
                onClick={() => setMatrixModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Đã hiểu &amp; Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Interactive Modal: Exam Traps & Tips (Bẫy đề thi) ───────────── */}
      {trapsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#fffdfa] dark:bg-[#12161f] border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-amber-50/60 dark:bg-amber-950/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-academic font-bold text-base sm:text-lg text-amber-950 dark:text-amber-100">
                    Cẩm Nang Bẫy Đề Thi &amp; Chiến Thuật Đạt Điểm A/A+
                  </h3>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-sans">
                    Đúc kết từ hơn 500+ bài thi sinh viên Khoa CNTT - Đại học Giao thông Vận tải
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTrapsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans text-xs">
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#fffdfa] dark:bg-[#151a24] space-y-1.5">
                <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-mono text-[10px]">1</span>
                  <span>Bẫy 1: Quên giải phóng bộ nhớ động (Memory Leak) trong C/C++</span>
                </div>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed pl-7">
                  Trong các bài toán danh sách liên kết hoặc mảng động, sinh viên thường viết hàm xóa phần tử nhưng quên lệnh <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono">free(temp)</code> hoặc <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono">delete temp</code>. Thầy cô chấm code trên giấy thường trừ 0.5đ đến 1.0đ cho lỗi này.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#fffdfa] dark:bg-[#151a24] space-y-1.5">
                <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-mono text-[10px]">2</span>
                  <span>Bẫy 2: Dùng WHERE thay vì HAVING khi lọc hàm tổng hợp trong SQL</span>
                </div>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed pl-7">
                  Câu lệnh <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono">WHERE COUNT(MaSV) &gt; 5</code> sẽ báo lỗi cú pháp ngay lập tức! Điều kiện với hàm gộp (Aggregate functions: COUNT, AVG, SUM, MAX, MIN) bắt buộc phải nằm sau mệnh đề <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono">GROUP BY ... HAVING</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#fffdfa] dark:bg-[#151a24] space-y-1.5">
                <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-mono text-[10px]">3</span>
                  <span>Bẫy 3: Nhầm Host Address với Broadcast Address khi chia subnet IP</span>
                </div>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed pl-7">
                  Khi chia subnet với dải ví dụ <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono">192.168.1.0/26</code>, địa chỉ gán cho thiết bị chỉ nằm trong khoảng từ <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono">.1</code> đến <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono">.62</code>. Địa chỉ <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono">.63</code> là Broadcast, không được gán cho máy tính!
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#fffdfa] dark:bg-[#151a24] space-y-1.5">
                <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-mono text-[10px]">4</span>
                  <span>Bẫy 4: Quên trường hợp biên cơ sở (Base Case) trong thuật toán đệ quy</span>
                </div>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed pl-7">
                  Khi viết đệ quy giải bài toán cây nhị phân hoặc tháp Hà Nội, nếu thiếu điểm dừng điều kiện <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono">if (node == NULL) return;</code>, thuật toán sẽ bị Stack Overflow vĩnh viễn và bị đánh rớt điểm toàn bộ câu đó.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end bg-stone-50/80 dark:bg-stone-900">
              <button
                onClick={() => setTrapsModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Đóng cẩm nang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PDF Viewer Modal (Direct Quick View) ────────────────────────── */}
      <PdfViewerModal
        isOpen={viewerModal.isOpen}
        onClose={() => setViewerModal({ isOpen: false, doc: null })}
        title={viewerModal.doc?.title || 'Đề thi học phần PDF'}
        fileUrl={viewerModal.doc?.primaryFileName ? `/documents/${viewerModal.doc.primaryFileName}` : '/sample.pdf'}
        fileName={viewerModal.doc?.primaryFileName || 'de_thi_hoc_phan.pdf'}
      />

      {/* ─── Document Quick Card Modal ────────────────────────────────────── */}
      <DocumentQuickCardModal
        isOpen={Boolean(quickDocModal)}
        doc={quickDocModal}
        onClose={() => setQuickDocModal(null)}
        onReadPdf={(doc) => {
          setQuickDocModal(null)
          handleOpenPdf(doc)
        }}
        onCite={() => {}}
        onDownload={handleDownload}
      />

      <Footer />
    </div>
  )
}

export default ExamBank
