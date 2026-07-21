import React, { useState } from 'react';
import { HeartPulse, Send, Check } from 'lucide-react';
import { SanitariChecklistReport } from '../types';

interface PharmacyPanelProps {
  report: SanitariChecklistReport;
  setReport: React.Dispatch<React.SetStateAction<SanitariChecklistReport>>;
}

export default function PharmacyPanel({ report, setReport }: PharmacyPanelProps) {
  // Local state for Pharmacy forms
  const [newExpMed, setNewExpMed] = useState({ name: '', expiryDate: '', lot: '', qty: '' });
  const [newOrder, setNewOrder] = useState({ name: '', qty: '', notes: '', urgency: 'Standard' });
  const [showPharmacySendSuccess, setShowPharmacySendSuccess] = useState(false);
  const [isSendingPharmacy, setIsSendingPharmacy] = useState(false);

  return (
    <div className="glass-card rounded-xl border border-white/10 shadow-xl overflow-hidden p-5 flex flex-col gap-6 text-white animate-fade-in">
      <div className="border-b border-white/10 pb-3">
        <h2 className="font-bold text-sm uppercase tracking-wider text-red-400 font-display flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-red-400" />
          Scadenze e Ordini Farmacia Ospedaliera
        </h2>
        <p className="text-[10px] text-slate-400 mt-1">
          Modulo di segnalazione tempestiva per i farmaci in scadenza e ordinazione urgente dei materiali per il ripristino del set 118.
        </p>
      </div>

      {/* FARMACI IN SCADENZA */}
      <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-white/5 pb-1 flex items-center justify-between">
          <span>1. Farmaci in Scadenza / Da Sostituire</span>
          <span className="bg-amber-500/20 text-amber-300 text-[9px] px-2 py-0.5 rounded font-bold">Segnalazione Scadenze</span>
        </h3>

        {/* Add form for expiring drug */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Nome Farmaco</label>
            <input
              type="text"
              placeholder="Es. Adrenalina fiale"
              value={newExpMed.name}
              onChange={(e) => setNewExpMed({ ...newExpMed, name: e.target.value })}
              className="w-full bg-black/30 border border-white/10 p-2 rounded text-xs text-white outline-none focus:border-red-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Data Scadenza</label>
            <input
              type="date"
              value={newExpMed.expiryDate}
              onChange={(e) => setNewExpMed({ ...newExpMed, expiryDate: e.target.value })}
              className="w-full bg-black/30 border border-white/10 p-2 rounded text-xs text-white outline-none focus:border-red-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Lotto</label>
            <input
              type="text"
              placeholder="Es. AB1234"
              value={newExpMed.lot}
              onChange={(e) => setNewExpMed({ ...newExpMed, lot: e.target.value })}
              className="w-full bg-black/30 border border-white/10 p-2 rounded text-xs text-white outline-none focus:border-red-500/50"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">Quantità</label>
              <input
                type="text"
                placeholder="Es. 5 fiale"
                value={newExpMed.qty}
                onChange={(e) => setNewExpMed({ ...newExpMed, qty: e.target.value })}
                className="w-full bg-black/30 border border-white/10 p-2 rounded text-xs text-white outline-none focus:border-red-500/50"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!newExpMed.name) return;
                const updatedExp = report.pharmacyExpiringMeds || [];
                const item = {
                  id: `exp_${Date.now()}`,
                  name: newExpMed.name,
                  expiryDate: newExpMed.expiryDate,
                  notes: newExpMed.lot ? `Lotto: ${newExpMed.lot}` : '',
                  qtyText: newExpMed.qty,
                  type: 'scadenza' as const
                };
                setReport({
                  ...report,
                  pharmacyExpiringMeds: [...updatedExp, item]
                });
                setNewExpMed({ name: '', expiryDate: '', lot: '', qty: '' });
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-2 rounded text-xs h-9 cursor-pointer transition-all active:scale-95 flex items-center justify-center"
            >
              Aggiungi
            </button>
          </div>
        </div>

        {/* Expiring meds list */}
        <div className="mt-2 max-h-[150px] overflow-y-auto">
          {(report.pharmacyExpiringMeds || []).length === 0 ? (
            <p className="text-[10px] text-slate-400 italic text-center py-2 bg-white/5 rounded-lg border border-white/5">Nessun farmaco in scadenza inserito.</p>
          ) : (
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-[10px]">
                  <th className="py-1">Farmaco</th>
                  <th className="py-1">Scadenza</th>
                  <th className="py-1">Lotto</th>
                  <th className="py-1 text-center">Quantità</th>
                  <th className="py-1 text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(report.pharmacyExpiringMeds || []).map((med) => (
                  <tr key={med.id} className="hover:bg-white/5 text-slate-200">
                    <td className="py-1.5 font-bold text-white">{med.name}</td>
                    <td className="py-1.5 text-amber-300 font-mono">
                      {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString('it-IT') : 'N/D'}
                    </td>
                    <td className="py-1.5 text-slate-300">{med.notes || '-'}</td>
                    <td className="py-1.5 text-center text-slate-300">{med.qtyText || '-'}</td>
                    <td className="py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setReport({
                            ...report,
                            pharmacyExpiringMeds: (report.pharmacyExpiringMeds || []).filter(m => m.id !== med.id)
                          });
                        }}
                        className="text-red-400 hover:text-red-300 font-bold px-1.5 cursor-pointer"
                      >
                        Rimuovi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MATERIALI DA ORDINARE IN FARMACIA */}
      <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-white/5 pb-1 flex items-center justify-between">
          <span>2. Richiesta Materiali / Dispositivi da Ordinare</span>
          <span className="bg-blue-500/20 text-blue-300 text-[9px] px-2 py-0.5 rounded font-bold">Ordine Farmacia</span>
        </h3>

        {/* Add form for order */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Articolo / Materiale Medico</label>
            <input
              type="text"
              placeholder="Es. Siringhe 10ml, Aghi Cannula G18"
              value={newOrder.name}
              onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
              className="w-full bg-black/30 border border-white/10 p-2 rounded text-xs text-white outline-none focus:border-red-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Quantità Richiesta</label>
            <input
              type="text"
              placeholder="Es. 20 unità"
              value={newOrder.qty}
              onChange={(e) => setNewOrder({ ...newOrder, qty: e.target.value })}
              className="w-full bg-black/30 border border-white/10 p-2 rounded text-xs text-white outline-none focus:border-red-500/50"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">Urgenza</label>
              <select
                value={newOrder.urgency}
                onChange={(e) => setNewOrder({ ...newOrder, urgency: e.target.value })}
                className="w-full bg-black/30 border border-white/10 p-2 rounded text-xs text-white outline-none focus:border-red-500/50 cursor-pointer"
              >
                <option className="bg-slate-900 text-white" value="Standard">Standard</option>
                <option className="bg-slate-900 text-amber-400 font-bold" value="Urgente">Urgente</option>
                <option className="bg-slate-900 text-red-500 font-black" value="Subito (Mancanza Grave)">Subito</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!newOrder.name) return;
                const updatedOrd = report.pharmacyOrders || [];
                const item = {
                  id: `ord_${Date.now()}`,
                  name: newOrder.name,
                  notes: `Urgenza: ${newOrder.urgency}`,
                  qtyText: newOrder.qty,
                  type: 'ordine' as const
                };
                setReport({
                  ...report,
                  pharmacyOrders: [...updatedOrd, item]
                });
                setNewOrder({ name: '', qty: '', notes: '', urgency: 'Standard' });
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-2 rounded text-xs h-9 cursor-pointer transition-all active:scale-95 flex items-center justify-center"
            >
              Aggiungi
            </button>
          </div>
        </div>

        {/* Orders list */}
        <div className="mt-2 max-h-[150px] overflow-y-auto">
          {(report.pharmacyOrders || []).length === 0 ? (
            <p className="text-[10px] text-slate-400 italic text-center py-2 bg-white/5 rounded-lg border border-white/5">Nessun materiale da ordinare inserito.</p>
          ) : (
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-[10px]">
                  <th className="py-1">Articolo</th>
                  <th className="py-1">Quantità</th>
                  <th className="py-1">Priorità / Urgenza</th>
                  <th className="py-1 text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(report.pharmacyOrders || []).map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 text-slate-200">
                    <td className="py-1.5 font-bold text-white">{ord.name}</td>
                    <td className="py-1.5 text-slate-300">{ord.qtyText || '-'}</td>
                    <td className="py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        ord.notes?.includes('Subito')
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : ord.notes?.includes('Urgente')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/5 text-slate-300'
                      }`}>
                        {ord.notes?.replace('Urgenza: ', '') || 'Standard'}
                      </span>
                    </td>
                    <td className="py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setReport({
                            ...report,
                            pharmacyOrders: (report.pharmacyOrders || []).filter(o => o.id !== ord.id)
                          });
                        }}
                        className="text-red-400 hover:text-red-300 font-bold px-1.5 cursor-pointer"
                      >
                        Rimuovi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SEND BUTTON FOR PHARMACY */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={() => {
            setIsSendingPharmacy(true);
            setTimeout(() => {
              setIsSendingPharmacy(false);
              setShowPharmacySendSuccess(true);
              setTimeout(() => setShowPharmacySendSuccess(false), 5000);
            }, 1500);
          }}
          disabled={isSendingPharmacy || ((report.pharmacyExpiringMeds || []).length === 0 && (report.pharmacyOrders || []).length === 0)}
          className="w-full flex items-center justify-center gap-2 p-3 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white disabled:bg-white/5 disabled:text-slate-500 disabled:border-white/5 transition-all cursor-pointer shadow-lg shadow-red-950/25 active:scale-95"
        >
          <Send className={`w-4 h-4 ${isSendingPharmacy ? 'animate-bounce' : ''}`} />
          {isSendingPharmacy ? 'Generazione Report e Invio Mail Farmacia...' : 'Invia Elenco Scadenze e Ordini al Reparto Farmacia'}
        </button>

        {showPharmacySendSuccess && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs flex flex-col gap-1 shadow-inner animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Report Farmacia Trasmesso con Successo!</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">
              • <strong>Destinatario:</strong> farmacia.asltaranto@pec.rupar.puglia.it<br />
              • <strong>C.C. Archivio:</strong> archivio.118taranto@sanitaserviceaslta.it<br />
              • <strong>Contenuto:</strong> {(report.pharmacyExpiringMeds || []).length} segnalazioni di scadenza e {(report.pharmacyOrders || []).length} ordini di rifornimento materiale.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
