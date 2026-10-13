import React from 'react'

interface DynamicBookCoverProps {
  title: string
  author?: string
  advisor?: string
  majorName?: string
  majorId?: number
  subjectName?: string
  documentTypeCode?: string
  documentTypeLabel?: string
  academicYearName?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'responsive'
}

interface MajorTheme {
  primary: string
  secondary: string
  accent: string
  gradientId: string
  code: string
  name: string
  patternColor: string
}

const MAJOR_THEMES: Record<string, MajorTheme> = {
  // CNPM - Công nghệ phần mềm: Xanh Navy / Blue
  CNPM: {
    primary: '#0B2847',
    secondary: '#1A4D80',
    accent: '#38BDF8',
    gradientId: 'grad-cnpm',
    code: 'CNPM',
    name: 'Công nghệ Phần mềm',
    patternColor: 'rgba(56, 189, 248, 0.12)',
  },
  // HTTT - Hệ thống thông tin: Ngọc bích / Emerald Green
  HTTT: {
    primary: '#064E3B',
    secondary: '#047857',
    accent: '#34D399',
    gradientId: 'grad-httt',
    code: 'HTTT',
    name: 'Hệ thống Thông tin',
    patternColor: 'rgba(52, 211, 153, 0.12)',
  },
  // KHMT - Khoa học máy tính: Tím / Royal Purple
  KHMT: {
    primary: '#4C1D95',
    secondary: '#6D28D9',
    accent: '#C084FC',
    gradientId: 'grad-khmt',
    code: 'KHMT',
    name: 'Khoa học Máy tính',
    patternColor: 'rgba(192, 132, 252, 0.12)',
  },
  // MMT - Mạng máy tính & TT: Cam / Amber
  MMT: {
    primary: '#7C2D12',
    secondary: '#C2410C',
    accent: '#FB923C',
    gradientId: 'grad-mmt',
    code: 'MMT',
    name: 'Mạng MT & Truyền thông',
    patternColor: 'rgba(251, 146, 60, 0.12)',
  },
}

const DEFAULT_THEME: MajorTheme = {
  primary: '#0F3A68',
  secondary: '#1E40AF',
  accent: '#60A5FA',
  gradientId: 'grad-default',
  code: 'FIT',
  name: 'Khoa Công nghệ Thông tin',
  patternColor: 'rgba(96, 165, 250, 0.12)',
}

export const getCategoryBadge = (
  code?: string,
  label?: string
): { tag: string; label: string; bg: string; text: string } => {
  const c = (code || '').toUpperCase()
  if (c === 'THESIS') {
    return { tag: '[KLTN]', label: 'Khóa luận tốt nghiệp', bg: 'bg-emerald-500/20 border-emerald-400', text: 'text-emerald-200' }
  }
  if (c === 'CAPSTONE' || c === 'PROJECT') {
    return { tag: '[BTL]', label: 'Bài tập lớn', bg: 'bg-blue-500/20 border-blue-400', text: 'text-blue-200' }
  }
  if (c === 'LECTURE') {
    return { tag: '[SLIDE]', label: 'Bài giảng & Slide', bg: 'bg-amber-500/20 border-amber-400', text: 'text-amber-200' }
  }
  if (c === 'EXAM') {
    return { tag: '[ĐỀ THI]', label: 'Đề thi & Lời giải', bg: 'bg-purple-500/20 border-purple-400', text: 'text-purple-200' }
  }
  if (c === 'EXERCISE') {
    return { tag: '[BÀI TẬP]', label: 'Bài tập & Thực hành', bg: 'bg-teal-500/20 border-teal-400', text: 'text-teal-200' }
  }
  if (c === 'LAB') {
    return { tag: '[LAB]', label: 'Hướng dẫn Lab', bg: 'bg-rose-500/20 border-rose-400', text: 'text-rose-200' }
  }
  return { tag: label ? `[${label}]` : '[TÀI LIỆU]', label: label || 'Học liệu', bg: 'bg-sky-500/20 border-sky-400', text: 'text-sky-200' }
}

export function detectMajorTheme(
  majorName?: string,
  majorId?: number,
  subjectName?: string,
  title?: string
): MajorTheme {
  const norm = (s?: string) => (s || '').toLowerCase()
  const subj = norm(subjectName)
  const tit = norm(title)
  const maj = norm(majorName)
  const subjectAndTitle = `${subj} ${tit}`

  // 1. Khoa học máy tính -> Tím (Purple)
  if (
    subjectAndTitle.includes('deep learning') ||
    subjectAndTitle.includes('học sâu') ||
    subjectAndTitle.includes('trí tuệ nhân tạo') ||
    subjectAndTitle.includes('ai') ||
    subjectAndTitle.includes('thị giác') ||
    subjectAndTitle.includes('thuật toán') ||
    subjectAndTitle.includes('đồ thị') ||
    subjectAndTitle.includes('graph') ||
    subjectAndTitle.includes('quy hoạch động') ||
    subjectAndTitle.includes('cấu trúc dữ liệu') ||
    maj.includes('khoa học máy tính') ||
    maj.includes('khmt') ||
    maj === 'cs' ||
    majorId === 3
  ) {
    return MAJOR_THEMES.KHMT
  }

  // 2. Mạng máy tính & Truyền thông -> Cam (Amber)
  if (
    subjectAndTitle.includes('mạng máy tính') ||
    subjectAndTitle.includes('an toàn thông tin') ||
    subjectAndTitle.includes('bảo mật') ||
    subjectAndTitle.includes('iot') ||
    subjectAndTitle.includes('network') ||
    subjectAndTitle.includes('k8s') ||
    subjectAndTitle.includes('kubernetes') ||
    subjectAndTitle.includes('docker') ||
    subjectAndTitle.includes('edge computing') ||
    maj.includes('mạng máy tính') ||
    maj.includes('truyền thông') ||
    maj.includes('mmt') ||
    maj === 'cn' ||
    majorId === 4
  ) {
    return MAJOR_THEMES.MMT
  }

  // 3. Hệ thống thông tin -> Xanh ngọc (Emerald Green)
  if (
    subjectAndTitle.includes('hệ thống thông tin') ||
    subjectAndTitle.includes('cơ sở dữ liệu') ||
    subjectAndTitle.includes('csdl') ||
    subjectAndTitle.includes('sql') ||
    subjectAndTitle.includes('blockchain') ||
    subjectAndTitle.includes('uml') ||
    maj.includes('hệ thống thông tin') ||
    maj.includes('httt') ||
    maj === 'is' ||
    majorId === 2
  ) {
    return MAJOR_THEMES.HTTT
  }

  // 4. Công nghệ phần mềm -> Xanh Navy (Blue)
  if (
    subjectAndTitle.includes('phần mềm') ||
    subjectAndTitle.includes('lập trình') ||
    subjectAndTitle.includes('web') ||
    subjectAndTitle.includes('react') ||
    subjectAndTitle.includes('spring') ||
    subjectAndTitle.includes('microservice') ||
    subjectAndTitle.includes('frontend') ||
    subjectAndTitle.includes('mã nguồn mở') ||
    maj.includes('phần mềm') ||
    maj.includes('cnpm') ||
    maj === 'se' ||
    majorId === 1
  ) {
    return MAJOR_THEMES.CNPM
  }

  return DEFAULT_THEME
}

