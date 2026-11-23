import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { ComptageControle } from '../../types/elevage';
import { formatDateFR, formatNombre } from '../../utils/format';
import { BottomSheet } from '../BottomSheet';
import { StepperInput } from '../FormInputs';

interface ComptageModalProps {
  open: boolean;
  onClose: () => void;
  bandeNom: string;
  dateISO: string;
  vivantsEstimesCeJour: number;
  avantArrivee: boolean;
  initial?: ComptageControle | null;
  onSave: (nombreCompte: number) => void;
  onDelete?: (comptage: ComptageControle) => void;
}

export function ComptageModal({
  open,
  onClose,
  bandeNom,
  dateISO,
  vivantsEstimesCeJour,
  avantArrivee,
  initial,
  onSave,
  onDelete,
}: ComptageModalProps) {
  const [nombreCompte, setNombreCompte] = useState(0);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setNombreCompte(initial.nombreCompte);
    } else {
      setNombreCompte(Math.max(0, vivantsEstimesCeJour));
    }
  }, [open, initial, vivantsEstimesCeJour]);

  const ecart = vivantsEstimesCeJour - nombreCompte;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(nombreCompte);
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Comptage de contrôle"
      subtitle={`${bandeNom} · ${formatDateFR(dateISO)}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
          <p className="text-sm font-medium text-slate-600">
            Vivants estimés à la fin du {formatDateFR(dateISO)} :
          </p>
          <p className="text-2xl font-extrabold text-slate-950 tabular-nums">
            {avantArrivee
              ? 'Avant l’arrivée de la bande'
              : `${formatNombre(vivantsEstimesCeJour)} poulets`}
          </p>
        </div>

        <StepperInput
          id="comptage-nombre"
          label="Nombre de poulets comptés dans le bâtiment"
          value={nombreCompte}
          onChange={setNombreCompte}
          min={0}
          step={1}
          unit="poulets"
        />

        {!avantArrivee && (
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
              ecart === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            {ecart === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-bold leading-snug tabular-nums">
              {ecart === 0
                ? 'Aucun écart : votre comptage correspond exactement à l’estimation.'
                : ecart > 0
                ? `Écart : ${formatNombre(ecart)} poulet${
                    ecart > 1 ? 's' : ''
                  } en moins par rapport à l’estimation.`
                : `Écart : ${formatNombre(Math.abs(ecart))} poulet${
                    Math.abs(ecart) > 1 ? 's' : ''
                  } en plus par rapport à l’estimation.`}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            className="flex-1 min-h-[52px] rounded-xl bg-emerald-800 text-white font-bold text-base hover:bg-emerald-900 active:bg-emerald-950 transition-colors"
          >
            Enregistrer le comptage
          </button>
          {initial && onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(initial);
                onClose();
              }}
              className="min-h-[52px] px-4 rounded-xl border border-red-300 bg-red-50 text-red-800 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </button>
          )}
        </div>
      </form>
    </BottomSheet>
  );
}
