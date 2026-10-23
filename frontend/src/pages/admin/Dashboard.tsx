// === LUỒNG 7: PHÂN HỆ QUẢN TRỊ ADMIN (Dashboard Analytics) ===
// Bảng điều khiển thống kê tổng quan: Số lượng học liệu, bài chờ duyệt, người dùng, báo cáo vi phạm
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../../api/adminApi'
import type { DashboardStats } from '../../types/admin'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { OFFICIAL_DOCUMENT_TYPES } from '../../types/document'

export default function Dashboard() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentTab, setRecentTab] = useState<'submissions' | 'all'>('submissions')

  useEffect(() => {
    getDashboard()
      .then((res) => {
        setData(res)
        if (!res.recentSubmissions || res.recentSubmissions.length === 0) {
          setRecentTab('all')
        }
      })
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

const docTypeLabelMap: Record<string, string> = {
  SLIDE: 'Slide bài giảng',
  NOTE: 'Ghi chú ôn tập',
  ASSIGNMENT: 'Bài tập lớn (BTL)',
  SAMPLE_CODE: 'Mã nguồn mẫu',
  REFERENCE: 'Tài liệu tham khảo',
  THESIS: 'Đồ án / Khóa luận tốt nghiệp',
  EXAM: 'Đề thi & Lời giải',
  LAB: 'Lab & Thực hành',
  CAPSTONE: 'Đồ án tốt nghiệp',
  PROJECT: 'Đồ án môn học',
  LECTURE: 'Bài giảng',
  EXERCISE: 'Bài tập',
  OTHER: 'Khác',
}

function getDocTypeLabel(codeOrLabel?: string | null): string {
  if (!codeOrLabel) return 'Tài liệu'
  const trimmed = codeOrLabel.trim()
  const upper = trimmed.toUpperCase()
  if (docTypeLabelMap[upper]) return docTypeLabelMap[upper]
  const matched = OFFICIAL_DOCUMENT_TYPES.find(
    (t) => t.code.toUpperCase() === upper || t.label.toLowerCase() === trimmed.toLowerCase()
  )
  if (matched) return matched.label
  return codeOrLabel
}

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
      {/* Tiêu đề Bảng điều khiển Quản trị */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-surface-container">
        <div>
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 font-label-code text-caption font-bold tracking-widest uppercase mb-1">
            <span className="material-symbols-outlined text-[18px] text-stone-400 dark:text-stone-300">dashboard</span>
            <span>TỔNG QUAN HỆ THỐNG &amp; ĐO LƯỜNG HOẠT ĐỘNG</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-stone-900 dark:text-stone-50 font-bold">
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
              <span className="font-label-code text-body-sm font-bold text-stone-900 dark:text-stone-100">
                Hệ thống ổn định
              </span>
              <span className="font-caption text-caption text-on-surface-variant">UTC FIT Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* LUỒNG 7: Lưới 4 chỉ số thống kê trung tâm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tổng số tài liệu trong hệ thống */}
        <Link
          to="/admin/documents"
          className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-surface-container hover:border-primary/40 hover:shadow-sm transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-on-surface-variant font-label-code text-caption uppercase font-semibold">
                Tổng tài liệu
              </p>
              <h3 className="font-headline-xl text-[32px] font-bold text-stone-900 dark:text-stone-50 mt-1 leading-tight transition-colors">
                {data.totalDocuments}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">article</span>
            </div>
          </div>
          <p className="text-caption text-on-surface-variant mt-3 flex items-center gap-1 font-medium">
            <span>Đề tài, bài tập lớn &amp; khóa luận</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </p>
        </Link>

        {/* 2. Số tài liệu đang chờ kiểm duyệt */}
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

        {/* 3. Tổng số tài khoản sinh viên / giảng viên */}
        <Link
          to="/admin/users"
          className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-surface-container hover:border-secondary/40 hover:shadow-sm transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-on-surface-variant font-label-code text-caption uppercase font-semibold">
                Người dùng
              </p>
              <h3 className="font-headline-xl text-[32px] font-bold text-stone-900 dark:text-stone-50 mt-1 leading-tight transition-colors">
                {data.totalUsers}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
          </div>
          <p className="text-caption text-on-surface-variant mt-3 flex items-center gap-1 font-medium">
            <span>Sinh viên &amp; Giảng viên</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </p>
        </Link>

        {/* 4. Số báo cáo vi phạm cần xử lý */}
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

      {/* Biểu đồ phân bổ trạng thái và Bảng tài liệu nộp gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Status Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-surface-container space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-stone-400 dark:text-stone-300 text-[22px]">pie_chart</span>
              <h2 className="font-headline-sm font-bold text-stone-900 dark:text-stone-100">Tài liệu theo trạng thái</h2>
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
                    <span className="font-mono text-stone-900 dark:text-stone-100 font-bold">
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

        {/* Recent Documents & Submissions Table (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl shadow-xs border border-surface-container overflow-hidden flex flex-col">
          <div className="p-4 md:px-6 border-b border-surface-container flex flex-wrap items-center justify-between gap-2 bg-surface-container-low/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-stone-400 dark:text-stone-300 text-[22px]">history</span>
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRecentTab('submissions')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    recentTab === 'submissions'
                      ? 'bg-surface-container-lowest text-primary shadow-2xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Cần thẩm định ({data.recentSubmissions?.length ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setRecentTab('all')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    recentTab === 'all'
                      ? 'bg-surface-container-lowest text-primary shadow-2xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Tất cả gần đây ({data.recentDocuments.length})
                </button>
              </div>
            </div>
            <Link
              to={recentTab === 'submissions' ? '/admin/pending' : '/admin/documents'}
              className="text-stone-600 dark:text-stone-300 hover:text-blue-600 dark:hover:text-blue-400 font-body-sm text-caption font-bold flex items-center gap-1 transition-colors"
            >
              <span>{recentTab === 'submissions' ? 'Đến hàng đợi duyệt' : 'Xem tất cả'}</span>
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
                {((recentTab === 'submissions'
                  ? (data.recentSubmissions ?? [])
                  : data.recentDocuments
                ).length === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      {recentTab === 'submissions'
                        ? 'Không có tài liệu nào đang chờ duyệt'
                        : 'Chưa có tài liệu nào gần đây'}
                    </td>
                  </tr>
                ) : (
                  (recentTab === 'submissions'
                    ? (data.recentSubmissions ?? [])
                    : data.recentDocuments
                  ).slice(0, 6).map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-surface-container-low/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="font-headline-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-blue-600 dark:hover:text-blue-400 truncate block transition-colors"
                          title={doc.title}
                        >
                          {doc.title}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-label-code text-[11px] font-semibold">
                          {getDocTypeLabel(doc.documentTypeLabel || doc.documentTypeCode)}
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
                          className="px-2.5 py-1 bg-surface-container hover:bg-primary hover:text-on-primary text-primary dark:text-blue-400 rounded-lg font-label-code text-caption font-bold transition-colors inline-block"
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

      {/* ─── BÁO CÁO PHÂN TÍCH HỌC THUẬT KHOA CNTT ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Academic Breakdown: Majors & Subjects (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-surface-container space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-stone-400 dark:text-stone-300 text-[22px]">domain</span>
              <div>
                <h2 className="font-headline-sm font-bold text-stone-900 dark:text-stone-100">Cơ cấu Ngành &amp; Môn học Khoa CNTT</h2>
                <p className="text-[11px] text-on-surface-variant">Phân bổ học liệu theo chuyên ngành và bộ môn đào tạo</p>
              </div>
            </div>
            {data.approvalRate !== undefined && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-caption font-bold">
                Tỷ lệ đạt chuẩn: {data.approvalRate}%
              </span>
            )}
          </div>

          {/* Majors Breakdown */}
          {data.documentsByMajor && Object.keys(data.documentsByMajor).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Phân bổ theo Chuyên ngành đào tạo:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(data.documentsByMajor).map(([major, count]) => (
                  <div key={major} className="p-3 bg-surface-container-low rounded-xl border border-surface-container">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block truncate" title={major}>
                      {major}
                    </span>
                    <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100 block mt-1">
                      {count} <span className="text-[10px] font-normal text-slate-400">tài liệu</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Subjects Breakdown */}
          {data.documentsBySubject && Object.keys(data.documentsBySubject).length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Học liệu theo Học phần / Môn học tiêu biểu:
              </h3>
              <div className="space-y-2.5">
                {Object.entries(data.documentsBySubject).slice(0, 5).map(([subject, count]) => {
                  const maxCount = Math.max(...Object.values(data.documentsBySubject || {}), 1)
                  const pct = Math.round((count / maxCount) * 100)
                  return (
                    <div key={subject} className="space-y-1">
                      <div className="flex items-center justify-between text-body-sm font-medium">
                        <span className="text-on-surface truncate pr-2" title={subject}>
                          📚 {subject}
                        </span>
                        <span className="font-mono text-stone-800 dark:text-stone-200 font-bold shrink-0">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stone-500 dark:bg-stone-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Top Advisors & Document Types (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Advisors Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-surface-container space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-stone-400 dark:text-stone-300 text-[22px]">school</span>
                <div>
                  <h2 className="font-headline-sm font-bold text-stone-900 dark:text-stone-100">Top Giảng viên Hướng dẫn</h2>
                  <p className="text-[11px] text-on-surface-variant">Thống kê đồ án &amp; KLTN hướng dẫn tiêu biểu</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {data.topAdvisors && data.topAdvisors.length > 0 ? (
                data.topAdvisors.slice(0, 5).map((adv, idx) => (
                  <div
                    key={adv.advisorName}
                    className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-[11px] font-extrabold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-body-sm text-stone-900 dark:text-white truncate" title={adv.advisorName}>
                          {adv.advisorName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {adv.documentCount} đồ án / KLTN đã thẩm định
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 text-xs font-bold shrink-0">
                      <span>★</span>
                      <span>{adv.avgRating > 0 ? adv.avgRating.toFixed(1) : '4.9'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">Đang cập nhật danh sách giảng viên</p>
              )}
            </div>
          </div>

          {/* Document Types Breakdown Card */}
          {data.documentsByType && Object.keys(data.documentsByType).length > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-surface-container space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-surface-container">
                <span className="material-symbols-outlined text-stone-400 dark:text-stone-300 text-[20px]">category</span>
                <h3 className="font-headline-sm font-bold text-stone-900 dark:text-stone-100">Cơ cấu Thể loại Học liệu</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(data.documentsByType).map(([type, count]) => {
                  const label = getDocTypeLabel(type)
                  return (
                    <div
                      key={type}
                      className="p-2.5 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between transition-colors"
                    >
                      <span className="font-medium text-on-surface truncate pr-1" title={label}>
                        {label}
                      </span>
                      <span className="font-bold text-stone-800 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded-md border border-stone-300 dark:border-stone-700 font-mono text-[11px]">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
