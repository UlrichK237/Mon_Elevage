import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  ClipboardList,
  Home,
  Plus,
  Settings,
  WalletCards,
} from 'lucide-react';
import {
  AppData,
  AppPage,
  Bande,
  BandeDetailTab,
  CategorieDepense,
  ComptageControle,
  Depense,
  Mortalite,
  SortieHorsVente,
  UndoAction,
  Vente,
} from './types/elevage';
import {
  chargerDonnees,
  creerDonneesDemo,
  creerDonneesVides,
  sauvegarderDonnees,
} from './data/storage';
import {
  DetailVenteDette,
  calculerBande,
  calculerCreancesParClient,
} from './utils/calculs';
import { formatDateFR, formatFCFA, generateId, getTodayISO } from './utils/format';
import { AccueilPage } from './pages/AccueilPage';
import { BandesPage } from './pages/BandesPage';
import { BandeDetailPage } from './pages/BandeDetailPage';
import { CreancesPage } from './pages/CreancesPage';
import { BilanGlobalPage } from './pages/BilanGlobalPage';
import { ParametresPage } from './pages/ParametresPage';
import { BandeModal } from './components/modals/BandeModal';
import { MortaliteModal } from './components/modals/MortaliteModal';
import { VenteModal } from './components/modals/VenteModal';
import { DepenseModal } from './components/modals/DepenseModal';
import { SortieModal } from './components/modals/SortieModal';
import { ClotureModal } from './components/modals/ClotureModal';
import { PaiementDetteModal } from './components/modals/PaiementDetteModal';
import { ComptageModal } from './components/modals/ComptageModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { UndoToast } from './components/UndoToast';

function parseHash(): {
  page: AppPage;
  bandeId: string | null;
  tab: BandeDetailTab;
} {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (raw.startsWith('bande/')) {
    const rest = raw.slice('bande/'.length);
    const [rawId, rawTab] = rest.split('/');
    const id = rawId ? decodeURIComponent(rawId) : '';
    const tab: BandeDetailTab =
      rawTab === 'calendrier' ? 'calendrier' : 'resume';
    if (id) return { page: 'bande_detail', bandeId: id, tab };
  }
  if (
    raw === 'bandes' ||
    raw === 'creances' ||
    raw === 'bilan' ||
    raw === 'parametres'
  ) {
    return { page: raw, bandeId: null, tab: 'resume' };
  }
  return { page: 'accueil', bandeId: null, tab: 'resume' };
}

