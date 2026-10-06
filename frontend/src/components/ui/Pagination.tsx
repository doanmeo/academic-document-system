import React from 'react';

interface PaginationProps {
  page?: number;
  currentPage?: number;
  totalPages: number;
  onChange?: (page: number) => void;
  onPageChange?: (page: number) => void;
}

export default function Pagination({ page, currentPage, totalPages, onChange, onPageChange }: PaginationProps) {
  const activePage = page ?? currentPage ?? 0;
  const handleChange = (p: number) => {
    if (onChange) onChange(p);
    if (onPageChange) onPageChange(p);
  };
  const getPages = () => {
    let start = Math.max(0, activePage - 2);
    let end = Math.min(totalPages - 1, activePage + 2);
    
    if (end - start < 4) {
      if (start === 0) end = Math.min(totalPages - 1, 4);
      else if (end === totalPages - 1) start = Math.max(0, totalPages - 5);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-1.5 mt-4">
      <button
        disabled={activePage === 0}
        onClick={() => handleChange(activePage - 1)}
        className="px-3 py-1.5 border border-surface-container rounded-lg text-body-sm font-semibold text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Trước
      </button>
      {getPages().map((p) => (
        <button
          key={p}
          onClick={() => handleChange(p)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-body-sm transition-all font-semibold ${
            activePage === p
              ? 'bg-primary text-on-primary shadow-xs'
              : 'border border-surface-container text-on-surface hover:bg-surface-container'
          }`}
        >
          {p + 1}
        </button>
      ))}
      <button
        disabled={activePage === totalPages - 1}
        onClick={() => handleChange(activePage + 1)}
        className="px-3 py-1.5 border border-surface-container rounded-lg text-body-sm font-semibold text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Sau
      </button>
    </div>
  );
}
export { Pagination };
