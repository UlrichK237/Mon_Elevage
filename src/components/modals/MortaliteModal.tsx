import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  CAUSES_MORTALITE_LABELS,
  CauseMortalite,
  Mortalite,
} from '../../types/elevage';
import { getTodayISO } from '../../utils/format';
import { BottomSheet } from '../BottomSheet';
import { DateInput, StepperInput } from '../FormInputs';

interface MortaliteModalProps {
  open: boolean;
  onClose: () => void;
  bandeNom: string;
  effectifVivantEstime: number;
  initial?: Mortalite | null;
  onSave: (data: Omit<Mortalite, 'id' | 'bandeId'>) => void;
}

const CAUSES: CauseMortalite[] = [
  'maladie',
  'chaleur',
  'accident',
  'predateur',
  'inconnue',
];

export function MortaliteModal({
  open,
  onClose,
  bandeNom,
  effectifVivantEstime,
  initial,
  onSave,
}: MortaliteModalProps) {
  const [nombre, setNombre] = useState(1);
  const [date, setDate] = useState(getTodayISO());
  const [cause, setCause] = useState<CauseMortalite | undefined>('inconnue');
  const [note, setNote] = useState('');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!open) return;
    setErreur('');
    if (initial) {
      setNombre(initial.nombre);
      setDate(initial.date);
      setCause(initial.cause);
      setNote(initial.note || '');
    } else {
      setNombre(1);
      setDate(getTodayISO());
      setCause('inconnue');
      setNote('');
    }
  }, [open, initial]);

  const maxDisponible = initial
    ? effectifVivantEstime + initial.nombre
    : effectifVivantEstime;
  const depasseEffectif = nombre > maxDisponible;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre <= 0) {
      setErreur('Indiquez au moins 1 poulet mort.');
      return;
    }
    onSave({
      date,
      nombre,
      cause,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier une mortalité' : 'Enregistrer des morts'}
      subtitle={bandeNom}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <StepperInput
          id="mort-nombre"
          label="Nombre de poulets morts"
          value={nombre}
          onChange={setNombre}
          min={1}
          step={1}
          unit="poulets"
        />

        {depasseEffectif && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-snug">
              Attention : ce nombre ({nombre}) dépasse l’effectif vivant estimé
              ({Math.max(0, maxDisponible)} poulets). Vous pouvez quand même enregistrer.
            </p>
          </div>
        )}

        <DateInput
          id="mort-date"
          label="Date"
          value={date}
          onChange={setDate}
        />

        <div>
          <span className="block text-base font-semibold text-slate-900 mb-2">
            Cause <span className="font-normal text-slate-500">(facultatif)</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CAUSES.map((c) => {
              const active = cause === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCause(active ? undefined : c)}
                  className={`min-h-[48px] px-3 rounded-xl border text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {CAUSES_MORTALITE_LABELS[c]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="mort-note"
            className="block text-base font-semibold text-slate-900 mb-1.5"
          >
            Note <span className="font-normal text-slate-500">(facultatif)</span>
          </label>
          <input
            id="mort-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex : étouffement la nuit"
            className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 bg-white text-base text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        {erreur && (
          <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            {erreur}
          </p>
        )}

        <button
          type="submit"
          className="w-full min-h-[52px] rounded-xl bg-red-700 text-white font-bold text-base hover:bg-red-800 active:bg-red-900 transition-colors"
        >
          {initial ? 'Enregistrer les modifications' : 'Enregistrer la mortalité'}
        </button>
      </form>
    </BottomSheet>
  );
}
