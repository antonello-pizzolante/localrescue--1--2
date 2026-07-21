const fs = require('fs');
let content = fs.readFileSync('src/components/AutistiForm.tsx', 'utf8');

const stateRegex = /const \[signerName, setSignerName\] = useState\(session\.operatorName\);/;
const stateReplace = `const [signerName, setSignerName] = useState(session.operatorName);
  const [rescuerSignerName, setRescuerSignerName] = useState(session.operatorRescuerName || '');
  const [driverTempSig, setDriverTempSig] = useState<string | null>(null);
  const [rescuerTempSig, setRescuerTempSig] = useState<string | null>(null);`;

content = content.replace(stateRegex, stateReplace);

const saveFuncRegex = /const handleSaveSignature = \(signatureDataUrl: string\) => \{([^]*?)(?=const handleCloudSync)/;
const saveFuncReplace = `const handleSaveSignature = () => {
    if (!activeSigningShift) return;
    if (!driverTempSig || !rescuerTempSig) {
      alert("Entrambe le firme (Autista e Soccorritore) sono obbligatorie.");
      return;
    }

    const timeStr = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const fullTimestamp = \`\${todayStr} \${timeStr}\`;

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
        id: \`rep_aut_\${Date.now()}\`,
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
    
    setActiveSigningShift(null);
    setDriverTempSig(null);
    setRescuerTempSig(null);
  };

  `;
content = content.replace(saveFuncRegex, saveFuncReplace);

const setShiftRegex = /setActiveSigningShift\(null\)/g;
content = content.replace(setShiftRegex, 'setActiveSigningShift(null); setDriverTempSig(null); setRescuerTempSig(null);');

const modalRegex = /\{activeSigningShift && \(([^]*?)<\/div>\n            \)\}/;
const modalReplace = `{activeSigningShift && (
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
            )}`;
            
content = content.replace(modalRegex, modalReplace);

fs.writeFileSync('src/components/AutistiForm.tsx', content);
