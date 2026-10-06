export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-xs text-slate-500 py-8 px-6 lg:px-12">
      <div className="max-w-[1720px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Department Info */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              U
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight">Hệ thống Tài liệu Học thuật UTC</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                KHOA CNTT
              </span>
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed max-w-md text-xs">
            Nền tảng lưu trữ, tra cứu bài giảng, giáo trình, đồ án tốt nghiệp và học liệu chuyên ngành Công nghệ Thông tin — Trường Đại học Giao thông Vận tải.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>SYSTEM VER: v2.4.0-RELEASE</span>
            <span>•</span>
            <span>UTC-FIT ACADEMIC ARCHIVE</span>
          </div>
        </div>

        {/* Col 2: Academic Links */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Liên kết Học thuật</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <a href="#rules" className="hover:text-blue-700 transition-colors">Quy chế Học thuật & Nộp KLTN</a>
            </li>
            <li>
              <a href="#dept" className="hover:text-blue-700 transition-colors">Danh mục Bộ môn Khoa CNTT</a>
            </li>
            <li>
              <a href="#portal" className="hover:text-blue-700 transition-colors">Cổng thông tin Đào tạo UTC</a>
            </li>
            <li>
              <a href="#turnitin" className="hover:text-blue-700 transition-colors">Quy định Liêm chính Học thuật (Turnitin)</a>
            </li>
          </ul>
        </div>

        {/* Col 3: Support & Contact */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Hỗ trợ & Liên hệ</h4>
          <p className="text-xs text-slate-600">Văn phòng Khoa CNTT — Phòng 204 Nhà A9</p>
          <p className="text-xs text-slate-600">Số 3 Cầu Giấy, Láng Thượng, Đống Đa, Hà Nội</p>
          <p className="text-xs text-blue-700 font-medium font-mono">fit@utc.edu.vn • (024) 3766 8925</p>
        </div>
      </div>

      <div className="max-w-[1720px] mx-auto mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
        <p>© 2026 Khoa Công nghệ Thông tin — Trường Đại học Giao thông Vận tải. Bảo lưu mọi quyền.</p>
        <div className="flex items-center gap-4">
          <a href="#terms" className="hover:text-slate-600">Hướng dẫn sử dụng</a>
          <a href="#privacy" className="hover:text-slate-600">Bảo mật thông tin</a>
          <a href="#api" className="hover:text-slate-600">API Developers</a>
        </div>
      </div>
    </footer>
  )
}
