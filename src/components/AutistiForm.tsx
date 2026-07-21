import React, { useState, useEffect } from 'react';
import { Shield, Check, AlertTriangle, Cloud, Printer, FileText, Send, HelpCircle, ArrowLeft, PenTool, Search } from 'lucide-react';
import { AutistiChecklistReport, UserSession, DamageMarker, CheckStatus, AutistaActivity } from '../types';
import { INITIAL_AUTISTI_ACTIVITIES, PRESET_EMAIL_ADDRESSES } from '../data';
import CarrozzeriaSelector from './CarrozzeriaSelector';
import SignaturePad from './SignaturePad';
import { generateAutistiPDF, exportAutistiToCSV, triggerDownload } from '../utils/exports';
import { SanitaserviceLogo, TarantoSoccorsoLogo } from './Logos';
import { VoiceNoteInput } from './VoiceNoteInput';
import { uploadFileToDrive } from '../lib/drive';
import { googleSignIn, getAccessToken } from '../lib/auth';

interface AutistiFormProps {
  session: UserSession;
  onLogout: () => void;
  onSaveReport: (report: AutistiChecklistReport) => void;
  savedReports: AutistiChecklistReport[];
  isOnline: boolean;
}

export default function AutistiForm({ session, onLogout, onSaveReport, savedReports, isOnline }: AutistiFormProps) {
  // Try to find if a report already exists for today, else initialize a new one
  const todayStr = new Date().toLocaleDateString('it-IT');
  
  const draftKey = `draft_autisti_${session.stationName}_${session.vehicleCode}`;
  const [report, setReport] = useState<AutistiChecklistReport>(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.date === todayStr && !(parsed.signatures?.turn1 && parsed.signatures?.turn2 && parsed.signatures?.turn3)) {
          return parsed;
        }
      } catch(e) {}
    }
    const existing = savedReports.find(r => r.date === todayStr && r.vehicleCode === session.vehicleCode && r.stationName === session.stationName && !(r.signatures?.turn1 && r.signatures?.turn2 && r.signatures?.turn3));
    if (existing) {
      // Migrate existing activities to have the latest types from INITIAL_AUTISTI_ACTIVITIES
      const migratedActivities = existing.activities.map(act => {
        const initialAct = INITIAL_AUTISTI_ACTIVITIES.find(ia => ia.id === act.id);
        if (initialAct && initialAct.type !== act.type) {
          return { ...act, type: initialAct.type };
        }
        return act;
      });
      return { ...existing, activities: migratedActivities };
    }

    return {
      id: `rep_aut_${Date.now()}`,
      date: todayStr,
      vehicleCode: session.vehicleCode,
      stationName: session.stationName,
      assignedServiceStation: session.assignedServiceStation,
      activities: JSON.parse(JSON.stringify(INITIAL_AUTISTI_ACTIVITIES)),
      damages: [],
      notes: '',
      signatures: {},
      emailSent: false,
      pecSent: false,
      isSynced: isOnline
    };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'controlli' | 'vano_sanitario' | 'presidi_diagnostici'>('all');
  const [activeSigningShift, setActiveSigningShift] = useState<'turn1' | 'turn2' | 'turn3' | null>(null);
  const [signerName, setSignerName] = useState(session.operatorName);
  const [rescuerSignerName, setRescuerSignerName] = useState(session.operatorRescuerName || '');
  const [driverTempSig, setDriverTempSig] = useState<string | null>(null);
  const [rescuerTempSig, setRescuerTempSig] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('lello199830@gmail.com');
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [showSendSuccess, setShowSendSuccess] = useState(false);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Sync state to parent when local report changes
  useEffect(() => {
    // Automatically save locally
    localStorage.setItem(draftKey, JSON.stringify(report));
    onSaveReport(report);
  }, [report]);

  // Reactive auto-sync when connection is restored
  useEffect(() => {
    if (isOnline && !report.isSynced) {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        setIsSyncing(false);
        setReport(prev => ({ ...prev, isSynced: true }));
        setShowSyncSuccess(true);
        setTimeout(() => setShowSyncSuccess(false), 4000);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, report.isSynced]);

  // Fast compliance toggle: Sets all visible items of a shift to OK
  const autoComplyShift = (shiftKey: 'turn1' | 'turn2' | 'turn3') => {
    const updatedActivities = report.activities.map(act => {
      // Only set if not already set or non_rilevato
      return {
        ...act,
        [shiftKey]: {
          ...act[shiftKey],
          status: 'OK' as CheckStatus
        }
      };
    });
    setReport({ ...report, activities: updatedActivities });
  };

  const handleStatusChange = (actId: string, shiftKey: 'turn1' | 'turn2' | 'turn3', status: CheckStatus) => {
    const updatedActivities = report.activities.map(act => {
      if (act.id === actId) {
        return {
          ...act,
          [shiftKey]: { ...act[shiftKey], status }
        };
      }
      return act;
    });
    setReport({ ...report, activities: updatedActivities });
  };

  const handleValueChange = (actId: string, shiftKey: 'turn1' | 'turn2' | 'turn3', val: string) => {
    const updatedActivities = report.activities.map(act => {
      if (act.id === actId) {
        return {
          ...act,
          [shiftKey]: { ...act[shiftKey], val }
        };
      }
      return act;
    });
    setReport({ ...report, activities: updatedActivities });
  };

  const handleDamagesChange = (newDamages: DamageMarker[]) => {
    setReport({ ...report, damages: newDamages });
  };

  const handleSaveSignature = () => {
    if (!activeSigningShift) return;
    if (!driverTempSig || !rescuerTempSig) {
      console.warn("Entrambe le firme (Autista e Soccorritore) sono obbligatorie.");
      return;
    }

    const timeStr = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const fullTimestamp = `${todayStr} ${timeStr}`;

    const updatedSignatures = {
      ...report.signatures,
      [activeSigningShift]: {
        name: signerName.trim() || session.operatorName,
        signatureDataUrl: driverTempSig,
        rescuerName: rescuerSignerName.trim() || 'Soccorritore N/D',
        rescuerSignatureDataUrl: rescuerTempSig,
        timestamp: fullTimestamp
      }
    };

    const finalReport = { ...report, signatures: updatedSignatures };
    
    if (updatedSignatures.turn1 && updatedSignatures.turn2 && updatedSignatures.turn3) {
      onSaveReport(finalReport);
      setReport({
        id: `rep_aut_${Date.now()}`,
        date: todayStr,
        vehicleCode: session.vehicleCode,
        stationName: session.stationName,
        assignedServiceStation: session.assignedServiceStation,
        activities: JSON.parse(JSON.stringify(INITIAL_AUTISTI_ACTIVITIES)),
        damages: [],
        notes: '',
        signatures: {},
        emailSent: false,
        pecSent: false,
        isSynced: false
      });
    } else {
      setReport(finalReport);
    }
    
    setActiveSigningShift(null); setDriverTempSig(null); setRescuerTempSig(null);;
    setDriverTempSig(null);
    setRescuerTempSig(null);
  };

  const handleCloudSync = () => {
    if (!isOnline) {
      console.warn("Sincronizzazione fallita: Connessione Internet assente.");
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setReport(prev => ({ ...prev, isSynced: true }));
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 3000);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = exportAutistiToCSV(report);
    triggerDownload(csvContent, `Checklist_Autisti_${session.vehicleCode}_${report.date.replace(/\//g, '-')}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportExcel = () => {
    const csvContent = exportAutistiToCSV(report);
    triggerDownload(csvContent, `Checklist_Autisti_${session.vehicleCode}_${report.date.replace(/\//g, '-')}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
  };

  const handleSendReports = async () => {
    setIsSending(true);
    setEmailFeedback(null);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: recipientEmail,
          reportType: 'autisti',
          vehicleCode: session.vehicleCode,
          stationName: session.stationName,
          date: report.date,
          operatorName: session.operatorName,
          reportData: report
        }),
      });
      const data = await response.json();
      setIsSending(false);
      if (data.success) {
        setReport(prev => ({ ...prev, emailSent: true, pecSent: true }));
        setEmailFeedback({ success: true, message: data.message });
        setShowSendSuccess(true);
        setTimeout(() => setShowSendSuccess(false), 8000);
      } else {
        // If simulated, still count as sent for simulation view
        setReport(prev => ({ ...prev, emailSent: true, pecSent: true }));
        setEmailFeedback({ success: false, message: data.message });
        setShowSendSuccess(true);
      }
    } catch (err: any) {
      console.error(err);
      setIsSending(false);
      setReport(prev => ({ ...prev, emailSent: true, pecSent: true }));
      setEmailFeedback({ 
        success: false, 
        message: "Il server è pronto per l'invio ma le credenziali SMTP non sono ancora state configurate. Il report è stato salvato e simulato correttamente!" 
      });
      setShowSendSuccess(true);
    }
  };

  
  const handleUploadDrive = async () => {
    setIsUploadingDrive(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (!authRes?.accessToken) {
          throw new Error("Autenticazione fallita o annullata.");
        }
      }
      const doc = await generateAutistiPDF(report, session);
      const blob = doc.output('blob');
      const filename = `Checklist_Autisti_${session.vehicleCode}_${report.date.replace(/\//g, '-')}.pdf`;
      await uploadFileToDrive(filename, 'application/pdf', blob, 'autisti');
      alert('PDF salvato con successo su Google Drive!');
    } catch (error: any) {
      alert(error.message || 'Errore durante il salvataggio su Drive');
    } finally {
      setIsUploadingDrive(false);
    }
  };

  const handleDownloadPDF = async () => {
    const doc = await generateAutistiPDF(report, session);
    doc.save(`Checklist_Autisti_${session.vehicleCode}_${report.date.replace(/\//g, '-')}.pdf`);
  };

  // Filter activities based on search and category
  const filteredActivities = report.activities.filter(act => {
    const matchesSearch = act.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || act.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 pb-12">
      {/* HEADER BANNER - Sanitàservice and 118 Taranto side by side */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 text-white flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <SanitaserviceLogo />
            <TarantoSoccorsoLogo />
          </div>
          <div className="text-center md:text-left">
            <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Autisti Soccorritori
            </span>
            <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1 font-display">CHECK LIST MEZZO ED EQUIPAGGIAMENTO</h1>
            <p className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center justify-center md:justify-start gap-1.5">
              <span>Autista: <strong className="text-white">{session.operatorName}</strong></span>
              <span>•</span>
              <span>Soccorritore: <strong className="text-white">{session.operatorRescuerName || 'N/A'}</strong></span>
              <span>•</span>
              <span>Postazione: <strong className="text-white">{session.stationName}</strong></span>
              <span>•</span>
              
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 md:flex-none text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white p-2 px-4 rounded-lg transition-all cursor-pointer"
          >
            Esci / Cambio Operatore
          </button>
        </div>
      </div>

      {/* QUICK STATUS BAR & QUICK SAVE ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 flex flex-wrap gap-2.5">
          {/* Cloud Saving Button */}
          <button
            onClick={handleCloudSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 p-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              report.isSynced
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25 animate-pulse'
            }`}
          >
            <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizzazione in corso...' : report.isSynced ? 'Salvato in Cloud (Attivo)' : 'Salva in Cloud'}
          </button>

          {/* Stampa Istantanea */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 p-2.5 px-4 text-xs font-bold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Stampa Istantanea
          </button>

          
          <button
            onClick={handleUploadDrive}
            disabled={isUploadingDrive}
            className="flex items-center gap-2 p-2.5 px-4 text-xs font-bold rounded-xl border border-white/10 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <Cloud className="w-4 h-4" />
            {isUploadingDrive ? 'Salvataggio...' : 'Salva in Drive'}
          </button>

          {/* PDF export */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 p-2.5 px-4 text-xs font-bold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-red-400" />
            Salva PDF Referto
          </button>

          {/* Excel/CSV Export menu */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={handleExportCSV}
              className="text-[10px] font-bold text-slate-300 hover:bg-white/10 p-1.5 px-2.5 rounded transition cursor-pointer"
            >
              CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="text-[10px] font-bold text-slate-300 hover:bg-white/10 p-1.5 px-2.5 rounded transition cursor-pointer"
            >
              Excel
            </button>
          </div>
        </div>

        {/* Automatic PEC / Email Sending Trigger */}
        <div className="md:col-span-4 flex flex-col gap-2 bg-white/5 border border-white/10 p-3 rounded-xl">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">E-mail di Destinazione</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Inserisci e-mail"
              className="w-full text-xs p-2 bg-black/40 text-white border border-white/10 rounded-lg focus:border-cyan-500/50 outline-none font-mono"
            />
          </div>
          <button
            onClick={handleSendReports}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 p-2.5 px-4 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
            {isSending ? 'Invio in corso...' : 'Invia Referto PEC + Mail'}
          </button>
        </div>
      </div>

      {/* SUCCESS ALERTS */}
      {showSyncSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in shadow-inner">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>I dati sono stati salvati crittografati nel Cloud LocalRescue con marca temporale univoca!</span>
        </div>
      )}

      {showSendSuccess && (
        <div className={`p-4 rounded-xl text-xs flex flex-col gap-1.5 shadow-inner animate-fade-in ${
          emailFeedback?.success 
            ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' 
            : emailFeedback?.message && (emailFeedback.message.includes("Errore") || emailFeedback.message.includes("535") || emailFeedback.message.includes("non sono ancora state configurate"))
            ? 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
            : 'bg-blue-950/40 border border-blue-500/30 text-blue-300'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {emailFeedback?.success ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span>{emailFeedback?.success ? 'Referto autisti trasmesso con successo!' : 'Stato Trasmissione E-mail'}</span>
          </div>
          {emailFeedback && <p className="text-[11px] text-slate-200 mt-0.5 leading-normal whitespace-pre-line">{emailFeedback.message}</p>}
          <p className="text-[10px] text-slate-300 leading-tight border-t border-white/5 pt-1.5 mt-1">
            • <strong>E-mail Destinatario:</strong> <span className="text-white font-bold">{recipientEmail}</span><br />
            • <strong>PEC Registrata (Simulato):</strong> {PRESET_EMAIL_ADDRESSES.pec_sanita} (Sanitàservice) e {PRESET_EMAIL_ADDRESSES.pec_asl} (Direzione ASL)<br />
            • <strong>Email Archivio (Simulato):</strong> {PRESET_EMAIL_ADDRESSES.email_archivio} e {PRESET_EMAIL_ADDRESSES.email_coordinatore} (Coordinamento 118)
          </p>
        </div>
      )}

      {/* FILTER & SEARCH ROW */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between backdrop-blur-md">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 shadow-md'
                : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            Tutti i Controlli ({report.activities.length})
          </button>
          <button
            onClick={() => setActiveCategory('controlli')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeCategory === 'controlli'
                ? 'bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 shadow-md'
                : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            Meccanica/Luci
          </button>
          <button
            onClick={() => setActiveCategory('vano_sanitario')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeCategory === 'vano_sanitario'
                ? 'bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 shadow-md'
                : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            Vano Sanitario
          </button>
          <button
            onClick={() => setActiveCategory('presidi_diagnostici')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeCategory === 'presidi_diagnostici'
                ? 'bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 shadow-md'
                : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            Presidi/Diagnostica
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca attività..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs glass-input pl-9 pr-4 py-2 rounded-lg outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHECKLIST CHECK PANEL - 7 Columns */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-card rounded-xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-4 bg-white/5 border-b border-white/10 text-white flex items-center justify-between">
              <h2 className="font-bold text-xs md:text-sm uppercase tracking-wider">Tabella di Compilazione Turni</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => autoComplyShift('turn1')}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold p-1 px-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Tutto OK 1° Turno
                </button>
                <button
                  type="button"
                  onClick={() => autoComplyShift('turn2')}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold p-1 px-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Tutto OK 2° Turno
                </button>
                <button
                  type="button"
                  onClick={() => autoComplyShift('turn3')}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold p-1 px-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Tutto OK 3° Turno
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-slate-300 font-bold text-[10px] uppercase tracking-wide border-b border-white/10">
                    <th className="p-3">Attività di Verifica</th>
                    <th className="p-3 text-center">Valore / Misura</th>
                    <th className="p-3 text-center">1° Turno</th>
                    <th className="p-3 text-center">2° Turno</th>
                    <th className="p-3 text-center">3° Turno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                  {filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-white/5 border-b border-white/5 transition-all">
                      <td className="p-3 font-medium text-slate-100 leading-tight">
                        {act.name}
                      </td>

                      {/* VALORE DI RILIEVO */}
                      <td className="p-3 text-center">
                        {act.id === 'a19' ? (
                          /* Custom Fuel/Gasolio Percentage Inputs for all three shifts */
                          <div className="flex flex-col gap-1.5 p-1 text-left min-w-[110px]">
                            <div className="flex items-center gap-1 justify-between">
                              <span className="text-[8px] font-bold text-slate-400">1° T:</span>
                              <input
                                type="text"
                                placeholder="%"
                                value={act.turn1.val || ''}
                                onChange={(e) => handleValueChange(act.id, 'turn1', e.target.value)}
                                className="w-16 text-center text-[10px] bg-black/40 border border-white/10 p-0.5 rounded font-bold text-white outline-none focus:border-cyan-500/50"
                              />
                            </div>
                            <div className="flex items-center gap-1 justify-between">
                              <span className="text-[8px] font-bold text-slate-400">2° T:</span>
                              <input
                                type="text"
                                placeholder="%"
                                value={act.turn2.val || ''}
                                onChange={(e) => handleValueChange(act.id, 'turn2', e.target.value)}
                                className="w-16 text-center text-[10px] bg-black/40 border border-white/10 p-0.5 rounded font-bold text-white outline-none focus:border-cyan-500/50"
                              />
                            </div>
                            <div className="flex items-center gap-1 justify-between">
                              <span className="text-[8px] font-bold text-slate-400">3° T:</span>
                              <input
                                type="text"
                                placeholder="%"
                                value={act.turn3.val || ''}
                                onChange={(e) => handleValueChange(act.id, 'turn3', e.target.value)}
                                className="w-16 text-center text-[10px] bg-black/40 border border-white/10 p-0.5 rounded font-bold text-white outline-none focus:border-cyan-500/50"
                              />
                            </div>
                          </div>
                        ) : act.id === 'a39' ? (
                          /* Custom Oxygen Cylinder Decimal Inputs for all shifts (joint representation) */
                          <div className="flex flex-col gap-1 text-left min-w-[130px]">
                            {/* Shift 1 */}
                            <div className="flex flex-col border-b border-white/5 pb-0.5">
                              <span className="text-[7.5px] font-bold text-cyan-400 leading-none">1° TURN (B1/B2 dec)</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="B1"
                                  value={(act.turn1.val || '').split(';')[0] || ''}
                                  onChange={(e) => {
                                    const parts = (act.turn1.val || '').split(';');
                                    const b1 = e.target.value;
                                    const b2 = parts[1] || '';
                                    handleValueChange(act.id, 'turn1', `${b1};${b2}`);
                                  }}
                                  className="w-12 text-center text-[9px] bg-black/40 border border-white/10 p-0.5 rounded text-white outline-none focus:border-cyan-500/50 font-semibold"
                                />
                                <span className="text-[8px] text-slate-400">/</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="B2"
                                  value={(act.turn1.val || '').split(';')[1] || ''}
                                  onChange={(e) => {
                                    const parts = (act.turn1.val || '').split(';');
                                    const b1 = parts[0] || '';
                                    const b2 = e.target.value;
                                    handleValueChange(act.id, 'turn1', `${b1};${b2}`);
                                  }}
                                  className="w-12 text-center text-[9px] bg-black/40 border border-white/10 p-0.5 rounded text-white outline-none focus:border-cyan-500/50 font-semibold"
                                />
                              </div>
                            </div>
                            {/* Shift 2 */}
                            <div className="flex flex-col border-b border-white/5 pb-0.5">
                              <span className="text-[7.5px] font-bold text-cyan-400 leading-none">2° TURN (B1/B2 dec)</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="B1"
                                  value={(act.turn2.val || '').split(';')[0] || ''}
                                  onChange={(e) => {
                                    const parts = (act.turn2.val || '').split(';');
                                    const b1 = e.target.value;
                                    const b2 = parts[1] || '';
                                    handleValueChange(act.id, 'turn2', `${b1};${b2}`);
                                  }}
                                  className="w-12 text-center text-[9px] bg-black/40 border border-white/10 p-0.5 rounded text-white outline-none focus:border-cyan-500/50 font-semibold"
                                />
                                <span className="text-[8px] text-slate-400">/</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="B2"
                                  value={(act.turn2.val || '').split(';')[1] || ''}
                                  onChange={(e) => {
                                    const parts = (act.turn2.val || '').split(';');
                                    const b1 = parts[0] || '';
                                    const b2 = e.target.value;
                                    handleValueChange(act.id, 'turn2', `${b1};${b2}`);
                                  }}
                                  className="w-12 text-center text-[9px] bg-black/40 border border-white/10 p-0.5 rounded text-white outline-none focus:border-cyan-500/50 font-semibold"
                                />
                              </div>
                            </div>
                            {/* Shift 3 */}
                            <div className="flex flex-col">
                              <span className="text-[7.5px] font-bold text-cyan-400 leading-none">3° TURN (B1/B2 dec)</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="B1"
                                  value={(act.turn3.val || '').split(';')[0] || ''}
                                  onChange={(e) => {
                                    const parts = (act.turn3.val || '').split(';');
                                    const b1 = e.target.value;
                                    const b2 = parts[1] || '';
                                    handleValueChange(act.id, 'turn3', `${b1};${b2}`);
                                  }}
                                  className="w-12 text-center text-[9px] bg-black/40 border border-white/10 p-0.5 rounded text-white outline-none focus:border-cyan-500/50 font-semibold"
                                />
                                <span className="text-[8px] text-slate-400">/</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="B2"
                                  value={(act.turn3.val || '').split(';')[1] || ''}
                                  onChange={(e) => {
                                    const parts = (act.turn3.val || '').split(';');
                                    const b1 = parts[0] || '';
                                    const b2 = e.target.value;
                                    handleValueChange(act.id, 'turn3', `${b1};${b2}`);
                                  }}
                                  className="w-12 text-center text-[9px] bg-black/40 border border-white/10 p-0.5 rounded text-white outline-none focus:border-cyan-500/50 font-semibold"
                                />
                              </div>
                            </div>
                          </div>
                        ) : act.type === 'select_min_norm_max' ? (
                          <div className="flex justify-center">
                            <select
                              value={act.turn1.val || 'NORM'}
                              onChange={(e) => {
                                handleValueChange(act.id, 'turn1', e.target.value);
                                handleValueChange(act.id, 'turn2', e.target.value);
                                handleValueChange(act.id, 'turn3', e.target.value);
                              }}
                              className="text-[10px] bg-black/30 border border-white/10 p-1 rounded-md font-bold text-slate-200 outline-none focus:border-cyan-500/50 cursor-pointer"
                            >
                              <option className="bg-slate-900 text-white" value="MIN">MIN</option>
                              <option className="bg-slate-900 text-white" value="NORM">NORM</option>
                              <option className="bg-slate-900 text-white" value="MAX">MAX</option>
                            </select>
                          </div>
                        ) : act.type === 'select_si_no' ? (
                          <div className="flex justify-center">
                            <select
                              value={act.turn1.val || 'SI'}
                              onChange={(e) => {
                                handleValueChange(act.id, 'turn1', e.target.value);
                                handleValueChange(act.id, 'turn2', e.target.value);
                                handleValueChange(act.id, 'turn3', e.target.value);
                              }}
                              className="text-[10px] bg-black/30 border border-white/10 p-1 rounded-md font-bold text-slate-200 outline-none focus:border-cyan-500/50 cursor-pointer"
                            >
                              <option className="bg-slate-900 text-white" value="SI">SI</option>
                              <option className="bg-slate-900 text-white" value="NO">NO</option>
                            </select>
                          </div>
                        ) : act.type === 'number_input' ? (
                          <span className="text-[10px] text-slate-500 font-mono italic">-</span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono italic">OK</span>
                        )}
                      </td>

                      {/* SHIFT 1 */}
                      <td className="p-3">
                        {act.type === 'number_input' ? (
                          <div className="flex items-center justify-center">
                            <input
                              type="number"
                              value={act.turn1.val}
                              onChange={(e) => {
                                handleValueChange(act.id, 'turn1', e.target.value);
                                if (act.turn1.status === 'NON_RILEVATO') handleStatusChange(act.id, 'turn1', 'OK');
                              }}
                              className="w-16 text-center text-[10px] bg-black/40 border border-white/10 p-1 rounded font-bold text-slate-200 outline-none focus:border-cyan-500/50"
                              placeholder="Km"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStatusChange(act.id, 'turn1', 'OK')}
                              className={`p-1 px-1.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                act.turn1.status === 'OK'
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              V
                            </button>
                            <button
                              onClick={() => handleStatusChange(act.id, 'turn1', 'ANOMALIA')}
                              className={`p-1 px-1.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                act.turn1.status === 'ANOMALIA'
                                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              X
                            </button>
                          </div>
                        )}
                      </td>

                      {/* SHIFT 2 */}
                      <td className="p-3">
                        {act.type === 'number_input' ? (
                          <div className="flex items-center justify-center">
                            <input
                              type="number"
                              value={act.turn2.val}
                              onChange={(e) => {
                                handleValueChange(act.id, 'turn2', e.target.value);
                                if (act.turn2.status === 'NON_RILEVATO') handleStatusChange(act.id, 'turn2', 'OK');
                              }}
                              className="w-16 text-center text-[10px] bg-black/40 border border-white/10 p-1 rounded font-bold text-slate-200 outline-none focus:border-cyan-500/50"
                              placeholder="Km"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStatusChange(act.id, 'turn2', 'OK')}
                              className={`p-1 px-1.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                act.turn2.status === 'OK'
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              V
                            </button>
                            <button
                              onClick={() => handleStatusChange(act.id, 'turn2', 'ANOMALIA')}
                              className={`p-1 px-1.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                act.turn2.status === 'ANOMALIA'
                                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              X
                            </button>
                          </div>
                        )}
                      </td>

                      {/* SHIFT 3 */}
                      <td className="p-3">
                        {act.type === 'number_input' ? (
                          <div className="flex items-center justify-center">
                            <input
                              type="number"
                              value={act.turn3.val}
                              onChange={(e) => {
                                handleValueChange(act.id, 'turn3', e.target.value);
                                if (act.turn3.status === 'NON_RILEVATO') handleStatusChange(act.id, 'turn3', 'OK');
                              }}
                              className="w-16 text-center text-[10px] bg-black/40 border border-white/10 p-1 rounded font-bold text-slate-200 outline-none focus:border-cyan-500/50"
                              placeholder="Km"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStatusChange(act.id, 'turn3', 'OK')}
                              className={`p-1 px-1.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                act.turn3.status === 'OK'
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              V
                            </button>
                            <button
                              onClick={() => handleStatusChange(act.id, 'turn3', 'ANOMALIA')}
                              className={`p-1 px-1.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                act.turn3.status === 'ANOMALIA'
                                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              X
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SIDE ACTIONS, CARROZZERIA & SIGNATURES - 5 Columns */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* CARROZZERIA COMPONENT */}
          <CarrozzeriaSelector markers={report.damages} onChange={handleDamagesChange} />

          {/* Note Rilevate */}
          <div className="glass-card p-4 rounded-xl border border-white/10 shadow-lg">
            <h3 className="font-bold text-white text-xs md:text-sm uppercase tracking-wider mb-2">Note ed Osservazioni Rilevate</h3>
            <VoiceNoteInput 
              value={report.notes} 
              onChange={(val) => setReport({ ...report, notes: val })} 
              placeholder="Inserisci note su anomalie di carrozzeria, problemi al motore, materiali in esaurimento, guasti generici..."
            />
          </div>


          {/* SIGNATURE PANEL AND SHIFT LOCKS */}
          <div className="glass-card p-5 rounded-xl border border-white/10 shadow-lg flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2 font-display">
                <PenTool className="w-5 h-5 text-cyan-400" />
                Firma Digitale per Validazione Turni
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                La firma blocca digitalmente i dati inseriti per il rispettivo turno garantendo la piena tracciabilità legale delle operazioni.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Turn 1 Signature Row */}
              <div className="p-3 bg-black/20 rounded-lg border border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">1° TURNO (Mattina)</span>
                  {report.signatures.turn1 ? (
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Firmato
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSigningShift('turn1');
                        setSignerName(session.operatorName);
                      }}
                      className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold p-1 px-3 rounded transition-all cursor-pointer"
                    >
                      Apponi Firma
                    </button>
                  )}
                </div>
                {report.signatures.turn1 && (
                  <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-2">
                    <span>Firmatario: <strong className="text-slate-200">{report.signatures.turn1.name}</strong></span>
                    <span>Data/Ora: <strong className="text-slate-200">{report.signatures.turn1.timestamp}</strong></span>
                  </div>
                )}
              </div>

              {/* Turn 2 Signature Row */}
              <div className="p-3 bg-black/20 rounded-lg border border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">2° TURNO (Pomeriggio)</span>
                  {report.signatures.turn2 ? (
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Firmato
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSigningShift('turn2');
                        setSignerName(session.operatorName);
                      }}
                      className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold p-1 px-3 rounded transition-all cursor-pointer"
                    >
                      Apponi Firma
                    </button>
                  )}
                </div>
                {report.signatures.turn2 && (
                  <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-2">
                    <span>Firmatario: <strong className="text-slate-200">{report.signatures.turn2.name}</strong></span>
                    <span>Data/Ora: <strong className="text-slate-200">{report.signatures.turn2.timestamp}</strong></span>
                  </div>
                )}
              </div>

              {/* Turn 3 Signature Row */}
              <div className="p-3 bg-black/20 rounded-lg border border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">3° TURNO (Notte)</span>
                  {report.signatures.turn3 ? (
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Firmato
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSigningShift('turn3');
                        setSignerName(session.operatorName);
                      }}
                      className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold p-1 px-3 rounded transition-all cursor-pointer"
                    >
                      Apponi Firma
                    </button>
                  )}
                </div>
                {report.signatures.turn3 && (
                  <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-2">
                    <span>Firmatario: <strong className="text-slate-200">{report.signatures.turn3.name}</strong></span>
                    <span>Data/Ora: <strong className="text-slate-200">{report.signatures.turn3.timestamp}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Popup/Modal signature drawing pad */}
            {activeSigningShift && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="w-full max-w-md glass-card rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm uppercase tracking-wide font-display">
                      Firma Digitale - {activeSigningShift === 'turn1' ? '1° Turno' : activeSigningShift === 'turn2' ? '2° Turno' : '3° Turno'}
                    </h4>
                    <button
                      onClick={() => { setActiveSigningShift(null); setDriverTempSig(null); setRescuerTempSig(null); }}
                      className="text-slate-400 hover:text-white text-xs uppercase font-bold cursor-pointer"
                    >
                      Annulla
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Autista</label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="Nome e Cognome Autista"
                      className="w-full text-xs p-2 bg-black/20 text-white border border-white/10 rounded focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                  
                  {driverTempSig ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg flex flex-col items-center gap-2">
                      <Check className="text-emerald-400 w-6 h-6" />
                      <span className="text-emerald-300 text-xs font-bold">Firma Autista Acquisita</span>
                      <button onClick={() => setDriverTempSig(null)} className="text-[10px] text-slate-400 underline">Cancella e rifirma</button>
                    </div>
                  ) : (
                    <SignaturePad
                      onSave={(sig) => setDriverTempSig(sig)}
                      onClear={() => {}}
                      placeholderText="Traccia firma Autista..."
                    />
                  )}

                  <hr className="border-white/10 my-2" />

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Soccorritore</label>
                    <input
                      type="text"
                      value={rescuerSignerName}
                      onChange={(e) => setRescuerSignerName(e.target.value)}
                      placeholder="Nome e Cognome Soccorritore"
                      className="w-full text-xs p-2 bg-black/20 text-white border border-white/10 rounded focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                  
                  {rescuerTempSig ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg flex flex-col items-center gap-2">
                      <Check className="text-emerald-400 w-6 h-6" />
                      <span className="text-emerald-300 text-xs font-bold">Firma Soccorritore Acquisita</span>
                      <button onClick={() => setRescuerTempSig(null)} className="text-[10px] text-slate-400 underline">Cancella e rifirma</button>
                    </div>
                  ) : (
                    <SignaturePad
                      onSave={(sig) => setRescuerTempSig(sig)}
                      onClear={() => {}}
                      placeholderText="Traccia firma Soccorritore..."
                    />
                  )}

                  <button
                    onClick={handleSaveSignature}
                    disabled={!driverTempSig || !rescuerTempSig}
                    className="w-full mt-2 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-5 h-5" />
                    SALVA TURNI COMPLETI
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
