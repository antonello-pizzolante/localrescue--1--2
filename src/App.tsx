import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Shield, ClipboardCheck, Ambulance, HelpCircle, LogOut, Cloud, Wifi, WifiOff } from 'lucide-react';
import { UserSession, AutistiChecklistReport, SanitariChecklistReport } from './types';
import { collection, collectionGroup, onSnapshot, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from './lib/firebase';
import Login from './components/Login';
import AutistiForm from './components/AutistiForm';
import SanitariForm from './components/SanitariForm';
import Dashboard from './components/Dashboard';
import CloudArchiveConsole from './components/CloudArchiveConsole';

import { getAccessToken } from './lib/auth';
import { uploadFileToDrive } from './lib/drive';
import { generateAutistiPDF, generateSanitariPDF } from './utils/exports';

import FoglioDiMarcia from './components/FoglioDiMarcia';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('118_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [autistiReports, setAutistiReports] = useState<AutistiChecklistReport[]>(() => {
    const saved = localStorage.getItem('118_autisti_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [sanitariReports, setSanitariReports] = useState<SanitariChecklistReport[]>(() => {
    const saved = localStorage.getItem('118_sanitari_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'compiler' | 'dashboard'>('compiler');

  // Real-time clock state
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  // Online/Offline status
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof window !== 'undefined' ? window.navigator.onLine : true);

  // Auto-sync notifications state
  const [showSyncNotification, setShowSyncNotification] = useState<{
    show: boolean;
    count: number;
    type: 'success' | 'offline' | 'online';
  }>({ show: false, count: 0, type: 'success' });

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentDateTime(`${dateStr} ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync state and automatically handle connectivity restore

  useEffect(() => {
    if (session) {
      localStorage.setItem('118_active_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('118_active_session');
    }
  }, [session]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      // Auto-sync any unsynced local reports automatically
      let count = 0;
      let syncedSome = false;

      setAutistiReports(prev => {
        const unsynced = prev.filter(r => !r.isSynced);
        if (unsynced.length > 0) {
          syncedSome = true;
          count += unsynced.length;
          unsynced.forEach(r => {
            const finalR = { ...r, isSynced: true };
            setDoc(doc(db, 'autisti_reports', r.id), finalR).catch(console.error);
            setDoc(doc(db, 'cecklist prova', r.id), finalR).catch(console.error);
          });
          return prev.map(r => ({ ...r, isSynced: true }));
        }
        return prev;
      });

      setSanitariReports(prev => {
        const unsynced = prev.filter(r => !r.isSynced);
        if (unsynced.length > 0) {
          syncedSome = true;
          count += unsynced.length;
          unsynced.forEach(r => {
            const finalR = { ...r, isSynced: true };
            setDoc(doc(db, 'sanitari_reports', r.id), finalR).catch(console.error);
            setDoc(doc(db, 'cecklist prova', r.id), finalR).catch(console.error);
          });
          return prev.map(r => ({ ...r, isSynced: true }));
        }
        return prev;
      });

      setShowSyncNotification({
        show: true,
        count,
        type: syncedSome ? 'success' : 'online'
      });

      setTimeout(() => {
        setShowSyncNotification(prev => ({ ...prev, show: false }));
      }, syncedSome ? 5000 : 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowSyncNotification({
        show: true,
        count: 0,
        type: 'offline'
      });
      setTimeout(() => {
        setShowSyncNotification(prev => ({ ...prev, show: false }));
      }, 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  useEffect(() => {
    if (!isOnline || !session) return;

    let autistiQuery;
    let sanitariQuery;

    if (session.role === 'consultazione') {
      autistiQuery = collectionGroup(db, 'autisti_reports');
      sanitariQuery = collectionGroup(db, 'sanitari_reports');
    } else {
      const sanitizedStation = session.stationName.replace(/[/#]/g, '_') || 'default_station';
      autistiQuery = collection(db, 'postazioni', sanitizedStation, 'autisti_reports');
      sanitariQuery = collection(db, 'postazioni', sanitizedStation, 'sanitari_reports');
    }

    const unsubAutisti = onSnapshot(autistiQuery, (snapshot) => {
      const reports = snapshot.docs.map(doc => doc.data() as AutistiChecklistReport);
      
      setAutistiReports(prev => {
        const unsynced = prev.filter(r => !r.isSynced);
        const map = new Map();
        reports.forEach(r => map.set(r.id, r));
        unsynced.forEach(r => map.set(r.id, r));
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return merged;
      });
    });

    const unsubSanitari = onSnapshot(sanitariQuery, (snapshot) => {
      const reports = snapshot.docs.map(doc => doc.data() as SanitariChecklistReport);
      
      setSanitariReports(prev => {
        const unsynced = prev.filter(r => !r.isSynced);
        const map = new Map();
        reports.forEach(r => map.set(r.id, r));
        unsynced.forEach(r => map.set(r.id, r));
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return merged;
      });
    });

    return () => {
      unsubAutisti();
      unsubSanitari();
    };
  }, [isOnline, session]);

  // Sync state to local storage

  useEffect(() => {
    localStorage.setItem('118_autisti_reports', JSON.stringify(autistiReports));
  }, [autistiReports]);

  useEffect(() => {
    localStorage.setItem('118_sanitari_reports', JSON.stringify(sanitariReports));
  }, [sanitariReports]);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    setActiveTab('compiler');
  };

  const handleLogout = () => {
    setSession(null);
    setActiveTab('compiler');
  };

  const handleSaveAutistiReport = async (report: AutistiChecklistReport) => {
    const isOnlineNow = typeof window !== 'undefined' ? window.navigator.onLine : true;
    const finalReport = { ...report, isSynced: isOnlineNow };
    
    // Update local state immediately for fast UI
    setAutistiReports(prev => {
      const idx = prev.findIndex(r => r.id === finalReport.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = finalReport;
        return copy;
      }
      return [finalReport, ...prev];
    });


    if (isOnlineNow) {
      try {
        const sanitizedStation = finalReport.stationName.replace(/[/#]/g, '_') || 'default_station';
        await setDoc(doc(db, 'postazioni', sanitizedStation, 'autisti_reports', finalReport.id), finalReport);
        
        // Auto Upload to Drive
        try {
          let token = await getAccessToken();
          if (!token) {
             console.log("Not logged in to Google Workspace, skipping auto-upload to drive");
          } else {
             const docPdf = await generateAutistiPDF(finalReport, session!);
             const blob = docPdf.output('blob');
             const filename = `LocalRescue-Checklist-Autisti-${finalReport.vehicleCode}-${finalReport.date.replace(/\//g, '-')}.pdf`;
             await uploadFileToDrive(filename, 'application/pdf', blob, 'autisti');
          }
        } catch (e) {
          console.error("Auto upload to drive failed", e);
        }

      } catch (err) {
        console.error("Error saving to Firebase", err);
      }
    }
  };

  const handleSaveSanitariReport = async (report: SanitariChecklistReport) => {
    const isOnlineNow = typeof window !== 'undefined' ? window.navigator.onLine : true;
    const finalReport = { ...report, isSynced: isOnlineNow };

    setSanitariReports(prev => {
      const idx = prev.findIndex(r => r.id === finalReport.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = finalReport;
        return copy;
      }
      return [finalReport, ...prev];
    });


    if (isOnlineNow) {
      try {
        const sanitizedStation = finalReport.stationName.replace(/[/#]/g, '_') || 'default_station';
        await setDoc(doc(db, 'postazioni', sanitizedStation, 'sanitari_reports', finalReport.id), finalReport);

        // Auto Upload to Drive
        try {
          let token = await getAccessToken();
          if (!token) {
             console.log("Not logged in to Google Workspace, skipping auto-upload to drive");
          } else {
             const docPdf = await generateSanitariPDF(finalReport, session!);
             const blob = docPdf.output('blob');
             const filename = `LocalRescue-Checklist-Sanitari-${finalReport.vehicleCode}-${finalReport.date.replace(/\//g, '-')}.pdf`;
             await uploadFileToDrive(filename, 'application/pdf', blob, 'sanitari');
          }
        } catch (e) {
          console.error("Auto upload to drive failed", e);
        }

      } catch (err) {
        console.error("Error saving to Firebase", err);
      }
    }
  };

  const selectAutistiReport = (report: AutistiChecklistReport) => {
    // Mimic session and focus
    setActiveTab('compiler');
  };

  const selectSanitariReport = (report: SanitariChecklistReport) => {
    // Mimic session and focus
    setActiveTab('compiler');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans antialiased">
      {/* AUTO-SYNC & CONNECTIVITY NOTIFICATION */}
      {showSyncNotification.show && (
        <div className={`fixed bottom-6 left-6 z-50 p-4 rounded-xl border shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-3 max-w-sm transition-all duration-300 transform translate-y-0 ${
          showSyncNotification.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/20' 
            : showSyncNotification.type === 'offline'
            ? 'bg-amber-950/90 border-amber-500/40 text-amber-200 shadow-amber-950/20'
            : 'bg-cyan-950/90 border-cyan-500/40 text-cyan-200 shadow-cyan-950/20'
        }`}>
          {showSyncNotification.type === 'success' ? (
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Cloud className="w-5 h-5 animate-bounce" />
            </div>
          ) : showSyncNotification.type === 'offline' ? (
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 animate-pulse">
              <WifiOff className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 animate-pulse">
              <Wifi className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wide">
              {showSyncNotification.type === 'success' 
                ? 'Sincronizzazione Automatica' 
                : showSyncNotification.type === 'offline'
                ? 'Connettività Assente (Offline)'
                : 'Connessione Ripristinata'
              }
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">
              {showSyncNotification.type === 'success' 
                ? `Rete ripristinata: sincronizzati con successo ${showSyncNotification.count} referti locali nel Cloud!` 
                : showSyncNotification.type === 'offline'
                ? 'L\'app è passata in modalità offline. Tutti i dati inseriti verranno memorizzati localmente sul dispositivo.'
                : 'Sei di nuovo online. Tutti i sistemi sono sincronizzati in tempo reale.'
              }
            </p>
          </div>
        </div>
      )}

      {/* GLOBAL BANNER HEADER */}
      {session ? (
        <header className="sticky top-0 z-40 bg-white/5 border-b border-white/10 shadow-lg backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            
            {/* BRANDING LOGO ACCORDING TO USER'S ROLE */}
            <div className="flex items-center gap-3">
              {session.role === 'sanitari' ? (
                // Sanitari View logo: ONLY 118 Taranto Soccorso
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-md relative">
                    <span className="font-sans font-black text-white text-sm">118</span>
                    <span className="absolute -bottom-1 bg-blue-900 text-[5px] font-bold text-white px-1 py-0.5 rounded uppercase tracking-wider">
                      Taranto
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-white tracking-tight block uppercase leading-none">
                      Check List 118
                    </span>
                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider block mt-0.5">
                      Taranto Soccorso
                    </span>
                  </div>
                </div>
              ) : session.role === 'autisti' ? (
                // Autisti View logo: ONLY Sanitàservice
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 flex flex-col items-center justify-center shadow-sm border border-cyan-500/10 p-0.5">
                    <Shield className="w-4 h-4 text-white" />
                    <span className="text-[5px] font-bold text-white uppercase leading-none mt-0.5">Sanità</span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-white tracking-tight block uppercase leading-none">
                      Check List Autisti
                    </span>
                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider block mt-0.5">
                      Sanitàservice ASL TA
                    </span>
                  </div>
                </div>
              ) : session.role === 'foglio_marcia' ? (
                // Foglio di Marcia View logo: Sky color theme
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center shadow-md relative">
                    <ClipboardCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white tracking-tight block uppercase leading-none">
                      Foglio di Marcia
                    </span>
                    <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider block mt-0.5">
                      Diario di Bordo Cloud
                    </span>
                  </div>
                </div>
              ) : (
                // Consultation View logo: Emerald color theme cloud
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md relative">
                    <Cloud className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white tracking-tight block uppercase leading-none">
                      Cloud Archive
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mt-0.5">
                      LocalRescue Console
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* TAB SELECTORS */}
            {session.role !== 'consultazione' && session.role !== 'foglio_marcia' && (
              <nav className="flex gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('compiler')}
                  className={`flex items-center gap-2 py-1.5 px-3 md:px-4 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'compiler'
                      ? 'bg-white/10 text-white shadow-md border border-white/15'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Compilatore Scheda</span>
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 py-1.5 px-3 md:px-4 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-white/10 text-white shadow-md border border-white/15'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Cruscotto Equipaggi</span>
                </button>
              </nav>
            )}

            {/* USER CONTROLS */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right text-xs">
                <span className="block font-bold text-white leading-tight truncate max-w-[140px]">{session.operatorName}</span>
                <span className="text-[9px] text-slate-400 font-medium">
                  {session.role === 'consultazione' 
                    ? 'Console Archivio Cloud' 
                    : session.role === 'foglio_marcia'
                    ? `Mezzo: ${session.vehicleCode} (${session.stationName})`
                    : `Assegnato: ${session.vehicleCode} (${session.stationName})`}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-300 hover:text-red-400 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                title="Cambio Operatore / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
      ) : null}

      {/* MAIN CONTAINER */}
      <main className="py-6 min-h-[85vh]">
        {!session ? (
          <Login onLogin={handleLogin} />
        ) : session.role === 'consultazione' ? (
          <CloudArchiveConsole
            session={session}
            onLogout={handleLogout}
            autistiReports={autistiReports}
            sanitariReports={sanitariReports}
            onSaveAutistiReports={setAutistiReports}
            onSaveSanitariReports={setSanitariReports}
          />
        ) : session.role === 'foglio_marcia' ? (
          <FoglioDiMarcia
            session={session}
            onLogout={handleLogout}
            isOnline={isOnline}
          />
        ) : activeTab === 'compiler' ? (
          session.role === 'autisti' ? (
            <AutistiForm
              session={session}
              onLogout={handleLogout}
              onSaveReport={handleSaveAutistiReport}
              savedReports={autistiReports}
              isOnline={isOnline}
            />
          ) : (
            <SanitariForm
              session={session}
              onLogout={handleLogout}
              onSaveReport={handleSaveSanitariReport}
              savedReports={sanitariReports}
              isOnline={isOnline}
            />
          )
        ) : (
          <Dashboard
            autistiReports={autistiReports}
            sanitariReports={sanitariReports}
            onSelectAutistiReport={selectAutistiReport}
            onSelectSanitariReport={selectSanitariReport}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-black/40 text-slate-400 py-6 text-center border-t border-white/10 text-[11px] backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p>© 2026 - LocalRescue • Check List 118 Taranto Soccorso • Centrale Operativa</p>
              
            </div>
            
            <div className="flex items-center justify-center sm:justify-start mt-2 border-t border-white/5 pt-4">
               {/* Il logo fornito dall'utente. Assicurati di caricare il file immagine in "public/footer-logo.png" */}
               <img 
                 src="/footer-logo.png" 
                 alt="Produced by Action Minds, Designed by Antonello Pizzolante & Mirko Serio" 
                 className="h-8 object-contain opacity-90 hover:opacity-100 transition-opacity"
               />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isOnline ? (
              <span className="bg-emerald-500/10 border border-emerald-500/20 p-1 px-2.5 rounded text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 shadow-sm">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Online / Sincronizzato</span>
              </span>
            ) : (
              <span className="bg-amber-500/10 border border-amber-500/20 p-1 px-2.5 rounded text-[10px] text-amber-400 font-bold flex items-center gap-1.5 shadow-sm animate-pulse">
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline / Archivio Locale</span>
              </span>
            )}
            <span className="bg-white/5 border border-white/5 p-1 px-2.5 rounded text-[10px] text-slate-400">Ambiente Cloud LocalRescue (Attivo)</span>
            <span className="text-slate-300 font-bold flex items-center gap-1.5 font-mono bg-white/5 border border-white/5 p-1 px-2.5 rounded">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {currentDateTime || 'Caricamento ora...'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
