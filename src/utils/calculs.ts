import {
  AppData,
  Bande,
  CATEGORIES_DEPENSE_LABELS,
  CategorieDepense,
  ComptageControle,
  Depense,
  Mortalite,
  PaiementDette,
  SortieHorsVente,
  Vente,
} from '../types/elevage';
import { getTodayISO, offsetDaysISO, parseISOParts } from './format';

export interface RepartitionVente {
  nombre: number;
  chiffreAffaires: number;
  prixMoyen: number | null;
}

export interface PosteDepenseLourd {
  cle: string;
  label: string;
  montant: number;
  part: number; // 0..1
}

export interface CalculsBande {
  bande: Bande;
  joursEcoules: number;
  dureePrevueJours: number;
  dateFinPrevue: string;
  joursRestantsJusquaFinPrevue: number; // positif = dans N jours, negatif = N jours apres
  // 1. Effectifs
  nbRecus: number;
  totalMorts: number;
  totalVendus: number;
  totalSortiesHorsVente: number;
  effectifVivantEstime: number;
  // 2. Mortalite
  tauxMortalite: number | null;
  // 3. Cloture / Manquants
  manquants: number | null;
  valeurPerteManquants: number | null;
  // 4. Revenus et creances
  chiffreAffaires: number;
  encaisseVentes: number;
  encaissePaiements: number;
  encaisseTotal: number;
  creances: number;
  // 5. Aliment
  sacsAchetes: number;
  sacsRestants: number;
  sacsConsommes: number;
  kgConsommes: number;
  montantAlimentAchete: number;
  prixMoyenPondereSac: number | null;
  coutAlimentConsomme: number;
  partAlimentDansDepenses: number | null;
  kgAlimentParPouletRecu: number | null;
  // 6. Depenses totales (achat poussins + depenses hors aliment + aliment consomme)
  coutAchatPoussins: number;
  depensesHorsAliment: number;
  depensesTotales: number;
  top3PostesDepenses: PosteDepenseLourd[];
  // 7. Resultat & Suivi "Ou j'en suis"
  resultat: number;
  resultatEstProvisoire: boolean;
  resultatTresorerie: number;
  depensesRecupereesRatio: number | null; // encaisseTotal / depensesTotales
  resteARecuperer: number; // max(0, depensesTotales - encaisseTotal)
  beneficeEnCours: number; // max(0, encaisseTotal - depensesTotales)
  prixReferencePrevision: number | null;
  resultatPrevisionnel: number | null;
  // 8. Unitaires & Marges
  prixRevientParPouletVendu: number | null;
  prixVenteMoyenGlobal: number | null;
  margeMoyenneParPoulet: number | null;
  // 9. Seuil de rentabilite
  prixMinimumCouvrirDepenses: number | null;
  // 10. Repartition gros / detail
  repartitionGros: RepartitionVente;
  repartitionDetail: RepartitionVente;
}

export interface DetailVenteDette {
  vente: Vente;
  bandeNom: string;
  montantPaye: number;
  resteDu: number;
  paiements: PaiementDette[];
}

export interface CreanceClient {
  clientNom: string;
  totalDu: number;
  ventesImpayees: DetailVenteDette[];
}

export interface TotauxGlobaux {
  nbBandesCloturees: number;
  totalPouletsRecus: number;
  totalPouletsVendus: number;
  totalPouletsMorts: number;
  totalManquants: number;
  totalChiffreAffaires: number;
  totalDepenses: number;
  totalResultat: number;
  totalEncaisse: number;
  totalCreancesEnCoursToutesBandes: number;
}

export interface ResumeJourBande {
  date: string;
  morts: Mortalite[];
  ventes: Vente[];
  depenses: Depense[];
  sorties: SortieHorsVente[];
  paiements: PaiementDette[];
  pouletsVendusJour: number;
  argentRentreJour: number;
  avantArrivee: boolean;
  vivantsEstimesFinJour: number;
  comptageControle: ComptageControle | null;
  ecartComptage: number | null; // vivantsEstimesFinJour - nombreCompte
}

export function calculerJoursDifference(dateDebutISO: string, dateFinISO: string): number {
  const debutParts = parseISOParts(dateDebutISO);
  const finParts = parseISOParts(dateFinISO);
  if (!debutParts || !finParts) {
    return 0;
  }
  const debut = Date.UTC(debutParts[0], debutParts[1] - 1, debutParts[2]);
  const fin = Date.UTC(finParts[0], finParts[1] - 1, finParts[2]);
  return Math.round((fin - debut) / (1000 * 60 * 60 * 24));
}