export default function App() {
  const [data, setData] = useState<AppData>(() => chargerDonnees());
  const initialRoute = useMemo(() => parseHash(), []);
  const [page, setPage] = useState<AppPage>(initialRoute.page);
  const [detailBandeId, setDetailBandeId] = useState<string | null>(
    initialRoute.bandeId
  );
  const [detailInitialTab, setDetailInitialTab] = useState<BandeDetailTab>(
    initialRoute.tab
  );
  const [selectedActiveBandeId, setSelectedActiveBandeId] = useState<
    string | null
  >(null);

  // Modales d'ajout / edition
  const [bandeModalOpen, setBandeModalOpen] = useState(false);
  const [editingBande, setEditingBande] = useState<Bande | null>(null);

  const [mortModal, setMortModal] = useState<{
    open: boolean;
    bandeId: string | null;
    defaultDate?: string;
    initial: Mortalite | null;
  }>({ open: false, bandeId: null, initial: null });

  const [venteModal, setVenteModal] = useState<{
    open: boolean;
    bandeId: string | null;
    defaultDate?: string;
    initial: Vente | null;
  }>({ open: false, bandeId: null, initial: null });

  const [depenseModal, setDepenseModal] = useState<{
    open: boolean;
    bandeId: string | null;
    defaultCategorie: CategorieDepense;
    defaultDate?: string;
    initial: Depense | null;
  }>({
    open: false,
    bandeId: null,
    defaultCategorie: 'aliment',
    initial: null,
  });

  const [sortieModal, setSortieModal] = useState<{
    open: boolean;
    bandeId: string | null;
    defaultDate?: string;
    initial: SortieHorsVente | null;
  }>({ open: false, bandeId: null, initial: null });

  const [comptageModal, setComptageModal] = useState<{
    open: boolean;
    bandeId: string | null;
    dateISO: string;
    vivantsEstimesFinJour: number;
    avantArrivee: boolean;
    initial: ComptageControle | null;
  }>({
    open: false,
    bandeId: null,
    dateISO: getTodayISO(),
    vivantsEstimesFinJour: 0,
    avantArrivee: false,
    initial: null,
  });

  const [clotureBandeId, setClotureBandeId] = useState<string | null>(null);
  const [paiementDetteTarget, setPaiementDetteTarget] =
    useState<DetailVenteDette | null>(null);

  // Confirmation & Undo
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    danger: boolean;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmer',
    danger: true,
    onConfirm: () => {},
  });

  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  // Persistance automatique
  useEffect(() => {
    sauvegarderDonnees(data);
  }, [data]);

  // Synchronisation HashRouter manuel (compatible Capacitor)
  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash();
      setPage(next.page);
      setDetailBandeId(next.bandeId);
      setDetailInitialTab(next.tab);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback(
    (
      nextPage: AppPage,
      bandeId?: string,
      tab: BandeDetailTab = 'resume'
    ) => {
      if (nextPage === 'bande_detail' && bandeId) {
        const suffix = tab === 'calendrier' ? '/calendrier' : '';
        window.location.hash = `#bande/${encodeURIComponent(bandeId)}${suffix}`;
        setDetailBandeId(bandeId);
        setDetailInitialTab(tab);
        setPage('bande_detail');
      } else {
        window.location.hash = `#${nextPage}`;
        setDetailBandeId(null);
        setDetailInitialTab('resume');
        setPage(nextPage);
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    []
  );

  const triggerUndo = useCallback((message: string, undoFn: () => void) => {
    setUndoAction({
      id: generateId('undo'),
      message,
      onUndo: undoFn,
    });
  }, []);

  const getBandeCalculs = useCallback(
    (bandeId: string | null) => {
      if (!bandeId) return null;
      const bande = data.bandes.find((b) => b.id === bandeId);
      if (!bande) return null;
      return calculerBande(
        bande,
        data.mortalites,
        data.ventes,
        data.paiementsDette,
        data.sortiesHorsVente,
        data.depenses
      );
    },
    [data]
  );

  const { totalCreances } = useMemo(
    () => calculerCreancesParClient(data),
    [data]
  );

  // --- CRUD Bandes ---
  const handleSaveBande = (payload: Omit<Bande, 'id' | 'statut'>) => {
    if (editingBande) {
      setData((prev) => ({
        ...prev,
        bandes: prev.bandes.map((b) =>
          b.id === editingBande.id ? { ...b, ...payload } : b
        ),
      }));
      setEditingBande(null);
    } else {
      const newBande: Bande = {
        ...payload,
        id: generateId('bande'),
        statut: 'en_cours',
      };
      setData((prev) => ({
        ...prev,
        bandes: [newBande, ...prev.bandes],
      }));
      setSelectedActiveBandeId(newBande.id);
      triggerUndo(`Bande « ${newBande.nom} » créée.`, () => {
        setData((prev) => ({
          ...prev,
          bandes: prev.bandes.filter((b) => b.id !== newBande.id),
        }));
      });
    }
  };

  // --- CRUD Mortalite ---
  const handleSaveMort = (payload: Omit<Mortalite, 'id' | 'bandeId'>) => {
    const bandeId = mortModal.bandeId;
    if (!bandeId) return;
    if (mortModal.initial) {
      const targetId = mortModal.initial.id;
      setData((prev) => ({
        ...prev,
        mortalites: prev.mortalites.map((m) =>
          m.id === targetId ? { ...m, ...payload } : m
        ),
      }));
    } else {
      const newItem: Mortalite = {
        ...payload,
        id: generateId('mort'),
        bandeId,
      };
      setData((prev) => ({
        ...prev,
        mortalites: [newItem, ...prev.mortalites],
      }));
      triggerUndo(
        `${newItem.nombre} mort${newItem.nombre > 1 ? 's' : ''} enregistré${
          newItem.nombre > 1 ? 's' : ''
        }.`,
        () => {
          setData((prev) => ({
            ...prev,
            mortalites: prev.mortalites.filter((m) => m.id !== newItem.id),
          }));
        }
      );
    }
  };

  const handleDeleteMort = (m: Mortalite) => {
    setConfirmState({
      open: true,
      title: 'Supprimer cette mortalité ?',
      message: `Voulez-vous supprimer l’entrée de ${m.nombre} poulet${
        m.nombre > 1 ? 's' : ''
      } mort${m.nombre > 1 ? 's' : ''} ?`,
      confirmLabel: 'Supprimer',
      danger: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          mortalites: prev.mortalites.filter((item) => item.id !== m.id),
        }));
        setConfirmState((s) => ({ ...s, open: false }));
      },
    });
  };

  // --- CRUD Vente ---
  const handleSaveVente = (payload: Omit<Vente, 'id' | 'bandeId'>) => {
    const bandeId = venteModal.bandeId;
    if (!bandeId) return;
    if (venteModal.initial) {
      const targetId = venteModal.initial.id;
      setData((prev) => ({
        ...prev,
        ventes: prev.ventes.map((v) =>
          v.id === targetId ? { ...v, ...payload } : v
        ),
      }));
    } else {
      const newItem: Vente = {
        ...payload,
        id: generateId('vente'),
        bandeId,
      };
      setData((prev) => ({
        ...prev,
        ventes: [newItem, ...prev.ventes],
      }));
      triggerUndo(
        `Vente de ${newItem.nombre} poulets (${formatFCFA(
          newItem.montantTotal
        )}) enregistrée.`,
        () => {
          setData((prev) => ({
            ...prev,
            ventes: prev.ventes.filter((v) => v.id !== newItem.id),
          }));
        }
      );
    }
  };

  const handleDeleteVente = (v: Vente) => {
    setConfirmState({
      open: true,
      title: 'Supprimer cette vente ?',
      message: `Voulez-vous supprimer la vente de ${v.nombre} poulets (${formatFCFA(
        v.montantTotal
      )}) ? Les paiements liés seront aussi supprimés.`,
      confirmLabel: 'Supprimer',
      danger: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          ventes: prev.ventes.filter((item) => item.id !== v.id),
          paiementsDette: prev.paiementsDette.filter((p) => p.venteId !== v.id),
        }));
        setConfirmState((s) => ({ ...s, open: false }));
      },
    });
  };

  // --- CRUD Depense ---
  const handleSaveDepense = (payload: Omit<Depense, 'id' | 'bandeId'>) => {
    const bandeId = depenseModal.bandeId;
    if (!bandeId) return;
    if (depenseModal.initial) {
      const targetId = depenseModal.initial.id;
      setData((prev) => ({
        ...prev,
        depenses: prev.depenses.map((d) =>
          d.id === targetId ? { ...d, ...payload } : d
        ),
      }));
    } else {
      const newItem: Depense = {
        ...payload,
        id: generateId('dep'),
        bandeId,
      };
      setData((prev) => ({
        ...prev,
        depenses: [newItem, ...prev.depenses],
      }));
      triggerUndo(
        `Dépense de ${formatFCFA(newItem.montant)} enregistrée.`,
        () => {
          setData((prev) => ({
            ...prev,
            depenses: prev.depenses.filter((d) => d.id !== newItem.id),
          }));
        }
      );
    }
  };

  const handleDeleteDepense = (d: Depense) => {
    setConfirmState({
      open: true,
      title: 'Supprimer cette dépense ?',
      message: `Voulez-vous supprimer cette dépense de ${formatFCFA(
        d.montant
      )} ?`,
      confirmLabel: 'Supprimer',
      danger: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          depenses: prev.depenses.filter((item) => item.id !== d.id),
        }));
        setConfirmState((s) => ({ ...s, open: false }));
      },
    });
  };

  // --- CRUD Sortie hors vente ---
  const handleSaveSortie = (payload: Omit<SortieHorsVente, 'id' | 'bandeId'>) => {
    const bandeId = sortieModal.bandeId;
    if (!bandeId) return;
    if (sortieModal.initial) {
      const targetId = sortieModal.initial.id;
      setData((prev) => ({
        ...prev,
        sortiesHorsVente: prev.sortiesHorsVente.map((s) =>
          s.id === targetId ? { ...s, ...payload } : s
        ),
      }));
    } else {
      const newItem: SortieHorsVente = {
        ...payload,
        id: generateId('sortie'),
        bandeId,
      };
      setData((prev) => ({
        ...prev,
        sortiesHorsVente: [newItem, ...prev.sortiesHorsVente],
      }));
      triggerUndo(
        `Sortie de ${newItem.nombre} poulet${
          newItem.nombre > 1 ? 's' : ''
        } enregistrée.`,
        () => {
          setData((prev) => ({
            ...prev,
            sortiesHorsVente: prev.sortiesHorsVente.filter(
              (s) => s.id !== newItem.id
            ),
          }));
        }
      );
    }
  };

  const handleDeleteSortie = (s: SortieHorsVente) => {
    setConfirmState({
      open: true,
      title: 'Supprimer cette sortie ?',
      message: `Voulez-vous supprimer cette sortie de ${s.nombre} poulet${
        s.nombre > 1 ? 's' : ''
      } ?`,
      confirmLabel: 'Supprimer',
      danger: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          sortiesHorsVente: prev.sortiesHorsVente.filter(
            (item) => item.id !== s.id
          ),
        }));
        setConfirmState((c) => ({ ...c, open: false }));
      },
    });
  };

  // --- CRUD Comptage de controle ---
  const handleSaveComptage = (nombreCompte: number) => {
    const bandeId = comptageModal.bandeId;
    const date = comptageModal.dateISO;
    if (!bandeId) return;

    if (comptageModal.initial) {
      const targetId = comptageModal.initial.id;
      setData((prev) => ({
        ...prev,
        comptagesControle: prev.comptagesControle.map((c) =>
          c.id === targetId ? { ...c, nombreCompte } : c
        ),
      }));
    } else {
      const newItem: ComptageControle = {
        id: generateId('compt'),
        bandeId,
        date,
        nombreCompte,
      };
      setData((prev) => ({
        ...prev,
        comptagesControle: [
          newItem,
          ...prev.comptagesControle.filter(
            (c) => !(c.bandeId === bandeId && c.date === date)
          ),
        ],
      }));
      triggerUndo(
        `Comptage du ${formatDateFR(date)} enregistré (${nombreCompte} poulets).`,
        () => {
          setData((prev) => ({
            ...prev,
            comptagesControle: prev.comptagesControle.filter(
              (c) => c.id !== newItem.id
            ),
          }));
        }
      );
    }
  };

  const handleDeleteComptage = (comptage: ComptageControle) => {
    setConfirmState({
      open: true,
      title: 'Supprimer ce comptage ?',
      message: `Voulez-vous supprimer le comptage de contrôle du ${formatDateFR(
        comptage.date
      )} ?`,
      confirmLabel: 'Supprimer',
      danger: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          comptagesControle: prev.comptagesControle.filter(
            (c) => c.id !== comptage.id
          ),
        }));
        setConfirmState((s) => ({ ...s, open: false }));
      },
    });
  };

  // --- Cloture & Reouverture ---
  const handleConfirmCloture = (payload: {
    dateCloture: string;
    nbCompteFinal: number;
    sacsRestantsFinal: number;
  }) => {
    if (!clotureBandeId) return;
    setData((prev) => ({
      ...prev,
      bandes: prev.bandes.map((b) =>
        b.id === clotureBandeId
          ? {
              ...b,
              statut: 'cloturee',
              dateCloture: payload.dateCloture,
              nbCompteFinal: payload.nbCompteFinal,
              sacsRestantsFinal: payload.sacsRestantsFinal,
            }
          : b
      ),
    }));
    navigate('bande_detail', clotureBandeId, 'resume');
    setClotureBandeId(null);
  };

  const handleReouvrirBande = (bande: Bande) => {
    setConfirmState({
      open: true,
      title: 'Rouvrir cette bande ?',
      message: `La bande « ${bande.nom} » redeviendra modifiable. Vous pourrez la clôturer à nouveau après vos corrections.`,
      confirmLabel: 'Rouvrir',
      danger: false,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          bandes: prev.bandes.map((b) =>
            b.id === bande.id ? { ...b, statut: 'en_cours' } : b
          ),
        }));
        setConfirmState((s) => ({ ...s, open: false }));
      },
    });
  };

  // --- Paiement de dette ---
  const handleSavePaiementDette = (payload: {
    venteId: string;
    date: string;
    montant: number;
    note?: string;
  }) => {
    const newItem = {
      id: generateId('paie'),
      ...payload,
    };
    setData((prev) => ({
      ...prev,
      paiementsDette: [newItem, ...prev.paiementsDette],
    }));
    triggerUndo(
      `Paiement de ${formatFCFA(newItem.montant)} enregistré.`,
      () => {
        setData((prev) => ({
          ...prev,
          paiementsDette: prev.paiementsDette.filter(
            (p) => p.id !== newItem.id
          ),
        }));
      }
    );
  };

  // --- Demo, Import & Reset ---
  const handleLoadDemo = () => {
    const charger = () => {
      const demo = creerDonneesDemo();
      setData(demo);
      setSelectedActiveBandeId('bande_demo_2');
      navigate('accueil');
    };
    if (data.bandes.length > 0) {
      setConfirmState({
        open: true,
        title: 'Remplacer par les données d’exemple ?',
        message:
          'Attention : vos bandes actuelles seront remplacées par 1 bande clôturée (avec 3 manquants) et 1 bande en cours.',
        confirmLabel: 'Charger l’exemple',
        danger: true,
        onConfirm: () => {
          charger();
          setConfirmState((s) => ({ ...s, open: false }));
        },
      });
    } else {
      charger();
    }
  };

  const handleImportData = (imported: AppData) => {
    if (data.bandes.length > 0) {
      setConfirmState({
        open: true,
        title: 'Importer cette sauvegarde ?',
        message:
          'Vos données actuelles sur cet appareil seront remplacées par le contenu du fichier sélectionné.',
        confirmLabel: 'Importer',
        danger: true,
        onConfirm: () => {
          setData(imported);
          setConfirmState((s) => ({ ...s, open: false }));
          navigate('accueil');
        },
      });
    } else {
      setData(imported);
      navigate('accueil');
    }
  };

  const handleResetAll = () => {
    setConfirmState({
      open: true,
      title: 'Tout effacer ?',
      message:
        'Toutes vos bandes, ventes, dépenses et créances seront définitivement supprimées de cet appareil.',
      confirmLabel: 'Tout effacer',
      danger: true,
      onConfirm: () => {
        setData(creerDonneesVides());
        setSelectedActiveBandeId(null);
        setConfirmState((s) => ({ ...s, open: false }));
        navigate('accueil');
      },
    });
  };

  const detailBande = useMemo(
    () =>
      detailBandeId
        ? data.bandes.find((b) => b.id === detailBandeId) || null
        : null,
    [data.bandes, detailBandeId]
  );

  const mortCalculs = getBandeCalculs(mortModal.bandeId);
  const venteCalculs = getBandeCalculs(venteModal.bandeId);
  const depenseCalculs = getBandeCalculs(depenseModal.bandeId);
  const sortieCalculs = getBandeCalculs(sortieModal.bandeId);
  const comptageCalculs = getBandeCalculs(comptageModal.bandeId);
  const clotureCalculs = getBandeCalculs(clotureBandeId);

  const navItems: Array<{
    id: AppPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'bandes', label: 'Bandes', icon: ClipboardList },
    { id: 'creances', label: 'Créances', icon: WalletCards },
    { id: 'bilan', label: 'Bilan', icon: BarChart3 },
    { id: 'parametres', label: 'Réglages', icon: Settings },
  ];

  const isNavActive = (id: AppPage) =>
    page === id || (id === 'bandes' && page === 'bande_detail');

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F3] text-slate-950">
      {/* Barre de navigation haute sur tablette/ordinateur (3 zones) */}
      <header className="hidden md:block bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => navigate('accueil')}
            className="text-xl font-extrabold tracking-tight text-slate-950 whitespace-nowrap shrink-0"
          >
            Mon Élevage
          </button>

          <nav
            aria-label="Navigation principale"
            className="flex items-center gap-6"
          >
            {navItems.map((item) => {
              const active = isNavActive(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  className={`min-h-[44px] px-1 text-sm font-bold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    active
                      ? 'border-emerald-800 text-emerald-900'
                      : 'border-transparent text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {item.label}
                  {item.id === 'creances' && totalCreances > 0
                    ? ` (${formatFCFA(totalCreances).replace(' FCFA', '')})`
                    : ''}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => {
              setEditingBande(null);
              setBandeModalOpen(true);
            }}
            className="min-h-[44px] px-4 rounded-xl bg-emerald-800 text-white text-sm font-bold flex items-center gap-1.5 hover:bg-emerald-900 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle bande</span>
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-24 md:pb-10">
        {page === 'accueil' && (
          <AccueilPage
            data={data}
            selectedActiveBandeId={selectedActiveBandeId}
            onSelectActiveBande={setSelectedActiveBandeId}
            onOpenNewBande={() => {
              setEditingBande(null);
              setBandeModalOpen(true);
            }}
            onOpenMort={(bandeId) =>
              setMortModal({ open: true, bandeId, initial: null })
            }
            onOpenVente={(bandeId) =>
              setVenteModal({ open: true, bandeId, initial: null })
            }
            onOpenDepense={(bandeId) =>
              setDepenseModal({
                open: true,
                bandeId,
                defaultCategorie: 'aliment',
                initial: null,
              })
            }
            onOpenSortie={(bandeId) =>
              setSortieModal({ open: true, bandeId, initial: null })
            }
            onOpenDetail={(bandeId) =>
              navigate('bande_detail', bandeId, 'resume')
            }
            onOpenCalendrier={(bandeId) =>
              navigate('bande_detail', bandeId, 'calendrier')
            }
            onOpenCloture={(bandeId) => setClotureBandeId(bandeId)}
            onGoParametres={() => navigate('parametres')}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {page === 'bandes' && (
          <BandesPage
            data={data}
            onOpenNewBande={() => {
              setEditingBande(null);
              setBandeModalOpen(true);
            }}
            onOpenDetail={(bandeId) =>
              navigate('bande_detail', bandeId, 'resume')
            }
          />
        )}

        {page === 'bande_detail' &&
          (detailBande ? (
            <BandeDetailPage
              bande={detailBande}
              data={data}
              initialTab={detailInitialTab}
              onBack={() => navigate('bandes')}
              onEditBande={(b) => {
                setEditingBande(b);
                setBandeModalOpen(true);
              }}
              onOpenCloture={() => setClotureBandeId(detailBande.id)}
              onReouvrirBande={() => handleReouvrirBande(detailBande)}
              onAddVente={(dateISO) =>
                setVenteModal({
                  open: true,
                  bandeId: detailBande.id,
                  defaultDate: dateISO,
                  initial: null,
                })
              }
              onEditVente={(v) =>
                setVenteModal({
                  open: true,
                  bandeId: detailBande.id,
                  initial: v,
                })
              }
              onDeleteVente={handleDeleteVente}
              onAddMort={(dateISO) =>
                setMortModal({
                  open: true,
                  bandeId: detailBande.id,
                  defaultDate: dateISO,
                  initial: null,
                })
              }
              onEditMort={(m) =>
                setMortModal({
                  open: true,
                  bandeId: detailBande.id,
                  initial: m,
                })
              }
              onDeleteMort={handleDeleteMort}
              onAddDepense={(isAliment, dateISO) =>
                setDepenseModal({
                  open: true,
                  bandeId: detailBande.id,
                  defaultCategorie: isAliment
                    ? 'aliment'
                    : 'medicaments_vaccins',
                  defaultDate: dateISO,
                  initial: null,
                })
              }
              onEditDepense={(d) =>
                setDepenseModal({
                  open: true,
                  bandeId: detailBande.id,
                  defaultCategorie: d.categorie,
                  initial: d,
                })
              }
              onDeleteDepense={handleDeleteDepense}
              onAddSortie={(dateISO) =>
                setSortieModal({
                  open: true,
                  bandeId: detailBande.id,
                  defaultDate: dateISO,
                  initial: null,
                })
              }
              onEditSortie={(s) =>
                setSortieModal({
                  open: true,
                  bandeId: detailBande.id,
                  initial: s,
                })
              }
              onDeleteSortie={handleDeleteSortie}
              onOpenComptage={(
                dateISO,
                vivantsEstimesFinJour,
                avantArrivee,
                existing
              ) =>
                setComptageModal({
                  open: true,
                  bandeId: detailBande.id,
                  dateISO,
                  vivantsEstimesFinJour,
                  avantArrivee,
                  initial: existing,
                })
              }
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3">
              <p className="text-base text-slate-700">
                Cette bande est introuvable.
              </p>
              <button
                type="button"
                onClick={() => navigate('bandes')}
                className="min-h-[48px] px-5 rounded-xl bg-slate-900 text-white font-bold text-sm"
              >
                Retour à la liste des bandes
              </button>
            </div>
          ))}

        {page === 'creances' && (
          <CreancesPage
            data={data}
            onOpenPaiement={(dette) => setPaiementDetteTarget(dette)}
          />
        )}

        {page === 'bilan' && (
          <BilanGlobalPage
            data={data}
            onOpenDetail={(bandeId) =>
              navigate('bande_detail', bandeId, 'resume')
            }
          />
        )}

        {page === 'parametres' && (
          <ParametresPage
            data={data}
            onBackupDone={() =>
              setData((prev) => ({ ...prev, lastBackupDate: getTodayISO() }))
            }
            onImportData={handleImportData}
            onLoadDemo={handleLoadDemo}
            onResetAll={handleResetAll}
          />
        )}
      </main>

      {/* Barre de navigation fixe en bas sur mobile */}
      <nav
        aria-label="Menu mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-safe shadow-lg"
      >
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={`flex flex-col items-center justify-center min-h-[48px] px-1 transition-colors ${
                  active
                    ? 'text-emerald-800 font-extrabold'
                    : 'text-slate-600 font-medium hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] leading-tight mt-1 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Message Annuler 8 secondes */}
      <UndoToast action={undoAction} onDismiss={() => setUndoAction(null)} />

      {/* Modales */}
      <BandeModal
        open={bandeModalOpen}
        onClose={() => {
          setBandeModalOpen(false);
          setEditingBande(null);
        }}
        initial={editingBande}
        onSave={handleSaveBande}
      />

      <MortaliteModal
        open={mortModal.open}
        onClose={() =>
          setMortModal({ open: false, bandeId: null, initial: null })
        }
        bandeNom={mortCalculs?.bande.nom || ''}
        effectifVivantEstime={mortCalculs?.effectifVivantEstime ?? 0}
        defaultDate={mortModal.defaultDate}
        initial={mortModal.initial}
        onSave={handleSaveMort}
      />

      <VenteModal
        open={venteModal.open}
        onClose={() =>
          setVenteModal({ open: false, bandeId: null, initial: null })
        }
        bandeNom={venteCalculs?.bande.nom || ''}
        effectifVivantEstime={venteCalculs?.effectifVivantEstime ?? 0}
        defaultDate={venteModal.defaultDate}
        initial={venteModal.initial}
        onSave={handleSaveVente}
      />

      <DepenseModal
        open={depenseModal.open}
        onClose={() =>
          setDepenseModal({
            open: false,
            bandeId: null,
            defaultCategorie: 'aliment',
            initial: null,
          })
        }
        bandeNom={depenseCalculs?.bande.nom || ''}
        defaultCategorie={depenseModal.defaultCategorie}
        defaultDate={depenseModal.defaultDate}
        initial={depenseModal.initial}
        onSave={handleSaveDepense}
      />

      <SortieModal
        open={sortieModal.open}
        onClose={() =>
          setSortieModal({ open: false, bandeId: null, initial: null })
        }
        bandeNom={sortieCalculs?.bande.nom || ''}
        effectifVivantEstime={sortieCalculs?.effectifVivantEstime ?? 0}
        defaultDate={sortieModal.defaultDate}
        initial={sortieModal.initial}
        onSave={handleSaveSortie}
      />

      <ComptageModal
        open={comptageModal.open}
        onClose={() =>
          setComptageModal((s) => ({ ...s, open: false, initial: null }))
        }
        bandeNom={comptageCalculs?.bande.nom || ''}
        dateISO={comptageModal.dateISO}
        vivantsEstimesCeJour={comptageModal.vivantsEstimesFinJour}
        avantArrivee={comptageModal.avantArrivee}
        initial={comptageModal.initial}
        onSave={handleSaveComptage}
        onDelete={handleDeleteComptage}
      />

      {clotureCalculs && (
        <ClotureModal
          open={Boolean(clotureBandeId)}
          onClose={() => setClotureBandeId(null)}
          calculs={clotureCalculs}
          onConfirmCloture={handleConfirmCloture}
        />
      )}

      <PaiementDetteModal
        open={Boolean(paiementDetteTarget)}
        onClose={() => setPaiementDetteTarget(null)}
        dette={paiementDetteTarget}
        onSave={handleSavePaiementDette}
      />

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        danger={confirmState.danger}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
