import React from 'react';
import { DocumentSummary } from '../../types/document';

interface DocumentCardProps {
  doc: DocumentSummary;
  selected?: boolean;
  onClick?: () => void;
}

const GRADIENTS = [
  {
    bg: 'from-primary via-primary-container to-primary',
    tag: 'FIT.UTC.RESEARCH',
    icon: 'terminal',
    badgeBg: 'bg-primary-container/60 text-white',
  },
  {
    bg: 'from-primary-container via-primary to-secondary',
    tag: 'UTC.DB-LAB',
    icon: 'dataset',
    badgeBg: 'bg-secondary/20 text-secondary-fixed',
  },
  {
    bg: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
    tag: 'DISTRIBUTED-MESH',
    icon: 'hub',
    badgeBg: 'bg-slate-700 text-cyan-300',
  },
  {
    bg: 'from-primary via-primary-container to-secondary-container',
    tag: 'CURRICULUM-UTC',
    icon: 'local_library',
    badgeBg: 'bg-primary/50 text-white',
  },
  {
    bg: 'from-[#1e3a8a] via-[#172554] to-[#1e40af]',
    tag: 'SECURITY-LAB',
    icon: 'security',
    badgeBg: 'bg-blue-900/60 text-blue-200',
  },
];

export default function DocumentCard({ doc, selected, onClick }: DocumentCardProps) {
  const gradient = GRADIENTS[Math.abs(doc.id % GRADIENTS.length)];

  return (
    <div
      onClick={onClick}
      className={`doc-card group bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-all cursor-pointer relative flex flex-col justify-between border ${
        selected ? 'ring-2 ring-primary border-primary' : 'border-surface-container hover:border-outline-variant'
      }`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-space-sm">
          <span className="bg-surface-container text-primary font-label-code text-caption font-bold px-2 py-0.5 rounded">
            {doc.documentTypeLabel || 'KLTN'} • {doc.academicYearName || '2024'}
          </span>
          <span className="bg-secondary-container/40 text-on-secondary-container font-label-badge text-caption font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">star</span>
            <span>{doc.avgRating > 0 ? doc.avgRating.toFixed(1) : '5.0'} Xuất sắc</span>
          </span>
        </div>

        {/* Visual Academic Title Cover Graphic */}
        <div
          className={`bg-gradient-to-br ${gradient.bg} text-on-primary rounded-lg p-space-md mb-space-md relative overflow-hidden flex flex-col justify-between min-h-[140px] shadow-inner`}
        >
          {/* Subtle Background Watermark Icon */}
          <div className="absolute -right-4 -bottom-6 opacity-10 pointer-events-none select-none">
            <span className="material-symbols-outlined text-[130px]">{gradient.icon}</span>
          </div>

          <div className="flex items-center justify-between text-secondary-fixed font-label-code text-caption font-bold z-10">
            <span>{gradient.tag}</span>
            <span className="bg-primary/50 px-1.5 py-0.5 rounded text-on-primary text-[10px]">PDF HQ</span>
          </div>

          <h3
            className="font-headline-md text-headline-sm text-on-primary tracking-tight leading-snug line-clamp-2 z-10 mt-2 font-bold"
            title={doc.title}
          >
            {doc.title}
          </h3>

          <div className="flex items-center justify-between z-10 pt-2 text-surface-container-high font-label-code text-caption">
            <span>MS: {doc.subjectName ? doc.subjectName.split(' ')[0] : 'KLTN'}-{doc.id}</span>
            <span>{doc.academicYearName || '2024'}</span>
          </div>
        </div>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-1 mb-space-sm min-h-[26px]">
          {doc.technologies && doc.technologies.length > 0 ? (
            doc.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech.id}
                className="bg-surface-container-low text-primary font-label-code text-caption px-2 py-0.5 rounded font-medium"
              >
                {tech.name}
              </span>
            ))
          ) : (
            <>
              <span className="bg-surface-container-low text-primary font-label-code text-caption px-2 py-0.5 rounded font-medium">
                Spring Boot
              </span>
              <span className="bg-surface-container-low text-primary font-label-code text-caption px-2 py-0.5 rounded font-medium">
                React
              </span>
              <span className="bg-surface-container-low text-primary font-label-code text-caption px-2 py-0.5 rounded font-medium">
                MySQL
              </span>
            </>
          )}
        </div>

        {/* Author & Advisor Info */}
        <div className="flex flex-col gap-1 text-on-surface-variant font-body-sm text-body-sm mb-space-md">
          <div className="flex items-center gap-1.5 text-on-surface font-semibold">
            <span className="material-symbols-outlined text-secondary text-[16px]">person</span>
            <span className="truncate">{doc.uploaderName || 'Sinh viên CNTT UTC'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">school</span>
            <span className="truncate">
              GVHD: <strong className="text-primary font-medium">{doc.advisorName || 'Khoa CNTT - UTC'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer Metrics */}
      <div className="pt-space-xs bg-surface-container-low -mx-space-md -mb-space-md px-space-md py-space-xs rounded-b-xl flex items-center justify-between text-on-surface-variant font-caption text-caption border-t border-surface-container">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">visibility</span> {doc.viewCount || 0}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">download</span> {doc.downloadCount || 0}
          </span>
        </div>
        {selected ? (
          <span className="text-secondary font-label-code font-bold flex items-center gap-1">
            Đang chọn <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        ) : (
          <span className="text-primary font-label-code font-bold group-hover:text-secondary transition-colors">
            Xem chi tiết
          </span>
        )}
      </div>
    </div>
  );
}