export function calculerJoursEntre(dateDebutISO: string, dateFinISO: string): number {
  return Math.max(0, calculerJoursDifference(dateDebutISO, dateFinISO));
}

export function calculerResteDuVente(
  vente: Vente,
  paiementsDette: PaiementDette[]
): { montantPaye: number; resteDu: number; paiements: PaiementDette[] } {
  const paiements = paiementsDette.filter((p) => p.venteId === vente.id);
  const sommePaiements = paiements.reduce((sum, p) => sum + p.montant, 0);
  const montantPaye = vente.montantEncaisse + sommePaiements;
  const resteDu = Math.max(0, vente.montantTotal - montantPaye);
  return { montantPaye, resteDu, paiements };
}

export function calculerBande(
  bande: Bande,
  mortalites: Mortalite[],
  ventes: Vente[],
  paiementsDette: PaiementDette[],
  sortiesHorsVente: SortieHorsVente[],
  depenses: Depense[],
  dateReferenceISO: string = getTodayISO()
): CalculsBande {
  const bandeMortalites = mortalites.filter((m) => m.bandeId === bande.id);
  const bandeVentes = ventes.filter((v) => v.bandeId === bande.id);
  const bandeSorties = sortiesHorsVente.filter((s) => s.bandeId === bande.id);
  const bandeDepenses = depenses.filter((d) => d.bandeId === bande.id);

  const venteIds = new Set(bandeVentes.map((v) => v.id));
  const bandePaiements = paiementsDette.filter((p) => venteIds.has(p.venteId));

  const dureePrevueJours =
    bande.dureePrevueJours && bande.dureePrevueJours > 0
      ? bande.dureePrevueJours
      : 28;
  const dateFinPrevue = offsetDaysISO(bande.dateArrivee, dureePrevueJours);
  const joursRestantsJusquaFinPrevue = calculerJoursDifference(
    dateReferenceISO,
    dateFinPrevue
  );

  // 11. Jours ecoules
  const dateFin =
    bande.statut === 'cloturee' && bande.dateCloture
      ? bande.dateCloture
      : dateReferenceISO;
  const joursEcoules = calculerJoursEntre(bande.dateArrivee, dateFin);

  // 1. Effectifs
  const nbRecus = bande.nbRecus;
  const totalMorts = bandeMortalites.reduce((sum, m) => sum + m.nombre, 0);
  const totalVendus = bandeVentes.reduce((sum, v) => sum + v.nombre, 0);
  const totalSortiesHorsVente = bandeSorties.reduce((sum, s) => sum + s.nombre, 0);
  const effectifVivantEstime =
    nbRecus - totalMorts - totalVendus - totalSortiesHorsVente;

  // 2. Taux de mortalite
  const tauxMortalite = nbRecus > 0 ? totalMorts / nbRecus : null;

  // 4. Revenus & creances
  const chiffreAffaires = bandeVentes.reduce((sum, v) => sum + v.montantTotal, 0);
  const encaisseVentes = bandeVentes.reduce((sum, v) => sum + v.montantEncaisse, 0);
  const encaissePaiements = bandePaiements.reduce((sum, p) => sum + p.montant, 0);
  const encaisseTotal = encaisseVentes + encaissePaiements;
  const creances = Math.max(0, chiffreAffaires - encaisseTotal);

  // 10. Repartition gros / detail
  const ventesGros = bandeVentes.filter((v) => v.type === 'gros');
  const ventesDetail = bandeVentes.filter((v) => v.type === 'detail');

  const nbGros = ventesGros.reduce((sum, v) => sum + v.nombre, 0);
  const caGros = ventesGros.reduce((sum, v) => sum + v.montantTotal, 0);
  const repartitionGros: RepartitionVente = {
    nombre: nbGros,
    chiffreAffaires: caGros,
    prixMoyen: nbGros > 0 ? caGros / nbGros : null,
  };

  const nbDetail = ventesDetail.reduce((sum, v) => sum + v.nombre, 0);
  const caDetail = ventesDetail.reduce((sum, v) => sum + v.montantTotal, 0);
  const repartitionDetail: RepartitionVente = {
    nombre: nbDetail,
    chiffreAffaires: caDetail,
    prixMoyen: nbDetail > 0 ? caDetail / nbDetail : null,
  };

  // 8 (partial). Prix de vente moyen global
  const prixVenteMoyenGlobal = totalVendus > 0 ? chiffreAffaires / totalVendus : null;

  // 3. Cloture / manquants
  const estCloturee =
    bande.statut === 'cloturee' && bande.nbCompteFinal !== undefined;
  const manquants = estCloturee
    ? effectifVivantEstime - (bande.nbCompteFinal as number)
    : null;
  const valeurPerteManquants =
    manquants !== null && prixVenteMoyenGlobal !== null
      ? manquants * prixVenteMoyenGlobal
      : null;

  // 5. Aliment
  const depensesAliment = bandeDepenses.filter((d) => d.categorie === 'aliment');
  const sacsAchetes = depensesAliment.reduce((sum, d) => sum + (d.nbSacs ?? 0), 0);
  const montantAlimentAchete = depensesAliment.reduce((sum, d) => sum + d.montant, 0);

  const sacsRestants =
    bande.statut === 'cloturee' && bande.sacsRestantsFinal !== undefined
      ? Math.max(0, bande.sacsRestantsFinal)
      : 0;
  const sacsConsommes = Math.max(0, sacsAchetes - sacsRestants);
  const kgConsommes = sacsConsommes * 50;

  const prixMoyenPondereSac =
    sacsAchetes > 0 ? montantAlimentAchete / sacsAchetes : null;

  const coutAlimentConsomme =
    sacsAchetes > 0 && prixMoyenPondereSac !== null
      ? sacsConsommes === sacsAchetes
        ? montantAlimentAchete
        : Math.round(sacsConsommes * prixMoyenPondereSac)
      : 0;

  const kgAlimentParPouletRecu = nbRecus > 0 ? kgConsommes / nbRecus : null;

  // 6. Depenses totales (achat poussins + depenses hors aliment + aliment consomme)
  const coutAchatPoussins = bande.coutAchatTotal;
  const depensesHorsAliment = bandeDepenses
    .filter((d) => d.categorie !== 'aliment')
    .reduce((sum, d) => sum + d.montant, 0);
  const depensesTotales =
    coutAchatPoussins + depensesHorsAliment + coutAlimentConsomme;

  const partAlimentDansDepenses =
    depensesTotales > 0 ? coutAlimentConsomme / depensesTotales : null;

  // Top 3 postes de depenses
  const postesMap = new Map<string, { label: string; montant: number }>();
  if (coutAchatPoussins > 0) {
    postesMap.set('achat_poussins', {
      label: 'Achat des poussins',
      montant: coutAchatPoussins,
    });
  }
  if (coutAlimentConsomme > 0) {
    postesMap.set('aliment', {
      label: 'Aliment consommé',
      montant: coutAlimentConsomme,
    });
  }
  for (const d of bandeDepenses) {
    if (d.categorie === 'aliment') continue;
    const prev = postesMap.get(d.categorie) || {
      label: CATEGORIES_DEPENSE_LABELS[d.categorie as CategorieDepense],
      montant: 0,
    };
    prev.montant += d.montant;
    postesMap.set(d.categorie, prev);
  }
  const top3PostesDepenses: PosteDepenseLourd[] = Array.from(postesMap.entries())
    .map(([cle, info]) => ({
      cle,
      label: info.label,
      montant: info.montant,
      part: depensesTotales > 0 ? info.montant / depensesTotales : 0,
    }))
    .filter((p) => p.montant > 0)
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 3);

  // 7. Resultat & "Ou j'en suis"
  const resultat = chiffreAffaires - depensesTotales;
  const resultatEstProvisoire = bande.statut !== 'cloturee';
  const resultatTresorerie = encaisseTotal - depensesTotales;

  const depensesRecupereesRatio =
    depensesTotales > 0 ? encaisseTotal / depensesTotales : null;
  const resteARecuperer = Math.max(0, depensesTotales - encaisseTotal);
  const beneficeEnCours = Math.max(0, encaisseTotal - depensesTotales);

  const prixReferencePrevision =
    prixVenteMoyenGlobal !== null && prixVenteMoyenGlobal > 0
      ? prixVenteMoyenGlobal
      : bande.prixVentePrevu && bande.prixVentePrevu > 0
      ? bande.prixVentePrevu
      : null;

  const resultatPrevisionnel =
    prixReferencePrevision !== null
      ? chiffreAffaires +
        Math.max(0, effectifVivantEstime) * prixReferencePrevision -
        depensesTotales
      : null;

  // 8. Prix de revient et marge
  const prixRevientParPouletVendu =
    totalVendus > 0 ? depensesTotales / totalVendus : null;
  const margeMoyenneParPoulet =
    prixVenteMoyenGlobal !== null && prixRevientParPouletVendu !== null
      ? prixVenteMoyenGlobal - prixRevientParPouletVendu
      : null;

  // 9. Seuil de rentabilite
  const prixMinimumCouvrirDepenses =
    effectifVivantEstime > 0 && resultat < 0
      ? (depensesTotales - chiffreAffaires) / effectifVivantEstime
      : null;

  return {
    bande,
    joursEcoules,
    dureePrevueJours,
    dateFinPrevue,
    joursRestantsJusquaFinPrevue,
    nbRecus,
    totalMorts,
    totalVendus,
    totalSortiesHorsVente,
    effectifVivantEstime,
    tauxMortalite,
    manquants,
    valeurPerteManquants,
    chiffreAffaires,
    encaisseVentes,
    encaissePaiements,
    encaisseTotal,
    creances,
    sacsAchetes,
    sacsRestants,
    sacsConsommes,
    kgConsommes,
    montantAlimentAchete,
    prixMoyenPondereSac,
    coutAlimentConsomme,
    partAlimentDansDepenses,
    kgAlimentParPouletRecu,
    coutAchatPoussins,
    depensesHorsAliment,
    depensesTotales,
    top3PostesDepenses,
    resultat,
    resultatEstProvisoire,
    resultatTresorerie,
    depensesRecupereesRatio,
    resteARecuperer,
    beneficeEnCours,
    prixReferencePrevision,
    resultatPrevisionnel,
    prixRevientParPouletVendu,
    prixVenteMoyenGlobal,
    margeMoyenneParPoulet,
    prixMinimumCouvrirDepenses,
    repartitionGros,
    repartitionDetail,
  };
}

