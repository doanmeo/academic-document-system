import React from 'react';
import { DocumentSummary } from '../../types/document';
import DynamicBookCover from '../DynamicBookCover';

interface DocumentCardProps {
  doc: DocumentSummary;
  selected?: boolean;
  onClick?: () => void;
}

export default function DocumentCard({ doc, selected, onClick }: DocumentCardProps) {
  return (
    <div
      onClick={onClick}
      className={`doc-card group bg-surface-container-lowest rounded-xl p-space-md shadow-xs hover:shadow-md transition-all cursor-pointer relative flex flex-col justify-between border ${
        selected ? 'ring-2 ring-primary border-primary' : 'border-surface-container hover:border-outline-variant'
      }`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-space-sm">
          <span className="bg-surface-container text-primary font-label-code text-caption font-bold px-2 py-0.5 rounded truncate">
            {doc.documentTypeLabel || 'KLTN'} • {doc.academicYearName || '2025'}
          </span>
          <span className="bg-secondary-container/40 text-on-secondary-container font-label-badge text-caption font-bold px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined text-[14px]">star</span>
            <span>{doc.avgRating > 0 ? doc.avgRating.toFixed(1) : '5.0'}</span>
          </span>
        </div>

        {/* Dynamic Vector SVG Book Cover */}
        <div className="mb-space-md flex justify-center">
          <DynamicBookCover
            title={doc.title}
            author={doc.uploaderName}
            advisor={doc.advisorName}
            majorName={doc.majorName}
            majorId={doc.majorId}
            subjectName={doc.subjectName}
            documentTypeCode={doc.documentTypeCode}
            documentTypeLabel={doc.documentTypeLabel}
            academicYearName={doc.academicYearName}
            size="responsive"
            className="w-full max-h-[170px]"
          />
        </div>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-1 mb-space-sm min-h-[26px]">
          {doc.technologies && doc.technologies.length > 0 ? (
            doc.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech.id}
                className="bg-surface-container-low text-primary font-label-code text-caption px-2 py-0.5 rounded font-medium"
              >
                {tech.name}
              </span>
            ))
          ) : (
            <span className="bg-surface-container-low text-primary font-label-code text-caption px-2 py-0.5 rounded font-medium">
              {doc.subjectName ? doc.subjectName.split(' ')[0] : 'CNTT'}
            </span>
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
