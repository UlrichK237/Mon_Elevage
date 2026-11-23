import React, { useEffect, useState } from 'react';
import { DetailVenteDette } from '../../utils/calculs';
import { formatDateFR, formatFCFA, getTodayISO } from '../../utils/format';
import { BottomSheet } from '../BottomSheet';
import { DateInput, MontantInput } from '../FormInputs';

interface PaiementDetteModalProps {
  open: boolean;
  onClose: () => void;
  dette: DetailVenteDette | null;
  onSave: (payload: { venteId: string; date: string; montant: number; note?: string }) => void;
}

export function PaiementDetteModal({
  open,
  onClose,
  dette,
  onSave,
}: PaiementDetteModalProps) {
  const [montant, setMontant] = useState(0);
  const [date, setDate] = useState(getTodayISO());
  const [note, setNote] = useState('');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!open || !dette) return;
    setErreur('');
    setMontant(dette.resteDu);
    setDate(getTodayISO());
    setNote('');
  }, [open, dette]);

  if (!dette) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (montant <= 0) {
      setErreur('Le montant encaissé doit être supérieur à zéro.');
      return;
    }
    if (montant > dette.resteDu) {
      setErreur(
        `Le paiement ne peut pas dépasser le reste dû (${formatFCFA(dette.resteDu)}).`
      );
      return;
    }
    onSave({
      venteId: dette.vente.id,
      date,
      montant,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Enregistrer un paiement"
      subtitle={`${dette.vente.client?.trim() || 'Client non précisé'} · ${dette.bandeNom}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Vente du {formatDateFR(dette.vente.date)}</span>
            <span className="tabular-nums font-medium">
              Total : {formatFCFA(dette.vente.montantTotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Déjà payé</span>
            <span className="tabular-nums font-medium">
              {formatFCFA(dette.montantPaye)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-amber-900 pt-1 border-t border-slate-200">
            <span>Reste à payer</span>
            <span className="tabular-nums">{formatFCFA(dette.resteDu)}</span>
          </div>
        </div>

        <MontantInput
          id="paiement-montant"
          label="Montant reçu"
          value={montant}
          onChange={setMontant}
          step={1000}
        />

        <DateInput
          id="paiement-date"
          label="Date du paiement"
          value={date}
          onChange={setDate}
        />

        <div>
          <label
            htmlFor="paiement-note"
            className="block text-base font-semibold text-slate-900 mb-1.5"
          >
            Note <span className="font-normal text-slate-500">(facultatif)</span>
          </label>
          <input
            id="paiement-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex : Espèces, Orange Money, MTN MoMo..."
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
          Valider le paiement
        </button>
      </form>
    </BottomSheet>
  );
}
