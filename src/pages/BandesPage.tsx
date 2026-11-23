import React, { useMemo } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { AppData } from '../types/elevage';
import { calculerToutesBandes } from '../utils/calculs';
import {
  formatDateFR,
  formatFCFA,
  formatNombre,
  formatPourcent,
} from '../utils/format';

interface BandesPageProps {
  data: AppData;
  onOpenNewBande: () => void;
  onOpenDetail: (bandeId: string) => void;
}

export function BandesPage({
  data,
  onOpenNewBande,
  onOpenDetail,
}: BandesPageProps) {
  const calculsList = useMemo(() => {
    const all = calculerToutesBandes(data);
    return all.sort((a, b) => {
      if (a.bande.statut !== b.bande.statut) {
        return a.bande.statut === 'en_cours' ? -1 : 1;
      }
      return b.bande.dateArrivee.localeCompare(a.bande.dateArrivee);
    });
  }, [data]);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">
            Mes bandes
          </h1>
          <p className="text-sm text-slate-600">
            {formatNombre(calculsList.length)} bande
            {calculsList.length > 1 ? 's' : ''} enregistrée
            {calculsList.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewBande}
          className="min-h-[48px] px-4 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center gap-1.5 hover:bg-emerald-900 active:bg-emerald-950 transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle bande</span>
        </button>
      </header>

      {calculsList.length === 0 ? (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-4">
          <p className="text-base text-slate-700">
            Vous n’avez encore aucune bande enregistrée. Appuyez sur « Nouvelle bande » pour commencer.
          </p>
          <button
            type="button"
            onClick={onOpenNewBande}
            className="min-h-[52px] px-6 rounded-xl bg-emerald-800 text-white font-bold text-base inline-flex items-center gap-2 hover:bg-emerald-900"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle bande</span>
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calculsList.map((c) => {
            const isGain = c.resultat >= 0;
            const isClosed = c.bande.statut === 'cloturee';
            const recupDepasse =
              c.depensesRecupereesRatio !== null &&
              c.depensesRecupereesRatio > 1;

            return (
              <button
                key={c.bande.id}
                type="button"
                onClick={() => onOpenDetail(c.bande.id)}
                className="w-full text-left bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 active:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-extrabold text-slate-950 truncate">
                      {c.bande.nom}
                    </h2>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {isClosed ? 'Clôturée' : 'En cours'} ·{' '}
                      {formatNombre(c.joursEcoules)} jours · Arrivée{' '}
                      {formatDateFR(c.bande.dateArrivee)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    {isClosed ? (
                      <>
                        <p className="text-xs font-medium text-slate-500">
                          {isGain ? 'GAIN' : 'PERTE'}
                        </p>
                        <p
                          className={`text-lg font-extrabold tabular-nums ${
                            isGain ? 'text-emerald-800' : 'text-red-700'
                          }`}
                        >
                          {formatFCFA(c.resultat)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-slate-500">
                          Dépenses récupérées
                        </p>
                        <p
                          className={`text-lg font-extrabold tabular-nums ${
                            recupDepasse
                              ? 'text-emerald-800'
                              : 'text-amber-800'
                          }`}
                        >
                          {formatPourcent(c.depensesRecupereesRatio, 0)}
                        </p>
                      </>
                    )}
                  </div>

                  <div>
                    {isClosed ? (
                      <>
                        <p className="text-xs font-medium text-slate-500">
                          Manquants à la clôture
                        </p>
                        <p
                          className={`text-lg font-extrabold tabular-nums ${
                            c.manquants && c.manquants > 0
                              ? 'text-red-700'
                              : 'text-emerald-800'
                          }`}
                        >
                          {c.manquants === null
                            ? '-'
                            : `${formatNombre(c.manquants)} poulet${
                                Math.abs(c.manquants) > 1 ? 's' : ''
                              }`}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-slate-500">
                          Vivants estimés
                        </p>
                        <p className="text-lg font-extrabold text-slate-950 tabular-nums">
                          {formatNombre(c.effectifVivantEstime)} poulets
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 tabular-nums">
                  {formatNombre(c.nbRecus)} reçus · {formatNombre(c.totalVendus)}{' '}
                  vendus · {formatNombre(c.totalMorts)} morts
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