export default function DynamicBookCover({
  title,
  author,
  advisor,
  majorName,
  majorId,
  subjectName,
  documentTypeCode,
  documentTypeLabel,
  academicYearName,
  className = '',
  size = 'responsive',
}: DynamicBookCoverProps) {
  const theme = detectMajorTheme(majorName, majorId, subjectName, title)
  const badge = getCategoryBadge(documentTypeCode, documentTypeLabel)

  // Truncate title for cover display if too long
  const displayTitle = title.length > 85 ? `${title.substring(0, 82)}...` : title

  return (
    <div
      className={`relative select-none overflow-hidden rounded-xl shadow-lg border border-white/10 transition-transform duration-300 group-hover:scale-[1.02] ${
        size === 'sm'
          ? 'w-[140px] aspect-[3/4.2]'
          : size === 'md'
          ? 'w-[200px] aspect-[3/4.2]'
          : size === 'lg'
          ? 'w-[280px] aspect-[3/4.2]'
          : 'w-full aspect-[3/4.2]'
      } ${className}`}
      style={{
        background: `linear-gradient(145deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
      }}
    >
      {/* SVG Background Geometry & Texture */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 300 420"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id={`pat-${theme.gradientId}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M0 24 L24 0 M0 0 L24 24"
              stroke={theme.accent}
              strokeWidth="0.75"
              strokeOpacity="0.18"
            />
          </pattern>
          <linearGradient id={`glow-${theme.gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.accent} stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="300" height="420" fill={`url(#pat-${theme.gradientId})`} />
        <circle cx="270" cy="50" r="140" fill={`url(#glow-${theme.gradientId})`} />
        <path
          d="M0 320 C100 280 180 380 300 330 L300 420 L0 420 Z"
          fill={theme.accent}
          fillOpacity="0.08"
        />
      </svg>

      {/* Book Spine (3D Shadow effect on left edge) */}
      <div className="absolute left-0 top-0 bottom-0 w-[14px] bg-gradient-to-r from-black/50 via-black/20 to-transparent z-10 border-r border-white/10" />

      {/* Cover Content Layout */}
      <div className="relative z-10 h-full p-4 pl-6 flex flex-col justify-between text-white">
        {/* Header Ribbon */}
        <div>
          <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-white/15">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
              <span className="font-mono text-[9px] tracking-wider uppercase opacity-90 truncate font-bold text-white/90">
                UTC • {theme.code}
              </span>
            </div>
            {academicYearName && (
              <span className="font-mono text-[9px] text-white/75 shrink-0">
                {academicYearName}
              </span>
            )}
          </div>

          {/* Prominent Category Badge */}
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border backdrop-blur-xs ${badge.bg} ${badge.text}`}
            >
              <span>{badge.tag}</span>
              <span className="text-[10px] font-sans font-medium opacity-90 hidden sm:inline">
                {badge.label}
              </span>
            </span>
          </div>
        </div>

        {/* Center: Title & Academic Topic */}
        <div className="my-auto py-2">
          <h2
            className="font-bold font-sans text-[13px] sm:text-[15px] leading-snug tracking-normal text-white line-clamp-4 drop-shadow-xs"
            title={title}
          >
            {displayTitle.normalize('NFC')}
          </h2>
          <div className="mt-2 w-8 h-[2px]" style={{ backgroundColor: theme.accent }} />
        </div>

        {/* Footer: Authors & Advisor */}
        <div className="pt-2 border-t border-white/15 text-[10px] space-y-0.5">
          {author && (
            <p className="text-white/95 font-medium truncate flex items-center gap-1 font-sans">
              <span className="text-white/60">SV:</span> {author.normalize('NFC')}
            </p>
          )}
          {advisor && (
            <p className="text-white/80 truncate text-[9.5px] flex items-center gap-1 font-sans">
              <span className="text-white/50">GV:</span> {advisor.normalize('NFC')}
            </p>
          )}
          <div className="pt-1 flex items-center justify-between text-[8.5px] text-white/60 font-mono">
            <span>FIT-UTC DIGITAL</span>
            <span style={{ color: theme.accent }}>★ 100% VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  )
}
