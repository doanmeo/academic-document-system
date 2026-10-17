import { Link } from 'react-router-dom'
import { GraduationCap, ShieldCheck, FileCheck2, FileText, BookOpen, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#fbfbfa] dark:bg-[#0c1017] border-t border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 text-xs transition-colors mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-black">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif-academic font-bold text-stone-950 dark:text-stone-50 tracking-tight text-base block">UTC FIT ACADEMIC</span>
                <span className="text-[10px] font-mono text-stone-500 block -mt-0.5">Khoa Công nghệ Thông tin</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Hệ thống quản lý, lưu trữ và tra cứu học liệu số nội bộ có kiểm duyệt của Khoa CNTT - Trường Đại học Giao thông Vận tải.
            </p>
          </div>

          {/* Quick Academic Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Học Liệu & Đào Tạo</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Tra cứu học liệu đa chiều</span>
                </Link>
              </li>
              <li>
                <Link to="/exams" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kho đề thi & Đáp án</span>
                </Link>
              </li>
              <li>
                <Link to="/templates" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Biểu mẫu BTL & Khóa luận</span>
                </Link>
              </li>
              <li>
                <Link to="/search?tab=heatmap" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Bản đồ Độ phủ Học liệu (Heatmap)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Integrity & Tools */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Liêm Chính Học Thuật</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/search?tab=novelty" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Đối soát tính mới đề tài</span>
                </Link>
              </li>
              <li>
                <Link to="/search?tab=heatmap" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Bản đồ độ phủ học liệu các bộ môn
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500">Quy chuẩn trích dẫn IEEE / APA</span>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500">Quy trình kiểm duyệt nội bộ Khoa</span>
              </li>
            </ul>
          </div>

          {/* Contact & Faculty Info */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Khoa CNTT · UTC</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Phòng 201 - Nhà A9, Trường ĐH Giao thông Vận tải<br />
              Số 3 phố Cầu Giấy, Q. Đống Đa, Hà Nội
            </p>
            <div className="pt-2 text-[11px] text-slate-400">
              <span>Hỗ trợ kỹ thuật: </span>
              <span className="font-mono text-slate-600 dark:text-slate-300">fit@utc.edu.vn</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Khoa Công nghệ Thông tin - Trường Đại học Giao thông Vận tải.
          </div>
          <div className="flex items-center gap-1">
            <span>Xây dựng phục vụ học tập &amp; nghiên cứu sinh viên Khoa CNTT</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
