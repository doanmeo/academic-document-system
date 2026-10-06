import { useState, useEffect } from 'react'
import type { User } from '../../types'
import { adminApi } from '../../api/adminApi'
import { toast } from 'sonner'
import CustomSelect from '../../components/ui/CustomSelect'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  useEffect(() => {
    setLoading(true)
    adminApi
      .getUsers({
        keyword: keyword || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
      })
      .then((res) => {
        if (res.success && res.data) {
          setUsers(res.data.content || [])
        } else {
          setUsers([])
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Không thể tải danh sách người dùng'
        toast.error(msg)
        setUsers([])
      })
      .finally(() => setLoading(false))
  }, [keyword, roleFilter])

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await adminApi.toggleUserActive(id, !currentActive)
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, active: !currentActive } : u))
      )
      toast.success(!currentActive ? 'Đã mở khóa tài khoản thành công' : 'Đã khóa tài khoản thành công')
    } catch (err: unknown) {
      const errResponse = err as { response?: { data?: { message?: string } }; message?: string }
      const msg = errResponse.response?.data?.message || errResponse.message || 'Không thể cập nhật trạng thái người dùng'
      toast.error(msg)
    }
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý người dùng</h1>
          <p className="text-xs text-slate-500 mt-1">
            Danh sách tài khoản sinh viên và quản trị viên trong hệ thống.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
          Tổng số: <strong className="text-indigo-600">{users.length}</strong> tài khoản
        </span>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên, email, mã sinh viên..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
          />
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Vai trò:</span>
          <CustomSelect
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            options={[
              { value: 'ALL', label: 'Tất cả vai trò' },
              { value: 'STUDENT', label: 'Sinh viên (Student)' },
              { value: 'ADMIN', label: 'Quản trị viên (Admin)' },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400 animate-pulse">
          Đang tải danh sách người dùng...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 text-base">Không tìm thấy người dùng</h3>
          <p className="text-xs text-slate-500 mt-1">
            Không có tài khoản nào phù hợp với điều kiện tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Người dùng</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Mã SV</th>
                  <th className="py-4 px-6">Vai trò</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Khóa / Mở</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {u.fullName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{u.fullName}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-mono">
                      {u.email}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap font-mono text-slate-700">
                      {u.studentCode || '—'}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.active ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {u.active ? 'Đang hoạt động' : 'Bị tạm khóa'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(u.id, u.active)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          u.active
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.active ? 'Khóa tài khoản' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
