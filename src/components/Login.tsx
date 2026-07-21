import React, { useState, useEffect } from 'react';
import { 
  Shield, Ambulance, CheckCircle, UserCheck, MapPin, Cloud, Lock, Mail, 
  KeyRound, Database, Phone, Smartphone, Send, ArrowLeft, RefreshCw, UserPlus,
  FileText
} from 'lucide-react';
import { UserSession } from '../types';
import { STATION_PRESETS } from '../data';
import SignaturePad from './SignaturePad';
import { SanitaserviceLogo, TarantoSoccorsoLogo } from './Logos';

interface LoginProps {
  onLogin: (session: UserSession) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [activeRole, setActiveRole] = useState<'sanitari' | 'autisti' | 'consultazione' | 'foglio_marcia'>('sanitari');
  const [operatorName, setOperatorName] = useState('');
  const [operatorRescuerName, setOperatorRescuerName] = useState('');
  const [driverSignature, setDriverSignature] = useState<string | null>(null);
  const [rescuerSignature, setRescuerSignature] = useState<string | null>(null);
  const [qualification, setQualification] = useState<'infermiere' | 'medico'>('infermiere');
  const [vehicleCode, setVehicleCode] = useState('');
  const [stationName, setStationName] = useState('INDIA CENTRO');
  const [assignedServiceStation, setAssignedServiceStation] = useState('TARANTO CENTRO');

