import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Plus, LogOut, Download, Printer, Save, Calendar, Clock, 
  MapPin, Shield, CheckCircle2, ChevronLeft, ChevronRight, PenTool, X, Trash2, Edit2
} from 'lucide-react';
import { UserSession } from '../types';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import SignaturePad from './SignaturePad';
import { SanitaserviceLogo, TarantoSoccorsoLogo } from './Logos';

interface FoglioDiMarciaProps {
  session: UserSession;
  onLogout: () => void;
  isOnline: boolean;
}

interface InterventionEntry {
  id: string;
  giorno: number;
  mese: string;
  anno: number;
  interventoNum: string;
  oraPartenza: string;
  kmPartenza: string;
  oraRientro: string;
  kmRientro: string;
  carburante: string;
  autista: string;
  firma: string | null; // signature data URL
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

interface SheetDocument {
  id: string;
  postazione: string;
  targa: string;
  mezzo: string;
  mese: string;
  anno: number;
  interventi: InterventionEntry[];
  lastUpdated: string;
}

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

export default function FoglioDiMarcia({ session, onLogout, isOnline }: FoglioDiMarciaProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth());
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  
  const [sheet, setSheet] = useState<SheetDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [activeInterventionId, setActiveInterventionId] = useState<string | null>(null);
  const [editingInterventionId, setEditingInterventionId] = useState<string | null>(null);

  // New Intervention Form fields
  const [giorno, setGiorno] = useState<number>(new Date().getDate());
  const [interventoNum, setInterventoNum] = useState<string>('');
  const [oraPartenza, setOraPartenza] = useState<string>(
    new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  );
  const [kmPartenza, setKmPartenza] = useState<string>('');
  const [oraRientro, setOraRientro] = useState<string>('');
  const [kmRientro, setKmRientro] = useState<string>('');
  const [carburante, setCarburante] = useState<string>('');
  const [autistaName, setAutistaName] = useState<string>(session.operatorName);
  const [tempSignature, setTempSignature] = useState<string | null>(null);

