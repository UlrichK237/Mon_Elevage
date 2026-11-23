import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { UndoAction } from '../types/elevage';

interface UndoToastProps {
  action: UndoAction | null;
  onDismiss: () => void;
}

const UNDO_DURATION_MS = 8000;

export function UndoToast({ action, onDismiss }: UndoToastProps) {
  const [secondsLeft, setSecondsLeft] = useState(8);

  useEffect(() => {
    if (!action) return;
    setSecondsLeft(8);

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(1, prev - 1));
    }, 1000);

    const timeout = window.setTimeout(() => {
      onDismiss();
    }, UNDO_DURATION_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [action, onDismiss]);

  if (!action) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40"
      role="status"
      aria-live="polite"
    >
      <div className="bg-slate-950 text-white rounded-2xl px-4 py-3 shadow-xl border border-slate-800 flex items-center justify-between gap-3">
        <p className="text-sm font-medium leading-snug flex-1">
          {action.message}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              action.onUndo();
              onDismiss();
            }}
            className="min-h-[44px] px-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-1.5 hover:bg-amber-300 active:bg-amber-500 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Annuler ({secondsLeft}s)</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Fermer le message"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
