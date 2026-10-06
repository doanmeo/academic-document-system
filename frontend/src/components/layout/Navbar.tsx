import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) =>
    `px-space-md py-space-xs rounded-lg font-body-sm text-body-sm transition-all ${
      isActive(path)
        ? 'bg-surface-container text-primary font-headline-sm font-semibold'
        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      <div className="h-16 max-w-7xl mx-auto px-4 lg:px-gutter-desktop flex items-center justify-between gap-space-md">
        {/* Brand & Nav */}
        <div className="flex items-center gap-space-lg">
          <Link to="/" className="flex items-center gap-space-sm group focus:outline-none">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">local_library</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-primary leading-none group-hover:text-primary-container transition-colors font-bold">
                Academic Docs
              </span>
              <span className="font-label-code text-[11px] font-bold text-secondary uppercase tracking-wider mt-1">
                KHOA CNTT - UTC
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-space-xs">
            <Link to="/" className={navLinkClass('/')}>
              Tra cứu
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/me/documents" className={navLinkClass('/me/documents')}>
                  Tài liệu của tôi
                </Link>
                <Link to="/me/bookmarks" className={navLinkClass('/me/bookmarks')}>
                  Đã lưu
                </Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className={navLinkClass('/admin')}>
                Quản trị
              </Link>
            )}
          </nav>
        </div>

        {/* Action Buttons & User Menu */}
        <div className="flex items-center gap-space-md">
          {isAuthenticated && (
            <Link
              to="/documents/upload"
              className="inline-flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container px-3.5 py-2 rounded-lg font-headline-sm text-body-sm transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span className="font-semibold">+ Đăng tải tài liệu</span>
            </Link>
          )}

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-body-sm font-semibold text-primary hover:text-primary-container transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg font-semibold text-body-sm transition-all shadow-xs"
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-space-sm cursor-pointer py-1"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface leading-snug">
                    {user?.fullName}
                  </span>
                  <span className="font-label-code text-[11px] text-secondary font-medium leading-none">
                    {user?.role === 'ADMIN' ? 'Ban Quản trị Khoa' : user?.studentCode || 'Sinh viên UTC'}
                  </span>
                </div>
                <span className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 z-50 bg-surface-container-lowest rounded-xl shadow-[0_10px_25px_-5px_rgba(15,58,104,0.12),0_8px_10px_-6px_rgba(15,58,104,0.08)] border border-surface-container py-space-xs">
                  <div className="px-space-md py-space-xs md:hidden bg-surface-container-low border-b border-surface-container">
                    <p className="font-body-sm text-body-sm font-semibold text-on-surface">{user?.fullName}</p>
                    <p className="font-label-code text-[11px] text-secondary">{user?.role === 'ADMIN' ? 'Admin Khoa' : user?.studentCode || 'Sinh viên'}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-space-sm px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <div className="my-1 border-t border-surface-container"></div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-space-sm w-full px-space-md py-space-sm font-body-sm text-body-sm text-error hover:bg-error-container/30 transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export { Navbar };
