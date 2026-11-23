import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Edit3,
  Gift,
  Plus,
  ShoppingBag,
  Skull,
  Trash2,
  Wallet,
} from 'lucide-react';
import {
  AppData,
  Bande,
  CATEGORIES_DEPENSE_LABELS,
  CAUSES_MORTALITE_LABELS,
  ComptageControle,
  Depense,
  MOTIFS_SORTIE_LABELS,
  Mortalite,
  SortieHorsVente,
  Vente,
} from '../types/elevage';
import { CalculsBande, calculerJourBande } from '../utils/calculs';
import {
  formatDateFR,
  formatFCFA,
  formatMonthYearFR,
  formatNombre,
  getDaysInMonth,
  getTodayISO,
  getWeekdayMondayFirst,
  parseISOParts,
  toISODate,
} from '../utils/format';

interface CalendrierBandeProps {
  bande: Bande;
  calculs: CalculsBande;
  data: AppData;
  onAddMortDate: (dateISO: string) => void;
  onEditMort: (m: Mortalite) => void;
  onDeleteMort: (m: Mortalite) => void;
  onAddVenteDate: (dateISO: string) => void;
  onEditVente: (v: Vente) => void;
  onDeleteVente: (v: Vente) => void;
  onAddDepenseDate: (dateISO: string) => void;
  onEditDepense: (d: Depense) => void;
  onDeleteDepense: (d: Depense) => void;
  onAddSortieDate: (dateISO: string) => void;
  onEditSortie: (s: SortieHorsVente) => void;
  onDeleteSortie: (s: SortieHorsVente) => void;
  onOpenComptage: (
    dateISO: string,
    vivantsEstimesFinJour: number,
    avantArrivee: boolean,
    existing: ComptageControle | null
  ) => void;
}

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function CalendrierBande({
  bande,
  calculs,
  data,
  onAddMortDate,
  onEditMort,
  onDeleteMort,
  onAddVenteDate,
  onEditVente,
  onDeleteVente,
  onAddDepenseDate,
  onEditDepense,
  onDeleteDepense,
  onAddSortieDate,
  onEditSortie,
  onDeleteSortie,
  onOpenComptage,
}: CalendrierBandeProps) {
  const todayISO = getTodayISO();
  const isClosed = bande.statut === 'cloturee';

  // Mois initial : mois d'aujourd'hui si bande en cours, sinon mois d'arrivee/cloture
  const initialRefISO =
    isClosed && bande.dateCloture ? bande.dateCloture : todayISO;
  const initialParts = parseISOParts(initialRefISO) || [2026, 1, 1];

  const [viewYear, setViewYear] = useState(initialParts[0]);
  const [viewMonth, setViewMonth] = useState(initialParts[1]); // 1..12
  const [selectedDateISO, setSelectedDateISO] = useState(initialRefISO);

  // Index des evenements par date AAAA-MM-JJ
  const eventsByDate = useMemo(() => {
    const map = new Map<
      string,
      {
        mort: boolean;
        vente: boolean;
        depense: boolean;
        sortie: boolean;
        comptage: boolean;
      }
    >();

    const ensure = (d: string) => {
      let entry = map.get(d);
      if (!entry) {
        entry = {
          mort: false,
          vente: false,
          depense: false,
          sortie: false,
          comptage: false,
        };
        map.set(d, entry);
      }
      return entry;
    };

    data.mortalites
      .filter((m) => m.bandeId === bande.id)
      .forEach((m) => {
        ensure(m.date).mort = true;
      });
    data.ventes
      .filter((v) => v.bandeId === bande.id)
      .forEach((v) => {
        ensure(v.date).vente = true;
      });
    data.depenses
      .filter((d) => d.bandeId === bande.id)
      .forEach((d) => {
        ensure(d.date).depense = true;
      });
    data.sortiesHorsVente
      .filter((s) => s.bandeId === bande.id)
      .forEach((s) => {
        ensure(s.date).sortie = true;
      });
    data.comptagesControle
      .filter((c) => c.bandeId === bande.id)
      .forEach((c) => {
        ensure(c.date).comptage = true;
      });

    return map;
  }, [bande.id, data]);

  // Cellules de la grille mensuelle (Lundi = 0)
  const calendarCells = useMemo(() => {
    const firstWeekday = getWeekdayMondayFirst(viewYear, viewMonth, 1);
    const totalDays = getDaysInMonth(viewYear, viewMonth);
    const cells: Array<{ iso: string | null; dayNum: number | null }> = [];

    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ iso: null, dayNum: null });
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push({
        iso: toISODate(viewYear, viewMonth, d),
        dayNum: d,
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ iso: null, dayNum: null });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const resumeJour = useMemo(
    () => calculerJourBande(bande, data, selectedDateISO),
    [bande, data, selectedDateISO]
  );

  const pctAvancement = Math.min(
    100,
    Math.max(
      0,
      Math.round((calculs.joursEcoules / calculs.dureePrevueJours) * 100)
    )
  );

  const rangeEndISO =
    isClosed && bande.dateCloture
      ? bande.dateCloture
      : calculs.dateFinPrevue;

  return (
    <div className="space-y-4">
      {/* En-tete progression : Jour X sur Y + Fin prevue */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-lg font-extrabold text-slate-950 tabular-nums">
            Jour {formatNombre(calculs.joursEcoules)} sur{' '}
            {formatNombre(calculs.dureePrevueJours)}
          </p>
          <span className="text-sm font-semibold text-slate-700 tabular-nums">
            {pctAvancement} %
          </span>
        </div>

        <div
          className="w-full h-3 rounded-full bg-slate-200 overflow-hidden"
          role="progressbar"
          aria-valuenow={pctAvancement}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Avancement de la bande"
        >
          <div
            className="h-full rounded-full bg-emerald-700 transition-all"
            style={{ width: `${pctAvancement}%` }}
          />
        </div>

        <p className="text-sm font-medium text-slate-700">
          {calculs.joursRestantsJusquaFinPrevue > 0 ? (
            <>
              Fin prévue le{' '}
              <span className="font-bold text-slate-950">
                {formatDateFR(calculs.dateFinPrevue)}
              </span>{' '}
              (dans {formatNombre(calculs.joursRestantsJusquaFinPrevue)} jour
              {calculs.joursRestantsJusquaFinPrevue > 1 ? 's' : ''})
            </>
          ) : calculs.joursRestantsJusquaFinPrevue === 0 ? (
            <>
              Fin prévue aujourd’hui le{' '}
              <span className="font-bold text-slate-950">
                {formatDateFR(calculs.dateFinPrevue)}
              </span>
            </>
          ) : (
            <>
              Fin prévue le{' '}
              <span className="font-bold text-slate-950">
                {formatDateFR(calculs.dateFinPrevue)}
              </span>{' '}
              ·{' '}
              {formatNombre(Math.abs(calculs.joursRestantsJusquaFinPrevue))}{' '}
              jour
              {Math.abs(calculs.joursRestantsJusquaFinPrevue) > 1 ? 's' : ''}{' '}
              après la date prévue
            </>
          )}
        </p>
      </section>

      {/* Grille mensuelle */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mois précédent"
            className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-300 bg-white text-slate-900 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-extrabold text-slate-950">
            {formatMonthYearFR(viewYear, viewMonth)}
          </h2>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Mois suivant"
            className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-300 bg-white text-slate-900 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Jours de la semaine (Lundi -> Dimanche) */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {JOURS_SEMAINE.map((j) => (
            <div
              key={j}
              className="py-1 text-xs font-bold text-slate-600"
            >
              {j}
            </div>
          ))}

          {calendarCells.map((cell, index) => {
            if (!cell.iso || cell.dayNum === null) {
              return <div key={`empty_${index}`} className="min-h-[50px]" />;
            }
            const iso = cell.iso;
            const inBand = iso >= bande.dateArrivee && iso <= rangeEndISO;
            const isArrivee = iso === bande.dateArrivee;
            const isFinPrevue = iso === calculs.dateFinPrevue;
            const isToday = iso === todayISO;
            const isSelected = iso === selectedDateISO;
            const ev = eventsByDate.get(iso);

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDateISO(iso)}
                aria-label={`Jour ${formatDateFR(iso)}`}
                className={`min-h-[52px] rounded-xl flex flex-col items-center justify-between py-1.5 px-0.5 transition-colors relative border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : isArrivee
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                    : isFinPrevue
                    ? 'bg-amber-100 text-amber-950 border-amber-400'
                    : inBand
                    ? 'bg-emerald-50/70 text-slate-950 border-emerald-100 hover:bg-emerald-100/70'
                    : 'bg-white text-slate-800 border-transparent hover:bg-slate-100'
                } ${isToday && !isSelected ? 'ring-2 ring-slate-900' : ''}`}
              >
                <span className="text-sm font-bold tabular-nums leading-none">
                  {cell.dayNum}
                </span>

                {/* Repères par forme et couleur */}
                <div className="flex items-center justify-center gap-0.5 min-h-[10px]">
                  {ev?.mort && (
                    <span
                      title="Mort"
                      className="w-2 h-2 bg-red-600 inline-block"
                    />
                  )}
                  {ev?.vente && (
                    <span
                      title="Vente"
                      className="w-2 h-2 rounded-full bg-emerald-600 inline-block"
                    />
                  )}
                  {ev?.depense && (
                    <span
                      title="Dépense"
                      className="w-2 h-2 rotate-45 bg-blue-600 inline-block"
                    />
                  )}
                  {ev?.sortie && (
                    <span
                      title="Don / consommation"
                      className="w-2 h-2 rounded-full border-2 border-amber-500 inline-block"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Légende */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-600 inline-block" />
            Mort
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            Vente
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-blue-600 inline-block" />
            Dépense
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 inline-block" />
            Don / conso
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400 inline-block" />
            Arrivée
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
            Fin prévue
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border-2 border-slate-900 inline-block" />
            Aujourd’hui
          </span>
        </div>
      </section>

      {/* Détail du jour sélectionné */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-extrabold text-slate-950">
              Journée du {formatDateFR(selectedDateISO)}
            </h3>
            <p className="text-sm text-slate-600">
              {selectedDateISO === bande.dateArrivee
                ? 'Jour d’arrivée des poussins'
                : selectedDateISO === calculs.dateFinPrevue
                ? 'Jour de fin prévue'
                : resumeJour.avantArrivee
                ? 'Avant l’arrivée de cette bande'
                : `Jour ${formatNombre(
                    Math.max(
                      0,
                      Math.round(
                        (Date.UTC(
                          ...((parseISOParts(selectedDateISO) || [2026, 1, 1]) as [
                            number,
                            number,
                            number
                          ])
                        ) -
                          Date.UTC(
                            ...((parseISOParts(bande.dateArrivee) || [
                              2026, 1, 1,
                            ]) as [number, number, number])
                          )) /
                          86400000
                      )
                    )
                  )} de la bande`}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenComptage(
                selectedDateISO,
                resumeJour.vivantsEstimesFinJour,
                resumeJour.avantArrivee,
                resumeJour.comptageControle
              )
            }
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold text-sm flex items-center gap-1.5 hover:bg-slate-100"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>
              {resumeJour.comptageControle
                ? 'Modifier comptage'
                : 'Comptage de contrôle'}
            </span>
          </button>
        </div>

        {/* Chiffres du jour */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600">
              Poulets vendus ce jour
            </p>
            <p className="text-xl font-extrabold text-slate-950 tabular-nums mt-0.5">
              {formatNombre(resumeJour.pouletsVendusJour)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600">
              Argent rentré ce jour
            </p>
            <p className="text-xl font-extrabold text-emerald-800 tabular-nums mt-0.5">
              {formatFCFA(resumeJour.argentRentreJour)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600">
              Vivants estimés en fin de journée
            </p>
            <p className="text-xl font-extrabold text-slate-950 tabular-nums mt-0.5">
              {resumeJour.avantArrivee
                ? '-'
                : `${formatNombre(resumeJour.vivantsEstimesFinJour)} poulets`}
            </p>
          </div>
        </div>

        {/* Comptage de controle du jour s'il existe */}
        {resumeJour.comptageControle && (
          <div
            className={`p-3.5 rounded-xl border ${
              resumeJour.ecartComptage === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <p className="text-sm font-bold tabular-nums">
              Comptage de contrôle :{' '}
              {formatNombre(resumeJour.comptageControle.nombreCompte)} poulets
              comptés
              {resumeJour.ecartComptage !== null && (
                <>
                  {' · '}
                  {resumeJour.ecartComptage === 0
                    ? 'Écart : 0 (compte exact)'
                    : resumeJour.ecartComptage > 0
                    ? `Écart : ${formatNombre(
                        resumeJour.ecartComptage
                      )} manquant${resumeJour.ecartComptage > 1 ? 's' : ''}`
                    : `Écart : ${formatNombre(
                        Math.abs(resumeJour.ecartComptage)
                      )} en plus`}
                </>
              )}
            </p>
          </div>
        )}

        {/* Boutons d'ajout à cette date */}
        {!isClosed && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onAddMortDate(selectedDateISO)}
              className="min-h-[48px] px-3 rounded-xl bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-red-800"
            >
              <Skull className="w-4 h-4" />
              <span>+ Mort</span>
            </button>
            <button
              type="button"
              onClick={() => onAddVenteDate(selectedDateISO)}
              className="min-h-[48px] px-3 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-emerald-900"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>+ Vente</span>
            </button>
            <button
              type="button"
              onClick={() => onAddDepenseDate(selectedDateISO)}
              className="min-h-[48px] px-3 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-slate-800"
            >
              <Wallet className="w-4 h-4" />
              <span>+ Dépense</span>
            </button>
            <button
              type="button"
              onClick={() => onAddSortieDate(selectedDateISO)}
              className="min-h-[48px] px-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-slate-50"
            >
              <Gift className="w-4 h-4" />
              <span>+ Don</span>
            </button>
          </div>
        )}

        {/* Liste des saisies de ce jour */}
        {resumeJour.morts.length === 0 &&
        resumeJour.ventes.length === 0 &&
        resumeJour.depenses.length === 0 &&
        resumeJour.sorties.length === 0 &&
        resumeJour.paiements.length === 0 ? (
          <p className="text-sm text-slate-600 py-1">
            Aucune saisie enregistrée à cette date.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {resumeJour.ventes.map((v) => (
              <li
                key={v.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-base font-bold text-emerald-900 tabular-nums">
                    Vente ({v.type === 'gros' ? 'Gros' : 'Détail'}) :{' '}
                    {formatNombre(v.nombre)} poulets ·{' '}
                    {formatFCFA(v.montantTotal)}
                  </p>
                  <p className="text-sm text-slate-600 tabular-nums">
                    Encaissé : {formatFCFA(v.montantEncaisse)}
                    {v.client ? ` · ${v.client}` : ''}
                  </p>
                </div>
                {!isClosed && (
                  <DayRowActions
                    onEdit={() => onEditVente(v)}
                    onDelete={() => onDeleteVente(v)}
                  />
                )}
              </li>
            ))}

            {resumeJour.paiements.map((p) => (
              <li
                key={p.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-base font-bold text-emerald-900 tabular-nums">
                    Remboursement dette client : {formatFCFA(p.montant)}
                  </p>
                  {p.note && <p className="text-sm text-slate-600">{p.note}</p>}
                </div>
              </li>
            ))}

            {resumeJour.morts.map((m) => (
              <li
                key={m.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-base font-bold text-red-800 tabular-nums">
                    Mortalité : {formatNombre(m.nombre)} poulet
                    {m.nombre > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-slate-600">
                    {m.cause
                      ? CAUSES_MORTALITE_LABELS[m.cause]
                      : 'Cause non précisée'}
                    {m.note ? ` · ${m.note}` : ''}
                  </p>
                </div>
                {!isClosed && (
                  <DayRowActions
                    onEdit={() => onEditMort(m)}
                    onDelete={() => onDeleteMort(m)}
                  />
                )}
              </li>
            ))}

            {resumeJour.depenses.map((d) => (
              <li
                key={d.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-950 tabular-nums">
                    {CATEGORIES_DEPENSE_LABELS[d.categorie]} ·{' '}
                    {formatFCFA(d.montant)}
                  </p>
                  <p className="text-sm text-slate-600">
                    {d.categorie === 'aliment' && d.nbSacs
                      ? `${formatNombre(d.nbSacs)} sacs × ${formatFCFA(
                          d.prixParSac
                        )}`
                      : 'Dépense'}
                    {d.note ? ` · ${d.note}` : ''}
                  </p>
                </div>
                {!isClosed && (
                  <DayRowActions
                    onEdit={() => onEditDepense(d)}
                    onDelete={() => onDeleteDepense(d)}
                  />
                )}
              </li>
            ))}

            {resumeJour.sorties.map((s) => (
              <li
                key={s.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-900 tabular-nums">
                    {MOTIFS_SORTIE_LABELS[s.motif]} : {formatNombre(s.nombre)}{' '}
                    poulet{s.nombre > 1 ? 's' : ''}
                  </p>
                  {s.note && <p className="text-sm text-slate-600">{s.note}</p>}
                </div>
                {!isClosed && (
                  <DayRowActions
                    onEdit={() => onEditSortie(s)}
                    onDelete={() => onDeleteSortie(s)}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DayRowActions({
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
