import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Database,
  Download,
  FileSpreadsheet,
  Trash2,
  Upload,
} from 'lucide-react';
import { AppData } from '../types/elevage';
import {
  genererCSVBande,
  telechargerFichier,
  validerEtNormaliserDonnees,
} from '../data/storage';
import { doitRappelerSauvegarde } from '../utils/calculs';
import { formatDateFR, getTodayISO } from '../utils/format';

interface ParametresPageProps {
  data: AppData;
  onBackupDone: () => void;
  onImportData: (newData: AppData) => void;
  onLoadDemo: () => void;
  onResetAll: () => void;
}

export function ParametresPage({
  data,
  onBackupDone,
  onImportData,
  onLoadDemo,
  onResetAll,
}: ParametresPageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedBandeCsvId, setSelectedBandeCsvId] = useState<string>(
    data.bandes[0]?.id || ''
  );
  const [feedback, setFeedback] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  const todayISO = getTodayISO();
  const rappel = doitRappelerSauvegarde(data, todayISO);

  const effectiveCsvBandeId =
    data.bandes.find((b) => b.id === selectedBandeCsvId)?.id ||
    data.bandes[0]?.id ||
    '';

  const handleExportJSON = () => {
    const payload: AppData = {
      ...data,
      lastBackupDate: todayISO,
    };
    const json = JSON.stringify(payload, null, 2);
    const nomFichier = `elevage-sauvegarde-${formatDateFR(todayISO).replace(
      /\//g,
      '-'
    )}.json`;
    telechargerFichier(json, nomFichier, 'application/json;charset=utf-8');
    onBackupDone();
    setFeedback({
      type: 'ok',
      text: `Sauvegarde téléchargée (${nomFichier}). Conservez ce fichier en lieu sûr.`,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const validData = validerEtNormaliserDonnees(parsed);
      onImportData(validData);
      setFeedback({
        type: 'ok',
        text: `Sauvegarde importée avec succès (${validData.bandes.length} bande(s)).`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text:
          err instanceof Error
            ? err.message
            : 'Impossible de lire ce fichier de sauvegarde.',
      });
    }
  };

  const handleExportCSV = () => {
    if (!effectiveCsvBandeId) return;
    const bande = data.bandes.find((b) => b.id === effectiveCsvBandeId);
    if (!bande) return;
    const csv = genererCSVBande(bande.id, data);
    const safeName = bande.nom
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '');
    telechargerFichier(
      csv,
      `bande-${safeName || 'export'}.csv`,
      'text/csv;charset=utf-8'
    );
    setFeedback({
      type: 'ok',
      text: `Tableau CSV de « ${bande.nom} » téléchargé.`,
    });
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-950">
          Paramètres et sauvegardes
        </h1>
        <p className="text-sm text-slate-600">
          Toutes vos données restent enregistrées sur votre téléphone, même sans internet.
        </p>
      </header>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
          role="status"
        >
          {feedback.text}
        </div>
      )}

      {rappel && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-950">
            <p className="font-bold">Rappel de sauvegarde</p>
            <p className="mt-0.5">
              {data.lastBackupDate
                ? `Votre dernière sauvegarde date du ${formatDateFR(
                    data.lastBackupDate
                  )} (plus de 7 jours).`
                : 'Vous n’avez encore fait aucune sauvegarde de vos données.'}{' '}
              Téléchargez une copie JSON pour ne rien perdre si vous changez de téléphone.
            </p>
          </div>
        </div>
      )}

      {/* Sauvegarde & Restauration JSON */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Sauvegarde complète (JSON)
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Dernière sauvegarde :{' '}
            <span className="font-semibold text-slate-900">
              {data.lastBackupDate
                ? formatDateFR(data.lastBackupDate)
                : 'Jamais enregistrée'}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="min-h-[52px] px-4 rounded-xl bg-emerald-800 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-emerald-900 active:bg-emerald-950 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Exporter en JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[52px] px-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-base flex items-center justify-center gap-2 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Importer une sauvegarde</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </section>

      {/* Export CSV par bande */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Exporter une bande en tableau (CSV)
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Ouvrez le bilan détaillé et les mouvements d’une bande dans Excel ou sur ordinateur.
          </p>
        </div>

        {data.bandes.length === 0 ? (
          <p className="text-sm text-slate-600">
            Créez d’abord une bande pour pouvoir l’exporter en CSV.
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={effectiveCsvBandeId}
              onChange={(e) => setSelectedBandeCsvId(e.target.value)}
              aria-label="Choisir une bande à exporter"
              className="flex-1 min-h-[52px] px-3.5 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              {data.bandes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nom} ({b.statut === 'cloturee' ? 'Clôturée' : 'En cours'})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExportCSV}
              className="min-h-[52px] px-5 rounded-xl bg-slate-900 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-slate-800 shrink-0"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Exporter en CSV</span>
            </button>
          </div>
        )}
      </section>

      {/* Demonstration & Reinitialisation */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Données d’essai et remise à zéro
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onLoadDemo}
            className="min-h-[52px] px-4 rounded-xl border border-slate-300 bg-slate-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
          >
            <Database className="w-5 h-5" />
            <span>Charger des données de démonstration</span>
          </button>

          <button
            type="button"
            onClick={onResetAll}
            className="min-h-[52px] px-4 rounded-xl border border-red-300 bg-red-50 text-red-800 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Effacer toutes les données</span>
          </button>
        </div>
      </section>
    </div>
  );
}
