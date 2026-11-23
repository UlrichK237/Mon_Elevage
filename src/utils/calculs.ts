import {
  AppData,
  Bande,
  Depense,
  Mortalite,
  PaiementDette,
  SortieHorsVente,
  Vente,
} from '../types/elevage';
import { getTodayISO } from './format';

export interface RepartitionVente {
  nombre: number;
  chiffreAffaires: number;
  prixMoyen: number | null;
}

export interface CalculsBande {
  bande: Bande;
  joursEcoules: number;
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
  partAlimentDansCharges: number | null;
  kgAlimentParPouletRecu: number | null;
  // 6. Charges
  coutAchatPoussins: number;
  depensesHorsAliment: number;
  chargesTotales: number;
  // 7. Resultat
  resultat: number;
  resultatEstProvisoire: boolean;
  resultatTresorerie: number;
  // 8. Unitaires & Marges
  prixRevientParPouletVendu: number | null;
  prixVenteMoyenGlobal: number | null;
  margeMoyenneParPoulet: number | null;
  // 9. Seuil de rentabilite
  prixMinimumCouvrirCharges: number | null;
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
  nbBandes: number;
  nbBandesEnCours: number;
  nbBandesCloturees: number;
  totalPouletsRecus: number;
  totalPouletsVendus: number;
  totalPouletsMorts: number;
  totalManquants: number;
  totalChiffreAffaires: number;
  totalCharges: number;
  totalResultat: number;
  totalEncaisse: number;
  totalCreances: number;
}

export function calculerJoursEntre(dateDebutISO: string, dateFinISO: string): number {
  const debutParts = dateDebutISO.split('-').map(Number);
  const finParts = dateFinISO.split('-').map(Number);
  if (
    debutParts.length !== 3 ||
    finParts.length !== 3 ||
    debutParts.some(Number.isNaN) ||
    finParts.some(Number.isNaN)
  ) {
    return 0;
  }
  const debut = Date.UTC(debutParts[0], debutParts[1] - 1, debutParts[2]);
  const fin = Date.UTC(finParts[0], finParts[1] - 1, finParts[2]);
  const diff = Math.round((fin - debut) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
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
  const creances = chiffreAffaires - encaisseTotal;

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

  // 6. Charges totales
  const coutAchatPoussins = bande.coutAchatTotal;
  const depensesHorsAliment = bandeDepenses
    .filter((d) => d.categorie !== 'aliment')
    .reduce((sum, d) => sum + d.montant, 0);
  const chargesTotales =
    coutAchatPoussins + depensesHorsAliment + coutAlimentConsomme;

  const partAlimentDansCharges =
    chargesTotales > 0 ? coutAlimentConsomme / chargesTotales : null;

  // 7. Resultat
  const resultat = chiffreAffaires - chargesTotales;
  const resultatEstProvisoire = bande.statut !== 'cloturee';
  const resultatTresorerie = encaisseTotal - chargesTotales;

  // 8. Prix de revient et marge
  const prixRevientParPouletVendu =
    totalVendus > 0 ? chargesTotales / totalVendus : null;
  const margeMoyenneParPoulet =
    prixVenteMoyenGlobal !== null && prixRevientParPouletVendu !== null
      ? prixVenteMoyenGlobal - prixRevientParPouletVendu
      : null;

  // 9. Seuil de rentabilite
  const prixMinimumCouvrirCharges =
    effectifVivantEstime > 0 && resultat < 0
      ? (chargesTotales - chiffreAffaires) / effectifVivantEstime
      : null;

  return {
    bande,
    joursEcoules,
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
    partAlimentDansCharges,
    kgAlimentParPouletRecu,
    coutAchatPoussins,
    depensesHorsAliment,
    chargesTotales,
    resultat,
    resultatEstProvisoire,
    resultatTresorerie,
    prixRevientParPouletVendu,
    prixVenteMoyenGlobal,
    margeMoyenneParPoulet,
    prixMinimumCouvrirCharges,
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

export function calculerTotauxGlobaux(calculsList: CalculsBande[]): TotauxGlobaux {
  return calculsList.reduce<TotauxGlobaux>(
    (acc, c) => ({
      nbBandes: acc.nbBandes + 1,
      nbBandesEnCours:
        acc.nbBandesEnCours + (c.bande.statut === 'en_cours' ? 1 : 0),
      nbBandesCloturees:
        acc.nbBandesCloturees + (c.bande.statut === 'cloturee' ? 1 : 0),
      totalPouletsRecus: acc.totalPouletsRecus + c.nbRecus,
      totalPouletsVendus: acc.totalPouletsVendus + c.totalVendus,
      totalPouletsMorts: acc.totalPouletsMorts + c.totalMorts,
      totalManquants: acc.totalManquants + (c.manquants ?? 0),
      totalChiffreAffaires: acc.totalChiffreAffaires + c.chiffreAffaires,
      totalCharges: acc.totalCharges + c.chargesTotales,
      totalResultat: acc.totalResultat + c.resultat,
      totalEncaisse: acc.totalEncaisse + c.encaisseTotal,
      totalCreances: acc.totalCreances + c.creances,
    }),
    {
      nbBandes: 0,
      nbBandesEnCours: 0,
      nbBandesCloturees: 0,
      totalPouletsRecus: 0,
      totalPouletsVendus: 0,
      totalPouletsMorts: 0,
      totalManquants: 0,
      totalChiffreAffaires: 0,
      totalCharges: 0,
      totalResultat: 0,
      totalEncaisse: 0,
      totalCreances: 0,
    }
  );
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
