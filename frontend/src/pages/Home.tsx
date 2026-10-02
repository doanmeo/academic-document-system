import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import { Search, UploadCloud, Bookmark, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Home() {
  const { user, isAdmin } = useAuth()
  const [backendHealth, setBackendHealth] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING')

  useEffect(() => {
    api.get('/health')
      .then((res) => {
        if (res.data?.success && res.data?.data?.status === 'UP') {
          setBackendHealth('UP')
        } else {
          setBackendHealth('DOWN')
        }
      })
      .catch(() => {
        setBackendHealth('DOWN')
      })
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/40 text-indigo-100 text-xs font-semibold mb-3 backdrop-blur-xs">
            {backendHealth === 'UP' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Backend kết nối thành công (UP)
              </>
            )}
            {backendHealth === 'CHECKING' && <span>Đang kiểm tra kết nối API...</span>}
            {backendHealth === 'DOWN' && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                Backend chưa khởi động
              </>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Xin chào, {user?.fullName || 'bạn'}! 👋
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Hệ thống quản lý và chia sẻ tài liệu học tập, đồ án, khóa luận nội bộ Khoa Công nghệ Thông tin.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 shadow-xs transition"
            >
              <Search className="w-4 h-4" />
              Tra cứu tài liệu
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/50 hover:bg-indigo-500/70 text-white font-semibold text-sm backdrop-blur-xs transition"
            >
              <UploadCloud className="w-4 h-4" />
              Đăng tài liệu mới
            </Link>
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          Thông tin phiên đăng nhập
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Họ và tên</span>
            <p className="font-semibold text-gray-900 mt-0.5">{user?.fullName}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Email</span>
            <p className="font-semibold text-gray-900 mt-0.5">{user?.email}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Vai trò</span>
            <p className="font-semibold text-indigo-600 mt-0.5">{user?.role}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Mã sinh viên</span>
            <p className="font-semibold text-gray-900 mt-0.5">{user?.studentCode || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/search"
          className="group block p-6 bg-white rounded-2xl border border-gray-200 hover:border-indigo-400 hover:shadow-sm transition"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">Kho tài liệu học tập</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Tìm kiếm bài giảng, tài liệu tham khảo, đề thi và đồ án theo môn học và năm học.
          </p>
        </Link>

        <Link
          to="/upload"
          className="group block p-6 bg-white rounded-2xl border border-gray-200 hover:border-indigo-400 hover:shadow-sm transition"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">Đăng tải tài liệu</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Đóng góp slide, bài tập lớn và tài liệu hữu ích cho cộng đồng sinh viên Khoa.
          </p>
        </Link>

        <Link
          to="/bookmarks"
          className="group block p-6 bg-white rounded-2xl border border-gray-200 hover:border-indigo-400 hover:shadow-sm transition"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">Tài liệu đã lưu</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Xem lại danh sách các tài liệu học tập bạn đã đánh dấu để ôn tập nhanh.
          </p>
        </Link>
      </div>
    </div>
  )
}
