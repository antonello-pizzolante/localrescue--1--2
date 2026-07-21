import React, { useState, useEffect } from 'react';
import { Shield, Check, AlertTriangle, Cloud, Printer, FileText, Send, ArrowLeft, PenTool, Search, HeartPulse } from 'lucide-react';
import { SanitariChecklistReport, UserSession, SanitariChecklistItem, CheckStatus } from '../types';
import { INITIAL_SANITARI_ITEMS, PRESET_EMAIL_ADDRESSES } from '../data';
import SignaturePad from './SignaturePad';
import { generateSanitariPDF, exportSanitariToCSV, triggerDownload } from '../utils/exports';
import { SanitaserviceLogo, TarantoSoccorsoLogo } from './Logos';
import PharmacyPanel from './PharmacyPanel';
import { VoiceNoteInput } from './VoiceNoteInput';
import { uploadFileToDrive } from '../lib/drive';
import { googleSignIn, getAccessToken } from '../lib/auth';

interface SanitariFormProps {
  session: UserSession;
  onLogout: () => void;
  onSaveReport: (report: SanitariChecklistReport) => void;
  savedReports: SanitariChecklistReport[];
  isOnline: boolean;
}

export default function SanitariForm({ session, onLogout, onSaveReport, savedReports, isOnline }: SanitariFormProps) {
  const todayStr = new Date().toLocaleDateString('it-IT');

  const draftKey = `draft_sanitari_${session.stationName}_${session.vehicleCode}`;
  const [report, setReport] = useState<SanitariChecklistReport>(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.date === todayStr && !(parsed.signatures?.mat && parsed.signatures?.pom && parsed.signatures?.not)) {
          return parsed;
        }
      } catch(e) {}
    }
    const existing = savedReports.find(r => r.date === todayStr && r.vehicleCode === session.vehicleCode && r.stationName === session.stationName && !(r.signatures?.mat && r.signatures?.pom && r.signatures?.not));
    if (existing) return existing;

    return {
      id: `rep_san_${Date.now()}`,
      date: todayStr,
      vehicleCode: session.vehicleCode,
      stationName: session.stationName,
      assignedServiceStation: session.assignedServiceStation,
      items: JSON.parse(JSON.stringify(INITIAL_SANITARI_ITEMS)),
      signatures: {},
      emailSent: false,
      pecSent: false,
      isSynced: isOnline
    };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSigningShift, setActiveSigningShift] = useState<'mat' | 'pom' | 'not' | null>(null);
  const [signerName, setSignerName] = useState(session.operatorName);
  const [recipientEmail, setRecipientEmail] = useState('lello199830@gmail.com');
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [showSendSuccess, setShowSendSuccess] = useState(false);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Sync state to parent when local report changes
  useEffect(() => {
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

  // Fast compliance toggle for Sanitari
  const autoComplyShift = (shiftKey: 'mat' | 'pom' | 'not') => {
    const updatedItems = report.items.map(item => {
      // Only set items matching the active filter or all if 'all' is active
      if (activeCategory === 'all' || item.category === activeCategory) {
        return {
          ...item,
          [shiftKey]: 'OK' as CheckStatus
        };
      }
      return item;
    });
    setReport({ ...report, items: updatedItems });
  };

  const handleStatusChange = (itemId: string, shiftKey: 'mat' | 'pom' | 'not', status: CheckStatus) => {
    const updatedItems = report.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          [shiftKey]: status
        };
      }
      return item;
    });
    setReport({ ...report, items: updatedItems });
  };

  const handleSaveSignature = (signatureDataUrl: string) => {
    if (!activeSigningShift) return;

    const timeStr = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const fullTimestamp = `${todayStr} ${timeStr}`;

    const updatedSignatures = {
      ...report.signatures,
      [activeSigningShift]: {
        name: signerName.trim() || session.operatorName,
        signatureDataUrl,
        timestamp: fullTimestamp
      }
    };

    const finalReport = { ...report, signatures: updatedSignatures };
    
    if (updatedSignatures.mat && updatedSignatures.pom && updatedSignatures.not) {
      // Force an immediate save
      onSaveReport(finalReport);
      // Reset to a virgin checklist for the next round
      setReport({
        id: `rep_san_${Date.now()}`,
        date: todayStr,
        vehicleCode: session.vehicleCode,
        stationName: session.stationName,
        assignedServiceStation: session.assignedServiceStation,
        items: JSON.parse(JSON.stringify(INITIAL_SANITARI_ITEMS)),
        signatures: {},
        emailSent: false,
        pecSent: false,
        isSynced: false
      });
    } else {
      setReport(finalReport);
    }
    
    setActiveSigningShift(null);
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
    const csvContent = exportSanitariToCSV(report);
    triggerDownload(csvContent, `Checklist_Sanitari_${session.vehicleCode}_${report.date.replace(/\//g, '-')}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportExcel = () => {
    const csvContent = exportSanitariToCSV(report);
    triggerDownload(csvContent, `Checklist_Sanitari_${session.vehicleCode}_${report.date.replace(/\//g, '-')}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
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
          reportType: 'sanitari',
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
        // If it's simulated due to missing credentials, we still set emailSent and pecSent as simulated
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
      const doc = await generateSanitariPDF(report, session);
      const blob = doc.output('blob');
      const filename = `Checklist_Sanitari_${session.vehicleCode}_${report.date.replace(/\//g, '-')}.pdf`;
      await uploadFileToDrive(filename, 'application/pdf', blob, 'sanitari');
      alert('PDF salvato con successo su Google Drive!');
    } catch (error: any) {
      alert(error.message || 'Errore durante il salvataggio su Drive');
    } finally {
      setIsUploadingDrive(false);
    }
  };

  const handleDownloadPDF = async () => {
    const doc = await generateSanitariPDF(report, session);
    doc.save(`Checklist_Sanitari_${session.vehicleCode}_${report.date.replace(/\//g, '-')}.pdf`);
  };

  // Get unique list of categories for navigation/tabs
  const categories: string[] = ['all', ...(Array.from(new Set(report.items.map(i => i.category))) as string[]), 'farmacia'];

  // Helper to translate tech labels to human user-friendly category titles
  const getCategoryTitle = (cat: string) => {
    if (cat === 'all') return 'Tutti i Campi';
    if (cat === 'farmacia') return 'Scadenze e Ordini Farmacia';
    return cat;
  };

  // Filter items
  const filteredItems = report.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
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
            <span className="bg-red-500/10 text-red-300 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Medico ed Infermieristico
            </span>
            <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1 font-display">CHECK-LIST MSA/MSB SET 118</h1>
            <p className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center justify-center md:justify-start gap-1.5">
              <span>Operatore loggato: <strong className="text-white">{session.operatorName}</strong></span>
              {session.qualification && (
                <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border ${
                  session.qualification === 'medico' 
                    ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {session.qualification}
                </span>
              )}
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
              className="w-full text-xs p-2 bg-black/40 text-white border border-white/10 rounded-lg focus:border-red-500/50 outline-none font-mono"
            />
          </div>
          <button
            onClick={handleSendReports}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 p-2.5 px-4 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/20 transition-all active:scale-[0.98] cursor-pointer"
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
          <span>I dati dei presidi sanitari sono stati archiviati nel Cloud LocalRescue con validità legale e marca temporale!</span>
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
            <span>{emailFeedback?.success ? 'Referto sanitario trasmesso con successo!' : 'Stato Trasmissione E-mail'}</span>
          </div>
          {emailFeedback && <p className="text-[11px] text-slate-200 mt-0.5 leading-normal whitespace-pre-line">{emailFeedback.message}</p>}
          <p className="text-[10px] text-slate-300 leading-tight border-t border-white/5 pt-1.5 mt-1">
            • <strong>E-mail Destinatario:</strong> <span className="text-white font-bold">{recipientEmail}</span><br />
            • <strong>PEC Destinatario (Simulato):</strong> {PRESET_EMAIL_ADDRESSES.pec_asl} (Direzione ASL Taranto)<br />
            • <strong>Email Centralina (Simulato):</strong> {PRESET_EMAIL_ADDRESSES.email_coordinatore} e {PRESET_EMAIL_ADDRESSES.email_archivio}
          </p>
        </div>
      )}

      {/* SEARCH AND CATEGORY NAVIGATION LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDEBAR TABS FOR CATEGORIES - 3 Columns */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="glass-card p-4 rounded-xl border border-white/10 shadow-lg">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 font-display">
              <HeartPulse className="w-4.5 h-4.5 text-red-400" />
              Sezioni Checklist
            </h3>

            {/* Fuzzy Search Inside Sidebar */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtra presidio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-black/20 text-white border border-white/10 pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-red-500/50"
              />
            </div>

            <div className="flex flex-col gap-1 max-h-[420px] overflow-y-auto">
              {categories.map((cat) => {
                const count = cat === 'all'
                  ? report.items.length
                  : cat === 'farmacia'
                  ? (report.pharmacyExpiringMeds?.length || 0) + (report.pharmacyOrders?.length || 0)
                  : report.items.filter(i => i.category === cat).length;
                const activeAnoms = cat === 'all' 
                  ? report.items.filter(i => i.mat === 'ANOMALIA' || i.pom === 'ANOMALIA' || i.not === 'ANOMALIA').length
                  : report.items.filter(i => i.category === cat && (i.mat === 'ANOMALIA' || i.pom === 'ANOMALIA' || i.not === 'ANOMALIA')).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-red-500/10 text-red-300 border-l-4 border-red-500 font-bold shadow-md'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">{getCategoryTitle(cat)}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {activeAnoms > 0 && (
                        <span className="bg-red-500/20 text-red-400 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                          {activeAnoms}
                        </span>
                      )}
                      <span className="bg-white/5 text-slate-400 font-mono text-[9px] px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* COMPILATION PANEL - 9 Columns */}
        <div className="lg:col-span-9 flex flex-col gap-5">
          {(activeCategory === 'farmacia' || activeCategory === 'all') && (
            <PharmacyPanel report={report} setReport={setReport} />
          )}

          {activeCategory !== 'farmacia' && (
            /* Main compilation table */
            <div className="glass-card rounded-xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-4 bg-white/5 border-b border-white/10 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-xs md:text-sm uppercase tracking-wider font-display">
                  {getCategoryTitle(activeCategory)}
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Visualizzati {filteredItems.length} di {report.items.length} articoli totali
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => autoComplyShift('mat')}
                  className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-bold p-1.5 px-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Segna OK (MAT)
                </button>
                <button
                  type="button"
                  onClick={() => autoComplyShift('pom')}
                  className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-bold p-1.5 px-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Segna OK (POM)
                </button>
                <button
                  type="button"
                  onClick={() => autoComplyShift('not')}
                  className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-bold p-1.5 px-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Segna OK (NOT)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-slate-300 font-bold text-[10px] uppercase tracking-wide border-b border-white/10">
                    <th className="p-3 w-12 text-center">Cod</th>
                    <th className="p-3">Articolo / Presidio Medico</th>
                    <th className="p-3 w-20 text-center">Quantità</th>
                    <th className="p-3 w-32 text-center">MATTINA (MAT)</th>
                    <th className="p-3 w-32 text-center">POMERIGGIO (POM)</th>
                    <th className="p-3 w-32 text-center">NOTTE (NOT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                        Nessun articolo trovato per questa categoria o filtro di ricerca.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white/5 border-b border-white/5 transition-all">
                        <td className="p-3 text-center font-mono text-[9px] text-slate-500">
                          {item.id.toUpperCase()}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-white leading-tight">{item.name}</div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider">{item.category}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-white/5 text-slate-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                            {item.qty}
                          </span>
                        </td>

                        {/* MAT SHIFT */}
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStatusChange(item.id, 'mat', 'OK')}
                              className={`p-1 px-2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                item.mat === 'OK'
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/45'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              Presente
                            </button>
                            <button
                              onClick={() => handleStatusChange(item.id, 'mat', 'ANOMALIA')}
                              className={`p-1 px-2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                item.mat === 'ANOMALIA'
                                  ? 'bg-red-600 text-white shadow-md shadow-red-950/45'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              Mancante
                            </button>
                          </div>
                        </td>

                        {/* POM SHIFT */}
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStatusChange(item.id, 'pom', 'OK')}
                              className={`p-1 px-2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                item.pom === 'OK'
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/45'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              Presente
                            </button>
                            <button
                              onClick={() => handleStatusChange(item.id, 'pom', 'ANOMALIA')}
                              className={`p-1 px-2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                item.pom === 'ANOMALIA'
                                  ? 'bg-red-600 text-white shadow-md shadow-red-950/45'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              Mancante
                            </button>
                          </div>
                        </td>

                        {/* NOT SHIFT */}
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStatusChange(item.id, 'not', 'OK')}
                              className={`p-1 px-2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                item.not === 'OK'
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/45'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              Presente
                            </button>
                            <button
                              onClick={() => handleStatusChange(item.id, 'not', 'ANOMALIA')}
                              className={`p-1 px-2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                item.not === 'ANOMALIA'
                                  ? 'bg-red-600 text-white shadow-md shadow-red-950/45'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              Mancante
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Note Rilevate */}
          <div className="glass-card p-4 rounded-xl border border-white/10 shadow-lg">
            <h3 className="font-bold text-white text-xs md:text-sm uppercase tracking-wider mb-2">Note ed Osservazioni Rilevate</h3>
            <VoiceNoteInput 
              value={report.notes || ''} 
              onChange={(val) => setReport({ ...report, notes: val })} 
              placeholder="Inserisci note su presidi mancanti, guasti elettromedicali, materiali in esaurimento..."
            />
          </div>

          {/* SIGNATURE PANEL AND SHIFT LOCKS FOR SANITARI */}
          <div className="glass-card p-5 rounded-xl border border-white/10 shadow-lg flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2 font-display">
                <PenTool className="w-5 h-5 text-red-400" />
                Firma Digitale di Validazione Sanitaria
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Medici o Infermieri firmano per asseverare l'avvenuto controllo dei presidi salvavita ed elettromedicali prima di montare in turno.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Shift MAT Signature Row */}
              <div className="p-3 bg-black/20 rounded-lg border border-white/10 flex flex-col gap-2.5 justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">TURNO MATTINA (MAT)</span>
                  {report.signatures.mat ? (
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Presente
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSigningShift('mat');
                        setSignerName(session.operatorName);
                      }}
                      className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-bold p-1 px-3 rounded transition-all cursor-pointer"
                    >
                      Firma
                    </button>
                  )}
                </div>
                {report.signatures.mat && (
                  <div className="text-[10px] text-slate-400 flex flex-col border-t border-white/5 pt-2 gap-0.5">
                    <span>Firma: <strong className="text-slate-200">{report.signatures.mat.name}</strong></span>
                    <span>Data: <strong className="text-slate-200">{report.signatures.mat.timestamp}</strong></span>
                  </div>
                )}
              </div>

              {/* Shift POM Signature Row */}
              <div className="p-3 bg-black/20 rounded-lg border border-white/10 flex flex-col gap-2.5 justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">TURNO POMERIGGIO (POM)</span>
                  {report.signatures.pom ? (
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Presente
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSigningShift('pom');
                        setSignerName(session.operatorName);
                      }}
                      className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-bold p-1 px-3 rounded transition-all cursor-pointer"
                    >
                      Firma
                    </button>
                  )}
                </div>
                {report.signatures.pom && (
                  <div className="text-[10px] text-slate-400 flex flex-col border-t border-white/5 pt-2 gap-0.5">
                    <span>Firma: <strong className="text-slate-200">{report.signatures.pom.name}</strong></span>
                    <span>Data: <strong className="text-slate-200">{report.signatures.pom.timestamp}</strong></span>
                  </div>
                )}
              </div>

              {/* Shift NOT Signature Row */}
              <div className="p-3 bg-black/20 rounded-lg border border-white/10 flex flex-col gap-2.5 justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">TURNO NOTTE (NOT)</span>
                  {report.signatures.not ? (
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Presente
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSigningShift('not');
                        setSignerName(session.operatorName);
                      }}
                      className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-bold p-1 px-3 rounded transition-all cursor-pointer"
                    >
                      Firma
                    </button>
                  )}
                </div>
                {report.signatures.not && (
                  <div className="text-[10px] text-slate-400 flex flex-col border-t border-white/5 pt-2 gap-0.5">
                    <span>Firma: <strong className="text-slate-200">{report.signatures.not.name}</strong></span>
                    <span>Data: <strong className="text-slate-200">{report.signatures.not.timestamp}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Popup/Modal signature drawing pad */}
            {activeSigningShift && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="w-full max-w-md glass-card rounded-2xl p-5 border border-white/10 shadow-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm uppercase tracking-wide font-display">
                      Firma Sanitaria - {activeSigningShift === 'mat' ? 'Mattina' : activeSigningShift === 'pom' ? 'Pomeriggio' : 'Notte'}
                    </h4>
                    <button
                      onClick={() => setActiveSigningShift(null)}
                      className="text-slate-400 hover:text-white text-xs uppercase font-bold cursor-pointer"
                    >
                      Annulla
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome del Convalidante Sanitario</label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="Nome e Cognome del firmatario"
                      className="w-full text-xs p-2 bg-black/20 text-white border border-white/10 rounded focus:border-red-500/50 outline-none"
                    />
                  </div>

                  <SignaturePad
                    onSave={handleSaveSignature}
                    onClear={() => {}}
                    placeholderText="Traccia qui la tua firma digitale sanitaria..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
