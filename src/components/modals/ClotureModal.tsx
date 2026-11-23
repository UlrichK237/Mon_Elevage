import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CalculsBande } from '../../utils/calculs';
import { formatFCFA, formatNombre, getTodayISO } from '../../utils/format';
import { BottomSheet } from '../BottomSheet';
import { DateInput, StepperInput } from '../FormInputs';

interface ClotureModalProps {
  open: boolean;
  onClose: () => void;
  calculs: CalculsBande;
  onConfirmCloture: (payload: {
    dateCloture: string;
    nbCompteFinal: number;
    sacsRestantsFinal: number;
  }) => void;
}

export function ClotureModal({
  open,
  onClose,
  calculs,
  onConfirmCloture,
}: ClotureModalProps) {
  const [nbCompteFinal, setNbCompteFinal] = useState(0);
  const [sacsRestantsFinal, setSacsRestantsFinal] = useState(0);
  const [dateCloture, setDateCloture] = useState(getTodayISO());

  useEffect(() => {
    if (!open) return;
    setNbCompteFinal(Math.max(0, calculs.effectifVivantEstime));
    setSacsRestantsFinal(0);
    setDateCloture(getTodayISO());
  }, [open, calculs.effectifVivantEstime]);

  const manquants = calculs.effectifVivantEstime - nbCompteFinal;
  const sacsRestantsBornes = Math.min(sacsRestantsFinal, calculs.sacsAchetes);
  const valeurManquants =
    calculs.prixVenteMoyenGlobal !== null
      ? manquants * calculs.prixVenteMoyenGlobal
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCloture({
      dateCloture,
      nbCompteFinal,
      sacsRestantsFinal: sacsRestantsBornes,
    });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Clôturer la bande"
      subtitle={calculs.bande.nom}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
          <p className="text-sm font-medium text-slate-600">
            Poulets vivants estimés selon vos notes :
          </p>
          <p className="text-2xl font-extrabold text-slate-950 tabular-nums">
            {formatNombre(calculs.effectifVivantEstime)} poulets
          </p>
          <p className="text-xs text-slate-600">
            Reçus ({formatNombre(calculs.nbRecus)}) − Morts (
            {formatNombre(calculs.totalMorts)}) − Vendus (
            {formatNombre(calculs.totalVendus)}) − Sortis (
            {formatNombre(calculs.totalSortiesHorsVente)})
          </p>
        </div>

        <StepperInput
          id="cloture-compte"
          label="Poulets comptés réellement dans le poulailler"
          value={nbCompteFinal}
          onChange={setNbCompteFinal}
          min={0}
          step={1}
          unit="poulets"
          helperText="Mettez 0 si tous les poulets ont déjà été vendus ou sortis."
        />

        {/* Ecart en direct */}
        {manquants > 0 ? (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-bold text-red-900 tabular-nums">
                Écart : {formatNombre(manquants)} poulet
                {manquants > 1 ? 's' : ''} manquant{manquants > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-800 mt-0.5">
                Poulets disparus sans explication
                {valeurManquants !== null
                  ? ` (perte estimée : ${formatFCFA(valeurManquants)})`
                  : ''}
                .
              </p>
            </div>
          </div>
        ) : manquants === 0 ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
            <p className="text-base font-bold text-emerald-900">
              Aucun écart : le compte est exact !
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-amber-950">
              Il y a {formatNombre(Math.abs(manquants))} poulets en plus par
              rapport à l’estimation (vérifiez les chiffres si besoin).
            </p>
          </div>
        )}

        <StepperInput
          id="cloture-sacs"
          label="Sacs d’aliment (50 kg) restants non utilisés"
          value={sacsRestantsBornes}
          onChange={(val) =>
            setSacsRestantsFinal(Math.min(val, calculs.sacsAchetes))
          }
          min={0}
          step={1}
          unit="sacs"
          helperText={`Sur ${formatNombre(
            calculs.sacsAchetes
          )} sacs achetés. Les sacs restants ne sont pas comptés dans les charges de cette bande.`}
        />

        <DateInput
          id="cloture-date"
          label="Date de clôture"
          value={dateCloture}
          onChange={setDateCloture}
        />

        <button
          type="submit"
          className="w-full min-h-[52px] rounded-xl bg-emerald-800 text-white font-bold text-base hover:bg-emerald-900 active:bg-emerald-950 transition-colors"
        >
          Valider la clôture
        </button>
      </form>
    </BottomSheet>
  );
}
