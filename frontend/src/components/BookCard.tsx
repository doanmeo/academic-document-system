import type { DocumentSummary } from '../types'

interface BookCardProps {
  doc: DocumentSummary
  isSelected?: boolean
  onClick?: () => void
  onQuickView?: () => void
}

export const UTC_BOOK_THEMES = [
  {
    id: 'dsa',
    bg: 'bg-[#F9F7F2]',
    border: 'border-amber-200',
    headerLabel: 'CẤU TRÚC DỮ LIỆU',
    labelBg: 'bg-amber-100/60 text-amber-800',
    title: 'Graph Algorithms',
    subtitle: 'Giáo trình & Chuyên đề',
    tag1: 'Spring Boot',
    tag2: 'React 18',
    usefulRate: '98% hữu ích',
    graphic: (
      <svg className="w-14 h-10" fill="none" viewBox="0 0 100 70">
        <line stroke="#b08968" strokeWidth="1.5" x1="20" x2="50" y1="20" y2="10" />
        <line stroke="#b08968" strokeWidth="1.5" x1="20" x2="35" y1="20" y2="45" />
        <line stroke="#b08968" strokeWidth="1.5" x1="50" x2="80" y1="10" y2="25" />
        <line stroke="#b08968" strokeWidth="1.5" x1="35" x2="70" y1="45" y2="55" />
        <line stroke="#b08968" strokeWidth="1.5" x1="80" x2="70" y1="25" y2="55" />
        <circle cx="20" cy="20" fill="#e76f51" r="5" />
        <circle cx="50" cy="10" fill="#2a9d8f" r="4" />
        <circle cx="80" cy="25" fill="#457b9d" r="6" />
        <circle cx="35" cy="45" fill="#e9c46a" r="5" />
        <circle cx="70" cy="55" fill="#264653" r="5" />
      </svg>
    ),
  },
  {
    id: 'ai',
    bg: 'bg-[#F0F5FD]',
    border: 'border-blue-200',
    headerLabel: 'TRÍ TUỆ NHÂN TẠO',
    labelBg: 'bg-blue-100/60 text-blue-800',
    title: 'Deep Learning',
    subtitle: 'Chuyên đề Thị giác máy tính',
    tag1: 'PyTorch',
    tag2: 'Python',
    usefulRate: '92% hữu ích',
    graphic: (
      <div className="flex items-center gap-1.5 py-1">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <div className="w-4 h-0.5 bg-blue-300" />
        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
        <div className="w-4 h-0.5 bg-blue-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
      </div>
    ),
  },
  {
    id: 'distributed',
    bg: 'bg-[#1E293B]',
    border: 'border-slate-700',
    headerLabel: 'HỆ PHÂN TÁN',
    labelBg: 'bg-slate-700 text-slate-200',
    title: 'Edge Computing',
    subtitle: 'KLTN Xuất sắc K22',
    tag1: 'Golang',
    tag2: 'MQTT',
    usefulRate: '95% hữu ích',
    isDark: true,
    graphic: (
      <div className="w-12 h-6 rounded-md border border-slate-600 bg-slate-800/80 flex items-center justify-center text-[10px] font-mono text-cyan-300">
        [ EDGE ]
      </div>
    ),
  },
  {
    id: 'cloud',
    bg: 'bg-[#EBF7F8]',
    border: 'border-cyan-200',
    headerLabel: 'ĐIỆN TOÁN ĐÁM MÂY',
    labelBg: 'bg-cyan-100 text-cyan-800',
    title: 'Cloud Systems',
    subtitle: 'Kiến trúc K8s & Microservices',
    tag1: 'Spring Boot',
    tag2: 'MySQL',
    usefulRate: '96% hữu ích',
    graphic: (
      <div className="flex flex-col items-center">
        <svg className="w-8 h-6 text-cyan-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
        </svg>
      </div>
    ),
  },
  {
    id: 'kernel',
    bg: 'bg-[#18181B]',
    border: 'border-zinc-800',
    headerLabel: 'MÃ NGUỒN MỞ',
    labelBg: 'bg-zinc-800 text-zinc-300',
    title: 'Linux Kernel',
    subtitle: 'Core Architecture & C',
    tag1: 'C/C++',
    tag2: 'Kernel',
    usefulRate: '89% hữu ích',
    isDark: true,
    graphic: (
      <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    id: 'db',
    bg: 'bg-[#1D3557]',
    border: 'border-blue-900',
    headerLabel: 'CƠ SỞ DỮ LIỆU',
    labelBg: 'bg-blue-900/80 text-blue-200',
    title: 'Distributed DB',
    subtitle: 'Sharding & Replication',
    tag1: 'PostgreSQL',
    tag2: 'Redis',
    usefulRate: '94% hữu ích',
    isDark: true,
    graphic: (
      <div className="w-8 h-8 rounded-lg border border-cyan-400/60 flex items-center justify-center">
        <div className="w-4 h-4 bg-cyan-400 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'web',
    bg: 'bg-[#FAF5FF]',
    border: 'border-purple-200',
    headerLabel: 'LẬP TRÌNH WEB',
    labelBg: 'bg-purple-100 text-purple-800',
    title: 'Modern UI & Micro-FE',
    subtitle: 'Frontend Enterprise Design',
    tag1: 'Next.js',
    tag2: 'Tailwind CSS',
    usefulRate: '97% hữu ích',
    graphic: (
      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
        UI
      </div>
    ),
  },
  {
    id: 'devops',
    bg: 'bg-[#FEFCE8]',
    border: 'border-yellow-200',
    headerLabel: 'DEVOPS',
    labelBg: 'bg-yellow-100 text-yellow-800',
    title: 'DevOps Pipeline',
    subtitle: 'CI/CD Deployment & Cloud',
    tag1: 'Docker',
    tag2: 'GitLab-CI',
    usefulRate: '93% hữu ích',
    graphic: (
      <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function BookCard({ doc, isSelected, onClick, onQuickView }: BookCardProps) {
  const themeIndex = Math.abs(doc.id % UTC_BOOK_THEMES.length)
  const theme = UTC_BOOK_THEMES[themeIndex]

  return (
    <article
      onClick={onClick}
      className={`bg-white rounded-2xl p-3 transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
        isSelected
          ? 'border-2 border-blue-600 shadow-md ring-2 ring-blue-100'
          : 'border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Book Cover */}
        <div
          className={`w-full h-44 rounded-xl ${theme.bg} ${theme.border} border flex flex-col items-center justify-between p-3.5 relative overflow-hidden text-center shadow-inner`}
        >
          {/* Top Label */}
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${theme.labelBg}`}>
            {theme.headerLabel}
          </span>

          {/* Title and Subtitle */}
          <div className="my-auto py-1">
            <h3
              className={`text-sm sm:text-base font-extrabold leading-tight ${
                theme.isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {theme.title}
            </h3>
            <p className={`text-[10px] mt-0.5 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {theme.subtitle}
            </p>
          </div>

          {/* Graphic Icon */}
          <div className="mt-1">{theme.graphic}</div>
        </div>

        {/* Card Info Below Cover */}
        <div className="mt-3">
          <h4
            className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate group-hover:text-blue-700 transition-colors"
            title={doc.title}
          >
            {doc.title}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            Tác giả: <span className="text-slate-700 font-medium">{doc.uploaderName}</span>
          </p>
        </div>

        {/* Tech Stack Tags */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {theme.tag1}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {theme.tag2}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (onQuickView) {
              onQuickView()
            } else {
              onClick?.()
            }
          }}
          className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${
            isSelected ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-blue-700'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {isSelected ? 'Đang xem' : 'Xem trước'}
        </button>

        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
          <span>♥</span>
          {theme.usefulRate}
        </span>
      </div>
    </article>
  )
}
