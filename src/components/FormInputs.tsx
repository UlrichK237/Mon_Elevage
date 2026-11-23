import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatDateFR, parsePositiveInt } from '../utils/format';

interface StepperInputProps {
  id?: string;
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  step?: number;
  unit?: string;
  helperText?: string;
}

export function StepperInput({
  id,
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  unit,
  helperText,
}: StepperInputProps) {
  const decrement = () => {
    onChange(Math.max(min, value - step));
  };
  const increment = () => {
    onChange(value + step);
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-base font-semibold text-slate-900 mb-1.5"
      >
        {label}
      </label>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={decrement}
          aria-label={`Diminuer ${label}`}
          className="min-w-[52px] min-h-[52px] rounded-xl border border-slate-300 bg-slate-100 text-slate-900 flex items-center justify-center hover:bg-slate-200 active:bg-slate-300 transition-colors shrink-0"
        >
          <Minus className="w-6 h-6" />
        </button>

        <div className="relative flex-1">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value === 0 ? '' : String(value)}
            placeholder="0"
            onChange={(e) => {
              const parsed = parsePositiveInt(e.target.value);
              onChange(Math.max(min, parsed));
            }}
            className="w-full min-h-[52px] px-3 rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-950 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 pointer-events-none">
              {unit}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={increment}
          aria-label={`Augmenter ${label}`}
          className="min-w-[52px] min-h-[52px] rounded-xl border border-slate-300 bg-slate-100 text-slate-900 flex items-center justify-center hover:bg-slate-200 active:bg-slate-300 transition-colors shrink-0"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      {helperText && (
        <p className="text-sm text-slate-600 mt-1">{helperText}</p>
      )}
    </div>
  );
}

interface MontantInputProps {
  id?: string;
  label: string;
  value: number;
  onChange: (val: number) => void;
  helperText?: string;
  step?: number;
}

export function MontantInput({
  id,
  label,
  value,
  onChange,
  helperText,
  step = 500,
}: MontantInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-base font-semibold text-slate-900 mb-1.5"
      >
        {label}
      </label>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - step))}
          aria-label={`Diminuer ${label}`}
          className="min-w-[48px] min-h-[52px] rounded-xl border border-slate-300 bg-slate-100 text-slate-900 flex items-center justify-center hover:bg-slate-200 active:bg-slate-300 transition-colors shrink-0"
        >
          <Minus className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value === 0 ? '' : String(value)}
            placeholder="0"
            onChange={(e) => onChange(parsePositiveInt(e.target.value))}
            className="w-full min-h-[52px] pl-3 pr-14 rounded-xl border border-slate-300 bg-white text-right text-lg font-bold text-slate-950 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-600 pointer-events-none">
            FCFA
          </span>
        </div>
        <button
          type="button"
          onClick={() => onChange(value + step)}
          aria-label={`Augmenter ${label}`}
          className="min-w-[48px] min-h-[52px] rounded-xl border border-slate-300 bg-slate-100 text-slate-900 flex items-center justify-center hover:bg-slate-200 active:bg-slate-300 transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      {helperText && (
        <p className="text-sm text-slate-600 mt-1">{helperText}</p>
      )}
    </div>
  );
}

interface DateInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
}

export function DateInput({ id, label, value, onChange }: DateInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-base font-semibold text-slate-900 mb-1.5"
      >
        {label}{' '}
        <span className="font-normal text-slate-600 text-sm">
          ({formatDateFR(value)})
        </span>
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
        className="w-full min-h-[52px] px-3 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
      />
    </div>
  );
}
