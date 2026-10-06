import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../../api/adminApi'
import type { DashboardStats } from '../../types/admin'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

export default function Dashboard() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs">
        <Spinner />
        <p className="mt-3 font-body-sm text-on-surface-variant">Đang tải số liệu thống kê...</p>
      </div>
    )
  }

  if (!data) return null

  const statusMap: Record<string, { label: string; color: string }> = {
    APPROVED: { label: 'Đã duyệt', color: 'bg-emerald-500' },
    PENDING: { label: 'Chờ duyệt', color: 'bg-amber-500' },
    DRAFT: { label: 'Bản nháp', color: 'bg-slate-400' },
    REJECTED: { label: 'Từ chối', color: 'bg-error' },
    HIDDEN: { label: 'Đã ẩn', color: 'bg-gray-400' },
    REVISION_REQUIRED: { label: 'Yêu cầu sửa', color: 'bg-orange-500' },
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-surface-container">
        <div>
          <div className="flex items-center gap-1.5 text-secondary font-label-code text-caption font-bold tracking-widest uppercase mb-1">
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>TỔNG QUAN HỆ THỐNG &amp; ĐO LƯỜNG HOẠT ĐỘNG</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
            Bảng Điều Khiển Quản Trị Hệ Thống
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Khoa CNTT - UTC • Thống kê số lượng học liệu, tiến độ thẩm định đồ án và báo cáo vi phạm.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-xs border border-surface-container flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div className="flex flex-col">
              <span className="font-label-code text-body-sm font-bold text-primary">
                Hệ thống ổn định
              </span>
              <span className="font-caption text-caption text-on-surface-variant">UTC FIT Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <Link
          to="/admin/documents"
          className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-surface-container hover:border-primary/40 hover:shadow-sm transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-on-surface-variant font-label-code text-caption uppercase font-semibold">
                Tổng tài liệu
              </p>
              <h3 className="font-headline-xl text-[32px] font-bold text-primary mt-1 leading-tight group-hover:text-secondary transition-colors">
                {data.totalDocuments}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">article</span>
            </div>
          </div>
          <p className="text-caption text-on-surface-variant mt-3 flex items-center gap-1 font-medium">
            <span>Đề tài, bài tập lớn &amp; khóa luận</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </p>
        </Link>

        {/* Pending Documents */}
        <Link
          to="/admin/pending"
          className={`bg-surface-container-lowest rounded-2xl p-5 shadow-xs border transition-all group ${
            data.pendingDocuments > 0
              ? 'border-amber-300 ring-2 ring-amber-100 hover:border-amber-400'
              : 'border-surface-container hover:border-amber-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-on-surface-variant font-label-code text-caption uppercase font-semibold">
                Chờ duyệt
              </p>
              <h3 className="font-headline-xl text-[32px] font-bold text-amber-600 mt-1 leading-tight">
                {data.pendingDocuments}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
            </div>
          </div>
          <p className="text-caption text-amber-700 mt-3 flex items-center gap-1 font-semibold">
            <span>Hàng đợi cần phê duyệt</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </p>
        </Link>

        {/* Total Users */}
        <Link
          to="/admin/users"
          className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-surface-container hover:border-secondary/40 hover:shadow-sm transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-on-surface-variant font-label-code text-caption uppercase font-semibold">
                Người dùng
              </p>
              <h3 className="font-headline-xl text-[32px] font-bold text-secondary mt-1 leading-tight group-hover:text-primary transition-colors">
                {data.totalUsers}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
          </div>
          <p className="text-caption text-on-surface-variant mt-3 flex items-center gap-1 font-medium">
            <span>Sinh viên &amp; Giảng viên</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </p>
        </Link>

        {/* Reports */}
        <Link
          to="/admin/reports"
          className={`bg-surface-container-lowest rounded-2xl p-5 shadow-xs border transition-all group ${
            data.totalReports > 0
              ? 'border-red-300 ring-2 ring-red-100 hover:border-red-400'
              : 'border-surface-container hover:border-red-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-on-surface-variant font-label-code text-caption uppercase font-semibold">
                Báo cáo vi phạm
              </p>
              <h3 className="font-headline-xl text-[32px] font-bold text-error mt-1 leading-tight">
                {data.totalReports}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">report</span>
            </div>
          </div>
          <p className="text-caption text-on-surface-variant mt-3 flex items-center gap-1 font-medium">
            <span>Khiếu nại bản quyền</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </p>
        </Link>
      </div>

      {/* Main Grid: Status Progress & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Status Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-surface-container space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">pie_chart</span>
              <h2 className="font-headline-sm font-bold text-primary">Tài liệu theo trạng thái</h2>
            </div>
            <span className="font-label-code text-caption text-on-surface-variant font-semibold">
              Tổng: {data.totalDocuments}
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(data.documentsByStatus).map(([status, count]) => {
              const width = data.totalDocuments > 0 ? (count / data.totalDocuments) * 100 : 0
              const info = statusMap[status] || { label: status, color: 'bg-primary' }
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-body-sm font-semibold">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${info.color}`} />
                      <span>{info.label}</span>
                    </span>
                    <span className="font-mono text-primary font-bold">
                      {count} <span className="text-outline text-caption font-normal">({Math.round(width)}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 bg-surface-container-low rounded-full overflow-hidden">
                    <div
                      className={`h-full ${info.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(width, count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Documents Table (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl shadow-xs border border-surface-container overflow-hidden flex flex-col">
          <div className="p-4 md:px-6 border-b border-surface-container flex items-center justify-between bg-surface-container-low/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">history</span>
              <h2 className="font-headline-sm font-bold text-primary">Tài liệu gửi gần đây</h2>
            </div>
            <Link
              to="/admin/documents"
              className="text-secondary hover:text-primary font-body-sm text-caption font-bold flex items-center gap-1 transition-colors"
            >
              <span>Xem tất cả</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low text-on-surface-variant font-label-code text-caption uppercase tracking-wider border-b border-surface-container">
                <tr>
                  <th className="py-3 px-4">Tiêu đề đề tài</th>
                  <th className="py-3 px-4">Loại</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Người nộp</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {data.recentDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      Chưa có tài liệu nào gần đây
                    </td>
                  </tr>
                ) : (
                  data.recentDocuments.slice(0, 6).map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-surface-container-low/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="font-headline-sm font-semibold text-primary hover:text-secondary truncate block transition-colors"
                          title={doc.title}
                        >
                          {doc.title}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-label-code text-[11px] font-semibold">
                          {doc.documentTypeLabel || doc.documentTypeCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge status={doc.status} />
                      </td>

                      <td className="py-3.5 px-4 text-on-surface text-caption truncate max-w-[120px]">
                        {doc.uploaderName}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="px-2.5 py-1 bg-surface-container hover:bg-primary hover:text-on-primary text-primary rounded-lg font-label-code text-caption font-bold transition-colors inline-block"
                        >
                          Xem
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