export function calculerToutesBandes(
  data: AppData,
  dateReferenceISO: string = getTodayISO()
): CalculsBande[] {
  return data.bandes.map((bande) =>
    calculerBande(
      bande,
      data.mortalites,
      data.ventes,
      data.paiementsDette,
      data.sortiesHorsVente,
      data.depenses,
      dateReferenceISO
    )
  );
}

export function calculerCreancesParClient(data: AppData): {
  clients: CreanceClient[];
  totalCreances: number;
} {
  const bandeMap = new Map<string, Bande>(data.bandes.map((b) => [b.id, b]));
  const clientGroups = new Map<string, DetailVenteDette[]>();

  for (const vente of data.ventes) {
    const { montantPaye, resteDu, paiements } = calculerResteDuVente(
      vente,
      data.paiementsDette
    );
    if (resteDu <= 0) continue;

    const clientNom = vente.client?.trim() || 'Client non précisé';
    const bandeNom = bandeMap.get(vente.bandeId)?.nom || 'Bande inconnue';
    const list = clientGroups.get(clientNom) || [];
    list.push({
      vente,
      bandeNom,
      montantPaye,
      resteDu,
      paiements: paiements.sort((a, b) => b.date.localeCompare(a.date)),
    });
    clientGroups.set(clientNom, list);
  }

  const clients: CreanceClient[] = Array.from(clientGroups.entries())
    .map(([clientNom, ventesImpayees]) => ({
      clientNom,
      totalDu: ventesImpayees.reduce((sum, item) => sum + item.resteDu, 0),
      ventesImpayees: ventesImpayees.sort((a, b) =>
        b.vente.date.localeCompare(a.vente.date)
      ),
    }))
    .sort((a, b) => b.totalDu - a.totalDu);

  const totalCreances = clients.reduce((sum, c) => sum + c.totalDu, 0);
  return { clients, totalCreances };
}

