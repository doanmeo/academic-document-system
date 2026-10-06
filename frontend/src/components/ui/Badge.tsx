import React from 'react';

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'emerald'
  | 'amber'
  | 'red'
  | 'gray'
  | 'blue'
  | 'purple'
  | 'yellow'
  | 'green';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  status?: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string; dot?: string }> = {
  APPROVED: {
    label: 'Đã duyệt',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  PENDING: {
    label: 'Chờ duyệt',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500 animate-pulse',
  },
  DRAFT: {
    label: 'Bản nháp',
    className: 'bg-slate-100 text-slate-700 border border-slate-200',
    dot: 'bg-slate-400',
  },
  REJECTED: {
    label: 'Từ chối',
    className: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
  HIDDEN: {
    label: 'Đã ẩn',
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
    dot: 'bg-gray-400',
  },
  REVISION_REQUIRED: {
    label: 'Yêu cầu sửa',
    className: 'bg-orange-50 text-orange-700 border border-orange-200',
    dot: 'bg-orange-500',
  },
};

const variantStyles: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
  emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border border-amber-200',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
  purple: 'bg-primary/10 text-primary border border-primary/20',
  gray: 'bg-surface-container text-on-surface-variant border border-surface-container-high',
};

export default function Badge({ children, variant = 'gray', status, className = '' }: BadgeProps) {
  if (status && statusConfig[status]) {
    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-badge text-[12px] font-bold shadow-2xs whitespace-nowrap ${config.className} ${className}`}
      >
        {config.dot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
        <span>{children || config.label}</span>
      </span>
    );
  }

  const styleClass = variantStyles[variant] || variantStyles.gray;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-badge text-[12px] font-bold shadow-2xs whitespace-nowrap ${styleClass} ${className}`}
    >
      {children || status}
    </span>
  );
}

export { Badge };
