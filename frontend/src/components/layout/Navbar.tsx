import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home as HomeIcon,
  GraduationCap,
  Search,
  BookOpen,
  FileCheck,
  FolderArchive,
  Upload,
  Sun,
  Moon,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Shield,
  FileText,
  Bookmark,
  Map,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import NotificationBell from '../NotificationBell'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    if (path === '/search') {
      return (
        location.pathname === '/search' &&
        !location.search.includes('tab=hub') &&
        !location.search.includes('tab=novelty') &&
        !location.search.includes('tab=heatmap')
      )
    }
    return location.pathname === path
  }

  const isTabActive = (tab: string) => {
    return location.pathname === '/search' && location.search.includes(`tab=${tab}`)
  }

  const navLinkClass = (active: boolean) =>
    `px-3 py-1.5 rounded text-xs font-mono transition-all duration-150 flex items-center gap-1.5 ${
      active
        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold shadow-xs'
        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800'
    }`

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fcfbf9]/95 dark:bg-[#0c1017]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-8 h-8 rounded bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif-academic font-bold text-base tracking-tight text-stone-950 dark:text-stone-50 leading-none">
                  Academic Docs
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 font-mono">
                  UTC FIT
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 leading-none mt-1">
                Khoa Công Nghệ Thông Tin
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-md border border-stone-200 dark:border-stone-800">
            <Link to="/" className={navLinkClass(isActive('/'))}>
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>

            <Link to="/search" className={navLinkClass(isActive('/search'))}>
              <Search className="w-3.5 h-3.5" />
              <span>Tra cứu tài liệu</span>
            </Link>

            <Link to="/exams" className={navLinkClass(isActive('/exams'))}>
              <BookOpen className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Kho Đề Thi</span>
            </Link>

            <Link to="/templates" className={navLinkClass(isActive('/templates'))}>
              <FileCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Biểu Mẫu UTC</span>
            </Link>

            <Link to="/search?tab=hub" className={navLinkClass(isTabActive('hub'))}>
              <span>Sổ tay Học phần</span>
            </Link>

            <Link to="/search?tab=novelty" className={navLinkClass(isTabActive('novelty'))}>
              <span>Đối soát Đề tài</span>
            </Link>

            <Link to="/search?tab=heatmap" className={navLinkClass(isTabActive('heatmap'))}>
              <Map className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Bản đồ Độ phủ</span>
            </Link>

            {isAuthenticated && (
              <Link to="/collections" className={navLinkClass(isActive('/collections'))}>
                <FolderArchive className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                <span>Bộ Sưu Tập</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link to="/admin" className={navLinkClass(isActive('/admin'))}>
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span>Quản trị</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
            type="button"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* In-app Notification Bell */}
          {isAuthenticated && <NotificationBell />}

          {/* Upload Document Button */}
          {isAuthenticated && (
            <Link
              to="/documents/upload"
              className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Đăng tải học liệu</span>
            </Link>
          )}

          {/* Auth State */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                type="button"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {user?.fullName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {user?.role === 'ADMIN' ? 'Ban Quản trị' : user?.studentCode || 'Sinh viên'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 md:hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{user?.studentCode || 'Sinh viên'}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Hồ sơ học tập</span>
                  </Link>

                  <Link
                    to="/me/documents"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Học liệu của tôi</span>
                  </Link>

                  <Link
                    to="/me/bookmarks"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-slate-400" />
                    <span>Học liệu đã lưu</span>
                  </Link>

                  <Link
                    to="/collections"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FolderArchive className="w-4 h-4 text-slate-400" />
                    <span>Bộ sưu tập cá nhân</span>
                  </Link>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      logout()
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
export { Navbar }