/**
 * Les totaux globaux ne comptent QUE les bandes cloturees.
 * Les creances en cours restent indiquees sur l'ensemble des ventes non reglees.
 */
export function calculerTotauxGlobaux(calculsList: CalculsBande[]): TotauxGlobaux {
  const cloturees = calculsList.filter((c) => c.bande.statut === 'cloturee');
  const totalCreancesEnCoursToutesBandes = calculsList.reduce(
    (sum, c) => sum + c.creances,
    0
  );

  const base = cloturees.reduce(
    (acc, c) => ({
      nbBandesCloturees: acc.nbBandesCloturees + 1,
      totalPouletsRecus: acc.totalPouletsRecus + c.nbRecus,
      totalPouletsVendus: acc.totalPouletsVendus + c.totalVendus,
      totalPouletsMorts: acc.totalPouletsMorts + c.totalMorts,
      totalManquants: acc.totalManquants + (c.manquants ?? 0),
      totalChiffreAffaires: acc.totalChiffreAffaires + c.chiffreAffaires,
      totalDepenses: acc.totalDepenses + c.depensesTotales,
      totalResultat: acc.totalResultat + c.resultat,
      totalEncaisse: acc.totalEncaisse + c.encaisseTotal,
    }),
    {
      nbBandesCloturees: 0,
      totalPouletsRecus: 0,
      totalPouletsVendus: 0,
      totalPouletsMorts: 0,
      totalManquants: 0,
      totalChiffreAffaires: 0,
      totalDepenses: 0,
      totalResultat: 0,
      totalEncaisse: 0,
    }
  );

  return {
    ...base,
    totalCreancesEnCoursToutesBandes,
  };
}