  // Consultation Navigation State
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Consultation state managers
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberCredentials, setRememberCredentials] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isModifyingDirectly, setIsModifyingDirectly] = useState(false);
  const [newDirectPassword, setNewDirectPassword] = useState('');
  const [confirmDirectPassword, setConfirmDirectPassword] = useState('');
  const [directPassSuccess, setDirectPassSuccess] = useState('');

  // Registration States
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Retrieve registered users from localStorage
  const getRegisteredUsers = () => {
    try {
      const usersStr = localStorage.getItem('localrescue_registered_users');
      if (usersStr) return JSON.parse(usersStr);
    } catch (e) {}
    return [
      {
        email: 'centrale@localrescue.it',
        password: 'localrescue',
        phone: '+393331234567'
      }
    ];
  };

  // Save registered users to localStorage
  const saveRegisteredUsers = (users: any[]) => {
    localStorage.setItem('localrescue_registered_users', JSON.stringify(users));
  };

  useEffect(() => {
    // Initialize user list with default admin account
    const usersStr = localStorage.getItem('localrescue_registered_users');
    if (!usersStr) {
      const defaultUsers = [
        {
          email: 'centrale@localrescue.it',
          password: 'localrescue',
          phone: '+393331234567'
        }
      ];
      localStorage.setItem('localrescue_registered_users', JSON.stringify(defaultUsers));
    }

    const savedCredsStr = localStorage.getItem('localrescue_credentials');
    if (savedCredsStr) {
      try {
        const savedCreds = JSON.parse(savedCredsStr);
        setEmail(savedCreds.email || 'centrale@localrescue.it');
        setRememberCredentials(!!savedCreds.remember);
        if (savedCreds.remember && savedCreds.password) {
          setPassword(savedCreds.password);
        }
      } catch (e) {
        setEmail('centrale@localrescue.it');
      }
    } else {
      const defaultCred = {
        email: 'centrale@localrescue.it',
        password: 'localrescue',
        remember: true
      };
      localStorage.setItem('localrescue_credentials', JSON.stringify(defaultCred));
      setEmail('centrale@localrescue.it');
      setPassword('localrescue');
      setRememberCredentials(true);
    }
  }, []);

  const stationPresets = STATION_PRESETS;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stationParam = urlParams.get('station');
    if (stationParam) {
      const preset = stationPresets.find(p => p.name === stationParam);
      if (preset) {
        setStationName(preset.name);
        setAssignedServiceStation(preset.service);
      }
    }
  }, []);

  const handleStationChange = (stationName: string) => {
    setStationName(stationName);
    const preset = stationPresets.find(p => p.name === stationName);
    if (preset) {
      setAssignedServiceStation(preset.service);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setDirectPassSuccess('');

    if (activeRole === 'consultazione') {
      const users = getRegisteredUsers();
      const user = users.find((u: any) => u.email.trim().toLowerCase() === email.trim().toLowerCase());

      if (!user) {
        setLoginError('Email non abilitata per la consultazione del database. Registrati se non lo hai già fatto.');
        return;
      }

      if (password !== user.password) {
        setLoginError('Password non corretta.');
        return;
      }

      // Save credentials state
      const credsToSave = {
        email: email.trim(),
        password: rememberCredentials ? password : '',
        remember: rememberCredentials
      };
      localStorage.setItem('localrescue_credentials', JSON.stringify(credsToSave));

      onLogin({
        role: 'consultazione',
        operatorName: 'Operatore Centrale Cloud',
        vehicleCode: 'DB-CLOUD',
        stationName: 'Centrale Taranto',
        assignedServiceStation: 'Centrale Operativa 118',
        loginTime: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }

    if (!operatorName.trim()) return;
    if (activeRole === 'autisti' && !operatorRescuerName.trim()) {
      return;
    }

    onLogin({
      role: activeRole,
      operatorName: operatorName.trim(),
      vehicleCode,
      stationName,
      assignedServiceStation,
      loginTime: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      operatorRescuerName: activeRole === 'autisti' ? operatorRescuerName.trim() : undefined,
      qualification: activeRole === 'sanitari' ? qualification : undefined
    });
  };

  // 1. Registration Handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setRegSuccess('');

    if (!regEmail.trim() || !regPassword || !regConfirmPassword) {
      setLoginError('Tutti i campi sono obbligatori.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setLoginError('Le password non coincidono.');
      return;
    }

    if (regPassword.length < 4) {
      setLoginError('La password deve essere di almeno 4 caratteri.');
      return;
    }

    const users = getRegisteredUsers();
    if (users.some((u: any) => u.email.trim().toLowerCase() === regEmail.trim().toLowerCase())) {
      setLoginError('Un account con questa email è già registrato.');
      return;
    }

    const newUser = {
      email: regEmail.trim(),
      password: regPassword,
      phone: ''
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    // Also sync localrescue_credentials for backwards compatibility
    localStorage.setItem('localrescue_credentials', JSON.stringify({
      email: regEmail.trim(),
      password: regPassword,
      remember: true
    }));

    setRegSuccess('Registrazione completata con successo! Ora puoi effettuare l\'accesso.');
    
    // Reset registration form
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
    
    setTimeout(() => {
      setAuthView('login');
      setRegSuccess('');
    }, 2500);
  };

  const isAutistiMissingDetails = activeRole === 'autisti' && (!operatorName.trim() || !operatorRescuerName.trim());
  const isSanitariMissingDetails = activeRole === 'sanitari' && !operatorName.trim();
  const isFoglioMarciaMissingDetails = activeRole === 'foglio_marcia' && (!vehicleCode.trim() || !operatorName.trim());
  const isConsultazioneMissingDetails = activeRole === 'consultazione' && (
    authView === 'login' && (!email.trim() || !password.trim())
  );
  const isDisabled = isAutistiMissingDetails || isSanitariMissingDetails || isConsultazioneMissingDetails || isFoglioMarciaMissingDetails;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl glass-card rounded-2xl shadow-2xl overflow-hidden">
        {/* LOGO BOX - Displays BOTH Logos as requested */}
        <div className="bg-white/5 p-6 border-b border-white/10 text-center flex flex-col items-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <SanitaserviceLogo className="scale-105 shadow-md" />
            <div className="hidden sm:block h-8 w-px bg-white/10" />
            <TarantoSoccorsoLogo className="scale-105 shadow-md" />
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight font-display">
            LOCALRESCUE - CHECK LIST 118
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sistema Integrato di Controllo, Tracciabilità e Validazione Turni
          </p>
        </div>

        {/* ROLE TABS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 bg-white/5 border border-white/10 p-1.5 m-6 mb-0 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveRole('sanitari');
              setLoginError('');
              setDirectPassSuccess('');
            }}
            className={`py-2.5 text-[10px] md:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 md:gap-2 ${
              activeRole === 'sanitari'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            Sanitari (118)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRole('autisti');
              setLoginError('');
              setDirectPassSuccess('');
            }}
            className={`py-2.5 text-[10px] md:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 md:gap-2 ${
              activeRole === 'autisti'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ambulance className="w-4 h-4 text-cyan-400" />
            Autisti (Mezzo)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRole('foglio_marcia');
              setLoginError('');
              setDirectPassSuccess('');
            }}
            className={`py-2.5 text-[10px] md:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 md:gap-2 ${
              activeRole === 'foglio_marcia'
                ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-400" />
            Foglio Marcia
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRole('consultazione');
              setLoginError('');
              setDirectPassSuccess('');
            }}
            className={`py-2.5 text-[10px] md:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 md:gap-2 ${
              activeRole === 'consultazione'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4 text-emerald-400" />
            Consultazione
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {activeRole === 'consultazione' ? (
            <div className="flex flex-col gap-4">
              {loginError && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span>{loginError}</span>
                </div>
              )}
              {directPassSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{directPassSuccess}</span>
                </div>
              )}
              {regSuccess && (
                <div className="p-3 bg-blue-950/40 border border-blue-500/30 text-blue-400 text-xs rounded-xl font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* VIEW 1: EMAIL & PASSWORD LOGIN */}
              {authView === 'login' && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Email Field */}
                  <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex items-center gap-3 focus-within:border-white/20 transition-all">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Email Amministratore / Centrale
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="Es: centrale@localrescue.it"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-sm text-white font-medium placeholder-slate-500 outline-none mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex items-center gap-3 focus-within:border-white/20 transition-all">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          Password Archivio Cloud
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsModifyingDirectly(!isModifyingDirectly)}
                          className="text-[9px] font-bold text-emerald-400 hover:underline hover:text-emerald-300 cursor-pointer"
                        >
                          {isModifyingDirectly ? 'Annulla cambio' : 'Modifica password'}
                        </button>
                      </div>
                      <input
                        required={!isModifyingDirectly}
                        type="password"
                        placeholder="Password d'accesso"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isModifyingDirectly}
                        className="w-full bg-transparent text-sm text-white font-medium placeholder-slate-500 outline-none mt-0.5 disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* DIRECT PASSWORD MODIFICATION EXPANSION */}
                  {isModifyingDirectly && (
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 flex flex-col gap-3">
                      <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5" />
                        CAMBIA LA PASSWORD ADESSO
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Nuova Password</label>
                          <input
                            type="password"
                            placeholder="Almeno 4 caratt."
                            value={newDirectPassword}
                            onChange={(e) => setNewDirectPassword(e.target.value)}
                            className="w-full bg-black/40 p-2 text-xs rounded border border-white/10 text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Conferma Nuova</label>
                          <input
                            type="password"
                            placeholder="Ripeti password"
                            value={confirmDirectPassword}
                            onChange={(e) => setConfirmDirectPassword(e.target.value)}
                            className="w-full bg-black/40 p-2 text-xs rounded border border-white/10 text-white outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginError('');
                          setDirectPassSuccess('');
                          if (!newDirectPassword || !confirmDirectPassword) {
                            setLoginError('Inserisci la nuova password e la sua conferma.');
                            return;
                          }
                          if (newDirectPassword !== confirmDirectPassword) {
                            setLoginError('Le password non coincidono.');
                            return;
                          }
                          if (newDirectPassword.length < 4) {
                            setLoginError('La password deve essere di almeno 4 caratteri.');
                            return;
                          }
                          const users = getRegisteredUsers();
                          const currentEmail = email || 'centrale@localrescue.it';
                          const userIdx = users.findIndex((u: any) => u.email.trim().toLowerCase() === currentEmail.trim().toLowerCase());
                          if (userIdx !== -1) {
                            users[userIdx].password = newDirectPassword;
                          } else {
                            users.push({
                              email: currentEmail,
                              password: newDirectPassword,
                              phone: '+393331234567'
                            });
                          }
                          saveRegisteredUsers(users);
                          localStorage.setItem('localrescue_credentials', JSON.stringify({
                            email: currentEmail,
                            password: newDirectPassword,
                            remember: rememberCredentials
                          }));
                          if (rememberCredentials) {
                            setPassword(newDirectPassword);
                          }
                          setDirectPassSuccess('Password modificata con successo!');
                          setIsModifyingDirectly(false);
                          setNewDirectPassword('');
                          setConfirmDirectPassword('');
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                      >
                        Salva e Applica Password
                      </button>
                    </div>
                  )}

                  {/* Remember Credentials Checkbox */}
                  <label className="flex items-center gap-2 px-1 text-xs text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberCredentials}
                      onChange={(e) => setRememberCredentials(e.target.checked)}
                      className="rounded bg-black/40 border-white/10 text-emerald-600 focus:ring-emerald-500/20"
                    />
                    <span>Ricorda e memorizza le credenziali sul dispositivo</span>
                  </label>

                  {/* SUBMIT LOG IN BUTTON */}
                  <button
                    type="submit"
                    disabled={isDisabled || isModifyingDirectly}
                    className="w-full py-3.5 mt-2 rounded-xl text-white font-bold text-sm shadow-lg bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Accedi all'Archivio Cloud
                  </button>

                  {/* NAVIGATION LINKS CONTAINER */}
                  <div className="flex flex-col gap-2.5 mt-2 pt-4 border-t border-white/5 text-[11px]">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Non hai un account?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthView('register');
                          setLoginError('');
                          setRegSuccess('');
                        }}
                        className="text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Registrati
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* VIEW 2: ACCOUNT REGISTRATION */}
              {authView === 'register' && (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl mb-1">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      💡 Registra qui la tua email e password per abilitare la consultazione dell'archivio cloud.
                    </p>
                  </div>

                  {/* Email Field */}
                  <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex items-center gap-3 focus-within:border-white/20 transition-all">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Email Amministratore / Centrale
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="Es: centrale@localrescue.it"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-transparent text-sm text-white font-medium placeholder-slate-500 outline-none mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/20 p-3.5 rounded-xl border border-white/10 flex items-center gap-2.5 focus-within:border-white/20 transition-all">
                      <div className="flex-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                          Scegli Password
                        </label>
                        <input
                          required
                          type="password"
                          placeholder="Almeno 4 caratt."
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-transparent text-xs text-white font-medium placeholder-slate-500 outline-none mt-0.5"
                        />
                      </div>
                    </div>

                    <div className="bg-black/20 p-3.5 rounded-xl border border-white/10 flex items-center gap-2.5 focus-within:border-white/20 transition-all">
                      <div className="flex-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                          Conferma Password
                        </label>
                        <input
                          required
                          type="password"
                          placeholder="Ripeti password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full bg-transparent text-xs text-white font-medium placeholder-slate-500 outline-none mt-0.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SUBMIT REGISTRATION BUTTON */}
                  <button
                    type="submit"
                    className="w-full py-3.5 mt-2 rounded-xl text-white font-bold text-sm shadow-lg bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Registrati
                  </button>

                  {/* BACK TO LOGIN */}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('login');
                      setLoginError('');
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 py-2 mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Torna alla schermata di accesso
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* STATION ROW */}
              <div className="grid grid-cols-1 gap-4">
                {/* Postazione */}
                <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex items-center gap-3 focus-within:border-white/20 transition-all">
                  <div className={`p-2 rounded-lg ${
                    activeRole === 'sanitari' 
                      ? 'bg-red-500/10 text-red-400' 
                      : activeRole === 'foglio_marcia'
                      ? 'bg-sky-500/10 text-sky-400'
                      : 'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Postazione
                    </label>
                    <select
                      value={stationName}
                      onChange={(e) => handleStationChange(e.target.value)}
                      className="w-full bg-transparent text-sm text-white font-medium outline-none mt-0.5 cursor-pointer border-none p-0 focus:ring-0"
                    >
                      {stationPresets.map((p) => (
                        <option className="bg-slate-900 text-white" key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* DYNAMIC ROLE FIELDS */}
              {activeRole === 'sanitari' ? (
                <div className="flex flex-col gap-4">
                  {/* Nome Operatore */}
                  <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex items-center gap-3 focus-within:border-white/20 transition-all">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Nome e Cognome Operatore Sanitario
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Es: Dott. Mario Rossi"
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        className="w-full bg-transparent text-sm text-white font-medium placeholder-slate-500 outline-none mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Qualifica Row for Sanitari */}
                  <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex flex-col gap-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Qualifica Professionale
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setQualification('infermiere')}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          qualification === 'infermiere'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-inner font-black'
                            : 'bg-transparent text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        <span>Infermiere</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setQualification('medico')}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          qualification === 'medico'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-inner font-black'
                            : 'bg-transparent text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        <span>Medico</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeRole === 'foglio_marcia' ? (
                <div className="flex flex-col gap-4">
                  {/* Nome Operatore per Foglio di marcia */}
                  <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex items-center gap-3 focus-within:border-white/20 transition-all">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Nome e Cognome Autista di Turno
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Es: Giuseppe Verdi"
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        className="w-full bg-transparent text-sm text-white font-medium placeholder-slate-500 outline-none mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Targa del Mezzo */}
                  <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex items-center gap-3 focus-within:border-white/20 transition-all">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                      <Ambulance className="w-5 h-5 text-sky-400" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Targa del Mezzo
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Es: AA 123 BB"
                        value={vehicleCode}
                        onChange={(e) => setVehicleCode(e.target.value)}
                        className="w-full bg-transparent text-sm text-white font-medium placeholder-slate-500 outline-none mt-0.5 uppercase"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Autista Block */}
                  <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            Nome e Cognome Autista
                          </label>
                          <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20 uppercase tracking-wider">Mansione: Conducente</span>
                        </div>
                        <input
                          required
                          type="text"
                          placeholder="Es: Giuseppe Verdi"
                          value={operatorName}
                          onChange={(e) => setOperatorName(e.target.value)}
                          className="w-full bg-transparent text-sm text-white font-medium placeholder-slate-500 outline-none mt-0.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Soccorritore Block */}
                  <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            Nome e Cognome Soccorritore
                          </label>
                          <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20 uppercase tracking-wider">Mansione: Soccorritore</span>
                        </div>
                        <input
                          required
                          type="text"
                          placeholder="Es: Antonio Russo"
                          value={operatorRescuerName}
                          onChange={(e) => setOperatorRescuerName(e.target.value)}
                          className="w-full bg-transparent text-sm text-white font-medium placeholder-slate-500 outline-none mt-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isDisabled}
                className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold text-sm shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeRole === 'sanitari'
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-950/20'
                    : activeRole === 'foglio_marcia'
                    ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-950/20'
                    : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950/20'
                }`}
              >
                {activeRole === 'autisti' ? (
                  isAutistiMissingDetails ? "Inserisci i nomi dell'equipaggio" : 'Accedi come Equipaggio e Inizia'
                ) : activeRole === 'foglio_marcia' ? (
                  isFoglioMarciaMissingDetails ? 'Inserisci i dettagli del mezzo' : 'Accedi al Foglio di Marcia'
                ) : (
                  isSanitariMissingDetails ? 'Inserisci il nome operatore' : 'Accedi e Inizia Compilazione'
                )}
              </button>
            </form>
          )}
        </div>

        <div className="bg-black/30 p-4 text-center border-t border-white/10">
          <p className="text-[10px] text-slate-400">
            Firma Digitale, Marca Temporale e Invio Referto PEC/Email automatici abilitati all'atto della convalida.
          </p>
        </div>
      </div>
    </div>
  );
}
