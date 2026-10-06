import React from 'react';
import { X } from 'lucide-react';

interface PdfViewerModalProps {
  url: string | null;
  title?: string;
  onClose: () => void;
}

export default function PdfViewerModal({ url, title, onClose }: PdfViewerModalProps) {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-gray-900 text-white">
        <h3 className="font-medium truncate max-w-xl">{title || 'PDF Viewer'}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-300 hover:text-white">
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 w-full bg-gray-100">
        <iframe src={url} className="w-full h-full border-0" title="PDF Viewer" />
      </div>
    </div>
  );
}
