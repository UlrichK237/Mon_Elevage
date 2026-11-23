import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { TypeVente, Vente } from '../../types/elevage';
import { formatFCFA, getTodayISO } from '../../utils/format';
import { BottomSheet } from '../BottomSheet';
import { DateInput, MontantInput, StepperInput } from '../FormInputs';

interface VenteModalProps {
  open: boolean;
  onClose: () => void;
  bandeNom: string;
  effectifVivantEstime: number;
  initial?: Vente | null;
  onSave: (data: Omit<Vente, 'id' | 'bandeId'>) => void;
}

export function VenteModal({
  open,
  onClose,
  bandeNom,
  effectifVivantEstime,
  initial,
  onSave,
}: VenteModalProps) {
  const [type, setType] = useState<TypeVente>('detail');
  const [nombre, setNombre] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(3000);
  const [montantTotal, setMontantTotal] = useState(3000);
  const [montantModifieManuellement, setMontantModifieManuellement] = useState(false);
  const [montantEncaisse, setMontantEncaisse] = useState(3000);
  const [encaisseSuitTotal, setEncaisseSuitTotal] = useState(true);
  const [date, setDate] = useState(getTodayISO());
  const [client, setClient] = useState('');
  const [note, setNote] = useState('');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!open) return;
    setErreur('');
    if (initial) {
      setType(initial.type);
      setNombre(initial.nombre);
      setPrixUnitaire(initial.prixUnitaire);
      setMontantTotal(initial.montantTotal);
      setMontantModifieManuellement(
        initial.montantTotal !== initial.nombre * initial.prixUnitaire
      );
      setMontantEncaisse(initial.montantEncaisse);
      setEncaisseSuitTotal(initial.montantEncaisse === initial.montantTotal);
      setDate(initial.date);
      setClient(initial.client || '');
      setNote(initial.note || '');
    } else {
      setType('detail');
      setNombre(1);
      setPrixUnitaire(3000);
      setMontantTotal(3000);
      setMontantModifieManuellement(false);
      setMontantEncaisse(3000);
      setEncaisseSuitTotal(true);
      setDate(getTodayISO());
      setClient('');
      setNote('');
    }
  }, [open, initial]);

  const updateNombreOuPrix = (newNb: number, newPrix: number) => {
    setNombre(newNb);
    setPrixUnitaire(newPrix);
    if (!montantModifieManuellement) {
      const calc = newNb * newPrix;
      setMontantTotal(calc);
      if (encaisseSuitTotal) {
        setMontantEncaisse(calc);
      }
    }
  };

  const handleTypeChange = (newType: TypeVente) => {
    setType(newType);
    if (!initial && !montantModifieManuellement) {
      const defaultPrix = newType === 'gros' ? 2800 : 3200;
      const defaultNb = newType === 'gros' && nombre === 1 ? 20 : nombre;
      setPrixUnitaire(defaultPrix);
      setNombre(defaultNb);
      const calc = defaultNb * defaultPrix;
      setMontantTotal(calc);
      if (encaisseSuitTotal) {
        setMontantEncaisse(calc);
      }
    }
  };

  const maxDisponible = initial
    ? effectifVivantEstime + initial.nombre
    : effectifVivantEstime;
  const depasseEffectif = nombre > maxDisponible;
  const resteDu = Math.max(0, montantTotal - montantEncaisse);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre <= 0) {
      setErreur('Le nombre de poulets vendus doit être supérieur à zéro.');
      return;
    }
    if (montantTotal < 0 || montantEncaisse < 0) {
      setErreur('Les montants ne peuvent pas être négatifs.');
      return;
    }
    onSave({
      date,
      type,
      nombre,
      prixUnitaire,
      montantTotal,
      montantEncaisse,
      client: client.trim() || undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier la vente' : 'Nouvelle vente'}
      subtitle={bandeNom}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type gros / detail */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleTypeChange('detail')}
            className={`min-h-[48px] rounded-lg font-bold text-base transition-colors ${
              type === 'detail'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            Au détail
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('gros')}
            className={`min-h-[48px] rounded-lg font-bold text-base transition-colors ${
              type === 'gros'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            En gros
          </button>
        </div>

        <StepperInput
          id="vente-nombre"
          label="Nombre de poulets vendus"
          value={nombre}
          onChange={(val) => updateNombreOuPrix(val, prixUnitaire)}
          min={1}
          step={type === 'gros' ? 5 : 1}
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

        <MontantInput
          id="vente-pu"
          label="Prix d’un poulet"
          value={prixUnitaire}
          onChange={(val) => updateNombreOuPrix(nombre, val)}
          step={100}
        />

        <MontantInput
          id="vente-total"
          label="Montant total de la vente"
          value={montantTotal}
          onChange={(val) => {
            setMontantModifieManuellement(true);
            setMontantTotal(val);
            if (encaisseSuitTotal) {
              setMontantEncaisse(val);
            }
          }}
          step={500}
          helperText={`Calcul automatique : ${nombre} × ${formatFCFA(prixUnitaire)} = ${formatFCFA(
            nombre * prixUnitaire
          )}`}
        />

        <div>
          <MontantInput
            id="vente-encaisse"
            label="Montant payé aujourd’hui (encaissé)"
            value={montantEncaisse}
            onChange={(val) => {
              setEncaisseSuitTotal(false);
              setMontantEncaisse(val);
            }}
            step={500}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setEncaisseSuitTotal(true);
                setMontantEncaisse(montantTotal);
              }}
              className="min-h-[44px] px-3 rounded-lg border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Tout payé
            </button>
            <button
              type="button"
              onClick={() => {
                setEncaisseSuitTotal(false);
                setMontantEncaisse(0);
              }}
              className="min-h-[44px] px-3 rounded-lg border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Tout à crédit (0 FCFA)
            </button>
          </div>
          {resteDu > 0 && (
            <p className="mt-2 text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Reste à payer (crédit client) : {formatFCFA(resteDu)}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="vente-client"
            className="block text-base font-semibold text-slate-900 mb-1.5"
          >
            Nom du client{' '}
            <span className="font-normal text-slate-500">
              {resteDu > 0 ? '(conseillé pour le crédit)' : '(facultatif)'}
            </span>
          </label>
          <input
            id="vente-client"
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Ex : Maman Clarisse"
            className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 bg-white text-base text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <DateInput
          id="vente-date"
          label="Date de vente"
          value={date}
          onChange={setDate}
        />

        <div>
          <label
            htmlFor="vente-note"
            className="block text-base font-semibold text-slate-900 mb-1.5"
          >
            Note <span className="font-normal text-slate-500">(facultatif)</span>
          </label>
          <input
            id="vente-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex : paiement par Mobile Money prévu vendredi"
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
          className="w-full min-h-[52px] rounded-xl bg-emerald-800 text-white font-bold text-base hover:bg-emerald-900 active:bg-emerald-950 transition-colors"
        >
          {initial ? 'Enregistrer les modifications' : 'Enregistrer la vente'}
        </button>
      </form>
    </BottomSheet>
  );
}
