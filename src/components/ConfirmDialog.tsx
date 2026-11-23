import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {danger && (
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3
              id="confirm-title"
              className="text-lg font-bold text-slate-950 leading-snug"
            >
              {title}
            </h3>
            <p className="text-base text-slate-700 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[48px] px-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-base hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[48px] px-4 rounded-xl font-semibold text-base text-white transition-colors ${
              danger
                ? 'bg-red-700 hover:bg-red-800 active:bg-red-900'
                : 'bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
