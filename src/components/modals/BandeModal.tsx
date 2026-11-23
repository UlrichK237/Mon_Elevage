import React, { useEffect, useState } from 'react';
import { Bande } from '../../types/elevage';
import { getTodayISO } from '../../utils/format';
import { BottomSheet } from '../BottomSheet';
import { DateInput, MontantInput, StepperInput } from '../FormInputs';

interface BandeModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Bande | null;
  onSave: (data: Omit<Bande, 'id' | 'statut'>) => void;
}

export function BandeModal({ open, onClose, initial, onSave }: BandeModalProps) {
  const [nom, setNom] = useState('');
  const [dateArrivee, setDateArrivee] = useState(getTodayISO());
  const [dureePrevueJours, setDureePrevueJours] = useState(28);
  const [nbRecus, setNbRecus] = useState(500);
  const [coutAchatTotal, setCoutAchatTotal] = useState(275000);
  const [prixVentePrevu, setPrixVentePrevu] = useState(0);
  const [fournisseur, setFournisseur] = useState('');
  const [notes, setNotes] = useState('');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!open) return;
    setErreur('');
    if (initial) {
      setNom(initial.nom);
      setDateArrivee(initial.dateArrivee);
      setDureePrevueJours(initial.dureePrevueJours || 28);
      setNbRecus(initial.nbRecus);
      setCoutAchatTotal(initial.coutAchatTotal);
      setPrixVentePrevu(initial.prixVentePrevu || 0);
      setFournisseur(initial.fournisseur || '');
      setNotes(initial.notes || '');
    } else {
      const now = new Date();
      const mois = now.toLocaleDateString('fr-FR', { month: 'long' });
      setNom(`Bande ${mois}`);
      setDateArrivee(getTodayISO());
      setDureePrevueJours(28);
      setNbRecus(500);
      setCoutAchatTotal(275000);
      setPrixVentePrevu(3000);
      setFournisseur('');
      setNotes('');
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      setErreur('Donnez un nom à la bande.');
      return;
    }
    if (nbRecus <= 0) {
      setErreur('Le nombre de poussins reçus doit être supérieur à zéro.');
      return;
    }
    if (dureePrevueJours <= 0) {
      setErreur('La durée prévue doit être d’au moins 1 jour.');
      return;
    }
    onSave({
      nom: nom.trim(),
      dateArrivee,
      dureePrevueJours,
      nbRecus,
      coutAchatTotal,
      prixVentePrevu: prixVentePrevu > 0 ? prixVentePrevu : undefined,
      fournisseur: fournisseur.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier la bande' : 'Nouvelle bande'}
      subtitle="Notez l’arrivée des poussins dans le bâtiment"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="bande-nom"
            className="block text-base font-semibold text-slate-900 mb-1.5"
          >
            Nom de la bande
          </label>
          <input
            id="bande-nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex : Bande 12 - décembre"
            className="w-full min-h-[52px] px-3.5 rounded-xl border border-slate-300 bg-white text-base font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <DateInput
          id="bande-date"
          label="Date d’arrivée"
          value={dateArrivee}
          onChange={setDateArrivee}
        />

        <StepperInput
          id="bande-duree"
          label="Durée prévue d’élevage"
          value={dureePrevueJours}
          onChange={setDureePrevueJours}
          min={1}
          step={1}
          unit="jours"
          helperText="Par défaut 28 jours (4 semaines)."
        />

        <StepperInput
          id="bande-nb"
          label="Nombre de poussins reçus"
          value={nbRecus}
          onChange={setNbRecus}
          min={1}
          step={10}
          unit="poussins"
        />

        <MontantInput
          id="bande-cout"
          label="Coût d’achat total des poussins"
          value={coutAchatTotal}
          onChange={setCoutAchatTotal}
          step={5000}
        />

        <MontantInput
          id="bande-prix-prevu"
          label="Prix de vente prévu par poulet (facultatif)"
          value={prixVentePrevu}
          onChange={setPrixVentePrevu}
          step={100}
          helperText="Sert uniquement pour estimer vos futures ventes avant les premières ventes."
        />

        <div>
          <label
            htmlFor="bande-fournisseur"
            className="block text-base font-semibold text-slate-900 mb-1.5"
          >
            Fournisseur <span className="font-normal text-slate-500">(facultatif)</span>
          </label>
          <input
            id="bande-fournisseur"
            type="text"
            value={fournisseur}
            onChange={(e) => setFournisseur(e.target.value)}
            placeholder="Ex : Couvoir de Bafoussam"
            className="w-full min-h-[52px] px-3.5 rounded-xl border border-slate-300 bg-white text-base text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div>
          <label
            htmlFor="bande-notes"
            className="block text-base font-semibold text-slate-900 mb-1.5"
          >
            Notes <span className="font-normal text-slate-500">(facultatif)</span>
          </label>
          <textarea
            id="bande-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observations à l’arrivée..."
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-base text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
          {initial ? 'Enregistrer les modifications' : 'Créer la bande'}
        </button>
      </form>
    </BottomSheet>
  );
}
