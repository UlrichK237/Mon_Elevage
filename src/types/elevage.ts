export type StatutBande = 'en_cours' | 'cloturee';

export type CauseMortalite =
  | 'maladie'
  | 'chaleur'
  | 'accident'
  | 'predateur'
  | 'inconnue';

export type TypeVente = 'gros' | 'detail';

export type MotifSortie = 'don' | 'consommation' | 'autre';

export type CategorieDepense =
  | 'aliment'
  | 'medicaments_vaccins'
  | 'chauffage'
  | 'eau_electricite'
  | 'main_oeuvre'
  | 'transport'
  | 'litiere'
  | 'desinfection'
  | 'autre';

export interface Bande {
  id: string;
  nom: string;
  dateArrivee: string; // Format ISO AAAA-MM-JJ
  dureePrevueJours: number; // Défaut 28
  nbRecus: number;
  coutAchatTotal: number;
  prixVentePrevu?: number; // FCFA par poulet (facultatif)
  fournisseur?: string;
  statut: StatutBande;
  dateCloture?: string; // Format ISO AAAA-MM-JJ
  nbCompteFinal?: number;
  sacsRestantsFinal?: number;
  notes?: string;
}

export interface Mortalite {
  id: string;
  bandeId: string;
  date: string; // AAAA-MM-JJ
  nombre: number;
  cause?: CauseMortalite;
  note?: string;
}

export interface Vente {
  id: string;
  bandeId: string;
  date: string; // AAAA-MM-JJ
  type: TypeVente;
  nombre: number;
  prixUnitaire: number;
  montantTotal: number;
  montantEncaisse: number;
  client?: string;
  note?: string;
}

export interface PaiementDette {
  id: string;
  venteId: string;
  date: string; // AAAA-MM-JJ
  montant: number;
  note?: string;
}

export interface SortieHorsVente {
  id: string;
  bandeId: string;
  date: string; // AAAA-MM-JJ
  nombre: number;
  motif: MotifSortie;
  note?: string;
}

export interface Depense {
  id: string;
  bandeId: string;
  date: string; // AAAA-MM-JJ
  categorie: CategorieDepense;
  montant: number;
  nbSacs?: number;
  prixParSac?: number;
  note?: string;
}

export interface ComptageControle {
  id: string;
  bandeId: string;
  date: string; // AAAA-MM-JJ
  nombreCompte: number;
}

export interface AppData {
  schemaVersion: number;
  lastBackupDate?: string; // AAAA-MM-JJ
  bandes: Bande[];
  mortalites: Mortalite[];
  ventes: Vente[];
  paiementsDette: PaiementDette[];
  sortiesHorsVente: SortieHorsVente[];
  depenses: Depense[];
  comptagesControle: ComptageControle[];
}

export const SCHEMA_VERSION = 2;

export const CAUSES_MORTALITE_LABELS: Record<CauseMortalite, string> = {
  maladie: 'Maladie',
  chaleur: 'Chaleur',
  accident: 'Accident',
  predateur: 'Prédateur',
  inconnue: 'Inconnue',
};

export const MOTIFS_SORTIE_LABELS: Record<MotifSortie, string> = {
  don: 'Don',
  consommation: 'Consommation maison',
  autre: 'Autre',
};

export const CATEGORIES_DEPENSE_LABELS: Record<CategorieDepense, string> = {
  aliment: 'Aliment (sacs 50 kg)',
  medicaments_vaccins: 'Médicaments et vaccins',
  chauffage: 'Chauffage (charbon, gaz, ampoules)',
  eau_electricite: 'Eau et électricité',
  main_oeuvre: 'Main-d’œuvre',
  transport: 'Transport',
  litiere: 'Litière (copeaux)',
  desinfection: 'Désinfection et nettoyage',
  autre: 'Autre dépense',
};

export type AppPage =
  | 'accueil'
  | 'bandes'
  | 'bande_detail'
  | 'creances'
  | 'bilan'
  | 'parametres';

export type BandeDetailTab =
  | 'resume'
  | 'calendrier'
  | 'ventes'
  | 'mortalite'
  | 'depenses'
  | 'aliment';

export interface UndoAction {
  id: string;
  message: string;
  onUndo: () => void;
}
