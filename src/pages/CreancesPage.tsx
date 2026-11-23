import React, { useMemo } from 'react';
import { Banknote } from 'lucide-react';
import { AppData } from '../types/elevage';
import {
  DetailVenteDette,
  calculerCreancesParClient,
} from '../utils/calculs';
import { formatDateFR, formatFCFA, formatNombre } from '../utils/format';

interface CreancesPageProps {
  data: AppData;
  onOpenPaiement: (dette: DetailVenteDette) => void;
}

export function CreancesPage({ data, onOpenPaiement }: CreancesPageProps) {
  const { clients, totalCreances } = useMemo(
    () => calculerCreancesParClient(data),
    [data]
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-950">
          Créances clients
        </h1>
        <p className="text-sm text-slate-600">
          Argent que vos clients doivent encore payer
        </p>
      </header>

      <section
        className={`rounded-3xl border p-5 ${
          totalCreances > 0
            ? 'bg-amber-50 border-amber-300'
            : 'bg-emerald-50 border-emerald-200'
        }`}
      >
        <p className="text-sm font-bold text-slate-800">
          Total à encaisser chez les clients
        </p>
        <p
          className={`text-4xl font-extrabold tabular-nums mt-1 ${
            totalCreances > 0 ? 'text-amber-900' : 'text-emerald-800'
          }`}
        >
          {formatFCFA(totalCreances)}
        </p>
      </section>

      {clients.length === 0 ? (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 text-center">
          <p className="text-base text-slate-700">
            Aucun client ne vous doit d’argent pour le moment. Lorsqu’une vente est payée en partie ou à crédit, elle apparaît ici.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <section
              key={client.clientNom}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950">
                    {client.clientNom}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {client.ventesImpayees.length} vente
                    {client.ventesImpayees.length > 1 ? 's' : ''} en attente
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500">
                    Total dû
                  </p>
                  <p className="text-xl font-extrabold text-amber-900 tabular-nums">
                    {formatFCFA(client.totalDu)}
                  </p>
                </div>
              </div>

              <ul className="divide-y divide-slate-200">
                {client.ventesImpayees.map((dette) => (
                  <li key={dette.vente.id} className="py-3.5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-base font-bold text-slate-950">
                          {dette.bandeNom} ·{' '}
                          {formatNombre(dette.vente.nombre)} poulets
                        </p>
                        <p className="text-sm text-slate-600 tabular-nums">
                          Vente du {formatDateFR(dette.vente.date)} · Total{' '}
                          {formatFCFA(dette.vente.montantTotal)} · Payé{' '}
                          {formatFCFA(dette.montantPaye)}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-xs font-semibold text-slate-500 block">
                          Reste dû
                        </span>
                        <span className="text-lg font-extrabold text-red-700 tabular-nums">
                          {formatFCFA(dette.resteDu)}
                        </span>
                      </div>
                    </div>

                    {dette.paiements.length > 0 && (
                      <div className="pl-3 border-l-2 border-slate-200 space-y-1">
                        {dette.paiements.map((p) => (
                          <p
                            key={p.id}
                            className="text-xs text-slate-600 tabular-nums"
                          >
                            Versement du {formatDateFR(p.date)} :{' '}
                            <span className="font-semibold text-slate-800">
                              {formatFCFA(p.montant)}
                            </span>
                            {p.note ? ` (${p.note})` : ''}
                          </p>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenPaiement(dette)}
                      className="w-full sm:w-auto min-h-[48px] px-4 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-900 active:bg-emerald-950 transition-colors"
                    >
                      <Banknote className="w-5 h-5" />
                      <span>Enregistrer un paiement</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
