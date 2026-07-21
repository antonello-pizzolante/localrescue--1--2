const fs = require('fs');
const file = 'src/components/CloudArchiveConsole.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [showDriveWizard, setShowDriveWizard] = useState(false);')) {
  content = content.replace('const [isGoogleLinked, setIsGoogleLinked] = useState(false);', 
  `const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [showDriveWizard, setShowDriveWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardStatus, setWizardStatus] = useState<'' | 'loading' | 'success' | 'error'>('');
  const [wizardError, setWizardError] = useState('');`);
}

const launchWizardBtn = `
          {/* Drive Setup Wizard Button */}
          <button
            onClick={() => {
              setShowDriveWizard(true);
              setWizardStep(1);
              setWizardStatus('');
              setWizardError('');
            }}
            className={\`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer \${isGoogleLinked ? 'bg-cyan-900/40 border border-cyan-500/30 text-cyan-300' : 'bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white'}\`}
          >
            <Cloud className="w-4 h-4" />
            <span>{isGoogleLinked ? 'Drive Connesso (Verifica)' : 'Configura Google Drive'}</span>
          </button>
`;

if (!content.includes('Configura Google Drive')) {
  content = content.replace('{/* Gmail Connect Button */}', launchWizardBtn + '\n          {/* Gmail Connect Button */}');
}

const wizardModal = `
      {/* DRIVE SETUP WIZARD */}
      {showDriveWizard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Cloud className="w-5 h-5 text-emerald-400" />
              Connessione Google Drive
            </h2>
            
            {wizardStep === 1 && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-slate-300">
                  Per procedere con il salvataggio dei referti in Google Drive, devi autenticarti con l'account principale: <strong className="text-white">localrescue099@gmail.com</strong>
                </p>
                <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs text-blue-200">
                  Questa procedura verificherà anche i permessi di scrittura creando un file di test temporaneo.
                </div>
                
                <button
                  onClick={async () => {
                    setWizardStatus('loading');
                    setWizardError('');
                    try {
                      const res = await googleSignIn();
                      if (res?.accessToken) {
                        setWizardStep(2);
                        setWizardStatus('');
                      }
                    } catch (e: any) {
                      setWizardStatus('error');
                      setWizardError(e.message);
                    }
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  {wizardStatus === 'loading' ? 'Autenticazione in corso...' : 'Inizia Autenticazione'}
                </button>
              </div>
            )}
            
            {wizardStep === 2 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  Autenticazione riuscita!
                </div>
                <p className="text-sm text-slate-300">
                  Ora verifichiamo i permessi di scrittura. L'app creerà un piccolo file di test su Drive per assicurarsi che le API siano operative.
                </p>
                <button
                  onClick={async () => {
                    setWizardStatus('loading');
                    setWizardError('');
                    try {
                      const blob = new Blob(["Questo è un file di test per verificare i permessi di scrittura in LocalRescue."], { type: "text/plain" });
                      await uploadFileToDrive(\`Test_LocalRescue_\${Date.now()}.txt\`, 'text/plain', blob, 'root');
                      
                      setWizardStep(3);
                      setWizardStatus('success');
                      setIsGoogleLinked(true);
                    } catch (e: any) {
                      setWizardStatus('error');
                      setWizardError(e.message);
                    }
                  }}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Cloud className="w-4 h-4" />
                  {wizardStatus === 'loading' ? 'Verifica in corso...' : 'Verifica Permessi Drive'}
                </button>
              </div>
            )}
            
            {wizardStep === 3 && (
              <div className="flex flex-col gap-4 items-center justify-center py-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white text-center">Configurazione Completata!</h3>
                <p className="text-sm text-slate-400 text-center">
                  Il tuo account ha i permessi di scrittura. Ora puoi eseguire il backup massivo dei referti direttamente su Drive.
                </p>
                <button
                  onClick={() => setShowDriveWizard(false)}
                  className="mt-2 w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  Chiudi e Torna all'Archivio
                </button>
              </div>
            )}
            
            {wizardStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 text-red-300 text-xs rounded-lg font-bold flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{wizardError}</span>
              </div>
            )}
            
            {wizardStep !== 3 && (
              <button
                onClick={() => setShowDriveWizard(false)}
                className="mt-4 w-full py-2 bg-transparent text-slate-400 hover:text-white text-xs font-bold underline transition-colors cursor-pointer"
              >
                Annulla e chiudi
              </button>
            )}
          </div>
        </div>
      )}
`;

if (!content.includes('DRIVE SETUP WIZARD')) {
  content = content.replace('</main>', wizardModal + '\n      </main>');
}

fs.writeFileSync(file, content);
console.log('Done');
