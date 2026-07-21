import React, { useState, useEffect } from 'react';
import { 
  Cloud, Database, Search, ArrowLeft, Filter, FileText, Check, AlertTriangle, 
  Trash2, ShieldAlert, Key, UserCheck, KeyRound, Download, RefreshCw, LogOut, CheckCircle2, QrCode, Printer 
} from 'lucide-react';
import { ScadenzeMezzi } from './ScadenzeMezzi';
import { AutistiChecklistReport, SanitariChecklistReport, UserSession } from '../types';
import { generateAutistiPDF, generateSanitariPDF } from '../utils/exports';
import { doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { STATION_PRESETS } from '../data';
import { googleSignIn, initAuth, logoutGoogle, getAccessToken } from '../lib/auth';
import { uploadFileToDrive } from '../lib/drive';
import { sendEmail } from '../lib/gmail';
import { Mail, Send, Bell, X, Calendar } from 'lucide-react';

interface CloudArchiveConsoleProps {
  session: UserSession;
  onLogout: () => void;
  autistiReports: AutistiChecklistReport[];
  sanitariReports: SanitariChecklistReport[];
  onDeleteAutistiReport?: (id: string) => void;
  onDeleteSanitariReport?: (id: string) => void;
  onSaveAutistiReports: React.Dispatch<React.SetStateAction<AutistiChecklistReport[]>>;
  onSaveSanitariReports: React.Dispatch<React.SetStateAction<SanitariChecklistReport[]>>;
}

export default function CloudArchiveConsole({
  session,
  onLogout,
  autistiReports,
  sanitariReports,
  onSaveAutistiReports,
  onSaveSanitariReports
}: CloudArchiveConsoleProps) {
  const [activeView, setActiveView] = useState<'archivio' | 'scadenze'>('archivio');
  const [expiringAlerts, setExpiringAlerts] = useState<any[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sanitari' | 'autisti'>('all');
  const [syncFilter, setSyncFilter] = useState<'all' | 'synced' | 'local'>('all');
  const [selectedAutisti, setSelectedAutisti] = useState<AutistiChecklistReport | null>(null);
  const [selectedSanitari, setSelectedSanitari] = useState<SanitariChecklistReport | null>(null);
  
  // Custom non-blocking modal states
  const [deletingReport, setDeletingReport] = useState<{ id: string; type: 'autisti' | 'sanitari'; vehicleCode: string; date: string } | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [showDriveWizard, setShowDriveWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardStatus, setWizardStatus] = useState<'' | 'loading' | 'success' | 'error'>('');
  const [wizardError, setWizardError] = useState('');
  const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(new Set());
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  
  // State for password change inside the logged-in dashboard
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Local state for credentials configuration
  const [savedEmail, setSavedEmail] = useState('centrale@localrescue.it');
  const [showSeedSuccess, setShowSeedSuccess] = useState(false);
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [isGmailAuth, setIsGmailAuth] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState('');

  useEffect(() => {
    initAuth(
      (user, token) => setIsGmailAuth(true),
      () => setIsGmailAuth(false)
    );
  }, []);

  useEffect(() => {
    const adminCreds = localStorage.getItem('localrescue_credentials');
    if (adminCreds) {
      try {
        const parsed = JSON.parse(adminCreds);
        if (parsed.email) setSavedEmail(parsed.email);
      } catch (e) {
        // Safe fallback
      }
    }
  }, []);


  const handleSendEmail = async (report: any, isAut: boolean) => {
    if (!isGmailAuth) {
      try {
        await googleSignIn();
        setIsGmailAuth(true);
      } catch (err) {
        setEmailStatusMsg("Errore di login Google.");
        setTimeout(() => setEmailStatusMsg(''), 3000);
        return;
      }
    }

    const confirmed = window.confirm('Sei sicuro di voler inviare questo referto via email tramite il tuo account Gmail?');
    if (!confirmed) return;

    try {
      setIsSendingEmail(true);
      setEmailStatusMsg('Invio in corso...');
      
      const typeStr = isAut ? 'Autisti' : 'Sanitari';
      const to = savedEmail || 'centrale@localrescue.it';
      const subject = `[${report.stationName}] Check-list ${typeStr} - del ${report.date}`;
      const body = `Referto compilato per:
Postazione: ${report.stationName}
Mezzo: ${report.vehicleCode}
Data: ${report.date}
Stato del veicolo e/o del vano sanitario controllati correttamente.
Le anomalie, se presenti, sono state registrate nel documento PDF ufficiale e sul sistema locale.`;

      await sendEmail(to, subject, body);
      setEmailStatusMsg('Email inviata con successo!');
    } catch (err) {
      console.error(err);
      setEmailStatusMsg("Errore nell'invio dell'email.");
    } finally {
      setIsSendingEmail(false);
      setTimeout(() => setEmailStatusMsg(''), 3000);
    }
  };

  // Generate demo logs if empty so they can test immediately
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    
    // Hardcoded old check for demo
    if (oldPassword !== 'localrescue') {
      setPassError('La password attuale non è corretta.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPassError('La nuova password non coincide con la conferma.');
      return;
    }
    
    if (newPassword.length < 6) {
      setPassError('La nuova password deve essere lunga almeno 6 caratteri.');
      return;
    }
    
    setPassSuccess('Password modificata con successo!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => {
      setIsChangingPass(false);
      setPassSuccess('');
    }, 2000);
  };

  const deleteReport = (id: string, type: 'autisti' | 'sanitari') => {
    if (!window.confirm('Vuoi davvero cancellare questo referto dall\'archivio? L\'azione è irreversibile.')) {
      return;
    }

    if (type === 'autisti') {
      deleteDoc(doc(db, 'autisti_reports', id)).catch(console.error);
      deleteDoc(doc(db, 'cecklist prova', id)).catch(console.error);
      onSaveAutistiReports(prev => prev.filter(r => r.id !== id));
      if (selectedAutisti?.id === id) setSelectedAutisti(null);
    } else {
      deleteDoc(doc(db, 'sanitari_reports', id)).catch(console.error);
      deleteDoc(doc(db, 'cecklist prova', id)).catch(console.error);
      onSaveSanitariReports(prev => prev.filter(r => r.id !== id));
      if (selectedSanitari?.id === id) setSelectedSanitari(null);
    }
  };

  // Combine lists with type metadata
  const combinedReports = [
    ...autistiReports.map(r => ({ ...r, listType: 'autisti' as const, keyId: `aut_${r.id}` })),
    ...sanitariReports.map(r => ({ ...r, listType: 'sanitari' as const, keyId: `san_${r.id}` }))
  ].sort((a, b) => {
    // Basic date parsing comparison (it-IT format dd/mm/yyyy)
    try {
      const partsA = a.date.split('/');
      const partsB = b.date.split('/');
      const timeA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0])).getTime();
      const timeB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0])).getTime();
      return timeB - timeA;
    } catch (e) {
      return 0;
    }
  });


  const toggleBulkSelection = (id: string) => {
    const newSet = new Set(selectedForBulk);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedForBulk(newSet);
  };

  
  const handleUploadToDrive = async (report: any, type: 'autisti' | 'sanitari') => {
    try {
      setIsUploadingDrive(true);
      let token = await getAccessToken();
      if (!token) {
        const result = await googleSignIn();
        token = result?.accessToken || null;
      }
      if (!token) {
        alert("Autenticazione necessaria per Google Drive");
        setIsUploadingDrive(false);
        return;
      }
      
      const { generateAutistiPDF, generateSanitariPDF } = await import('../utils/exports');
      const { uploadFileToDrive } = await import('../lib/drive');
      
      let doc;
      let filename = '';
      const dummySession = {
        name: 'Sistema', role: 'admin', operatorName: 'Centrale', loginTime: new Date().toISOString()
      };
      
      if (type === 'autisti') {
        doc = await generateAutistiPDF(report, dummySession as any);
        filename = `LocalRescue-Checklist-Autisti-${report.vehicleCode}-${report.date.replace(/\//g, '-')}.pdf`;
      } else {
        doc = await generateSanitariPDF(report, dummySession as any);
        filename = `LocalRescue-Checklist-Sanitari-${report.vehicleCode}-${report.date.replace(/\//g, '-')}.pdf`;
      }
      
      const pdfBlob = doc.output('blob');
      await uploadFileToDrive(filename, 'application/pdf', pdfBlob, type);
      alert('Upload su Drive completato con successo!');
    } catch (err) {
      console.error(err);
      alert('Errore durante upload su Drive');
    } finally {
      setIsUploadingDrive(false);
    }
  };

  const handleBulkUploadToDrive = async () => {
    if (selectedForBulk.size === 0) return;
    setIsBulkUploading(true);
    let successCount = 0;
    try {
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (!authRes?.accessToken) {
          throw new Error("Autenticazione fallita o annullata.");
        }
      }

      for (const id of selectedForBulk) {
        const report = combinedReports.find(r => r.id === id);
        if (!report) continue;
        
        const isAut = report.listType === 'autisti';
        
        let docPdf;
        let filename;
        
        if (isAut) {
          const rep = report as AutistiChecklistReport;
          docPdf = await generateAutistiPDF(rep, {
            role: 'autisti',
            operatorName: rep.operator1 || 'N/D',
            vehicleCode: rep.vehicleCode,
            stationName: rep.stationName,
            assignedServiceStation: rep.assignedServiceStation,
            loginTime: '07:00'
          });
          filename = `LocalRescue-Checklist-Autisti-${rep.vehicleCode}-${rep.date.replace(/\//g, '-')}.pdf`;
        } else {
          const rep = report as SanitariChecklistReport;
          docPdf = await generateSanitariPDF(rep, {
            role: 'sanitari',
            operatorName: rep.operatorMat || 'N/D',
            vehicleCode: rep.vehicleCode,
            stationName: rep.stationName,
            assignedServiceStation: rep.assignedServiceStation,
            loginTime: '07:00'
          });
          filename = `LocalRescue-Checklist-Sanitari-${rep.vehicleCode}-${rep.date.replace(/\//g, '-')}.pdf`;
        }
        
        const blob = docPdf.output('blob');
        await uploadFileToDrive(filename, 'application/pdf', blob, isAut ? 'autisti' : 'sanitari');
        successCount++;
      }
      
      alert(`${successCount} referti caricati con successo su Drive.`);
      setSelectedForBulk(new Set());
    } catch (e: any) {
      alert('Errore durante il caricamento massivo: ' + e.message);
    } finally {
      setIsBulkUploading(false);
    }
  };

  // Filtering
  const filteredReports = combinedReports.filter(report => {
    // Search matches vehicle code, station, or operators
    const searchString = `${report.vehicleCode} ${report.stationName} ${report.assignedServiceStation} ${
      report.listType === 'autisti' 
        ? `${report.operator1 || ''} ${report.operator2 || ''}` 
        : `${report.operatorMat || ''} ${report.operatorPom || ''} ${report.operatorNot || ''}`
    }`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType = typeFilter === 'all' || report.listType === typeFilter;

    // Sync filter
    const matchesSync = syncFilter === 'all' 
      || (syncFilter === 'synced' && report.isSynced)
      || (syncFilter === 'local' && !report.isSynced);

    return matchesSearch && matchesType && matchesSync;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">
      

      {/* EXPIRING ALERTS */}
      {expiringAlerts.filter(a => !dismissedAlerts.includes(a.id)).length > 0 && (
        <div className="mb-6 space-y-2">
          {expiringAlerts.filter(a => !dismissedAlerts.includes(a.id)).map(alert => (
            <div key={alert.id} className={`flex items-start justify-between p-4 rounded-xl border shadow-lg ${alert.daysLeft < 0 ? 'bg-red-900/50 border-red-500/50 shadow-red-500/10' : 'bg-amber-900/50 border-amber-500/50 shadow-amber-500/10'}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${alert.daysLeft < 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <Bell className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${alert.daysLeft < 0 ? 'text-red-300' : 'text-amber-300'}`}>
                    Attenzione: Scadenza {alert.type} Mezzo {alert.vehicleCode}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {alert.daysLeft < 0 
                      ? `La scadenza è superata da ${Math.abs(alert.daysLeft)} giorni (Data: ${new Date(alert.expiryDate).toLocaleDateString('it-IT')})`
                      : `Scade tra ${alert.daysLeft} giorni (Data: ${new Date(alert.expiryDate).toLocaleDateString('it-IT')})`
                    }
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-pulse">
            <Cloud className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                CONSOLE CLOUD ATTIVA
              </span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-slate-300 text-xs font-mono">{savedEmail}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight font-display mt-1">
              LocalRescue Cloud Database
            </h1>
            <p className="text-xs text-slate-400">
              Consultazione archivi storici digitali con conformità 118 Taranto e Sanitàservice.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* QR Codes Button */}
          <button
            onClick={() => setShowQRCodes(!showQRCodes)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/20 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Genera QR Code Postazioni</span>
          </button>

          
          {/* Drive Setup Wizard Button */}
          <button
            onClick={() => {
              setShowDriveWizard(true);
              setWizardStep(1);
              setWizardStatus('');
              setWizardError('');
            }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${isGoogleLinked ? 'bg-cyan-900/40 border border-cyan-500/30 text-cyan-300' : 'bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white'}`}
          >
            <Cloud className="w-4 h-4" />
            <span>{isGoogleLinked ? 'Drive Connesso (Verifica)' : 'Configura Google Drive'}</span>
          </button>

          {/* Gmail Connect Button */}
          <button
            onClick={async () => {
              if (isGmailAuth) {
                await logoutGoogle();
                setIsGmailAuth(false);
              } else {
                try {
                  await googleSignIn();
                  setIsGmailAuth(true);
                } catch(e) {}
              }
            }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${isGmailAuth ? 'bg-blue-900/40 border border-blue-500/30 text-blue-300' : 'bg-slate-800 border border-slate-700 text-slate-300'}`}
          >
            <Mail className="w-4 h-4" />
            <span>{isGmailAuth ? 'Gmail Connesso' : 'Connetti Gmail'}</span>
          </button>
          
          {/* Change Password Button */}
          <button
            onClick={() => setIsChangingPass(!isChangingPass)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>Modifica Password Accesso</span>
          </button>

          

          {/* Delete Cloud Data Button */}
          <button
            onClick={() => setIsConfirmingClearAll(true)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all bg-red-600/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-600/20 cursor-pointer"
            title="Elimina in modo permanente tutti i dati salvati nel cloud"
          >
            <Trash2 className="w-4 h-4" />
            <span>Elimina Dati nel Cloud</span>
          </button>

          {/* Log Out */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Esci Archivio</span>
          </button>
        </div>
      </div>

 
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-slate-900/50 rounded-xl border border-white/5 w-fit">
        <button
          onClick={() => setActiveView('archivio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeView === 'archivio' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Archivio Check List</span>
        </button>
        <button
          onClick={() => setActiveView('scadenze')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeView === 'scadenze' 
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scadenze Mezzi</span>
        </button>
      </div>

      {activeView === 'archivio' ? (
        <>

      {/* FEEDBACK SUCCESS POPUP */}
      {showSeedSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs font-medium mb-6 flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Database popolato con referti di test pre-sincronizzati! Puoi procedere alla ricerca e consultazione.</span>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="bg-red-950/40 border border-red-500/35 text-red-300 p-4 rounded-xl text-xs font-medium mb-6 flex items-center gap-3 animate-fade-in shadow-lg">
          <Trash2 className="w-5 h-5 text-red-400 animate-bounce" />
          <span>Operazione completata con successo! I dati selezionati sono stati eliminati permanentemente dal database cloud e dall'archivio locale.</span>
        </div>
      )}

      
      {/* QR CODES SUB-PANEL */}
      {showQRCodes && (
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/5 shadow-xl mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2 uppercase tracking-wider">
              <QrCode className="w-5 h-5" />
              Codici QR Postazioni
            </h3>
            <button 
              onClick={() => setShowQRCodes(false)}
              className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
            >
              Chiudi
            </button>
          </div>
          
          <p className="text-xs text-slate-300 mb-6">
            Scansionando questi QR code, gli operatori verranno reindirizzati direttamente alla schermata di accesso con la postazione già pre-compilata.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {STATION_PRESETS.map((preset) => {
              const url = `${window.location.origin}?station=${encodeURIComponent(preset.name)}`;
              const qrId = `qr-${preset.name.replace(/\s+/g, '-')}`;
              return (
                <div key={preset.name} className="flex flex-col items-center p-4 bg-black/40 rounded-xl border border-white/10">
                  <div id={qrId} className="bg-white p-2 rounded-lg mb-3">
                    <QRCodeSVG value={url} size={120} />
                  </div>
                  <h4 className="text-xs font-bold text-white text-center mb-1">{preset.name}</h4>
                  <p className="text-[10px] text-slate-400 text-center line-clamp-2">{preset.service}</p>
                  
                  <div className="flex gap-2 mt-3 w-full">
                    <button 
                      onClick={() => {
                        const svg = document.getElementById(qrId)?.querySelector('svg');
                        if (!svg) return;
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const img = new Image();
                        img.onload = () => {
                          canvas.width = img.width + 40;
                          canvas.height = img.height + 40;
                          if(ctx) {
                            ctx.fillStyle = "white";
                            ctx.fillRect(0,0, canvas.width, canvas.height);
                            ctx.drawImage(img, 20, 20);
                            const pngFile = canvas.toDataURL('image/png');
                            const downloadLink = document.createElement('a');
                            downloadLink.download = `QRCode-${preset.name}.png`;
                            downloadLink.href = pngFile;
                            downloadLink.click();
                          }
                        };
                        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                      }}
                      className="flex-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 py-1.5 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3 mr-1" /> Salva
                    </button>
                    
                    <button 
                      onClick={() => {
                        const svg = document.getElementById(qrId)?.querySelector('svg');
                        if (!svg) return;
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const printWindow = window.open('', '', 'width=600,height=600');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Stampa QR Code - ${preset.name}</title>
                                <style>
                                  body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                                  .qr-container { padding: 40px; border: 2px solid #000; border-radius: 12px; display: inline-block; text-align: center; }
                                  h1 { margin-top: 20px; font-size: 24px; }
                                  svg { width: 300px; height: 300px; }
                                </style>
                              </head>
                              <body>
                                <div class="qr-container">
                                  ${svgData}
                                  <h1>${preset.name}</h1>
                                </div>
                                <script>
                                  window.onload = () => {
                                    window.print();
                                    setTimeout(() => window.close(), 500);
                                  };
                                </script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                      }}
                      className="flex-1 bg-slate-700/50 hover:bg-slate-600 border border-white/10 text-white py-1.5 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      <Printer className="w-3 h-3 mr-1" /> Stampa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PASSWORD CHANGE SUB-PANEL */}
      {isChangingPass && (
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/5 shadow-xl mb-6 max-w-xl animate-fade-in">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider mb-4">
            <Key className="w-4 h-4" />
            Modifica password amministrativa d'accesso
          </h3>

          <form onSubmit={handlePasswordChangeSubmit} className="flex flex-col gap-4">
            {passError && (
              <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-300 text-xs rounded-lg font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>{passError}</span>
              </div>
            )}
            {passSuccess && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{passSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Password Attuale</label>
                <input
                  type="password"
                  required
                  placeholder="Es: localrescue"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full text-xs p-2.5 bg-black/40 text-white border border-white/10 rounded-lg outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Nuova Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimo 4 caratt."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs p-2.5 bg-black/40 text-white border border-white/10 rounded-lg outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Conferma Nuova</label>
                <input
                  type="password"
                  required
                  placeholder="Ripeti password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs p-2.5 bg-black/40 text-white border border-white/10 rounded-lg outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPass(false);
                  setPassError('');
                  setPassSuccess('');
                }}
                className="py-1.5 px-3 text-xs font-bold text-slate-400 bg-transparent hover:text-white cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Salva Nuova Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* METRIC COUNTERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-black/20 text-center">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Totale Referti Sanitari</span>
          <span className="text-xl md:text-2xl font-black text-red-400 mt-1 block">
            {sanitariReports.length}
          </span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-black/20 text-center">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Totale Referti Autisti</span>
          <span className="text-xl md:text-2xl font-black text-cyan-400 mt-1 block">
            {autistiReports.length}
          </span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-black/20 text-center">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sincronizzati Cloud</span>
          <span className="text-xl md:text-2xl font-black text-emerald-400 mt-1 block">
            {combinedReports.filter(r => r.isSynced).length}
          </span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-black/20 text-center">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Locali Offline</span>
          <span className="text-xl md:text-2xl font-black text-amber-400 mt-1 block">
            {combinedReports.filter(r => !r.isSynced).length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FILTERS & LOG LIST - 7 Columns */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-card p-4 rounded-xl border border-white/10 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              Filtra e Ricerca Database
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              {/* Search text */}
              <div className="sm:col-span-6 relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cerca per mezzo, operatore, postazione..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-8.5 pr-3 py-2 bg-black/40 text-white border border-white/10 rounded-lg outline-none focus:border-emerald-500/50 placeholder-slate-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={typeFilter}
                onChange={(e: any) => setTypeFilter(e.target.value)}
                className="sm:col-span-3 text-xs p-2 bg-black/40 text-slate-300 border border-white/10 rounded-lg outline-none cursor-pointer"
              >
                <option className="bg-slate-950 text-white" value="all">Tutte le schede</option>
                <option className="bg-slate-950 text-white" value="sanitari">Solo Sanitari</option>
                <option className="bg-slate-950 text-white" value="autisti">Solo Autisti</option>
              </select>

              {/* Sync Filter */}
              <select
                value={syncFilter}
                onChange={(e: any) => setSyncFilter(e.target.value)}
                className="sm:col-span-3 text-xs p-2 bg-black/40 text-slate-300 border border-white/10 rounded-lg outline-none cursor-pointer"
              >
                <option className="bg-slate-950 text-white" value="all">Tutti gli stati</option>
                <option className="bg-slate-950 text-white" value="synced">Sincronizzati Cloud</option>
                <option className="bg-slate-950 text-white" value="local">Solo Locali</option>
              </select>
            </div>
          </div>

          {/* MAIN RESULTS CONTAINER */}
          <div className="glass-card rounded-2xl border border-white/10 shadow-lg overflow-hidden flex-1 min-h-[400px] flex flex-col">
            <div className="p-4 bg-white/5 border-b border-white/10 text-xs font-bold text-slate-300 flex justify-between items-center">
              <span>Risultati Database ({filteredReports.length})</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">MARCA TEMPORALE CRITTOGRAFATA</span>
            </div>

            <div className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[550px] flex-1">
              {filteredReports.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 italic text-xs gap-3">
                  <Database className="w-10 h-10 text-slate-600 stroke-1" />
                  <div>
                    <p className="font-bold text-slate-300 not-italic">Nessun referto trovato</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                      Modifica i filtri di ricerca.
                    </p>
                  </div>
                </div>
              ) : (
                filteredReports.map((report) => {
                  const isAut = report.listType === 'autisti';
                  const mainOperator = isAut 
                    ? (report as AutistiChecklistReport).operator1 
                    : ((report as SanitariChecklistReport).operatorMat || (report as SanitariChecklistReport).operatorPom || 'N/D');

                  
const isSelected = isAut 
                    ? selectedAutisti?.id === report.id
                    : selectedSanitari?.id === report.id;

                  return (
                    <div 
                      key={report.keyId}
                      className={`p-4 rounded-xl border transition-all flex flex-col gap-2.5 ${
                        isSelected 
                          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20' 
                          : 'bg-black/20 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Bulk Upload Checkbox */}
                        <div 
                          className="mr-2 flex items-center justify-center cursor-pointer p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBulkSelection(report.id);
                          }}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedForBulk.has(report.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-black/20 border-white/20'}`}>
                            {selectedForBulk.has(report.id) && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>
                        {/* Summary */}
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            if (isAut) {
                              setSelectedAutisti(report as AutistiChecklistReport);
                              setSelectedSanitari(null);
                            } else {
                              setSelectedSanitari(report as SanitariChecklistReport);
                              setSelectedAutisti(null);
                            }
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isAut 
                                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' 
                                : 'bg-red-500/15 text-red-300 border border-red-500/20'
                            }`}>
                              {isAut ? 'AUTISTI / MEZZO' : 'SANITARI / 118'}
                            </span>

                            {report.isSynced ? (
                              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase">
                                ● IN CLOUD
                              </span>
                            ) : (
                              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase">
                                ○ SOLO LOCALE
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-white text-sm mt-1.5 flex items-center gap-2">
                            Checklist {report.date}
                            <span className="text-xs text-slate-400 font-medium font-mono">({report.date})</span>
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                            Operatore: <strong className="text-white">{mainOperator}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Postazione: {report.stationName} | {report.assignedServiceStation}
                          </p>
                        </div>

                        {/* Action cluster */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {/* Details Toggle */}
                          <button
                            onClick={() => {
                              if (isAut) {
                                setSelectedAutisti(report as AutistiChecklistReport);
                                setSelectedSanitari(null);
                              } else {
                                setSelectedSanitari(report as SanitariChecklistReport);
                                setSelectedAutisti(null);
                              }
                              setIsDetailModalOpen(true);
                            }}
                            className="p-2 text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all cursor-pointer"
                            title="Espandi referto dettagliato"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          
                          {/* Drive Export */}
                          <button
                            onClick={() => handleUploadToDrive(report as any, isAut ? 'autisti' : 'sanitari')}
                            disabled={isUploadingDrive}
                            className="p-2 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/30 rounded-xl border border-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                            title="Salva in Google Drive"
                          >
                            <Cloud className="w-3.5 h-3.5" />
                          </button>

                          {/* PDF Export */}
                          <button
                            onClick={async () => {
                              if (isAut) {
                                const rep = report as AutistiChecklistReport;
                                const doc = await generateAutistiPDF(rep, {
                                  role: 'autisti',
                                  operatorName: rep.operator1 || 'N/D',
                                  vehicleCode: rep.vehicleCode,
                                  stationName: rep.stationName,
                                  assignedServiceStation: rep.assignedServiceStation,
                                  loginTime: '07:00'
                                });
                                doc.save(`LocalRescue-Checklist-Autisti-${rep.vehicleCode}-${rep.date}.pdf`);
                              } else {
                                const rep = report as SanitariChecklistReport;
                                const doc = await generateSanitariPDF(rep, {
                                  role: 'sanitari',
                                  operatorName: rep.operatorMat || 'N/D',
                                  vehicleCode: rep.vehicleCode,
                                  stationName: rep.stationName,
                                  assignedServiceStation: rep.assignedServiceStation,
                                  loginTime: '07:00'
                                });
                                doc.save(`LocalRescue-Checklist-Sanitari-${rep.vehicleCode}-${rep.date}.pdf`);
                              }
                            }}
                            className="p-2 text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all cursor-pointer"
                            title="Scarica PDF Ufficiale"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingReport({
                              id: report.id,
                              type: report.listType,
                              vehicleCode: report.vehicleCode,
                              date: report.date
                            })}
                            className="p-2 text-red-400 bg-red-950/20 hover:bg-red-900/30 rounded-xl border border-red-500/20 transition-all cursor-pointer"
                            title="Elimina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* DETAILED SPEC VIEW PANEL - 5 Columns */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-2xl border border-white/10 shadow-xl overflow-hidden sticky top-20 min-h-[450px] flex flex-col">
            <div className="p-4 bg-white/5 border-b border-white/10 text-white font-bold text-xs uppercase tracking-wider font-display flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Ispezione Referto Cloud
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[580px]">
              {selectedAutisti ? (
                <div className="flex flex-col gap-4 animate-fade-in text-xs">
                  {/* AUTISTI REPORT DETAILS */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">
                        Autisti / Conducente
                      </span>
                      <h3 className="font-extrabold text-white text-base mt-1.5">Checklist Checklist</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Postazione: {selectedAutisti.stationName}</p>
                    </div>
                    <span className="text-slate-400 font-mono">{selectedAutisti.date}</span>
                  </div>

                  {/* Crew members inside */}
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Equipaggio Registrato:</span>
                    <p className="text-white">● Conducente: <strong className="text-cyan-300">{selectedAutisti.operator1 || 'N/D'}</strong></p>
                    {selectedAutisti.operator2 && <p className="text-white">● Soccorritore Accompagnatore: <strong className="text-slate-300">{selectedAutisti.operator2}</strong></p>}
                  </div>

                  {/* Damage Log */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Registro Danni Carrozzeria:</span>
                    {selectedAutisti.damages.length === 0 ? (
                      <p className="text-slate-400 italic">Nessun danno o graffio segnalato (Mezzo integro).</p>
                    ) : (
                      <div className="flex flex-col gap-1 mt-1">
                        {selectedAutisti.damages.map(d => (
                          <div key={d.id} className="p-1.5 rounded bg-red-950/10 border border-red-500/20 text-red-300 flex items-center justify-between text-[11px]">
                            <span>[{d.part}] - {d.type === 'O' ? 'Ammaccatura' : 'Graffio'}: {d.description || 'N/D'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold font-mono">Annotazioni Tecniche:</span>
                    <p className="text-slate-300 italic">{selectedAutisti.notes || 'Nessuna nota aggiuntiva caricata.'}</p>
                  </div>

                  {/* Sub-item checklists */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Controlli Verificati:</span>
                    {selectedAutisti.activities.length === 0 ? (
                      <p className="text-slate-400 italic">Nessuna attività registrata in questa demo.</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {selectedAutisti.activities.slice(0, 8).map(a => (
                          <div key={a.id} className="flex justify-between items-center text-[11px] pb-1 border-b border-white/5">
                            <span className="text-slate-300">{a.name}</span>
                            <span className="text-cyan-400 font-bold">{a.turn1.val || 'CONFORME'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Signatures check */}
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Firme Convalida Turno:</span>
                    <div className="flex flex-col gap-2">
                      {selectedAutisti.signatures.turn1 && (
                        <div className="flex items-center justify-between text-[11px] bg-emerald-950/20 p-1.5 rounded border border-emerald-500/20 text-emerald-300">
                          <span>✓ {selectedAutisti.signatures.turn1.name} (T1)</span>
                          <span className="font-mono">{selectedAutisti.signatures.turn1.timestamp}</span>
                        </div>
                      )}
                      {selectedAutisti.signatures.turn2 && (
                        <div className="flex items-center justify-between text-[11px] bg-emerald-950/20 p-1.5 rounded border border-emerald-500/20 text-emerald-300">
                          <span>✓ {selectedAutisti.signatures.turn2.name} (T2)</span>
                          <span className="font-mono">{selectedAutisti.signatures.turn2.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : selectedSanitari ? (
                <div className="flex flex-col gap-4 animate-fade-in text-xs">
                  {/* SANITARI REPORT DETAILS */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded uppercase">
                        Sanitario / Medico / Infermiere
                      </span>
                      <h3 className="font-extrabold text-white text-base mt-1.5">Controllo Presidi</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Postazione: {selectedSanitari.stationName}</p>
                    </div>
                    <span className="text-slate-400 font-mono">{selectedSanitari.date}</span>
                  </div>

                  {/* Operators */}
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Personale Sanitario Certificante:</span>
                    {selectedSanitari.operatorMat && <p className="text-white">● Turno Mattina: <strong className="text-red-300">{selectedSanitari.operatorMat}</strong></p>}
                    {selectedSanitari.operatorPom && <p className="text-white">● Turno Pomeriggio: <strong className="text-red-300">{selectedSanitari.operatorPom}</strong></p>}
                    {selectedSanitari.operatorNot && <p className="text-white">● Turno Notturno: <strong className="text-red-300">{selectedSanitari.operatorNot}</strong></p>}
                  </div>

                  {/* Expiring meds */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Farmaci in Scadenza Rilevati:
                    </span>
                    {selectedSanitari.pharmacyExpiringMeds?.length === 0 ? (
                      <p className="text-slate-400 italic">Nessun farmaco in scadenza registrato.</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {selectedSanitari.pharmacyExpiringMeds?.map(m => (
                          <div key={m.id} className="p-1.5 rounded bg-amber-950/20 border border-amber-500/20 text-amber-300 flex justify-between">
                            <span>{m.name}</span>
                            <span className="font-bold">SCADE: {m.expiryDate}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Orders */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Richieste Integrazione Deposito:</span>
                    {selectedSanitari.pharmacyOrders?.length === 0 ? (
                      <p className="text-slate-400 italic">Nessun ordine o reintegro richiesto.</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {selectedSanitari.pharmacyOrders?.map(m => (
                          <div key={m.id} className="p-1.5 rounded bg-blue-950/20 border border-blue-500/20 text-blue-300 flex justify-between">
                            <span>{m.name}</span>
                            <span className="font-bold">Q.TÀ: {m.quantityToOrder}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Note di Servizio:</span>
                    <p className="text-slate-300 italic whitespace-pre-wrap">{selectedSanitari.notes || 'Nessuna nota aggiuntiva inserita.'}</p>
                  </div>

                  {/* Item checklists */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Stato Presidi Elettromedicali e Borse:</span>
                    {selectedSanitari.items.length === 0 ? (
                      <p className="text-slate-400 italic">Nessun articolo registrato.</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {selectedSanitari.items.map(itm => (
                          <div key={itm.id} className="flex justify-between items-center text-[11px] pb-1 border-b border-white/5">
                            <span className="text-slate-300">{itm.name} (Q.tà: {itm.qty})</span>
                            <span className={`font-bold ${itm.mat === 'ANOMALIA' ? 'text-red-400' : 'text-emerald-400'}`}>
                              {itm.mat === 'ANOMALIA' ? 'ANOMALO' : 'CONFORME'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 italic gap-2 self-center">
                  <FileText className="w-12 h-12 text-slate-600 stroke-1 mb-2 animate-bounce" />
                  <p className="font-bold text-slate-300 not-italic">Nessun referto sotto ispezione</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Clicca sull'icona del foglio o della riga di un referto a sinistra per caricarlo in questa vista dettagliata e visualizzare tutte le firme digitali e i campi presidi.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/40 border-t border-white/10 text-[10px] text-slate-400 text-center">
              Interfaccia protetta da crittografia asimmetrica SHA-256 e validità legale.
            </div>
          </div>
        </div>

      </div>


        </>
      ) : (
        <ScadenzeMezzi />
      )}

      {/* DETAILED CONSULTATION MODAL */}

      {isDetailModalOpen && (selectedAutisti || selectedSanitari) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Consultazione Dettagliata Referto Cloud
              </span>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer"
              >
                Chiudi ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {selectedAutisti ? (
                <div className="flex flex-col gap-4 text-xs">
                  {/* AUTISTI REPORT DETAILS */}
                  <div className="flex justify-between items-start border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[9px] font-black bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">
                        Autisti / Conducente
                      </span>
                      <h3 className="font-extrabold text-white text-lg mt-1.5">Checklist Checklist</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Postazione: {selectedAutisti.stationName}</p>
                    </div>
                    <span className="text-slate-300 font-mono font-bold bg-white/5 p-1.5 px-2.5 rounded-lg border border-white/5">{selectedAutisti.date}</span>
                  </div>

                  {/* Crew members inside */}
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Equipaggio Certificato:</span>
                    <p className="text-white">● Autista 1 (Certificante): <strong className="text-cyan-300">{selectedAutisti.operator1}</strong></p>
                    {selectedAutisti.operator2 && <p className="text-white">● Autista 2: <strong className="text-cyan-300">{selectedAutisti.operator2}</strong></p>}
                    {selectedAutisti.operator3 && <p className="text-white">● Terzo Componente: <strong className="text-cyan-300">{selectedAutisti.operator3}</strong></p>}
                  </div>

                  {/* Notes */}
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Note di Servizio:</span>
                    <p className="text-slate-300 italic whitespace-pre-wrap">{selectedAutisti.notes || 'Nessuna nota aggiuntiva inserita.'}</p>
                  </div>

                  {/* Damage Map status */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Rilevamento Danni Carrozzeria:</span>
                    {selectedAutisti.damages.length === 0 ? (
                      <p className="text-slate-400 italic">Nessun danno o anomalia di carrozzeria riscontrata.</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {selectedAutisti.damages.map(dmg => (
                          <div key={dmg.id} className="p-1.5 rounded bg-red-950/20 border border-red-500/20 text-red-300 flex justify-between">
                            <span>● {dmg.part}</span>
                            <span className="font-bold italic">{dmg.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Items checklist table */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Esito Controlli e Dotazioni Sanitari:</span>
                    {selectedAutisti.activities.length === 0 ? (
                      <p className="text-slate-400 italic">Nessun controllo compilato.</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {selectedAutisti.activities.map(act => (
                          <div key={act.id} className="flex justify-between items-center text-[11px] pb-1 border-b border-white/5">
                            <span className="text-slate-300">{act.name}</span>
                            <div className="flex gap-2">
                              {act.turn1.status !== 'NON_RILEVATO' && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${act.turn1.status === 'OK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                  T1: {act.turn1.status} {act.turn1.val && `(${act.turn1.val})`}
                                </span>
                              )}
                              {act.turn2.status !== 'NON_RILEVATO' && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${act.turn2.status === 'OK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                  T2: {act.turn2.status} {act.turn2.val && `(${act.turn2.val})`}
                                </span>
                              )}
                              {act.turn3.status !== 'NON_RILEVATO' && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${act.turn3.status === 'OK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                  T3: {act.turn3.status} {act.turn3.val && `(${act.turn3.val})`}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Signatures check */}
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Firme Convalida Turno:</span>
                    <div className="flex flex-col gap-2">
                      {selectedAutisti.signatures.turn1 && (
                        <div className="flex items-center justify-between text-[11px] bg-emerald-950/20 p-1.5 rounded border border-emerald-500/20 text-emerald-300">
                          <span>✓ {selectedAutisti.signatures.turn1.name} (T1)</span>
                          <span className="font-mono">{selectedAutisti.signatures.turn1.timestamp}</span>
                        </div>
                      )}
                      {selectedAutisti.signatures.turn2 && (
                        <div className="flex items-center justify-between text-[11px] bg-emerald-950/20 p-1.5 rounded border border-emerald-500/20 text-emerald-300">
                          <span>✓ {selectedAutisti.signatures.turn2.name} (T2)</span>
                          <span className="font-mono">{selectedAutisti.signatures.turn2.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : selectedSanitari ? (
                <div className="flex flex-col gap-4 text-xs">
                  {/* SANITARI REPORT DETAILS */}
                  <div className="flex justify-between items-start border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[9px] font-black bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded uppercase">
                        Sanitario / Medico / Infermiere
                      </span>
                      <h3 className="font-extrabold text-white text-lg mt-1.5">Controllo Presidi</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Postazione: {selectedSanitari.stationName}</p>
                    </div>
                    <span className="text-slate-300 font-mono font-bold bg-white/5 p-1.5 px-2.5 rounded-lg border border-white/5">{selectedSanitari.date}</span>
                  </div>

                  {/* Operators */}
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Personale Sanitario Certificante:</span>
                    {selectedSanitari.operatorMat && <p className="text-white">● Turno Mattina: <strong className="text-red-300">{selectedSanitari.operatorMat}</strong></p>}
                    {selectedSanitari.operatorPom && <p className="text-white">● Turno Pomeriggio: <strong className="text-red-300">{selectedSanitari.operatorPom}</strong></p>}
                    {selectedSanitari.operatorNot && <p className="text-white">● Turno Notturno: <strong className="text-red-300">{selectedSanitari.operatorNot}</strong></p>}
                  </div>

                  {/* Expiring meds */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Farmaci in Scadenza Rilevati:
                    </span>
                    {selectedSanitari.pharmacyExpiringMeds?.length === 0 ? (
                      <p className="text-slate-400 italic">Nessun farmaco in scadenza registrato.</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {selectedSanitari.pharmacyExpiringMeds?.map(m => (
                          <div key={m.id} className="p-1.5 rounded bg-amber-950/20 border border-amber-500/20 text-amber-300 flex justify-between">
                            <span>{m.name}</span>
                            <span className="font-bold">SCADE: {m.expiryDate}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Orders */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Richieste Integrazione Deposito:</span>
                    {selectedSanitari.pharmacyOrders?.length === 0 ? (
                      <p className="text-slate-400 italic">Nessun ordine o reintegro richiesto.</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {selectedSanitari.pharmacyOrders?.map(m => (
                          <div key={m.id} className="p-1.5 rounded bg-blue-950/20 border border-blue-500/20 text-blue-300 flex justify-between">
                            <span>{m.name}</span>
                            <span className="font-bold">Q.TÀ: {m.quantityToOrder}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Note di Servizio:</span>
                    <p className="text-slate-300 italic whitespace-pre-wrap">{selectedSanitari.notes || 'Nessuna nota aggiuntiva inserita.'}</p>
                  </div>

                  {/* Item checklists */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Stato Presidi Elettromedicali e Borse:</span>
                    {selectedSanitari.items.length === 0 ? (
                      <p className="text-slate-400 italic">Nessun articolo registrato.</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {selectedSanitari.items.map(itm => (
                          <div key={itm.id} className="flex justify-between items-center text-[11px] pb-1 border-b border-white/5">
                            <span className="text-slate-300">{itm.name} (Q.tà: {itm.qty})</span>
                            <span className={`font-bold ${itm.mat === 'ANOMALIA' ? 'text-red-400' : 'text-emerald-400'}`}>
                              {itm.mat === 'ANOMALIA' ? 'ANOMALO' : 'CONFORME'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="p-4 bg-black/40 border-t border-white/10 flex justify-between items-center">
              
              {/* Drive Download Button */}
              <button
                onClick={() => handleUploadToDrive(selectedAutisti || selectedSanitari as any, selectedAutisti ? 'autisti' : 'sanitari')}
                disabled={isUploadingDrive}
                className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl bg-cyan-600/20 border border-cyan-500/30 hover:bg-cyan-600/40 text-cyan-300 font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                <span>Salva in Drive</span>
              </button>

              {/* PDF Download Button inside the Modal too for convenience */}
              <button
                onClick={async () => {
                  if (selectedAutisti) {
                    const doc = await generateAutistiPDF(selectedAutisti, {
                      role: 'autisti',
                      operatorName: selectedAutisti.operator1 || 'N/D',
                      vehicleCode: selectedAutisti.vehicleCode,
                      stationName: selectedAutisti.stationName,
                      assignedServiceStation: selectedAutisti.assignedServiceStation,
                      loginTime: '07:00'
                    });
                    doc.save(`LocalRescue-Checklist-Autisti-${selectedAutisti.vehicleCode}-${selectedAutisti.date}.pdf`);
                  } else if (selectedSanitari) {
                    const doc = await generateSanitariPDF(selectedSanitari, {
                      role: 'sanitari',
                      operatorName: selectedSanitari.operatorMat || 'N/D',
                      vehicleCode: selectedSanitari.vehicleCode,
                      stationName: selectedSanitari.stationName,
                      assignedServiceStation: selectedSanitari.assignedServiceStation,
                      loginTime: '07:00'
                    });
                    doc.save(`LocalRescue-Checklist-Sanitari-${selectedSanitari.vehicleCode}-${selectedSanitari.date}.pdf`);
                  }
                }}
                className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Scarica PDF Referto</span>
              </button>
              
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="py-2 px-5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer border border-white/10"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-4 bg-red-950/20 border-b border-red-500/20 flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
              <Trash2 className="w-4 h-4 text-red-400" />
              Conferma Eliminazione Referto
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-300 leading-relaxed">
                Stai per eliminare in modo definitivo il referto del mezzo <strong className="text-white">{deletingReport.vehicleCode}</strong> registrato in data <strong className="text-white">{deletingReport.date}</strong> dall'Archivio Cloud LocalRescue.
              </p>
              <p className="text-[11px] text-red-400/80 mt-3 font-semibold">
                ⚠ Attenzione: Questa azione è immediata e irreversibile. I dati verranno rimossi permanentemente sia dal Cloud che dal dispositivo locale.
              </p>
            </div>
            <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end gap-2.5">
              <button
                onClick={() => setDeletingReport(null)}
                className="py-2 px-4 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer border border-white/10"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  const { id, type } = deletingReport;
                  if (type === 'autisti') {
                    deleteDoc(doc(db, 'autisti_reports', id)).catch(console.error);
                    deleteDoc(doc(db, 'cecklist prova', id)).catch(console.error);
                    onSaveAutistiReports(prev => prev.filter(r => r.id !== id));
                    if (selectedAutisti?.id === id) setSelectedAutisti(null);
                  } else {
                    deleteDoc(doc(db, 'sanitari_reports', id)).catch(console.error);
                    deleteDoc(doc(db, 'cecklist prova', id)).catch(console.error);
                    onSaveSanitariReports(prev => prev.filter(r => r.id !== id));
                    if (selectedSanitari?.id === id) setSelectedSanitari(null);
                  }
                  setDeletingReport(null);
                  setShowDeleteSuccess(true);
                  setTimeout(() => setShowDeleteSuccess(false), 3000);
                }}
                className="py-2 px-5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border border-red-500/30 shadow-lg shadow-red-950/20"
              >
                Elimina Ora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM CLEAR ALL MODAL */}
      {isConfirmingClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-4 bg-red-950/20 border-b border-red-500/20 flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
              <Trash2 className="w-4 h-4 text-red-400 animate-pulse" />
              Svuota Archivio Database Cloud
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-300 leading-relaxed">
                Stai per eliminare <strong className="text-white">tutti i referti</strong> (Autisti e Sanitari) presenti sia nell'archivio Cloud che memorizzati localmente sul dispositivo.
              </p>
              <p className="text-[11px] text-red-400 mt-3 font-extrabold uppercase tracking-wide">
                ⚠ Azione Estremamente Distruttiva e Irreversibile!
              </p>
            </div>
            <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end gap-2.5">
              <button
                onClick={() => setIsConfirmingClearAll(false)}
                className="py-2 px-4 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer border border-white/10"
              >
                Annulla
              </button>
              <button
                onClick={async () => {
                  const batch = writeBatch(db);
                  autistiReports.forEach(r => { batch.delete(doc(db, 'autisti_reports', r.id)); batch.delete(doc(db, 'cecklist prova', r.id)); });
                  sanitariReports.forEach(r => { batch.delete(doc(db, 'sanitari_reports', r.id)); batch.delete(doc(db, 'cecklist prova', r.id)); });
                  await batch.commit().catch(console.error);

                  onSaveAutistiReports([]);
                  onSaveSanitariReports([]);
                  setSelectedAutisti(null);
                  setSelectedSanitari(null);
                  setIsConfirmingClearAll(false);
                  setShowDeleteSuccess(true);
                  setTimeout(() => setShowDeleteSuccess(false), 3000);
                }}
                className="py-2 px-5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border border-red-500/30 shadow-lg shadow-red-950/20"
              >
                Elimina Tutto il Cloud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
