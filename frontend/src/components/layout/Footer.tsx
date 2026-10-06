import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-surface-container py-space-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-space-sm text-caption text-on-surface-variant font-caption">
        <div className="flex items-center gap-space-sm">
          <span className="font-headline-sm font-bold text-primary">Academic Docs FIT-UTC</span>
          <span>•</span>
          <span>Hệ thống Quản lý &amp; Tra cứu Học liệu Số</span>
        </div>
        <div className="flex items-center gap-space-md">
          <Link to="/" className="hover:text-primary transition-colors">Quy chế Đào tạo</Link>
          <Link to="/" className="hover:text-primary transition-colors">Hướng dẫn Nộp KLTN</Link>
          <Link to="/" className="hover:text-primary transition-colors">Liên hệ Bộ môn</Link>
        </div>
        <div className="font-label-code text-on-surface-variant text-[11px]">
          &copy; 2026 UTC Faculty of IT. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export { Footer };
