import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, message, description, icon }: EmptyStateProps) {
  const displayTitle = title || message || 'Không có dữ liệu';
  const displayDesc = description;

  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs space-y-3">
      {icon ? (
        <div className="text-secondary mb-1">{icon}</div>
      ) : (
        <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary/60">
          <span className="material-symbols-outlined text-[32px]">inventory_2</span>
        </div>
      )}
      <h3 className="font-headline-sm font-bold text-primary">{displayTitle}</h3>
      {displayDesc && (
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          {displayDesc}
        </p>
      )}
    </div>
  );
}

export { EmptyState };
