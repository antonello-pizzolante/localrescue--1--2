const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

if (!content.includes('import { googleSignIn, initAuth }')) {
  content = content.replace(
    "import { STATION_PRESETS } from '../data';",
    "import { STATION_PRESETS } from '../data';\nimport { googleSignIn, initAuth, logoutGoogle } from '../lib/auth';\nimport { sendEmail } from '../lib/gmail';\nimport { Mail, Send } from 'lucide-react';"
  );
}

// Add state for Gmail
const authStates = `  const [showSeedSuccess, setShowSeedSuccess] = useState(false);
  const [showQRCodes, setShowQRCodes] = useState(false);`;

if (!content.includes('const [isGmailAuth, setIsGmailAuth] = useState(false);')) {
  content = content.replace(
    authStates,
    authStates + `\n  const [isGmailAuth, setIsGmailAuth] = useState(false);\n  const [isSendingEmail, setIsSendingEmail] = useState(false);\n  const [emailStatusMsg, setEmailStatusMsg] = useState('');`
  );
}

// Add initAuth effect
const effectsStr = `  useEffect(() => {
    const adminCreds = localStorage.getItem('localrescue_credentials');`;

if (!content.includes('initAuth(')) {
  content = content.replace(
    effectsStr,
    `  useEffect(() => {
    initAuth(
      (user, token) => setIsGmailAuth(true),
      () => setIsGmailAuth(false)
    );
  }, []);

` + effectsStr
  );
}

const sendEmailHandler = `
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

    try {
      setIsSendingEmail(true);
      setEmailStatusMsg('Invio in corso...');
      
      const typeStr = isAut ? 'Autisti' : 'Sanitari';
      const to = savedEmail || 'centrale@localrescue.it';
      const subject = \`[\${report.stationName}] Check-list \${typeStr} - \${report.vehicleCode} del \${report.date}\`;
      const body = \`Referto compilato per:
Postazione: \${report.stationName}
Mezzo: \${report.vehicleCode}
Data: \${report.date}
Stato del veicolo e/o del vano sanitario controllati correttamente.
Le anomalie, se presenti, sono state registrate nel documento PDF ufficiale e sul sistema locale.\`;

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
`;

if (!content.includes('handleSendEmail')) {
  content = content.replace(
    '  // Generate demo logs if empty',
    sendEmailHandler + '\n  // Generate demo logs if empty'
  );
}

// Add the Email button next to the download button
const downloadBtnMatch = `              <button
                onClick={() => {
                  if (selectedAutisti) {
                    generateAutistiPDF(selectedAutisti);
                  } else if (selectedSanitari) {
                    generateSanitariPDF(selectedSanitari);
                  }
                }}
                className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Scarica PDF Referto</span>
              </button>`;

const newButtons = `              <button
                onClick={() => {
                  if (selectedAutisti) {
                    generateAutistiPDF(selectedAutisti);
                  } else if (selectedSanitari) {
                    generateSanitariPDF(selectedSanitari);
                  }
                }}
                className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Scarica PDF</span>
              </button>

              <button
                onClick={() => handleSendEmail(selectedAutisti || selectedSanitari, !!selectedAutisti)}
                disabled={isSendingEmail}
                className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isGmailAuth ? <Send className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                <span>{isSendingEmail ? 'Invio...' : (isGmailAuth ? 'Invia Email' : 'Collega Gmail')}</span>
              </button>
              
              {emailStatusMsg && <span className="text-xs text-blue-400 font-bold ml-2 self-center">{emailStatusMsg}</span>}`;

if (!content.includes('handleSendEmail(')) {
  content = content.replace(downloadBtnMatch, newButtons);
}

// Add Gmail Status to Header
const headerToolsMatch = `{/* Change Password Button */}`;
const gmailStatusBtn = `{/* Gmail Connect Button */}
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
            className={\`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer \${isGmailAuth ? 'bg-blue-900/40 border border-blue-500/30 text-blue-300' : 'bg-slate-800 border border-slate-700 text-slate-300'}\`}
          >
            <Mail className="w-4 h-4" />
            <span>{isGmailAuth ? 'Gmail Connesso' : 'Connetti Gmail'}</span>
          </button>
          
          {/* Change Password Button */}`;

if (!content.includes('Gmail Connesso')) {
  content = content.replace(headerToolsMatch, gmailStatusBtn);
}


fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