  // Reference for printable area
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Derive unique document ID for this station + targa + month + year
  const sanitizedStation = session.stationName.replace(/[/#]/g, '_') || 'default_station';
  const sanitizedTarga = session.vehicleCode.trim().toUpperCase().replace(/\s+/g, '_') || 'unknown_targa';
  const docId = `${sanitizedStation}_${sanitizedTarga}_${String(activeMonth + 1).padStart(2, '0')}_${activeYear}`;

  // Firestore Subscription
  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, 'fogli_di_marcia', docId);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setSheet(snapshot.data() as SheetDocument);
      } else {
        // Default empty sheet object
        setSheet({
          id: docId,
          postazione: session.stationName,
          targa: session.vehicleCode.toUpperCase(),
          mezzo: session.assignedServiceStation || 'Mezzo 118',
          mese: MONTHS_IT[activeMonth],
          anno: activeYear,
          interventi: [],
          lastUpdated: new Date().toISOString()
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error subscribing to foglio di marcia:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [docId, activeMonth, activeYear, session]);

  // Adjust default day in form when date switches or modal opens
  useEffect(() => {
    const today = new Date();
    if (today.getMonth() === activeMonth && today.getFullYear() === activeYear) {
      setGiorno(today.getDate());
    } else {
      setGiorno(1);
    }
  }, [activeMonth, activeYear, showAddModal]);

  const handlePrevMonth = () => {
    if (activeMonth === 0) {
      setActiveMonth(11);
      setActiveYear(prev => prev - 1);
    } else {
      setActiveMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (activeMonth === 11) {
      setActiveMonth(0);
      setActiveYear(prev => prev + 1);
    } else {
      setActiveMonth(prev => prev + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    const today = new Date();
    setActiveMonth(today.getMonth());
    setActiveYear(today.getFullYear());
  };

  const calculateTotalKm = (partenza: string, rientro: string) => {
    const start = Number(partenza);
    const end = Number(rientro);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      return end - start;
    }
    return '--';
  };

  const handleEditIntervention = (entry: InterventionEntry) => {
    setGiorno(entry.giorno);
    setInterventoNum(entry.interventoNum);
    setOraPartenza(entry.oraPartenza);
    setKmPartenza(entry.kmPartenza);
    setOraRientro(entry.oraRientro);
    setKmRientro(entry.kmRientro);
    setCarburante(entry.carburante);
    setAutistaName(entry.autista);
    setTempSignature(entry.firma);
    setEditingInterventionId(entry.id);
    setShowAddModal(true);
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveIntervention = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!sheet) return;
    setErrorMsg(null);
    
    if (!interventoNum || !oraPartenza || !kmPartenza || !autistaName) {
      setErrorMsg("Compila tutti i campi obbligatori (Intervento, Ora, Km e Nome Autista).");
      return;
    }

    let updatedInterventi = [...sheet.interventi];

    if (editingInterventionId) {
      updatedInterventi = updatedInterventi.map(entry => {
        if (entry.id === editingInterventionId) {
          return {
            ...entry,
            giorno,
            interventoNum: interventoNum.trim() || 'Servizio ordinario / Presidio',
            oraPartenza: oraPartenza || '--:--',
            kmPartenza: kmPartenza || '0',
            oraRientro: oraRientro || '--:--',
            kmRientro: kmRientro || '0',
            carburante: carburante.trim() || '/',
            autista: autistaName.trim() || session.operatorName,
            firma: tempSignature,
            lastModifiedBy: session.operatorName,
            lastModifiedAt: new Date().toISOString()
          };
        }
        return entry;
      });
    } else {
      const newEntry: InterventionEntry = {
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString(),
        giorno,
        mese: String(activeMonth + 1).padStart(2, '0'),
        anno: activeYear,
        interventoNum: interventoNum.trim() || 'Servizio ordinario / Presidio',
        oraPartenza: oraPartenza || '--:--',
        kmPartenza: kmPartenza || '0',
        oraRientro: oraRientro || '--:--',
        kmRientro: kmRientro || '0',
        carburante: carburante.trim() || '/',
        autista: autistaName.trim() || session.operatorName,
        firma: tempSignature,
        createdAt: new Date().toISOString()
      };
      updatedInterventi.push(newEntry);
    }

    // Sort by giorno ascending, then departure time or creation time
    updatedInterventi.sort((a, b) => a.giorno - b.giorno);

    const updatedDoc: SheetDocument = {
      ...sheet,
      interventi: updatedInterventi,
      lastUpdated: new Date().toISOString()
    };

    try {
      setShowAddModal(false);
      resetForm();
      setDoc(doc(db, 'fogli_di_marcia', docId), updatedDoc).catch(err => {
        console.error("Error saving intervention:", err);
      });
    } catch (err) {
      console.error("Error saving intervention:", err);
      setErrorMsg("Errore durante il salvataggio sul Cloud. Riprova.");
    }
  };

  const handleDeleteIntervention = async (id: string) => {
    if (!sheet) return;

    const updatedInterventi = sheet.interventi.filter(entry => entry.id !== id);
    const updatedDoc: SheetDocument = {
      ...sheet,
      interventi: updatedInterventi,
      lastUpdated: new Date().toISOString()
    };

    try {
      setDoc(doc(db, 'fogli_di_marcia', docId), updatedDoc).catch(err => {
        console.error("Error deleting intervention:", err);
      });
    } catch (err) {
      console.error("Error deleting intervention:", err);
      setErrorMsg("Errore durante l'eliminazione sul Cloud.");
    }
  };

  const resetForm = () => {
    setInterventoNum('');
    const now = new Date();
    setOraPartenza(now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
    setKmPartenza('');
    setOraRientro('');
    setKmRientro('');
    setCarburante('');
    setAutistaName(session.operatorName);
    setTempSignature(null);
    setEditingInterventionId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = async () => {
    if (!printAreaRef.current) return;
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      
      // We temporarily add a class or style if needed, but it should be fine.
      const canvas = await html2canvas(printAreaRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a' // slate-900 to match dark theme, or white if we want light print
      });
      
      const imgData = canvas.toDataURL('image/png');
      // Use landscape A4
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Foglio_Marcia_${docId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      // Removed alert as it fails in iFrame previews
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-slate-900/60 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-600/20 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-md">
            <FileText className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              Foglio di Marcia <span className="text-cyan-400 text-xs font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">Diario di Bordo</span>
            </h1>
            <p className="text-xs text-slate-400">
              Registrazione interventi ed attività in tempo reale • Archivio Cloud Mensile Dedicato
            </p>
          </div>
        </div>

        {/* MONTH SWITCHER */}
        <div className="flex items-center bg-black/40 p-1.5 rounded-xl border border-white/10">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
            title="Mese Precedente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="px-4 text-center min-w-[150px]">
            <span className="block text-xs font-extrabold text-cyan-400 uppercase tracking-wide">
              {MONTHS_IT[activeMonth]} {activeYear}
            </span>
            <span className="text-[9px] text-slate-400">
              Scheda {String(activeMonth + 1).padStart(2, '0')}/{activeYear}
            </span>
          </div>

          <button 
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
            title="Mese Successivo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {(activeMonth !== new Date().getMonth() || activeYear !== new Date().getFullYear()) && (
            <button 
              onClick={handleResetToCurrentMonth}
              className="ml-2 px-2.5 py-1 text-[10px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all"
            >
              Corrente
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generatePDF}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl border border-cyan-500/50 shadow-lg shadow-cyan-950/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Scarica PDF</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Stampa</span>
          </button>
          
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-bold text-red-400 bg-red-950/20 hover:bg-red-900/30 rounded-xl border border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Esci Scheda</span>
          </button>
        </div>
      </div>

      {/* ACTIVE INFO SHEET PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <span className="block text-[9px] font-bold text-slate-500 uppercase">Postazione Attiva</span>
            <span className="text-sm font-extrabold text-white">{session.stationName}</span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="block text-[9px] font-bold text-slate-500 uppercase">Targa del Mezzo</span>
            <span className="text-sm font-extrabold text-white tracking-widest">{session.vehicleCode.toUpperCase()}</span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="block text-[9px] font-bold text-slate-500 uppercase">Copertura Foglio</span>
            <span className="text-sm font-extrabold text-white">01 {MONTHS_IT[activeMonth]} - Fine Mese</span>
          </div>
        </div>
      </div>

      {/* CLOUD SAVE INDICATOR */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-400">
            {isOnline ? "Sincronizzato in tempo reale con Firebase Cloud" : "In attesa di connessione (Salvataggio Locale)"}
          </span>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-950/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registra Nuovo Intervento</span>
        </button>
      </div>

      {/* DIARIO DI BORDO TABLE AREA */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
        
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Caricamento registro dal database Cloud...</p>
          </div>
        ) : (
          <div className="overflow-x-auto" ref={printAreaRef} id="printable-foglio-di-marcia">
            
            {/* PRINT & PREVIEW HEADER MODEL (styled exactly like the paper form) */}
            <div className="bg-white text-black p-8 border-b border-slate-300 print:block hidden-header-preview">
              <div className="flex items-center justify-between gap-4 mb-6">
                <SanitaserviceLogo className="h-16 w-auto object-contain shrink-0" />
                <div className="text-center">
                  <h1 className="text-2xl font-black tracking-widest text-slate-900 uppercase">Diario di Bordo</h1>
                  <span className="text-xs font-bold text-slate-600">Sanitàservice ASL TA s.r.l. Unipersonale</span>
                </div>
                <TarantoSoccorsoLogo className="h-16 w-auto object-contain shrink-0" />
              </div>

              <div className="grid grid-cols-3 gap-4 border border-slate-300 p-4 rounded-lg bg-slate-50 text-xs font-bold text-slate-700 mb-6">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Postazione P.P.I.T. / 118</span>
                  <span className="text-sm font-black text-slate-900">{sheet?.postazione || session.stationName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Mezzo di Servizio</span>
                  <span className="text-sm font-black text-slate-900">{sheet?.mezzo || session.assignedServiceStation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Targa del Mezzo</span>
                  <span className="text-sm font-black text-slate-900 tracking-widest">{sheet?.targa || session.vehicleCode.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* SCREEN LAYOUT MAIN CONTAINER */}
            <div className="p-1 min-w-[1000px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-300 text-[10px] uppercase font-black tracking-wide border-b border-white/10">
                    <th className="p-3 text-center border-r border-white/5 w-12">Giorno</th>
                    <th className="p-3 text-center border-r border-white/5 w-12">Mese</th>
                    <th className="p-3 text-center border-r border-white/5 w-12">Anno</th>
                    <th className="p-3 border-r border-white/5">intervento n° e/o motivo di servizio</th>
                    <th className="p-3 text-center border-r border-white/5 w-24">Ora part.</th>
                    <th className="p-3 text-center border-r border-white/5 w-24">km part.</th>
                    <th className="p-3 text-center border-r border-white/5 w-24">Ora rient.</th>
                    <th className="p-3 text-center border-r border-white/5 w-24">km rient.</th>
                    <th className="p-3 text-center border-r border-white/5 w-24">km tot.</th>
                    <th className="p-3 text-center border-r border-white/5 w-32">Carburante €/Lt</th>
                    <th className="p-3 border-r border-white/5 w-48">Autista (Cognome e Nome)</th>
                    <th className="p-3 text-center w-24 border-r border-white/5">Firma</th>
                    <th className="p-3 text-center w-12 no-print">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-medium bg-slate-950/20">
                  {sheet && sheet.interventi && sheet.interventi.length > 0 ? (
                    sheet.interventi.map((entry, index) => (
                      <tr 
                        key={entry.id}
                        className="hover:bg-white/5 transition-all group duration-150 border-b border-white/5 text-slate-300"
                      >
                        <td className="p-3 text-center font-bold text-white border-r border-white/5 bg-slate-900/10">{String(entry.giorno).padStart(2, '0')}</td>
                        <td className="p-3 text-center text-slate-400 border-r border-white/5">{String(entry.mese).padStart(2, '0')}</td>
                        <td className="p-3 text-center text-slate-400 border-r border-white/5">{entry.anno}</td>
                        <td className="p-3 font-semibold text-white border-r border-white/5 max-w-xs" title={entry.interventoNum}>
                          <div className="truncate">{entry.interventoNum}</div>
                          {entry.lastModifiedBy && entry.lastModifiedAt && (
                            <div className="text-[9px] text-amber-500/80 mt-1 font-bold">
                              Modificato da: {entry.lastModifiedBy} ({new Date(entry.lastModifiedAt).toLocaleDateString('it-IT')} {new Date(entry.lastModifiedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })})
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono border-r border-white/5 text-cyan-400 font-bold">{entry.oraPartenza}</td>
                        <td className="p-3 text-center font-mono border-r border-white/5 text-slate-400">{entry.kmPartenza}</td>
                        <td className="p-3 text-center font-mono border-r border-white/5 text-amber-400 font-bold">{entry.oraRientro || '--:--'}</td>
                        <td className="p-3 text-center font-mono border-r border-white/5 text-slate-400">{entry.kmRientro || '--'}</td>
                        <td className="p-3 text-center font-mono border-r border-white/5 font-bold text-emerald-400 bg-emerald-950/20">{calculateTotalKm(entry.kmPartenza, entry.kmRientro)}</td>
                        <td className="p-3 text-center border-r border-white/5 italic text-slate-400 font-bold bg-black/10">{entry.carburante}</td>
                        <td className="p-3 font-semibold text-white border-r border-white/5 uppercase tracking-wide truncate max-w-[160px]">
                          {entry.autista}
                        </td>
                        <td className="p-1.5 text-center border-r border-white/5">
                          {entry.firma ? (
                            <div className="flex items-center justify-center h-10 w-20 bg-white rounded p-0.5 mx-auto">
                              <img src={entry.firma} alt="Firma Autista" className="max-h-full max-w-full object-contain" />
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveInterventionId(entry.id);
                                setTempSignature(null);
                                setShowSignModal(true);
                              }}
                              className="text-[9px] font-bold text-cyan-400 hover:underline flex items-center justify-center gap-1 mx-auto py-1 px-2 rounded bg-cyan-950/40 border border-cyan-500/20 uppercase cursor-pointer no-print"
                            >
                              <PenTool className="w-3 h-3" />
                              <span>Firma</span>
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-center no-print flex flex-col items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditIntervention(entry)}
                            className="p-1.5 text-slate-500 hover:text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition-all cursor-pointer w-full flex items-center justify-center"
                            title="Modifica riga"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteIntervention(entry.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer w-full flex items-center justify-center"
                            title="Elimina riga"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="py-24 text-center text-slate-500 font-medium">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Clock className="w-8 h-8 text-slate-600 animate-pulse" />
                          <p>Nessun intervento registrato per il mese di {MONTHS_IT[activeMonth]} {activeYear}.</p>
                          <p className="text-[10px] text-slate-600">Fai clic su "Registra Nuovo Intervento" per cominciare la compilazione.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>

      {/* COMPILATION ROW MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] animate-scale-up">
            <div className="bg-slate-950/60 p-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wide">Registrazione Intervento</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 md:p-6 custom-scrollbar">
              <div className="flex flex-col gap-4">
              
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
                  {errorMsg}
                </div>
              )}

              {/* Date selection inside form */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/20 p-2.5 rounded-lg border border-white/10">
                  <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Giorno</label>
                  <select 
                    value={giorno}
                    onChange={(e) => setGiorno(Number(e.target.value))}
                    className="w-full bg-transparent text-xs text-white font-bold border-none p-0 outline-none focus:ring-0 cursor-pointer"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option className="bg-slate-900" key={d} value={d}>{String(d).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-black/20 p-2.5 rounded-lg border border-white/10">
                  <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Mese</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={MONTHS_IT[activeMonth]} 
                    className="w-full bg-transparent text-xs text-slate-400 font-bold border-none p-0 outline-none" 
                  />
                </div>
                <div className="bg-black/20 p-2.5 rounded-lg border border-white/10">
                  <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Anno</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={activeYear} 
                    className="w-full bg-transparent text-xs text-slate-400 font-bold border-none p-0 outline-none" 
                  />
                </div>
              </div>

              {/* Intervento o motivo */}
              <div className="bg-black/20 p-3.5 rounded-xl border border-white/10">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Intervento N° e/o Motivo di Servizio
                </label>
                <input 
                  type="text"
                  placeholder="Es: Intervento n. 12 / Trasferimento / Lavaggio Mezzo"
                  value={interventoNum}
                  onChange={(e) => setInterventoNum(e.target.value)}
                  className="w-full bg-transparent text-sm text-white font-medium outline-none placeholder-slate-600 mt-1"
                />
              </div>

              {/* Time and KM Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ora Partenza</label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <input 
                      type="text"
                      placeholder="HH:MM"
                      value={oraPartenza}
                      onChange={(e) => setOraPartenza(e.target.value)}
                      className="bg-transparent text-xs text-white font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">km alla Partenza</label>
                  <input 
                    type="number"
                    placeholder="Es: 124500"
                    value={kmPartenza}
                    onChange={(e) => setKmPartenza(e.target.value)}
                    className="w-full bg-transparent text-xs text-white font-bold outline-none mt-1"
                  />
                </div>
              </div>

              {/* Return Row and Totals */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ora Rientro</label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <input 
                      type="text"
                      placeholder="HH:MM"
                      value={oraRientro}
                      onChange={(e) => setOraRientro(e.target.value)}
                      className="bg-transparent text-xs text-white font-bold outline-none w-full"
                    />
                  </div>
                </div>

                <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">km Rientro</label>
                  <input 
                    type="number"
                    placeholder="Es: 124545"
                    value={kmRientro}
                    onChange={(e) => setKmRientro(e.target.value)}
                    className="w-full bg-transparent text-xs text-white font-bold outline-none mt-1"
                  />
                </div>
                
                <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20">
                  <label className="block text-[9px] font-bold text-emerald-400/80 uppercase tracking-wider mb-1">Totale KM</label>
                  <input 
                    type="text"
                    readOnly
                    value={calculateTotalKm(kmPartenza, kmRientro)}
                    className="w-full bg-transparent text-xs text-emerald-400 font-black outline-none mt-1"
                  />
                </div>
              </div>

              {/* Carburante and Autista Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Carburante (€ / Lt)</label>
                  <input 
                    type="text"
                    placeholder="Es: € 50 / 25 Lt (o lascia /)"
                    value={carburante}
                    onChange={(e) => setCarburante(e.target.value)}
                    className="w-full bg-transparent text-xs text-white font-bold outline-none mt-1"
                  />
                </div>

                <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cognome e Nome Autista</label>
                  <input 
                    required
                    type="text"
                    placeholder="Nome Autista"
                    value={autistaName}
                    onChange={(e) => setAutistaName(e.target.value)}
                    className="w-full bg-transparent text-xs text-white font-bold outline-none mt-1 uppercase"
                  />
                </div>
              </div>

              {/* SIGNATURE SECTION */}
              <div className="border border-white/5 rounded-xl overflow-hidden mt-1">
                {tempSignature ? (
                  <div className="bg-black/40 p-4 text-center">
                    <span className="block text-[9px] font-black text-emerald-400 uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Firma Convalidata
                    </span>
                    <div className="flex items-center justify-center h-16 w-32 bg-white rounded p-1 mx-auto border border-white/10">
                      <img src={tempSignature} alt="Firma Autista Convalidata" className="max-h-full max-w-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setTempSignature(null)}
                      className="text-[10px] text-red-400 hover:underline font-bold mt-2 cursor-pointer block mx-auto"
                    >
                      Ripeti Firma
                    </button>
                  </div>
                ) : (
                  <div className="p-1 bg-black/10">
                    <SignaturePad 
                      placeholderText="Disegna la tua firma qui come autista di turno..."
                      onSave={(sig) => setTempSignature(sig)} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* STICKY SUBMIT BUTTON FOOTER */}
            <div className="p-4 bg-slate-950/80 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={handleSaveIntervention}
                className="w-full py-3.5 rounded-xl text-white font-black text-sm bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-950/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingInterventionId ? 'Salva Modifiche' : 'Salva nel Diario di Bordo Cloud'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* POPUP ROW SIGNATURE PAD */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-slate-950/60 p-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-extrabold text-xs text-white uppercase tracking-wide flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-cyan-400" />
                Firma Intervento Selezionato
              </span>
              <button 
                onClick={() => setShowSignModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <SignaturePad 
                placeholderText="Firma qui l'intervento registrato..."
                onSave={async (sig) => {
                  if (!sheet || !activeInterventionId) return;
                  
                  const updatedInterventi = sheet.interventi.map(entry => {
                    if (entry.id === activeInterventionId) {
                      return { ...entry, firma: sig };
                    }
                    return entry;
                  });

                  const updatedDoc: SheetDocument = {
                    ...sheet,
                    interventi: updatedInterventi,
                    lastUpdated: new Date().toISOString()
                  };

                  try {
                    setShowSignModal(false);
                    setActiveInterventionId(null);
                    setDoc(doc(db, 'fogli_di_marcia', docId), updatedDoc).catch(err => {
                      console.error("Error signing intervention:", err);
                    });
                  } catch (err) {
                    console.error("Error signing intervention:", err);
                    // Removed alert to prevent silent failures in iFrame
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS for printing layout and preview hiding */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-foglio-di-marcia, #printable-foglio-di-marcia * {
            visibility: visible;
          }
          #printable-foglio-di-marcia {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .hidden-header-preview {
            display: block !important;
          }
          table {
            border: 1px solid #cbd5e1 !important;
            color: black !important;
          }
          th {
            background-color: #f1f5f9 !important;
            color: black !important;
            border-bottom: 2px solid #cbd5e1 !important;
            border-right: 1px solid #cbd5e1 !important;
            font-size: 8px !important;
            padding: 6px !important;
          }
          td {
            border-bottom: 1px solid #cbd5e1 !important;
            border-right: 1px solid #cbd5e1 !important;
            color: #1e293b !important;
            font-size: 8px !important;
            padding: 6px !important;
            background: transparent !important;
          }
          tr {
            background: transparent !important;
          }
        }
        .hidden-header-preview {
          display: none;
        }
      `}</style>
    </div>
  );
}
