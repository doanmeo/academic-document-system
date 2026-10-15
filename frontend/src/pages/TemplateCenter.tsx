import React from 'react'
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
  School
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export const TemplateCenter: React.FC = () => {
  const templates = [
    {
      id: 1,
      title: 'Mẫu Báo Cáo Bài Tập Lớn Chuẩn Khoa CNTT (Word)',
      category: 'Word (.docx)',
      desc: 'Quy chuẩn trang bìa chính thức có logo Trường ĐH Giao thông Vận tải & Khoa CNTT, mục lục tự động, danh mục bảng biểu và định dạng căn lề chuẩn học thuật.',
      features: ['Font Times New Roman 13, giãn dòng 1.3', 'Trang bìa chính thức & trang phụ bìa', 'Mục lục tự động & đánh số hình vẽ/bảng biểu'],
      format: 'DOCX',
      size: '240 KB',
      isHot: true,
    },
    {
      id: 2,
      title: 'Khung Khóa Luận Tốt Nghiệp LaTeX (Overleaf Template)',
      category: 'LaTeX (Overleaf / TeXLive)',
      desc: 'Bộ mã nguồn LaTeX chuẩn IEEE/UTC FIT tích hợp sẵn gói thuật toán (algorithm2e), tô màu mã nguồn (minted/listings) và quản lý trích dẫn BibTeX tự động.',
      features: ['Sẵn sàng clone trực tiếp trên Overleaf', 'Tự động biên dịch sang PDF chuẩn đồ án', 'Tích hợp môi trường chứng minh & định lý'],
      format: 'ZIP / LaTeX',
      size: '1.2 MB',
      overleafUrl: 'https://www.overleaf.com/latex/templates',
      isHot: true,
    },
    {
      id: 3,
      title: 'Slide Thuyết Trình Bảo Vệ Đồ Án UTC FIT (PowerPoint)',
      category: 'PowerPoint (.pptx)',
      desc: 'Bộ slide 16:9 thiết kế hiện đại tông xanh Navy & Trắng nhận diện UTC FIT, tối ưu cho 15 phút báo cáo hội đồng chấm bảo vệ khóa luận và đồ án.',
      features: ['25 layouts thiết kế chuẩn khoa học', 'Sẵn các sơ đồ kiến trúc UML, Flowchart', 'Bảng so sánh hiệu năng & kết quả thực nghiệm'],
      format: 'PPTX',
      size: '4.8 MB',
    },
    {
      id: 4,
      title: 'Bộ Checklist Tự Đánh Giá Liêm Chính & Chống Đạo Văn',
      category: 'PDF Hướng dẫn',
      desc: 'Bảng kiểm 15 tiêu chí liêm chính học thuật dành cho sinh viên trước khi nộp đồ án: trích dẫn nguồn, công bố mã nguồn, cam kết độc lập tác quyền.',
      features: ['Tránh lỗi vi phạm bản quyền đồ án', 'Hướng dẫn trích dẫn chuẩn APA 7th & IEEE', 'Quy trình giải trình hội đồng'],
      format: 'PDF',
      size: '350 KB',
    },
    {
      id: 5,
      title: 'Phiếu Giao Đề Tài & Nhận Xét Của Giảng Viên Hướng Dẫn',
      category: 'Word (.docx)',
      desc: 'Biểu mẫu BM-01 và BM-02 theo quy định đào tạo Khoa CNTT: Phiếu đăng ký đề tài, theo dõi tiến độ tuần và phiếu đánh giá của GVHD/GVPB.',
      features: ['Chuẩn mẫu ban hành năm học 2024-2025', 'Khung chấm điểm theo thang rubric 10 điểm', 'Đầy đủ chữ ký & xác nhận'],
      format: 'DOCX',
      size: '120 KB',
    },
  ]

  const handleDownload = (title: string, format: string) => {
    const content = `TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI - KHOA CÔNG NGHỆ THÔNG TIN\n\n${title}\nĐịnh dạng: ${format}\nNăm học: 2024 - 2025\n\nTài liệu được tải từ Hệ thống Học liệu Nội bộ Khoa CNTT UTC.`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}.${format.toLowerCase()}`
    a.click()
    URL.revokeObjectURL(url)
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
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Biểu Mẫu Chuẩn UTC</span>
          </div>

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white p-8 md:p-10 mb-8 shadow-md border border-blue-900/40">
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
                <School className="w-4 h-4 text-amber-400" />
                <span>Quy Chuẩn Học Thuật Ban Hành · Khoa CNTT UTC</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                Trung Tâm Biểu Mẫu Chuẩn BTL &amp; Khóa Luận UTC
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-2xl">
                Tải về các mẫu báo cáo Bài tập lớn, Đề cương khóa luận tốt nghiệp (Word &amp; Overleaf LaTeX), slide bảo vệ và phiếu nhận xét của giảng viên hướng dẫn đạt chuẩn quy định Khoa CNTT.
              </p>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="flex flex-col justify-between bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                      {tpl.category}
                    </span>
                    {tpl.isHot && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Phổ biến nhất
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                    {tpl.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    {tpl.desc}
                  </p>

                  {/* Feature bullet points */}
                  <div className="space-y-1.5 mb-6">
                    {tpl.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">{tpl.size}</span>
                  <div className="flex items-center gap-2">
                    {tpl.overleafUrl && (
                      <a
                        href={tpl.overleafUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Mở trên Overleaf"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDownload(tpl.title, tpl.format)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải biểu mẫu</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Guidelines info box */}
          <div className="mt-12 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Quy định về Định dạng &amp; Liêm chính Học thuật Đồ án Khoa CNTT
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tất cả các bản nộp khóa luận tốt nghiệp và bài tập lớn môn học phải tuân thủ nghiêm ngặt định dạng mẫu được Khoa ban hành. Mọi tài liệu tham khảo phải được trích dẫn nguồn theo chuẩn IEEE hoặc APA. Đối với các đề tài có xây dựng phần mềm, sinh viên bắt buộc phải đính kèm đường link kho lưu trữ mã nguồn (GitHub/GitLab) của dự án.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default TemplateCenter
