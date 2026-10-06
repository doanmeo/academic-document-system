import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow bg-surface">
        <div className="max-w-7xl mx-auto px-4 lg:px-gutter-desktop space-y-6">
          {/* Admin Navigation Pills Strip */}
          <div className="bg-surface-container-lowest p-2.5 rounded-xl shadow-xs border border-surface-container flex items-center gap-1.5 flex-wrap">
            <NavLink
              to="/admin"
              end={true}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg font-headline-sm text-body-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              📊 Tổng quan
            </NavLink>
            <NavLink
              to="/admin/documents"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg font-headline-sm text-body-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              📄 Tất cả tài liệu
            </NavLink>
            <NavLink
              to="/admin/pending"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg font-headline-sm text-body-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              ⏳ Hàng đợi duyệt
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg font-headline-sm text-body-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              👥 Người dùng
            </NavLink>
            <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg font-headline-sm text-body-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              ⚠️ Báo cáo vi phạm
            </NavLink>
          </div>

          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  )
}
