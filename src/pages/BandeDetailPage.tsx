import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Lock,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  AppData,
  Bande,
  BandeDetailTab,
  CATEGORIES_DEPENSE_LABELS,
  CAUSES_MORTALITE_LABELS,
  ComptageControle,
  Depense,
  MOTIFS_SORTIE_LABELS,
  Mortalite,
  SortieHorsVente,
  Vente,
} from '../types/elevage';
import { calculerBande, calculerResteDuVente } from '../utils/calculs';
import {
  formatDateFR,
  formatFCFA,
  formatNombre,
  formatPourcent,
} from '../utils/format';
import { BlocOuJenSuis, BlocResultatCloture } from '../components/BlocOuJenSuis';
import { CalendrierBande } from '../components/CalendrierBande';

interface BandeDetailPageProps {
  bande: Bande;
  data: AppData;
  initialTab?: BandeDetailTab;
  onBack: () => void;
  onEditBande: (bande: Bande) => void;
  onOpenCloture: () => void;
  onReouvrirBande: () => void;
  onAddVente: (dateISO?: string) => void;
  onEditVente: (v: Vente) => void;
  onDeleteVente: (v: Vente) => void;
  onAddMort: (dateISO?: string) => void;
  onEditMort: (m: Mortalite) => void;
  onDeleteMort: (m: Mortalite) => void;
  onAddDepense: (isAliment?: boolean, dateISO?: string) => void;
  onEditDepense: (d: Depense) => void;
  onDeleteDepense: (d: Depense) => void;
  onAddSortie: (dateISO?: string) => void;
  onEditSortie: (s: SortieHorsVente) => void;
  onDeleteSortie: (s: SortieHorsVente) => void;
  onOpenComptage: (
    dateISO: string,
    vivantsEstimesFinJour: number,
    avantArrivee: boolean,
    existing: ComptageControle | null
  ) => void;
}

