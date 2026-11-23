import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Gift,
  Plus,
  ShoppingBag,
  Skull,
  Wallet,
} from 'lucide-react';
import {
  AppData,
  CATEGORIES_DEPENSE_LABELS,
  CAUSES_MORTALITE_LABELS,
  MOTIFS_SORTIE_LABELS,
} from '../types/elevage';
import { calculerBande, doitRappelerSauvegarde } from '../utils/calculs';
import {
  formatDateFR,
  formatFCFA,
  formatNombre,
  getTodayISO,
} from '../utils/format';

interface AccueilPageProps {
  data: AppData;
  selectedActiveBandeId: string | null;
  onSelectActiveBande: (id: string) => void;
  onOpenNewBande: () => void;
  onOpenMort: (bandeId: string) => void;
  onOpenVente: (bandeId: string) => void;
  onOpenDepense: (bandeId: string) => void;
  onOpenSortie: (bandeId: string) => void;
  onOpenDetail: (bandeId: string) => void;
  onOpenCloture: (bandeId: string) => void;
  onGoParametres: () => void;
  onLoadDemo: () => void;
}

export function AccueilPage({
  data,
  selectedActiveBandeId,
  onSelectActiveBande,
  onOpenNewBande,
  onOpenMort,
  onOpenVente,
  onOpenDepense,
  onOpenSortie,
  onOpenDetail,
  onOpenCloture,
  onGoParametres,
  onLoadDemo,
}: AccueilPageProps) {
  const todayISO = getTodayISO();
  const bandesEnCours = useMemo(
    () =>
      data.bandes
        .filter((b) => b.statut === 'en_cours')
        .sort((a, b) => b.dateArrivee.localeCompare(a.dateArrivee)),
    [data.bandes]
  );

  const bandeActive = useMemo(() => {
    if (bandesEnCours.length === 0) return null;
    return (
      bandesEnCours.find((b) => b.id === selectedActiveBandeId) ||
      bandesEnCours[0]
    );
  }, [bandesEnCours, selectedActiveBandeId]);

  const calculs = useMemo(() => {
    if (!bandeActive) return null;
    return calculerBande(
      bandeActive,
      data.mortalites,
      data.ventes,
      data.paiementsDette,
      data.sortiesHorsVente,
      data.depenses,
      todayISO
    );
  }, [bandeActive, data, todayISO]);

  const recentMovements = useMemo(() => {
    if (!bandeActive) return [];
    const items: Array<{
      id: string;
      date: string;
      titre: string;
      detail: string;
      valeur: string;
      tone: 'red' | 'green' | 'neutral';
    }> = [];

    data.ventes
      .filter((v) => v.bandeId === bandeActive.id)
      .forEach((v) => {
        items.push({
          id: v.id,
          date: v.date,
          titre: `Vente ${v.type === 'gros' ? 'en gros' : 'au détail'} (${formatNombre(
            v.nombre
          )} poulets)`,
          detail: v.client ? `Client : ${v.client}` : 'Vente directe',
          valeur: `+ ${formatFCFA(v.montantTotal)}`,
          tone: 'green',
        });
      });

    data.mortalites
      .filter((m) => m.bandeId === bandeActive.id)
      .forEach((m) => {
        items.push({
          id: m.id,
          date: m.date,
          titre: `Mortalité : ${formatNombre(m.nombre)} poulet${
            m.nombre > 1 ? 's' : ''
          }`,
          detail: m.cause ? CAUSES_MORTALITE_LABELS[m.cause] : 'Cause non précisée',
          valeur: `-${formatNombre(m.nombre)}`,
          tone: 'red',
        });
      });

    data.depenses
      .filter((d) => d.bandeId === bandeActive.id)
      .forEach((d) => {
        items.push({
          id: d.id,
          date: d.date,
          titre:
            d.categorie === 'aliment' && d.nbSacs
              ? `Aliment : ${formatNombre(d.nbSacs)} sac${d.nbSacs > 1 ? 's' : ''}`
              : CATEGORIES_DEPENSE_LABELS[d.categorie],
          detail: d.note || 'Dépense',
          valeur: `- ${formatFCFA(d.montant)}`,
          tone: 'neutral',
        });
      });

    data.sortiesHorsVente
      .filter((s) => s.bandeId === bandeActive.id)
      .forEach((s) => {
        items.push({
          id: s.id,
          date: s.date,
          titre: `${MOTIFS_SORTIE_LABELS[s.motif]} (${formatNombre(
            s.nombre
          )} poulet${s.nombre > 1 ? 's' : ''})`,
          detail: s.note || 'Sortie hors vente',
          valeur: `-${formatNombre(s.nombre)}`,
          tone: 'neutral',
        });
      });

    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [bandeActive, data]);

  const rappelSauvegarde = doitRappelerSauvegarde(data, todayISO);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Mon Élevage
          </h1>
          <p className="text-sm text-slate-600">
            Aujourd’hui · {formatDateFR(todayISO)}
          </p>
        </div>
        {bandesEnCours.length > 0 && (
          <button
            type="button"
            onClick={onOpenNewBande}
            className="min-h-[48px] px-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm flex items-center gap-1.5 hover:bg-slate-50 active:bg-slate-100 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle bande</span>
          </button>
        )}
      </header>

      {rappelSauvegarde && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-amber-950 leading-snug">
              Pensez à sauvegarder votre cahier (aucune copie depuis plus de 7 jours).
            </p>
          </div>
          <button
            type="button"
            onClick={onGoParametres}
            className="min-h-[44px] px-4 rounded-xl bg-amber-800 text-white font-bold text-sm hover:bg-amber-900 transition-colors shrink-0"
          >
            Sauvegarder
          </button>
        </div>
      )}

      {!calculs ? (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 text-center space-y-5 shadow-sm">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-950">
              Aucune bande en cours
            </h2>
            <p className="text-base text-slate-700">
              Créez une nouvelle bande à l’arrivée des poussins pour suivre chaque poulet, chaque sac d’aliment et vos bénéfices.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenNewBande}
              className="w-full sm:w-auto min-h-[54px] px-6 rounded-xl bg-emerald-800 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-emerald-900 active:bg-emerald-950 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle bande</span>
            </button>
            {data.bandes.length === 0 && (
              <button
                type="button"
                onClick={onLoadDemo}
                className="w-full sm:w-auto min-h-[54px] px-5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-base hover:bg-slate-50 transition-colors"
              >
                Charger des données d’exemple
              </button>
            )}
          </div>
        </section>
      ) : (
        <>
          {bandesEnCours.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {bandesEnCours.map((b) => {
                const active = b.id === calculs.bande.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectActiveBande(b.id)}
                    className={`min-h-[44px] px-4 rounded-xl border text-sm font-bold whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {b.nom}
                  </button>
                );
              })}
            </div>
          )}

          {/* Carte principale de la bande en cours */}
          <section className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">
                  {calculs.bande.nom}
                </h2>
                <p className="text-sm font-medium text-slate-600 mt-0.5">
                  Jour {formatNombre(calculs.joursEcoules)} · Arrivée le{' '}
                  {formatDateFR(calculs.bande.dateArrivee)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenDetail(calculs.bande.id)}
                className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold text-sm flex items-center gap-1 hover:bg-slate-100 shrink-0"
              >
                <span>Détails</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Grille double : Vivants estimés + Résultat provisoire */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-sm font-semibold text-slate-600">
                  Poulets vivants estimés
                </p>
                <p className="text-5xl font-extrabold text-slate-950 tabular-nums mt-1 leading-none">
                  {formatNombre(calculs.effectifVivantEstime)}
                </p>
                <p className="text-sm text-slate-700 mt-3 tabular-nums">
                  {formatNombre(calculs.nbRecus)} reçus ·{' '}
                  {formatNombre(calculs.totalMorts)} morts ·{' '}
                  {formatNombre(calculs.totalVendus)} vendus ·{' '}
                  {formatNombre(calculs.totalSortiesHorsVente)} sortis
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  calculs.resultat >= 0
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    calculs.resultat >= 0 ? 'text-emerald-900' : 'text-red-900'
                  }`}
                >
                  {calculs.resultat >= 0 ? 'GAIN provisoire' : 'PERTE provisoire'}
                </p>
                <p
                  className={`text-3xl sm:text-4xl font-extrabold tabular-nums mt-1 leading-tight ${
                    calculs.resultat >= 0 ? 'text-emerald-800' : 'text-red-800'
                  }`}
                >
                  {formatFCFA(calculs.resultat)}
                </p>
                <div className="mt-3 pt-2.5 border-t border-black/10 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-slate-700 font-medium">
                    Trésorerie (encaissé − charges) :
                  </span>
                  <span
                    className={`font-bold tabular-nums ${
                      calculs.resultatTresorerie >= 0
                        ? 'text-emerald-900'
                        : 'text-red-900'
                    }`}
                  >
                    {formatFCFA(calculs.resultatTresorerie)}
                  </span>
                </div>
              </div>
            </div>

            {calculs.prixMinimumCouvrirCharges !== null && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950">
                <p className="text-sm font-bold">
                  Prix minimum pour couvrir vos charges sur les{' '}
                  {formatNombre(calculs.effectifVivantEstime)} poulets restants :{' '}
                  <span className="text-base underline decoration-2 tabular-nums">
                    {formatFCFA(calculs.prixMinimumCouvrirCharges)} / poulet
                  </span>
                </p>
              </div>
            )}

            {/* 4 gros boutons de saisie */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenMort(calculs.bande.id)}
                className="min-h-[76px] p-3.5 rounded-2xl bg-red-700 text-white font-bold text-base flex flex-col items-center justify-center gap-1.5 hover:bg-red-800 active:bg-red-900 transition-colors shadow-sm"
              >
                <Skull className="w-6 h-6" />
                <span>+ Mort</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenVente(calculs.bande.id)}
                className="min-h-[76px] p-3.5 rounded-2xl bg-emerald-800 text-white font-bold text-base flex flex-col items-center justify-center gap-1.5 hover:bg-emerald-900 active:bg-emerald-950 transition-colors shadow-sm"
              >
                <ShoppingBag className="w-6 h-6" />
                <span>+ Vente</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenDepense(calculs.bande.id)}
                className="min-h-[76px] p-3.5 rounded-2xl bg-slate-900 text-white font-bold text-base flex flex-col items-center justify-center gap-1.5 hover:bg-slate-800 active:bg-slate-950 transition-colors shadow-sm"
              >
                <Wallet className="w-6 h-6" />
                <span>+ Dépense</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenSortie(calculs.bande.id)}
                className="min-h-[76px] p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-base flex flex-col items-center justify-center gap-1.5 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <Gift className="w-6 h-6" />
                <span>Don / conso</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-700 tabular-nums">
                Aliment acheté :{' '}
                <span className="font-bold text-slate-950">
                  {formatNombre(calculs.sacsAchetes)} sacs
                </span>{' '}
                ({formatNombre(calculs.kgConsommes)} kg)
              </div>
              <button
                type="button"
                onClick={() => onOpenCloture(calculs.bande.id)}
                className="min-h-[48px] px-4 rounded-xl border border-emerald-700 text-emerald-900 bg-emerald-50 font-bold text-sm flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Clôturer la bande</span>
              </button>
            </div>
          </section>

          {/* Derniers mouvements */}
          <section className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-950">
                Dernières saisies
              </h3>
              <button
                type="button"
                onClick={() => onOpenDetail(calculs.bande.id)}
                className="min-h-[44px] px-2 text-sm font-bold text-emerald-800 hover:underline"
              >
                Tout voir
              </button>
            </div>
            {recentMovements.length === 0 ? (
              <p className="text-sm text-slate-600 py-2">
                Aucune saisie enregistrée sur cette bande pour le moment. Utilisez les 4 boutons ci-dessus.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {recentMovements.map((m) => (
                  <li
                    key={m.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-950 truncate">
                        {m.titre}
                      </p>
                      <p className="text-sm text-slate-600 truncate">
                        {formatDateFR(m.date)} · {m.detail}
                      </p>
                    </div>
                    <span
                      className={`text-base font-bold tabular-nums shrink-0 ${
                        m.tone === 'green'
                          ? 'text-emerald-800'
                          : m.tone === 'red'
                          ? 'text-red-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {m.valeur}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
