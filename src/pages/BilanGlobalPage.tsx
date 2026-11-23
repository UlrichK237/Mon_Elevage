import React, { useMemo } from 'react';
import { AppData } from '../types/elevage';
import {
  calculerTotauxGlobaux,
  calculerToutesBandes,
} from '../utils/calculs';
import {
  formatFCFA,
  formatNombre,
  formatPourcent,
} from '../utils/format';
import { BarChartResultat } from '../components/BarChartResultat';

interface BilanGlobalPageProps {
  data: AppData;
  onOpenDetail: (bandeId: string) => void;
}

export function BilanGlobalPage({ data, onOpenDetail }: BilanGlobalPageProps) {
  const calculsList = useMemo(() => {
    const all = calculerToutesBandes(data);
    return all.sort((a, b) =>
      a.bande.dateArrivee.localeCompare(b.bande.dateArrivee)
    );
  }, [data]);

  const totaux = useMemo(
    () => calculerTotauxGlobaux(calculsList),
    [calculsList]
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-950">
          Tableau de bord global
        </h1>
        <p className="text-sm text-slate-600">
          Les totaux cumulés comptent uniquement les bandes clôturées.
        </p>
      </header>

      {calculsList.length === 0 ? (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 text-center">
          <p className="text-base text-slate-700">
            Ajoutez votre première bande pour voir vos résultats cumulés, vos marges et le graphique comparatif.
          </p>
        </section>
      ) : (
        <>
          {/* Totaux globaux (bandes clôturées uniquement) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              className={`rounded-2xl border p-4 ${
                totaux.nbBandesCloturees === 0
                  ? 'bg-white border-slate-200'
                  : totaux.totalResultat >= 0
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <p className="text-xs font-bold text-slate-700">
                {totaux.nbBandesCloturees === 0
                  ? 'RÉSULTAT CUMULÉ (CLÔTURÉES)'
                  : totaux.totalResultat >= 0
                  ? 'GAIN CUMULÉ (CLÔTURÉES)'
                  : 'PERTE CUMULÉE (CLÔTURÉES)'}
              </p>
              <p
                className={`text-2xl font-extrabold tabular-nums mt-1 ${
                  totaux.nbBandesCloturees === 0
                    ? 'text-slate-950'
                    : totaux.totalResultat >= 0
                    ? 'text-emerald-800'
                    : 'text-red-700'
                }`}
              >
                {totaux.nbBandesCloturees === 0
                  ? '-'
                  : formatFCFA(totaux.totalResultat)}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600">
                Chiffre d’affaires (clôturées)
              </p>
              <p className="text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                {totaux.nbBandesCloturees === 0
                  ? '-'
                  : formatFCFA(totaux.totalChiffreAffaires)}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600">
                Créances en cours (toutes bandes)
              </p>
              <p
                className={`text-2xl font-extrabold tabular-nums mt-1 ${
                  totaux.totalCreancesEnCoursToutesBandes > 0
                    ? 'text-amber-800'
                    : 'text-slate-950'
                }`}
              >
                {formatFCFA(totaux.totalCreancesEnCoursToutesBandes)}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600">
                Poulets vendus / reçus (clôturées)
              </p>
              <p className="text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                {totaux.nbBandesCloturees === 0
                  ? '-'
                  : `${formatNombre(totaux.totalPouletsVendus)} / ${formatNombre(
                      totaux.totalPouletsRecus
                    )}`}
              </p>
            </div>
          </section>

          {/* Graphique en barres (bandes clôturées) */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-950">
                Résultat des bandes clôturées (FCFA)
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                Vert : GAIN · Rouge : PERTE
              </p>
            </div>
            <BarChartResultat bandes={calculsList} />
          </section>

          {/* Tableau comparatif */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Comparatif des bandes
            </h2>
            <p className="text-xs text-slate-600">
              Touchez une bande pour ouvrir son détail complet.
            </p>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full min-w-[660px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-600">
                    <th className="py-3 pr-3">Bande</th>
                    <th className="py-3 px-3 text-right">
                      Résultat / Récupéré
                    </th>
                    <th className="py-3 px-3 text-right">Marge / poulet</th>
                    <th className="py-3 px-3 text-right">Mortalité</th>
                    <th className="py-3 px-3 text-right">Manquants</th>
                    <th className="py-3 pl-3 text-right">Aliment / poulet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {calculsList.map((c) => {
                    const isClosed = c.bande.statut === 'cloturee';
                    const isGain = c.resultat >= 0;
                    const recupDepasse =
                      c.depensesRecupereesRatio !== null &&
                      c.depensesRecupereesRatio > 1;

                    return (
                      <tr
                        key={c.bande.id}
                        onClick={() => onOpenDetail(c.bande.id)}
                        className="hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 pr-3">
                          <span className="font-bold text-slate-950 block">
                            {c.bande.nom}
                          </span>
                          <span className="text-xs text-slate-600">
                            {isClosed ? 'Clôturée' : 'En cours'} ·{' '}
                            {formatNombre(c.joursEcoules)} j
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-3 text-right font-extrabold tabular-nums whitespace-nowrap ${
                            isClosed
                              ? isGain
                                ? 'text-emerald-800'
                                : 'text-red-700'
                              : recupDepasse
                              ? 'text-emerald-800'
                              : 'text-amber-800'
                          }`}
                        >
                          {isClosed ? (
                            <>
                              {isGain ? 'GAIN ' : 'PERTE '}
                              {formatFCFA(c.resultat)}
                            </>
                          ) : (
                            <>
                              {formatPourcent(c.depensesRecupereesRatio, 0)}{' '}
                              récupérés
                            </>
                          )}
                        </td>
                        <td
                          className={`py-3.5 px-3 text-right font-bold tabular-nums whitespace-nowrap ${
                            !isClosed || c.margeMoyenneParPoulet === null
                              ? 'text-slate-600'
                              : c.margeMoyenneParPoulet >= 0
                              ? 'text-emerald-800'
                              : 'text-red-700'
                          }`}
                        >
                          {isClosed
                            ? formatFCFA(c.margeMoyenneParPoulet)
                            : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatPourcent(c.tauxMortalite)}
                        </td>
                        <td
                          className={`py-3.5 px-3 text-right font-bold tabular-nums whitespace-nowrap ${
                            c.manquants === null
                              ? 'text-slate-500'
                              : c.manquants > 0
                              ? 'text-red-700'
                              : 'text-emerald-800'
                          }`}
                        >
                          {c.manquants === null ? '-' : formatNombre(c.manquants)}
                        </td>
                        <td className="py-3.5 pl-3 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                          {c.kgAlimentParPouletRecu !== null
                            ? `${formatNombre(c.kgAlimentParPouletRecu, 2)} kg`
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
