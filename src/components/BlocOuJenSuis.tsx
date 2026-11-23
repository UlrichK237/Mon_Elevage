import React from 'react';
import { CalculsBande } from '../utils/calculs';
import { formatFCFA, formatPourcent } from '../utils/format';

interface BlocOuJenSuisProps {
  calculs: CalculsBande;
}

export function BlocOuJenSuis({ calculs }: BlocOuJenSuisProps) {
  const ratio = calculs.depensesRecupereesRatio ?? 0;
  const pctClamp = Math.min(100, Math.max(0, Math.round(ratio * 100)));
  const depasse = calculs.encaisseTotal > calculs.depensesTotales;

  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-extrabold text-slate-950">
          Où j’en suis
        </h3>
        <span className="text-sm font-bold text-slate-700 tabular-nums">
          {calculs.depensesRecupereesRatio !== null
            ? `${formatPourcent(calculs.depensesRecupereesRatio, 0)} récupérés`
            : '-'}
        </span>
      </div>

      {/* a) Investissement de depart & Depenses totales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white border border-slate-200">
          <p className="text-xs font-semibold text-slate-600">
            Investissement de départ
          </p>
          <p className="text-lg font-extrabold text-slate-950 tabular-nums mt-0.5">
            {formatFCFA(calculs.coutAchatPoussins)}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white border border-slate-200">
          <p className="text-xs font-semibold text-slate-600">
            Dépenses totales
          </p>
          <p className="text-lg font-extrabold text-slate-950 tabular-nums mt-0.5">
            {formatFCFA(calculs.depensesTotales)}
          </p>
        </div>
      </div>

      {/* b) Barre de progression Depenses recuperees */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-800">
            Dépenses récupérées (encaissé)
          </span>
          <span className="font-bold text-slate-950 tabular-nums">
            {formatFCFA(calculs.encaisseTotal)}
          </span>
        </div>
        <div
          className="w-full h-3.5 rounded-full bg-slate-200 overflow-hidden"
          role="progressbar"
          aria-valuenow={pctClamp}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Pourcentage des dépenses récupérées"
        >
          <div
            className={`h-full rounded-full transition-all ${
              depasse ? 'bg-emerald-700' : 'bg-amber-600'
            }`}
            style={{ width: `${pctClamp}%` }}
          />
        </div>
      </div>

      {/* b/c) Message d'avancement (jamais rouge) */}
      {depasse ? (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
          <p className="text-base font-extrabold text-emerald-900">
            Vous avez commencé à gagner :{' '}
            <span className="tabular-nums">
              {formatFCFA(calculs.beneficeEnCours)}
            </span>
          </p>
          {calculs.creances > 0 && (
            <p className="text-sm font-medium text-emerald-900 tabular-nums">
              Vos clients vous doivent encore {formatFCFA(calculs.creances)}.
            </p>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
          <p className="text-sm font-bold leading-snug tabular-nums">
            Il vous reste {formatFCFA(calculs.resteARecuperer)} à récupérer avant
            de commencer à gagner.
          </p>
          {calculs.creances > 0 && (
            <p className="text-sm font-medium text-amber-900 tabular-nums">
              Vos clients vous doivent encore {formatFCFA(calculs.creances)}.
            </p>
          )}
        </div>
      )}

      {/* d) Prevision */}
      {calculs.prixReferencePrevision !== null &&
        calculs.resultatPrevisionnel !== null && (
          <div
            className={`p-3.5 rounded-xl border space-y-1 ${
              calculs.resultatPrevisionnel >= 0
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                Prévision en fin de bande
              </span>
            </div>
            {calculs.resultatPrevisionnel >= 0 ? (
              <p className="text-sm font-bold text-emerald-900 tabular-nums leading-snug">
                Si vous vendez le reste à environ{' '}
                {formatFCFA(calculs.prixReferencePrevision)} : bénéfice prévu{' '}
                {formatFCFA(calculs.resultatPrevisionnel)}
              </p>
            ) : (
              <p className="text-sm font-bold text-amber-900 tabular-nums leading-snug">
                Si vous vendez le reste à environ{' '}
                {formatFCFA(calculs.prixReferencePrevision)} : il manquerait{' '}
                {formatFCFA(Math.abs(calculs.resultatPrevisionnel))}
              </p>
            )}
          </div>
        )}
    </div>
  );
}

export function BlocResultatCloture({ calculs }: { calculs: CalculsBande }) {
  const isGain = calculs.resultat >= 0;

  return (
    <div className="space-y-4">
      <section
        className={`rounded-3xl border p-5 ${
          isGain
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <p
          className={`text-sm font-bold ${
            isGain ? 'text-emerald-900' : 'text-red-900'
          }`}
        >
          {isGain ? 'GAIN FINAL' : 'PERTE FINALE'}
        </p>
        <p
          className={`text-3xl sm:text-4xl font-extrabold tabular-nums mt-1 ${
            isGain ? 'text-emerald-800' : 'text-red-800'
          }`}
        >
          {formatFCFA(calculs.resultat)}
        </p>
        <p className="text-base font-medium text-slate-800 mt-2 leading-snug tabular-nums">
          {isGain
            ? `Cette bande s’est terminée avec un bénéfice de ${formatFCFA(
                calculs.resultat
              )}.`
            : `Cette bande s’est terminée avec une perte de ${formatFCFA(
                Math.abs(calculs.resultat)
              )}.`}
        </p>
        <p className="text-sm font-medium text-slate-700 mt-2 tabular-nums">
          Trésorerie (encaissé − dépenses) :{' '}
          <span className="font-bold">
            {formatFCFA(calculs.resultatTresorerie)}
          </span>
        </p>
      </section>

      {calculs.top3PostesDepenses.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="text-lg font-bold text-slate-950">
            Les 3 dépenses les plus lourdes
          </h2>
          <ol className="divide-y divide-slate-100">
            {calculs.top3PostesDepenses.map((poste, idx) => (
              <li
                key={poste.cle}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <span className="text-base font-semibold text-slate-900">
                  {idx + 1}. {poste.label}
                </span>
                <span className="text-base font-bold text-slate-950 tabular-nums shrink-0">
                  {formatFCFA(poste.montant)}{' '}
                  <span className="text-sm font-medium text-slate-600">
                    ({formatPourcent(poste.part, 0)})
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