export function calculerJourBande(
  bande: Bande,
  data: AppData,
  dateISO: string
): ResumeJourBande {
  const morts = data.mortalites.filter(
    (m) => m.bandeId === bande.id && m.date === dateISO
  );
  const ventes = data.ventes.filter(
    (v) => v.bandeId === bande.id && v.date === dateISO
  );
  const depenses = data.depenses.filter(
    (d) => d.bandeId === bande.id && d.date === dateISO
  );
  const sorties = data.sortiesHorsVente.filter(
    (s) => s.bandeId === bande.id && s.date === dateISO
  );

  const venteIdsBande = new Set(
    data.ventes.filter((v) => v.bandeId === bande.id).map((v) => v.id)
  );
  const paiements = data.paiementsDette.filter(
    (p) => venteIdsBande.has(p.venteId) && p.date === dateISO
  );

  const pouletsVendusJour = ventes.reduce((sum, v) => sum + v.nombre, 0);
  const argentRentreJour =
    ventes.reduce((sum, v) => sum + v.montantEncaisse, 0) +
    paiements.reduce((sum, p) => sum + p.montant, 0);

  const avantArrivee = dateISO < bande.dateArrivee;

  let vivantsEstimesFinJour = 0;
  if (!avantArrivee) {
    const mortsCumul = data.mortalites
      .filter((m) => m.bandeId === bande.id && m.date <= dateISO)
      .reduce((sum, m) => sum + m.nombre, 0);
    const vendusCumul = data.ventes
      .filter((v) => v.bandeId === bande.id && v.date <= dateISO)
      .reduce((sum, v) => sum + v.nombre, 0);
    const sortiesCumul = data.sortiesHorsVente
      .filter((s) => s.bandeId === bande.id && s.date <= dateISO)
      .reduce((sum, s) => sum + s.nombre, 0);
    vivantsEstimesFinJour =
      bande.nbRecus - mortsCumul - vendusCumul - sortiesCumul;
  }

  const comptageControle =
    data.comptagesControle.find(
      (c) => c.bandeId === bande.id && c.date === dateISO
    ) || null;

  const ecartComptage =
    comptageControle && !avantArrivee
      ? vivantsEstimesFinJour - comptageControle.nombreCompte
      : null;

  return {
    date: dateISO,
    morts,
    ventes,
    depenses,
    sorties,
    paiements,
    pouletsVendusJour,
    argentRentreJour,
    avantArrivee,
    vivantsEstimesFinJour,
    comptageControle,
    ecartComptage,
  };
}

export function doitRappelerSauvegarde(
  data: AppData,
  todayISO: string = getTodayISO()
): boolean {
  if (data.bandes.length === 0) return false;
  if (!data.lastBackupDate) return true;
  const joursDepuisSauvegarde = calculerJoursEntre(data.lastBackupDate, todayISO);
  return joursDepuisSauvegarde >= 7;
}
