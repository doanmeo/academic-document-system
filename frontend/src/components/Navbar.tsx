import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, LogOut, User as UserIcon, Shield, Search, UploadCloud, Bookmark } from 'lucide-react'
import { toast } from 'sonner'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Đã đăng xuất khỏi hệ thống')
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight hover:opacity-90 transition">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline">Academic Docs</span>
            </Link>

            {/* Main Nav Links */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1 ml-6 text-sm font-medium text-gray-700">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md hover:bg-gray-100 hover:text-indigo-600 transition"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/search"
                  className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 hover:text-indigo-600 transition"
                >
                  <Search className="w-4 h-4" />
                  Tìm kiếm
                </Link>
                <Link
                  to="/upload"
                  className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 hover:text-indigo-600 transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  Đăng tải
                </Link>
                <Link
                  to="/bookmarks"
                  className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 hover:text-indigo-600 transition"
                >
                  <Bookmark className="w-4 h-4" />
                  Đã lưu
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/pending"
                    className="flex items-center gap-1 px-3 py-2 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 transition font-semibold"
                  >
                    <Shield className="w-4 h-4" />
                    Quản trị
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-gray-800 leading-tight">{user.fullName}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
