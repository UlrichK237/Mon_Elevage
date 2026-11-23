import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-950/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        <div className="flex items-start justify-between gap-4 px-5 pt-3 pb-3 border-b border-slate-200 shrink-0">
          <div className="min-w-0">
            <h2
              id="sheet-title"
              className="text-xl font-bold text-slate-950 leading-tight"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="min-h-[48px] min-w-[48px] -mr-2 -mt-1 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 pb-safe">{children}</div>
      </div>
    </div>
  );
}
