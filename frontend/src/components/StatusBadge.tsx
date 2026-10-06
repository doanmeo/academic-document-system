import type { DocumentStatus } from '../types'

interface StatusBadgeProps {
  status: DocumentStatus
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const configs: Record<DocumentStatus, { label: string; bg: string; text: string; border: string }> = {
    DRAFT: {
      label: 'Bản nháp',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
    },
    PENDING: {
      label: 'Chờ duyệt',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-300',
    },
    REVISION_REQUIRED: {
      label: 'Cần sửa đổi',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-300',
    },
    APPROVED: {
      label: 'Đã duyệt',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
    },
    REJECTED: {
      label: 'Bị từ chối',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-300',
    },
    HIDDEN: {
      label: 'Đã ẩn',
      bg: 'bg-gray-100',
      text: 'text-gray-500',
      border: 'border-gray-300',
    },
    ARCHIVED: {
      label: 'Lưu trữ',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-300',
    },
  }

  const config = configs[status] || configs.DRAFT

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {config.label}
    </span>
  )
}
