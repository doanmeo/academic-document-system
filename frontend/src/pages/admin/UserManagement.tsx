import React, { useEffect, useState } from 'react'
import { getAdminUsers, toggleUserActive } from '../../api/adminApi'
import type { PageResponse } from '../../types/document'
import type { User } from '../../types/admin'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'

export default function UserManagement() {
  const [data, setData] = useState<PageResponse<User> | null>(null)
  const [loading, setLoading] = useState(false)
  const [roleFilter, setRoleFilter] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [confirmToggle, setConfirmToggle] = useState<{ user: User } | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const fetchUsers = () => {
    setLoading(true)
    getAdminUsers({ page, keyword, role: roleFilter })
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [page, keyword, roleFilter])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleToggle = async () => {
    if (!confirmToggle) return
    const user = confirmToggle.user
    setActionLoading(user.id)
    try {
      await toggleUserActive(user.id, { active: !user.active })
      setToast({
        type: 'success',
        msg: user.active
          ? `Đã khóa tài khoản ${user.fullName} thành công!`
          : `Đã mở khóa tài khoản ${user.fullName} thành công!`,
      })
      setConfirmToggle(null)
      fetchUsers()
    } catch (e) {
      console.error(e)
      setToast({ type: 'error', msg: 'Có lỗi xảy ra khi cập nhật trạng thái tài khoản' })
    } finally {
      setActionLoading(null)
    }
  }

  const roleTabs = [
    { label: 'Tất cả vai trò', value: '' },
    { label: 'Sinh viên', value: 'STUDENT' },
    { label: 'Quản trị viên', value: 'ADMIN' },
  ]

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border text-body-sm flex items-center gap-2.5 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-surface-container">
        <div>
          <div className="flex items-center gap-1.5 text-secondary font-label-code text-caption font-bold tracking-widest uppercase mb-1">
            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
            <span>QUẢN TRỊ NGƯỜI DÙNG &amp; PHÂN QUYỀN HỆ THỐNG</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
            Quản Lý Tài Khoản Người Dùng
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Khoa CNTT - UTC • Kiểm soát trạng thái tài khoản sinh viên, giảng viên và phân quyền quản trị.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-xs border border-surface-container flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">group</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-code text-body-sm font-bold text-primary">
                {data ? data.totalElements : 0} người dùng
              </span>
              <span className="font-caption text-caption text-on-surface-variant">Tổng tài khoản</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto">
          {roleTabs.map((tab) => {
            const active = roleFilter === tab.value
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setRoleFilter(tab.value)
                  setPage(0)
                }}
                className={`px-3.5 py-1.5 rounded-lg text-body-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  active
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo họ tên, email, MSSV..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
          />
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-code text-caption uppercase tracking-wider border-b border-surface-container">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Avatar</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Mã sinh viên</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Chuyên ngành</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : !data || data.content.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-outline mx-auto mb-2 block">
                      person_off
                    </span>
                    <p className="font-semibold text-primary">Không tìm thấy tài khoản người dùng phù hợp</p>
                  </td>
                </tr>
              ) : (
                data.content.map((user) => {
                  const isAdmin = user.role === 'ADMIN'
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-surface-container-low/60 transition-colors ${
                        !user.active ? 'bg-surface-container-low/30 opacity-70' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mx-auto shadow-2xs">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-headline-sm font-semibold text-primary">
                        {user.fullName}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-body-sm text-on-surface-variant">
                        {user.email}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-body-sm text-on-surface">
                        {user.studentCode || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-badge text-caption font-bold ${
                            isAdmin
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-secondary/10 text-secondary border border-secondary/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-primary' : 'bg-secondary'}`} />
                          <span>{isAdmin ? 'ADMIN' : 'STUDENT'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {user.majorName || 'Chưa cập nhật'}
                      </td>

                      <td className="py-3.5 px-4">
                        {user.active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-badge text-caption font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-label-badge text-caption font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span>Đã khóa</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setConfirmToggle({ user })}
                          disabled={actionLoading === user.id}
                          className={`px-3 py-1 rounded-lg font-body-sm text-caption font-bold transition-all cursor-pointer ${
                            user.active
                              ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {actionLoading === user.id
                            ? 'Đang xử lý...'
                            : user.active
                            ? 'Khóa tài khoản'
                            : 'Mở khóa'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-surface-container bg-surface-container-lowest">
            <Pagination
              page={page}
              totalPages={data.totalPages}
              onChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmToggle && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-surface-container">
              <span
                className={`material-symbols-outlined text-[24px] ${
                  confirmToggle.user.active ? 'text-error' : 'text-emerald-600'
                }`}
              >
                {confirmToggle.user.active ? 'lock' : 'lock_open'}
              </span>
              <h3 className="font-headline-md font-bold text-primary">
                {confirmToggle.user.active ? 'Khóa tài khoản người dùng' : 'Mở khóa tài khoản'}
              </h3>
            </div>

            <p className="font-body-sm text-on-surface leading-relaxed">
              Bạn có chắc chắn muốn {confirmToggle.user.active ? 'khóa' : 'mở khóa'} quyền truy cập của tài khoản{' '}
              <strong className="text-primary">{confirmToggle.user.fullName}</strong> ({confirmToggle.user.email})?
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmToggle(null)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-body-sm font-semibold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleToggle}
                className={`px-5 py-2 text-white rounded-xl font-body-sm font-bold shadow-xs transition-all cursor-pointer ${
                  confirmToggle.user.active
                    ? 'bg-error hover:bg-error-container text-on-error hover:text-on-error-container'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