export function BandeDetailPage({
  bande,
  data,
  initialTab = 'resume',
  onBack,
  onEditBande,
  onOpenCloture,
  onReouvrirBande,
  onAddVente,
  onEditVente,
  onDeleteVente,
  onAddMort,
  onEditMort,
  onDeleteMort,
  onAddDepense,
  onEditDepense,
  onDeleteDepense,
  onAddSortie,
  onEditSortie,
  onDeleteSortie,
  onOpenComptage,
}: BandeDetailPageProps) {
  const [tab, setTab] = useState<BandeDetailTab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, bande.id]);

  const calculs = useMemo(
    () =>
      calculerBande(
        bande,
        data.mortalites,
        data.ventes,
        data.paiementsDette,
        data.sortiesHorsVente,
        data.depenses
      ),
    [bande, data]
  );

  const isClosed = bande.statut === 'cloturee';

  const ventes = useMemo(
    () =>
      data.ventes
        .filter((v) => v.bandeId === bande.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.ventes, bande.id]
  );

  const mortalites = useMemo(
    () =>
      data.mortalites
        .filter((m) => m.bandeId === bande.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.mortalites, bande.id]
  );

  const depensesAutres = useMemo(
    () =>
      data.depenses
        .filter((d) => d.bandeId === bande.id && d.categorie !== 'aliment')
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.depenses, bande.id]
  );

  const depensesToutes = useMemo(
    () =>
      data.depenses
        .filter((d) => d.bandeId === bande.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.depenses, bande.id]
  );

  const depensesAliment = useMemo(
    () =>
      data.depenses
        .filter((d) => d.bandeId === bande.id && d.categorie === 'aliment')
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.depenses, bande.id]
  );

  const sorties = useMemo(
    () =>
      data.sortiesHorsVente
        .filter((s) => s.bandeId === bande.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.sortiesHorsVente, bande.id]
  );

  const tabs: Array<{ id: BandeDetailTab; label: string }> = [
    { id: 'resume', label: 'Résumé' },
    { id: 'calendrier', label: 'Calendrier' },
    { id: 'ventes', label: `Ventes (${ventes.length})` },
    { id: 'mortalite', label: `Mortalité (${mortalites.length})` },
    { id: 'depenses', label: `Dépenses (${depensesToutes.length})` },
    { id: 'aliment', label: `Aliment (${depensesAliment.length})` },
  ];

  return (
    <div className="space-y-4">
      {/* En-tete */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[48px] px-3 -ml-2 rounded-xl text-slate-900 font-bold text-base flex items-center gap-1.5 hover:bg-slate-200/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Bandes</span>
        </button>

        <div className="flex items-center gap-2">
          {!isClosed && (
            <button
              type="button"
              onClick={() => onEditBande(bande)}
              className="min-h-[48px] px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm flex items-center gap-1.5 hover:bg-slate-50"
            >
              <Edit3 className="w-4 h-4" />
              <span>Modifier</span>
            </button>
          )}
          {isClosed ? (
            <button
              type="button"
              onClick={onReouvrirBande}
              className="min-h-[48px] px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm flex items-center gap-1.5 hover:bg-slate-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rouvrir</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCloture}
              className="min-h-[48px] px-3.5 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center gap-1.5 hover:bg-emerald-900"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Clôturer</span>
            </button>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-950">{bande.nom}</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          {isClosed ? 'Clôturée' : 'En cours'} · {formatNombre(calculs.joursEcoules)}{' '}
          jours · Arrivée {formatDateFR(bande.dateArrivee)}
          {bande.dateCloture ? ` · Clôture ${formatDateFR(bande.dateCloture)}` : ''}
          {bande.fournisseur ? ` · ${bande.fournisseur}` : ''}
        </p>
      </div>

      {isClosed && (
        <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-300 flex items-center gap-2.5 text-slate-900">
          <Lock className="w-5 h-5 text-slate-700 shrink-0" />
          <p className="text-sm font-medium">
            Cette bande est clôturée (lecture seule). Appuyez sur « Rouvrir » si vous devez modifier une saisie.
          </p>
        </div>
      )}

      {/* Onglets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`min-h-[48px] px-4 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ONGLET RESUME */}
      {tab === 'resume' && (
        <div className="space-y-4">
          {isClosed ? (
            <BlocResultatCloture calculs={calculs} />
          ) : (
            <BlocOuJenSuis calculs={calculs} />
          )}

          {!isClosed && calculs.prixMinimumCouvrirDepenses !== null && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
              <p className="text-sm font-bold">
                Prix minimum pour couvrir vos dépenses sur les{' '}
                {formatNombre(calculs.effectifVivantEstime)} poulets restants :{' '}
                <span className="tabular-nums underline">
                  {formatFCFA(calculs.prixMinimumCouvrirDepenses)} / poulet
                </span>
              </p>
            </div>
          )}

          {/* Effectifs et manquants */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-lg font-bold text-slate-950">
              Suivi des poulets
            </h2>
            <dl className="divide-y divide-slate-100 text-base">
              <LigneStat label="Poussins reçus" valeur={formatNombre(calculs.nbRecus)} />
              <LigneStat
                label="Morts"
                valeur={`${formatNombre(calculs.totalMorts)} (${formatPourcent(
                  calculs.tauxMortalite
                )})`}
              />
              <LigneStat label="Vendus" valeur={formatNombre(calculs.totalVendus)} />
              <LigneStat
                label="Sorties hors vente (dons / conso)"
                valeur={formatNombre(calculs.totalSortiesHorsVente)}
              />
              <LigneStat
                label="Effectif vivant estimé"
                valeur={formatNombre(calculs.effectifVivantEstime)}
                gras
              />
              {isClosed && calculs.manquants !== null && (
                <>
                  <LigneStat
                    label="Comptés à la clôture"
                    valeur={formatNombre(bande.nbCompteFinal)}
                  />
                  <LigneStat
                    label="Manquants (écart)"
                    valeur={`${formatNombre(calculs.manquants)} poulet${
                      Math.abs(calculs.manquants) > 1 ? 's' : ''
                    }`}
                    tone={calculs.manquants > 0 ? 'red' : 'green'}
                    gras
                  />
                  {calculs.manquants > 0 && (
                    <LigneStat
                      label="Valeur estimée de la perte"
                      valeur={formatFCFA(calculs.valeurPerteManquants)}
                      tone="red"
                    />
                  )}
                </>
              )}
            </dl>
          </section>

          {/* Chiffre d'affaires & Prix unitaires */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-lg font-bold text-slate-950">
              Ventes et prix moyens
            </h2>
            <dl className="divide-y divide-slate-100 text-base">
              <LigneStat
                label="Chiffre d’affaires"
                valeur={formatFCFA(calculs.chiffreAffaires)}
                gras
              />
              <LigneStat
                label="Montant encaissé"
                valeur={formatFCFA(calculs.encaisseTotal)}
              />
              <LigneStat
                label="Créances clients (reste dû)"
                valeur={formatFCFA(calculs.creances)}
                tone={calculs.creances > 0 ? 'amber' : 'neutral'}
              />
              <LigneStat
                label="Prix de revient par poulet vendu"
                valeur={formatFCFA(calculs.prixRevientParPouletVendu)}
              />
              <LigneStat
                label="Prix de vente moyen global"
                valeur={formatFCFA(calculs.prixVenteMoyenGlobal)}
              />
              {isClosed && (
                <LigneStat
                  label="Marge moyenne par poulet"
                  valeur={formatFCFA(calculs.margeMoyenneParPoulet)}
                  tone={
                    calculs.margeMoyenneParPoulet !== null
                      ? calculs.margeMoyenneParPoulet >= 0
                        ? 'green'
                        : 'red'
                      : 'neutral'
                  }
                  gras
                />
              )}
            </dl>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600">Ventes en gros</p>
                <p className="text-base font-bold text-slate-950 tabular-nums mt-1">
                  {formatNombre(calculs.repartitionGros.nombre)} poulets ·{' '}
                  {formatFCFA(calculs.repartitionGros.chiffreAffaires)}
                </p>
                <p className="text-sm text-slate-600 tabular-nums">
                  Prix moyen : {formatFCFA(calculs.repartitionGros.prixMoyen)}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600">Ventes au détail</p>
                <p className="text-base font-bold text-slate-950 tabular-nums mt-1">
                  {formatNombre(calculs.repartitionDetail.nombre)} poulets ·{' '}
                  {formatFCFA(calculs.repartitionDetail.chiffreAffaires)}
                </p>
                <p className="text-sm text-slate-600 tabular-nums">
                  Prix moyen : {formatFCFA(calculs.repartitionDetail.prixMoyen)}
                </p>
              </div>
            </div>
          </section>

          {/* Depenses totales & Aliment */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-lg font-bold text-slate-950">
              Dépenses et aliment
            </h2>
            <dl className="divide-y divide-slate-100 text-base">
              <LigneStat
                label="Achat des poussins"
                valeur={formatFCFA(calculs.coutAchatPoussins)}
              />
              <LigneStat
                label="Coût aliment consommé"
                valeur={formatFCFA(calculs.coutAlimentConsomme)}
              />
              <LigneStat
                label="Dépenses hors aliment"
                valeur={formatFCFA(calculs.depensesHorsAliment)}
              />
              <LigneStat
                label="Dépenses totales"
                valeur={formatFCFA(calculs.depensesTotales)}
                gras
              />
              <LigneStat
                label="Part de l’aliment dans les dépenses"
                valeur={formatPourcent(calculs.partAlimentDansDepenses)}
              />
              <LigneStat
                label="Sacs consommés / achetés"
                valeur={`${formatNombre(calculs.sacsConsommes)} / ${formatNombre(
                  calculs.sacsAchetes
                )} sacs (${formatNombre(calculs.kgConsommes)} kg)`}
              />
              <LigneStat
                label="Aliment par poulet reçu"
                valeur={
                  calculs.kgAlimentParPouletRecu !== null
                    ? `${formatNombre(calculs.kgAlimentParPouletRecu, 2)} kg`
                    : '-'
                }
              />
            </dl>
          </section>

          {/* Sorties hors vente (dons / conso) */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-950">
                Dons et consommation ({sorties.length})
              </h2>
              {!isClosed && (
                <button
                  type="button"
                  onClick={() => onAddSortie()}
                  className="min-h-[44px] px-3 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-1 hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              )}
            </div>
            {sorties.length === 0 ? (
              <p className="text-sm text-slate-600">
                Aucun don ni prélèvement pour la maison enregistré sur cette bande.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {sorties.map((s) => (
                  <li
                    key={s.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-base font-bold text-slate-950">
                        {formatNombre(s.nombre)} poulet{s.nombre > 1 ? 's' : ''} ·{' '}
                        {MOTIFS_SORTIE_LABELS[s.motif]}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatDateFR(s.date)}
                        {s.note ? ` · ${s.note}` : ''}
                      </p>
                    </div>
                    {!isClosed && (
                      <RowActions
                        onEdit={() => onEditSortie(s)}
                        onDelete={() => onDeleteSortie(s)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {bande.notes && (
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-base font-bold text-slate-950 mb-1">Notes</h2>
              <p className="text-base text-slate-700">{bande.notes}</p>
            </section>
          )}
        </div>
      )}

      {/* ONGLET CALENDRIER */}
      {tab === 'calendrier' && (
        <CalendrierBande
          bande={bande}
          calculs={calculs}
          data={data}
          onAddMortDate={(dateISO) => onAddMort(dateISO)}
          onEditMort={onEditMort}
          onDeleteMort={onDeleteMort}
          onAddVenteDate={(dateISO) => onAddVente(dateISO)}
          onEditVente={onEditVente}
          onDeleteVente={onDeleteVente}
          onAddDepenseDate={(dateISO) => onAddDepense(false, dateISO)}
          onEditDepense={onEditDepense}
          onDeleteDepense={onDeleteDepense}
          onAddSortieDate={(dateISO) => onAddSortie(dateISO)}
          onEditSortie={onEditSortie}
          onDeleteSortie={onDeleteSortie}
          onOpenComptage={onOpenComptage}
        />
      )}

      {/* ONGLET VENTES */}
      {tab === 'ventes' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-950">
              Liste des ventes
            </h2>
            {!isClosed && (
              <button
                type="button"
                onClick={() => onAddVente()}
                className="min-h-[48px] px-4 rounded-xl bg-emerald-800 text-white text-sm font-bold flex items-center gap-1.5 hover:bg-emerald-900"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une vente</span>
              </button>
            )}
          </div>
          {ventes.length === 0 ? (
            <p className="text-base text-slate-600 py-3">
              Aucune vente enregistrée pour cette bande. Appuyez sur « Ajouter une vente » dès que vous vendez des poulets.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {ventes.map((v) => {
                const { resteDu } = calculerResteDuVente(v, data.paiementsDette);
                return (
                  <li key={v.id} className="py-3.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-950 tabular-nums">
                          {formatNombre(v.nombre)} poulets (
                          {v.type === 'gros' ? 'Gros' : 'Détail'}) ·{' '}
                          {formatFCFA(v.montantTotal)}
                        </p>
                        <p className="text-sm text-slate-600 tabular-nums">
                          {formatDateFR(v.date)} · {formatFCFA(v.prixUnitaire)} / poulet
                          {v.client ? ` · ${v.client}` : ''}
                        </p>
                        {resteDu > 0 && (
                          <p className="text-sm font-bold text-amber-800 mt-0.5 tabular-nums">
                            Reste à payer : {formatFCFA(resteDu)}
                          </p>
                        )}
                        {v.note && (
                          <p className="text-sm text-slate-600 mt-0.5">{v.note}</p>
                        )}
                      </div>
                      {!isClosed && (
                        <RowActions
                          onEdit={() => onEditVente(v)}
                          onDelete={() => onDeleteVente(v)}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* ONGLET MORTALITE */}
      {tab === 'mortalite' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-950">
              Mortalités ({formatNombre(calculs.totalMorts)} au total)
            </h2>
            {!isClosed && (
              <button
                type="button"
                onClick={() => onAddMort()}
                className="min-h-[48px] px-4 rounded-xl bg-red-700 text-white text-sm font-bold flex items-center gap-1.5 hover:bg-red-800"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            )}
          </div>
          {mortalites.length === 0 ? (
            <p className="text-base text-slate-600 py-3">
              Aucune mortalité enregistrée sur cette bande.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {mortalites.map((m) => (
                <li
                  key={m.id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-950 tabular-nums">
                      {formatNombre(m.nombre)} mort{m.nombre > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-slate-600">
                      {formatDateFR(m.date)} ·{' '}
                      {m.cause ? CAUSES_MORTALITE_LABELS[m.cause] : 'Cause non précisée'}
                      {m.note ? ` · ${m.note}` : ''}
                    </p>
                  </div>
                  {!isClosed && (
                    <RowActions
                      onEdit={() => onEditMort(m)}
                      onDelete={() => onDeleteMort(m)}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ONGLET DEPENSES */}
      {tab === 'depenses' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Toutes les dépenses
              </h2>
              <p className="text-sm text-slate-600 tabular-nums">
                Hors achat poussins :{' '}
                {formatFCFA(
                  calculs.depensesHorsAliment + calculs.montantAlimentAchete
                )}{' '}
                (dont {formatFCFA(calculs.depensesHorsAliment)} hors aliment)
              </p>
            </div>
            {!isClosed && (
              <button
                type="button"
                onClick={() => onAddDepense(false)}
                className="min-h-[48px] px-4 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-1.5 hover:bg-slate-800 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            )}
          </div>
          {depensesToutes.length === 0 ? (
            <p className="text-base text-slate-600 py-3">
              Aucune dépense enregistrée. Ajoutez vos achats d’aliment, vaccins, chauffage ou transport.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {depensesToutes.map((d) => (
                <li
                  key={d.id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-950 tabular-nums">
                      {CATEGORIES_DEPENSE_LABELS[d.categorie]} ·{' '}
                      {formatFCFA(d.montant)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {formatDateFR(d.date)}
                      {d.categorie === 'aliment' && d.nbSacs
                        ? ` · ${formatNombre(d.nbSacs)} sacs × ${formatFCFA(
                            d.prixParSac
                          )}`
                        : ''}
                      {d.note ? ` · ${d.note}` : ''}
                    </p>
                  </div>
                  {!isClosed && (
                    <RowActions
                      onEdit={() => onEditDepense(d)}
                      onDelete={() => onDeleteDepense(d)}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
          {depensesAutres.length === 0 && depensesToutes.length > 0 && (
            <p className="text-xs text-slate-500">
              Note : seules des dépenses d’aliment sont enregistrées pour l’instant.
            </p>
          )}
        </section>
      )}

      {/* ONGLET ALIMENT */}
      {tab === 'aliment' && (
        <div className="space-y-4">
          <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-lg font-bold text-slate-950">
              Bilan aliment (sacs de 50 kg)
            </h2>
            <dl className="divide-y divide-slate-100 text-base">
              <LigneStat
                label="Sacs achetés"
                valeur={`${formatNombre(calculs.sacsAchetes)} sacs`}
              />
              <LigneStat
                label="Sacs restants à la clôture"
                valeur={`${formatNombre(calculs.sacsRestants)} sacs`}
              />
              <LigneStat
                label="Sacs consommés"
                valeur={`${formatNombre(calculs.sacsConsommes)} sacs (${formatNombre(
                  calculs.kgConsommes
                )} kg)`}
                gras
              />
              <LigneStat
                label="Prix moyen par sac"
                valeur={formatFCFA(calculs.prixMoyenPondereSac)}
              />
              <LigneStat
                label="Coût aliment consommé"
                valeur={formatFCFA(calculs.coutAlimentConsomme)}
                gras
              />
              <LigneStat
                label="Part de l’aliment dans les dépenses"
                valeur={formatPourcent(calculs.partAlimentDansDepenses)}
              />
              <LigneStat
                label="Quantité par poulet reçu"
                valeur={
                  calculs.kgAlimentParPouletRecu !== null
                    ? `${formatNombre(calculs.kgAlimentParPouletRecu, 2)} kg`
                    : '-'
                }
              />
            </dl>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-slate-950">
                Achats d’aliment
              </h3>
              {!isClosed && (
                <button
                  type="button"
                  onClick={() => onAddDepense(true)}
                  className="min-h-[48px] px-4 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-1.5 hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Sacs</span>
                </button>
              )}
            </div>
            {depensesAliment.length === 0 ? (
              <p className="text-base text-slate-600 py-2">
                Aucun sac d’aliment enregistré pour cette bande. Appuyez sur « + Sacs » lors de chaque achat.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {depensesAliment.map((d) => (
                  <li
                    key={d.id}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-base font-bold text-slate-950 tabular-nums">
                        {formatNombre(d.nbSacs)} sac
                        {(d.nbSacs ?? 0) > 1 ? 's' : ''} (
                        {formatNombre((d.nbSacs ?? 0) * 50)} kg) ·{' '}
                        {formatFCFA(d.montant)}
                      </p>
                      <p className="text-sm text-slate-600 tabular-nums">
                        {formatDateFR(d.date)} · {formatFCFA(d.prixParSac)} / sac
                        {d.note ? ` · ${d.note}` : ''}
                      </p>
                    </div>
                    {!isClosed && (
                      <RowActions
                        onEdit={() => onEditDepense(d)}
                        onDelete={() => onDeleteDepense(d)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function LigneStat({
  label,
  valeur,
  gras = false,
  tone = 'neutral',
}: {
  label: string;
  valeur: string;
  gras?: boolean;
  tone?: 'neutral' | 'green' | 'red' | 'amber';
}) {
  const colorClass =
    tone === 'green'
      ? 'text-emerald-800'
      : tone === 'red'
      ? 'text-red-700'
      : tone === 'amber'
      ? 'text-amber-800'
      : 'text-slate-950';

  return (
    <div className="py-2.5 flex items-center justify-between gap-4">
      <dt className="text-slate-700">{label}</dt>
      <dd
        className={`tabular-nums text-right ${colorClass} ${
          gras ? 'font-extrabold' : 'font-semibold'
        }`}
      >
        {valeur}
      </dd>
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={onEdit}
        aria-label="Modifier"
        className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex items-center justify-center hover:bg-slate-100"
      >
        <Edit3 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Supprimer"
        className="min-h-[44px] min-w-[44px] rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-center justify-center hover:bg-red-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
