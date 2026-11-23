import React, { useEffect, useState } from 'react';
import {
  CATEGORIES_DEPENSE_LABELS,
  CategorieDepense,
  Depense,
} from '../../types/elevage';
import { formatFCFA, getTodayISO } from '../../utils/format';
import { BottomSheet } from '../BottomSheet';
import { DateInput, MontantInput, StepperInput } from '../FormInputs';

interface DepenseModalProps {
  open: boolean;
  onClose: () => void;
  bandeNom: string;
  defaultCategorie?: CategorieDepense;
  defaultDate?: string;
  initial?: Depense | null;
  onSave: (data: Omit<Depense, 'id' | 'bandeId'>) => void;
}

const CATEGORIES: CategorieDepense[] = [
  'aliment',
  'medicaments_vaccins',
  'chauffage',
  'eau_electricite',
  'main_oeuvre',
  'transport',
  'litiere',
  'desinfection',
  'autre',
];

export function DepenseModal({
  open,
  onClose,
  bandeNom,
  defaultCategorie = 'aliment',
  defaultDate,
  initial,
  onSave,
}: DepenseModalProps) {
  const [categorie, setCategorie] = useState<CategorieDepense>(defaultCategorie);
  const [nbSacs, setNbSacs] = useState(5);
  const [prixParSac, setPrixParSac] = useState(18000);
  const [montant, setMontant] = useState(90000);
  const [date, setDate] = useState(getTodayISO());
  const [note, setNote] = useState('');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!open) return;
    setErreur('');
    if (initial) {
      setCategorie(initial.categorie);
      setNbSacs(initial.nbSacs ?? 1);
      setPrixParSac(initial.prixParSac ?? 18000);
      setMontant(initial.montant);
      setDate(initial.date);
      setNote(initial.note || '');
    } else {
      setCategorie(defaultCategorie);
      setNbSacs(5);
      setPrixParSac(18000);
      setMontant(defaultCategorie === 'aliment' ? 5 * 18000 : 5000);
      setDate(defaultDate || getTodayISO());
      setNote('');
    }
  }, [open, initial, defaultCategorie, defaultDate]);

  const isAliment = categorie === 'aliment';
  const montantFinal = isAliment ? nbSacs * prixParSac : montant;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAliment && nbSacs <= 0) {
      setErreur('Indiquez au moins 1 sac d’aliment.');
      return;
    }
    if (montantFinal <= 0) {
      setErreur('Le montant doit être supérieur à zéro.');
      return;
    }
    onSave({
      date,
      categorie,
      montant: montantFinal,
      nbSacs: isAliment ? nbSacs : undefined,
      prixParSac: isAliment ? prixParSac : undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier la dépense' : 'Nouvelle dépense'}
      subtitle={bandeNom}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="dep-cat"
            className="block text-base font-semibold text-slate-900 mb-1.5"
          >
            Catégorie de dépense
          </label>
          <select
            id="dep-cat"
            value={categorie}
            onChange={(e) => {
              const next = e.target.value as CategorieDepense;
              setCategorie(next);
              if (next === 'aliment') {
                setMontant(nbSacs * prixParSac);
              }
            }}
            className="w-full min-h-[52px] px-3.5 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORIES_DEPENSE_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        {isAliment ? (
          <div className="space-y-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <StepperInput
              id="dep-sacs"
              label="Nombre de sacs (50 kg)"
              value={nbSacs}
              onChange={setNbSacs}
              min={1}
              step={1}
              unit="sacs"
            />
            <MontantInput
              id="dep-prix-sac"
              label="Prix d’un sac de 50 kg"
              value={prixParSac}
              onChange={setPrixParSac}
              step={500}
            />
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-700">
                Montant total aliment
              </span>
              <span className="text-xl font-bold text-slate-950 tabular-nums">
                {formatFCFA(montantFinal)}
              </span>
            </div>
          </div>
        ) : (
          <MontantInput
            id="dep-montant"
            label="Montant de la dépense"
            value={montant}
            onChange={setMontant}
            step={500}
          />
        )}

        <DateInput
          id="dep-date"
          label="Date"
          value={date}
          onChange={setDate}
        />

        <div>
          <label
            htmlFor="dep-note"
            className="block text-base font-semibold text-slate-900 mb-1.5"
          >
            Note <span className="font-normal text-slate-500">(facultatif)</span>
          </label>
          <input
            id="dep-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isAliment
                ? 'Ex : Aliment démarrage / croissance'
                : 'Ex : Vaccin Gumboro, transport moto...'
            }
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
          className="w-full min-h-[52px] rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 active:bg-slate-950 transition-colors"
        >
          {initial ? 'Enregistrer les modifications' : 'Enregistrer la dépense'}
        </button>
      </form>
    </BottomSheet>
  );
}
