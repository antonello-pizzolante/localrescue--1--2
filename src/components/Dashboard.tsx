import React, { useState } from 'react';
import { LayoutDashboard, Users, AlertTriangle, Send, Bell, CheckCircle, RefreshCw, Eye, Download, ShieldAlert, Clock, CloudOff } from 'lucide-react';
import { CrewStatus, DeadlineNotification, AutistiChecklistReport, SanitariChecklistReport } from '../types';
import { ScadenzeMezzi } from './ScadenzeMezzi';
import { KmTotaliGrafico } from './KmTotaliGrafico';
import { MOCK_CREW_STATUSES, INITIAL_DEADLINE_NOTIFICATIONS } from '../data';

interface DashboardProps {
  autistiReports: AutistiChecklistReport[];
  sanitariReports: SanitariChecklistReport[];
  onSelectAutistiReport: (report: AutistiChecklistReport) => void;
  onSelectSanitariReport: (report: SanitariChecklistReport) => void;
}

export default function Dashboard({ autistiReports, sanitariReports, onSelectAutistiReport, onSelectSanitariReport }: DashboardProps) {
  const [crews, setCrews] = useState<CrewStatus[]>(MOCK_CREW_STATUSES);
  const [notifications, setNotifications] = useState<DeadlineNotification[]>(INITIAL_DEADLINE_NOTIFICATIONS);
  const [newNotifText, setNewNotifText] = useState('');
  const [newNotifSeverity, setNewNotifSeverity] = useState<'high' | 'medium' | 'info'>('medium');

  // Add simulated push notification
  const handleAddNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifText.trim()) return;

    const newNotif: DeadlineNotification = {
      id: `not_${Date.now()}`,
      title: 'Nuova Notifica Turno',
      description: newNotifText.trim(),
      type: 'mancata_compilazione',
      severity: newNotifSeverity,
      dueDate: 'Immediata',
      targetRole: 'all'
    };

    setNotifications([newNotif, ...notifications]);
    setNewNotifText('');
  };

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Helper to translate statuses to badges
  const getStatusBadge = (status: 'pending' | 'ok' | 'anomalia') => {
    switch (status) {
      case 'ok':
        return <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">● CONFORME</span>;
      case 'anomalia':
        return <span className="bg-red-500/15 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">▲ ANOMALIA</span>;
      default:
        return <span className="bg-white/5 text-slate-400 border border-white/5 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">○ IN ATTESA</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 pb-12">
      {/* STATS COUNTER GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Crews */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Equipaggi Attivi</span>
            <span className="text-2xl font-black text-white">{crews.length + 1}</span>
            <span className="block text-[9px] text-emerald-400 font-semibold mt-0.5">● Connessi in tempo reale</span>
          </div>
        </div>

        {/* Anomalies */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Anomalie Rilevate</span>
            <span className="text-2xl font-black text-white">2</span>
            <span className="block text-[9px] text-red-400 font-semibold mt-0.5">Risoluzione in loco richiesta</span>
          </div>
        </div>

        {/* Transmission Mail PEC */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invii PEC / Mail 118</span>
            <span className="text-2xl font-black text-white">
              {autistiReports.filter(r => r.pecSent).length + sanitariReports.filter(r => r.pecSent).length + 4}
            </span>
            <span className="block text-[9px] text-emerald-400 font-semibold mt-0.5">✓ Ricevuta registrata</span>
          </div>
        </div>

        {/* Active notifications */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notifiche Scadenza</span>
            <span className="text-2xl font-black text-white">{notifications.length}</span>
            <span className="block text-[9px] text-slate-400 font-semibold mt-0.5 font-sans">Prossimi 30 giorni</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CREWS PROGRESS CRUSCOTTO - 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-4 bg-white/5 border-b border-white/10 text-white flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5 font-display">
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  Stato Avanzamento Equipaggi 118 (Cruscotto)
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Monitoraggio in tempo reale dei turni e delle firme digitali dei responsabili in loco</p>
              </div>
              <button
                onClick={() => setCrews([...crews])}
                className="p-1.5 hover:bg-white/10 rounded transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* Active Crew (Current Ambulance from user's workspace session) */}
              <div className="p-4 rounded-xl bg-black/25 border border-dashed border-white/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Mio Equipaggio</span>
                    <h3 className="font-bold text-white text-sm mt-1">Mezzo Corrente (TA-01)</h3>
                    <p className="text-[10px] text-slate-400">Postazione: INDIA CENTRO | TARANTO CENTRO</p>
                  </div>
                  <span className="text-[10px] text-cyan-300 font-bold bg-white/5 p-1 px-2.5 rounded-lg border border-white/10 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> Turno Corrente
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5 text-xs">
                  {/* Autisti Check status */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Checklist Autisti (Carrozzeria/Mezzo):</span>
                    <div className="flex gap-1.5">
                      <div className="flex flex-col items-center flex-1 bg-black/30 p-1.5 rounded border border-white/5">
                        <span className="text-[9px] text-slate-400 font-bold">1° T</span>
                        <span className="text-[10px] text-emerald-400 font-bold mt-1">CONFORME</span>
                      </div>
                      <div className="flex flex-col items-center flex-1 bg-black/30 p-1.5 rounded border border-white/5">
                        <span className="text-[9px] text-slate-400 font-bold">2° T</span>
                        <span className="text-[10px] text-slate-400 mt-1">PENDING</span>
                      </div>
                      <div className="flex flex-col items-center flex-1 bg-black/30 p-1.5 rounded border border-white/5">
                        <span className="text-[9px] text-slate-500 font-bold">3° T</span>
                        <span className="text-[10px] text-slate-600 mt-1">ATTESA</span>
                      </div>
                    </div>
                  </div>

                  {/* Sanitari check status */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Checklist Sanitari (FARMACI/PRESIDI):</span>
                    <div className="flex gap-1.5">
                      <div className="flex flex-col items-center flex-1 bg-black/30 p-1.5 rounded border border-white/5">
                        <span className="text-[9px] text-slate-400 font-bold">MAT</span>
                        <span className="text-[10px] text-emerald-400 font-bold mt-1">CONFORME</span>
                      </div>
                      <div className="flex flex-col items-center flex-1 bg-black/30 p-1.5 rounded border border-white/5">
                        <span className="text-[9px] text-slate-400 font-bold">POM</span>
                        <span className="text-[10px] text-slate-400 mt-1">PENDING</span>
                      </div>
                      <div className="flex flex-col items-center flex-1 bg-black/30 p-1.5 rounded border border-white/5">
                        <span className="text-[9px] text-slate-500 font-bold">NOT</span>
                        <span className="text-[10px] text-slate-600 mt-1">ATTESA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other active Crews */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Altri Equipaggi Monitorati:</span>
                
                {crews.map((crew) => (
                  <div key={crew.crewId} className="p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{crew.vehicleCode}</span>
                        <span className="text-slate-500">|</span>
                        <span className="font-medium text-slate-300">{crew.stationName}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Assegnazione: {crew.assignedServiceStation}</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {/* Driver shifts */}
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Checklist Autisti:</span>
                        <div className="flex gap-1">
                          {getStatusBadge(crew.autistiStatus.turn1)}
                          {getStatusBadge(crew.autistiStatus.turn2)}
                          {getStatusBadge(crew.autistiStatus.turn3)}
                        </div>
                      </div>

                      {/* Sanitary shifts */}
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 tracking-wider mb-1 uppercase">Checklist Sanitari:</span>
                        <div className="flex gap-1">
                          {getStatusBadge(crew.sanitariStatus.mat)}
                          {getStatusBadge(crew.sanitariStatus.pom)}
                          {getStatusBadge(crew.sanitariStatus.not)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CHILOMETRI GRAFICO */}
          <KmTotaliGrafico />

          {/* STORED COMPILATIONS ARCHIVE */}
          <div className="glass-card rounded-2xl border border-white/10 shadow-xl overflow-hidden mt-6">
            <div className="p-4 bg-white/5 border-b border-white/10">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider font-display">
                Archivio Locale Checklist Compilate Oggi
              </h3>
            </div>
            
            <div className="p-4 flex flex-col gap-2">
              {autistiReports.length === 0 && sanitariReports.length === 0 ? (
                <div className="p-6 text-center text-slate-400 italic text-xs">
                  Nessun referto compilato per oggi in questa postazione. Inizia ad accedere ad una delle schede.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {autistiReports.map(r => (
                    <div key={r.id} className="p-3 bg-black/20 rounded-xl border border-white/10 flex items-center justify-between text-xs relative overflow-hidden">
                      {/* Offline Pending Indicator */}
                      {!r.isSynced && (
                        <div className="absolute top-0 right-0 left-0 h-0.5 bg-amber-500/50">
                          <div className="h-full bg-amber-400 animate-pulse w-full"></div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[9px] font-bold p-0.5 px-2 rounded-full uppercase">Autista Soccorritore</span>
                          {!r.isSynced && (
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                              <CloudOff className="w-2.5 h-2.5" />
                              In attesa di sync
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white mt-1">Checklist - {r.date}</h4>
                        <p className="text-[10px] text-slate-400">Firme: {Object.keys(r.signatures).length}/3 Turni</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectAutistiReport(r)}
                          className="p-1.5 text-cyan-300 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all cursor-pointer"
                          title="Visualizza e Modifica"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {sanitariReports.map(r => (
                    <div key={r.id} className="p-3 bg-black/20 rounded-xl border border-white/10 flex items-center justify-between text-xs relative overflow-hidden">
                      {/* Offline Pending Indicator */}
                      {!r.isSynced && (
                        <div className="absolute top-0 right-0 left-0 h-0.5 bg-amber-500/50">
                          <div className="h-full bg-amber-400 animate-pulse w-full"></div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-500/10 text-red-300 border border-red-500/20 text-[9px] font-bold p-0.5 px-2 rounded-full uppercase">Sanitario 118</span>
                          {!r.isSynced && (
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                              <CloudOff className="w-2.5 h-2.5" />
                              In attesa di sync
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white mt-1">Checklist - {r.date}</h4>
                        <p className="text-[10px] text-slate-400">Firme: {Object.keys(r.signatures).length}/3 Turni</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectSanitariReport(r)}
                          className="p-1.5 text-cyan-300 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all cursor-pointer"
                          title="Visualizza e Modifica"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PUSH NOTIFICATIONS & DEADLINES - 4 Columns */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 font-display">
                <Bell className="w-5 h-5 text-amber-400 animate-swing" />
                Scadenze Imminenti (Push)
              </h3>
              <span className="bg-amber-500/15 text-amber-300 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {notifications.length} ATTIVE
              </span>
            </div>

            {/* List of push notifications */}
            <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center p-6 text-slate-500 italic text-xs">
                  Nessuna notifica o scadenza di presidio attiva!
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border flex flex-col gap-1.5 relative group transition-all ${
                      n.severity === 'high'
                        ? 'bg-red-500/10 border-red-500/30 text-white hover:bg-red-500/15'
                        : n.severity === 'medium'
                        ? 'bg-amber-500/10 border-amber-500/30 text-white hover:bg-amber-500/15'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-white text-xs pr-4 flex items-center gap-1.5 font-display">
                        {n.severity === 'high' && <ShieldAlert className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                        {n.title}
                      </h4>
                      <button
                        onClick={() => clearNotification(n.id)}
                        className="text-slate-400 hover:text-white text-[10px] font-bold p-0.5 rounded opacity-100 md:opacity-0 group-hover:opacity-100 transition-all absolute top-2 right-2 cursor-pointer"
                      >
                        × Accetta
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-normal">{n.description}</p>
                    <div className="flex items-center justify-between text-[8.5px] font-bold uppercase tracking-wider text-slate-400 pt-1 border-t border-white/5">
                      <span>Ruolo: {n.targetRole.toUpperCase()}</span>
                      <span className={n.severity === 'high' ? 'text-red-400' : 'text-slate-400'}>Scade: {n.dueDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Simulated Push Notification Trigger Creator */}
            <form onSubmit={handleAddNotification} className="mt-3 pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulatore Push Notification:</span>
              <input
                type="text"
                value={newNotifText}
                onChange={(e) => setNewNotifText(e.target.value)}
                placeholder="Es: Mancano aghi cannula 20G nel turno..."
                className="w-full text-xs p-2.5 bg-black/20 text-white border border-white/10 rounded-lg outline-none focus:border-amber-500/50 placeholder-slate-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newNotifSeverity}
                  onChange={(e: any) => setNewNotifSeverity(e.target.value)}
                  className="text-xs p-2 bg-black/25 text-slate-300 border border-white/10 rounded outline-none cursor-pointer"
                >
                  <option className="bg-slate-950 text-white" value="high">Alta Priorità</option>
                  <option className="bg-slate-950 text-white" value="medium">Media Priorità</option>
                  <option className="bg-slate-950 text-white" value="info">Informativa</option>
                </select>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-all shadow-lg shadow-amber-950/20 flex items-center justify-center cursor-pointer"
                >
                  Genera Push Alert
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* SCADENZE MEZZI SECTION */}
      <div className="mt-8">
        <h2 className="text-xl font-black text-white tracking-tight font-display flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-cyan-400" />
          Scadenze e Revisioni Mezzi
        </h2>
        <ScadenzeMezzi />
      </div>

    </div>
  );
}
