import {
  AppData,
  Bande,
  CATEGORIES_DEPENSE_LABELS,
  CAUSES_MORTALITE_LABELS,
  MOTIFS_SORTIE_LABELS,
  SCHEMA_VERSION,
} from '../types/elevage';
import { calculerBande } from '../utils/calculs';
import {
  formatDateFR,
  formatFCFA,
  formatNombre,
  formatPourcent,
  getTodayISO,
  offsetDaysISO,
} from '../utils/format';

const STORAGE_KEY = 'mon_elevage_poulets_v1';

export function creerDonneesVides(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    bandes: [],
    mortalites: [],
    ventes: [],
    paiementsDette: [],
    sortiesHorsVente: [],
    depenses: [],
    comptagesControle: [],
  };
}

export function chargerDonnees(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return creerDonneesVides();
    }
    const parsed = JSON.parse(raw);
    return validerEtNormaliserDonnees(parsed);
  } catch {
    return creerDonneesVides();
  }
}

export function sauvegarderDonnees(data: AppData): void {
  const payload: AppData = {
    ...data,
    schemaVersion: SCHEMA_VERSION,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function migrerBande(raw: Record<string, unknown>): Bande {
  const b = raw as unknown as Bande;
  return {
    ...b,
    dureePrevueJours:
      typeof raw.dureePrevueJours === 'number' && raw.dureePrevueJours > 0
        ? raw.dureePrevueJours
        : 28,
    prixVentePrevu:
      typeof raw.prixVentePrevu === 'number' && raw.prixVentePrevu > 0
        ? raw.prixVentePrevu
        : undefined,
  };
}

export function validerEtNormaliserDonnees(input: unknown): AppData {
  if (!input || typeof input !== 'object') {
    throw new Error('Fichier de sauvegarde invalide.');
  }
  const obj = input as Record<string, unknown>;
  if (typeof obj.schemaVersion !== 'number') {
    throw new Error('Version du fichier manquante ou invalide.');
  }
  if (
    !Array.isArray(obj.bandes) ||
    !Array.isArray(obj.mortalites) ||
    !Array.isArray(obj.ventes) ||
    !Array.isArray(obj.paiementsDette) ||
    !Array.isArray(obj.sortiesHorsVente) ||
    !Array.isArray(obj.depenses)
  ) {
    throw new Error('Structure de sauvegarde incomplète.');
  }

  // Migration douce depuis schemaVersion 1 -> 2
  const bandes = obj.bandes.map((item) =>
    migrerBande((item || {}) as Record<string, unknown>)
  );

  const comptagesControle = Array.isArray(obj.comptagesControle)
    ? (obj.comptagesControle as AppData['comptagesControle'])
    : [];

  return {
    schemaVersion: SCHEMA_VERSION,
    lastBackupDate:
      typeof obj.lastBackupDate === 'string' ? obj.lastBackupDate : undefined,
    bandes,
    mortalites: obj.mortalites as AppData['mortalites'],
    ventes: obj.ventes as AppData['ventes'],
    paiementsDette: obj.paiementsDette as AppData['paiementsDette'],
    sortiesHorsVente: obj.sortiesHorsVente as AppData['sortiesHorsVente'],
    depenses: obj.depenses as AppData['depenses'],
    comptagesControle,
  };
}

export function creerDonneesDemo(): AppData {
  const today = getTodayISO();

  // Bande 1 : Bande cloturee avec 3 manquants
  const b1Arrivee = offsetDaysISO(today, -56);
  const b1Cloture = offsetDaysISO(today, -30);

  // Bande 2 : Bande en cours (18 jours)
  const b2Arrivee = offsetDaysISO(today, -18);

  return {
    schemaVersion: SCHEMA_VERSION,
    lastBackupDate: today,
    bandes: [
      {
        id: 'bande_demo_1',
        nom: 'Bande 11 - novembre',
        dateArrivee: b1Arrivee,
        dureePrevueJours: 28,
        nbRecus: 550,
        coutAchatTotal: 302500,
        prixVentePrevu: 2900,
        fournisseur: 'Couvoir de Bafoussam',
        statut: 'cloturee',
        dateCloture: b1Cloture,
        nbCompteFinal: 0,
        sacsRestantsFinal: 2,
        notes: 'Bonne croissance dans l’ensemble. 3 poulets manquants au comptage final.',
      },
      {
        id: 'bande_demo_2',
        nom: 'Bande 12 - décembre',
        dateArrivee: b2Arrivee,
        dureePrevueJours: 28,
        nbRecus: 600,
        coutAchatTotal: 330000,
        prixVentePrevu: 3000,
        fournisseur: 'Couvoir de Bafoussam',
        statut: 'en_cours',
        notes: 'Poussins vigoureux à l’arrivée.',
      },
    ],
    mortalites: [
      {
        id: 'mort_demo_1',
        bandeId: 'bande_demo_1',
        date: offsetDaysISO(b1Arrivee, 2),
        nombre: 6,
        cause: 'chaleur',
        note: 'Premiers jours après arrivée',
      },
      {
        id: 'mort_demo_2',
        bandeId: 'bande_demo_1',
        date: offsetDaysISO(b1Arrivee, 11),
        nombre: 5,
        cause: 'maladie',
      },
      {
        id: 'mort_demo_3',
        bandeId: 'bande_demo_1',
        date: offsetDaysISO(b1Arrivee, 19),
        nombre: 3,
        cause: 'inconnue',
      },
      {
        id: 'mort_demo_4',
        bandeId: 'bande_demo_2',
        date: offsetDaysISO(b2Arrivee, 3),
        nombre: 7,
        cause: 'accident',
        note: 'Étouffement la nuit',
      },
      {
        id: 'mort_demo_5',
        bandeId: 'bande_demo_2',
        date: offsetDaysISO(b2Arrivee, 10),
        nombre: 4,
        cause: 'maladie',
      },
    ],
    sortiesHorsVente: [
      {
        id: 'sortie_demo_1',
        bandeId: 'bande_demo_1',
        date: offsetDaysISO(b1Arrivee, 22),
        nombre: 5,
        motif: 'consommation',
      },
      {
        id: 'sortie_demo_2',
        bandeId: 'bande_demo_1',
        date: offsetDaysISO(b1Arrivee, 24),
        nombre: 3,
        motif: 'don',
        note: 'Pour les voisins qui ont aidé au déchargement',
      },
      {
        id: 'sortie_demo_3',
        bandeId: 'bande_demo_2',
        date: offsetDaysISO(b2Arrivee, 15),
        nombre: 4,
        motif: 'consommation',
      },
    ],
    ventes: [
      {
        id: 'vente_demo_1',
        bandeId: 'bande_demo_1',
        date: offsetDaysISO(b1Arrivee, 23),
        type: 'gros',
        nombre: 250,
        prixUnitaire: 2800,
        montantTotal: 700000,
        montantEncaisse: 700000,
        client: 'Grossiste Mokolo',
      },
      {
        id: 'vente_demo_2',
        bandeId: 'bande_demo_1',
        date: offsetDaysISO(b1Arrivee, 25),
        type: 'gros',
        nombre: 150,
        prixUnitaire: 2850,
        montantTotal: 427500,
        montantEncaisse: 327500,
        client: 'Maman Clarisse (Mfoundi)',
        note: 'Reste à payer à la prochaine livraison',
      },
      {
        id: 'vente_demo_3',
        bandeId: 'bande_demo_1',
        date: offsetDaysISO(b1Arrivee, 26),
        type: 'detail',
        nombre: 125,
        prixUnitaire: 3200,
        montantTotal: 400000,
        montantEncaisse: 400000,
        client: 'Clients du quartier',
      },
      {
        id: 'vente_demo_4',
        bandeId: 'bande_demo_2',
        date: offsetDaysISO(today, -2),
        type: 'gros',
        nombre: 80,
        prixUnitaire: 2900,
        montantTotal: 232000,
        montantEncaisse: 150000,
        client: 'Établissement Nkodo',
      },
      {
        id: 'vente_demo_5',
        bandeId: 'bande_demo_2',
        date: offsetDaysISO(today, -1),
        type: 'detail',
        nombre: 40,
        prixUnitaire: 3250,
        montantTotal: 130000,
        montantEncaisse: 100000,
        client: 'Tonton Paul',
      },
    ],
    paiementsDette: [
      {
        id: 'paie_demo_1',
        venteId: 'vente_demo_2',
        date: offsetDaysISO(b1Arrivee, 29),
        montant: 50000,
        note: 'Premier versement Orange Money',
      },
    ],
    depenses: [
      {
        id: 'dep_demo_1',
        bandeId: 'bande_demo_1',
        date: b1Arrivee,
        categorie: 'aliment',
        nbSacs: 15,
        prixParSac: 18500,
        montant: 277500,
        note: 'Aliment démarrage',
      },
      {
        id: 'dep_demo_2',
        bandeId: 'bande_demo_1',
        date: offsetDaysISO(b1Arrivee, 10),
        categorie: 'aliment',
        nbSacs: 30,
        prixParSac: 17500,
        montant: 525000,
        note: 'Aliment croissance et finition',
      },
      {
        id: 'dep_demo_3',
        bandeId: 'bande_demo_1',
        date: offsetDaysISO(b1Arrivee, 1),
        categorie: 'medicaments_vaccins',
        montant: 38000,
        note: 'Vaccins + vitamines',
      },
      {
        id: 'dep_demo_4',
        bandeId: 'bande_demo_1',
        date: b1Arrivee,
        categorie: 'chauffage',
        montant: 22000,
        note: 'Charbon + ampoules',
      },
      {
        id: 'dep_demo_5',
        bandeId: 'bande_demo_1',
        date: b1Arrivee,
        categorie: 'litiere',
        montant: 15000,
        note: 'Copeaux de bois',
      },
      {
        id: 'dep_demo_6',
        bandeId: 'bande_demo_1',
        date: offsetDaysISO(b1Arrivee, 15),
        categorie: 'eau_electricite',
        montant: 12000,
      },
      {
        id: 'dep_demo_7',
        bandeId: 'bande_demo_2',
        date: b2Arrivee,
        categorie: 'aliment',
        nbSacs: 18,
        prixParSac: 18500,
        montant: 333000,
        note: 'Aliment démarrage',
      },
      {
        id: 'dep_demo_8',
        bandeId: 'bande_demo_2',
        date: offsetDaysISO(b2Arrivee, 9),
        categorie: 'aliment',
        nbSacs: 22,
        prixParSac: 17500,
        montant: 385000,
        note: 'Aliment croissance',
      },
      {
        id: 'dep_demo_9',
        bandeId: 'bande_demo_2',
        date: offsetDaysISO(b2Arrivee, 1),
        categorie: 'medicaments_vaccins',
        montant: 42000,
        note: 'Vaccins Gumboro et Newcastle',
      },
      {
        id: 'dep_demo_10',
        bandeId: 'bande_demo_2',
        date: b2Arrivee,
        categorie: 'chauffage',
        montant: 24000,
      },
      {
        id: 'dep_demo_11',
        bandeId: 'bande_demo_2',
        date: b2Arrivee,
        categorie: 'desinfection',
        montant: 14000,
      },
    ],
    comptagesControle: [
      {
        id: 'compt_demo_1',
        bandeId: 'bande_demo_2',
        date: offsetDaysISO(today, -3),
        nombreCompte: 583,
      },
    ],
  };
}

function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function genererCSVBande(bandeId: string, data: AppData): string {
  const bande = data.bandes.find((b) => b.id === bandeId);
  if (!bande) return '';
  const c = calculerBande(
    bande,
    data.mortalites,
    data.ventes,
    data.paiementsDette,
    data.sortiesHorsVente,
    data.depenses
  );

  const lines: string[] = [];
  lines.push(['RÉSUMÉ DE LA BANDE', bande.nom].map(escapeCSV).join(';'));
  lines.push(['Statut', bande.statut === 'cloturee' ? 'Clôturée' : 'En cours'].map(escapeCSV).join(';'));
  lines.push(['Date d’arrivée', formatDateFR(bande.dateArrivee)].map(escapeCSV).join(';'));
  lines.push(['Fin prévue', formatDateFR(c.dateFinPrevue)].map(escapeCSV).join(';'));
  if (bande.dateCloture) {
    lines.push(['Date de clôture', formatDateFR(bande.dateCloture)].map(escapeCSV).join(';'));
  }
  lines.push(['Durée (jours)', c.joursEcoules].map(escapeCSV).join(';'));
  lines.push(['Poulets reçus', c.nbRecus].map(escapeCSV).join(';'));
  lines.push(['Morts', c.totalMorts].map(escapeCSV).join(';'));
  lines.push(['Taux de mortalité', formatPourcent(c.tauxMortalite)].map(escapeCSV).join(';'));
  lines.push(['Vendus', c.totalVendus].map(escapeCSV).join(';'));
  lines.push(['Sorties hors vente', c.totalSortiesHorsVente].map(escapeCSV).join(';'));
  lines.push(['Effectif vivant estimé', c.effectifVivantEstime].map(escapeCSV).join(';'));
  if (c.manquants !== null) {
    lines.push(['Poulets comptés à la clôture', bande.nbCompteFinal].map(escapeCSV).join(';'));
    lines.push(['Manquants', c.manquants].map(escapeCSV).join(';'));
    lines.push(['Valeur perte manquants', formatFCFA(c.valeurPerteManquants)].map(escapeCSV).join(';'));
  }
  lines.push(['Chiffre d’affaires', formatFCFA(c.chiffreAffaires)].map(escapeCSV).join(';'));
  lines.push(['Montant encaissé', formatFCFA(c.encaisseTotal)].map(escapeCSV).join(';'));
  lines.push(['Créances restantes', formatFCFA(c.creances)].map(escapeCSV).join(';'));
  lines.push(['Dépenses totales', formatFCFA(c.depensesTotales)].map(escapeCSV).join(';'));
  lines.push(['Résultat', formatFCFA(c.resultat)].map(escapeCSV).join(';'));
  lines.push(['Sacs achetés (50 kg)', c.sacsAchetes].map(escapeCSV).join(';'));
  lines.push(['Sacs consommés', c.sacsConsommes].map(escapeCSV).join(';'));
  lines.push(['Aliment par poulet reçu (kg)', formatNombre(c.kgAlimentParPouletRecu, 2)].map(escapeCSV).join(';'));

  lines.push('');
  lines.push('VENTES');
  lines.push(['Date', 'Type', 'Nombre', 'Prix unitaire', 'Montant total', 'Encaissé', 'Client', 'Note'].map(escapeCSV).join(';'));
  data.ventes
    .filter((v) => v.bandeId === bande.id)
    .forEach((v) => {
      lines.push(
        [
          formatDateFR(v.date),
          v.type === 'gros' ? 'Gros' : 'Détail',
          v.nombre,
          v.prixUnitaire,
          v.montantTotal,
          v.montantEncaisse,
          v.client || '',
          v.note || '',
        ]
          .map(escapeCSV)
          .join(';')
      );
    });

  lines.push('');
  lines.push('MORTALITÉS');
  lines.push(['Date', 'Nombre', 'Cause', 'Note'].map(escapeCSV).join(';'));
  data.mortalites
    .filter((m) => m.bandeId === bande.id)
    .forEach((m) => {
      lines.push(
        [
          formatDateFR(m.date),
          m.nombre,
          m.cause ? CAUSES_MORTALITE_LABELS[m.cause] : '',
          m.note || '',
        ]
          .map(escapeCSV)
          .join(';')
      );
    });

  lines.push('');
  lines.push('DÉPENSES');
  lines.push(['Date', 'Catégorie', 'Sacs (50 kg)', 'Prix par sac', 'Montant', 'Note'].map(escapeCSV).join(';'));
  data.depenses
    .filter((d) => d.bandeId === bande.id)
    .forEach((d) => {
      lines.push(
        [
          formatDateFR(d.date),
          CATEGORIES_DEPENSE_LABELS[d.categorie],
          d.nbSacs ?? '',
          d.prixParSac ?? '',
          d.montant,
          d.note || '',
        ]
          .map(escapeCSV)
          .join(';')
      );
    });

  lines.push('');
  lines.push('SORTIES HORS VENTE');
  lines.push(['Date', 'Nombre', 'Motif', 'Note'].map(escapeCSV).join(';'));
  data.sortiesHorsVente
    .filter((s) => s.bandeId === bande.id)
    .forEach((s) => {
      lines.push(
        [
          formatDateFR(s.date),
          s.nombre,
          MOTIFS_SORTIE_LABELS[s.motif],
          s.note || '',
        ]
          .map(escapeCSV)
          .join(';')
      );
    });

  return '\uFEFF' + lines.join('\r\n');
}

export function telechargerFichier(
  contenu: string,
  nomFichier: string,
  mimeType: string
): void {
  const blob = new Blob([contenu], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomFichier;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
