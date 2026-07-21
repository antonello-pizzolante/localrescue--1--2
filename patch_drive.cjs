const fs = require('fs');

function patchAutistiForm() {
  const file = 'src/components/AutistiForm.tsx';
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('import { uploadFileToDrive }')) {
    content = content.replace("import { VoiceNoteInput } from './VoiceNoteInput';", "import { VoiceNoteInput } from './VoiceNoteInput';\nimport { uploadFileToDrive } from '../lib/drive';\nimport { googleSignIn, getAccessToken } from '../lib/auth';");
  }

  if (!content.includes('const [isUploadingDrive, setIsUploadingDrive] = useState(false);')) {
    content = content.replace("const [showSendSuccess, setShowSendSuccess] = useState(false);", "const [showSendSuccess, setShowSendSuccess] = useState(false);\n  const [isUploadingDrive, setIsUploadingDrive] = useState(false);");
  }

  const driveFunc = `
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
      const filename = \`Checklist_Autisti_\${session.vehicleCode}_\${report.date.replace(/\\//g, '-')}.pdf\`;
      await uploadFileToDrive(filename, 'application/pdf', blob);
      alert('PDF salvato con successo su Google Drive!');
    } catch (error: any) {
      alert(error.message || 'Errore durante il salvataggio su Drive');
    } finally {
      setIsUploadingDrive(false);
    }
  };
`;

  if (!content.includes('handleUploadDrive')) {
    content = content.replace("const handleDownloadPDF = async () => {", driveFunc + "\n  const handleDownloadPDF = async () => {");
  }

  const driveBtn = `
          <button
            onClick={handleUploadDrive}
            disabled={isUploadingDrive}
            className="flex items-center gap-2 p-2.5 px-4 text-xs font-bold rounded-xl border border-white/10 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <Cloud className="w-4 h-4" />
            {isUploadingDrive ? 'Salvataggio...' : 'Salva in Drive'}
          </button>
`;

  if (!content.includes('Salva in Drive')) {
    content = content.replace("{/* PDF export */}", driveBtn + "\n          {/* PDF export */}");
  }

  fs.writeFileSync(file, content);
}

function patchSanitariForm() {
  const file = 'src/components/SanitariForm.tsx';
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('import { uploadFileToDrive }')) {
    content = content.replace("import { VoiceNoteInput } from './VoiceNoteInput';", "import { VoiceNoteInput } from './VoiceNoteInput';\nimport { uploadFileToDrive } from '../lib/drive';\nimport { googleSignIn, getAccessToken } from '../lib/auth';");
  }

  if (!content.includes('const [isUploadingDrive, setIsUploadingDrive] = useState(false);')) {
    content = content.replace("const [showSendSuccess, setShowSendSuccess] = useState(false);", "const [showSendSuccess, setShowSendSuccess] = useState(false);\n  const [isUploadingDrive, setIsUploadingDrive] = useState(false);");
  }

  const driveFunc = `
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
      const filename = \`Checklist_Sanitari_\${session.vehicleCode}_\${report.date.replace(/\\//g, '-')}.pdf\`;
      await uploadFileToDrive(filename, 'application/pdf', blob);
      alert('PDF salvato con successo su Google Drive!');
    } catch (error: any) {
      alert(error.message || 'Errore durante il salvataggio su Drive');
    } finally {
      setIsUploadingDrive(false);
    }
  };
`;

  if (!content.includes('handleUploadDrive')) {
    content = content.replace("const handleDownloadPDF = async () => {", driveFunc + "\n  const handleDownloadPDF = async () => {");
  }

  const driveBtn = `
          <button
            onClick={handleUploadDrive}
            disabled={isUploadingDrive}
            className="flex items-center gap-2 p-2.5 px-4 text-xs font-bold rounded-xl border border-white/10 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <Cloud className="w-4 h-4" />
            {isUploadingDrive ? 'Salvataggio...' : 'Salva in Drive'}
          </button>
`;

  if (!content.includes('Salva in Drive')) {
    content = content.replace("{/* PDF export */}", driveBtn + "\n          {/* PDF export */}");
  }

  fs.writeFileSync(file, content);
}

function patchCloudArchiveConsole() {
  const file = 'src/components/CloudArchiveConsole.tsx';
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('import { uploadFileToDrive }')) {
    content = content.replace("import { googleSignIn, initAuth, logoutGoogle } from '../lib/auth';", "import { googleSignIn, initAuth, logoutGoogle, getAccessToken } from '../lib/auth';\nimport { uploadFileToDrive } from '../lib/drive';");
  }

  if (!content.includes('const [isUploadingDrive, setIsUploadingDrive] = useState(false);')) {
    content = content.replace("const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);", "const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);\n  const [isUploadingDrive, setIsUploadingDrive] = useState(false);");
  }

  const driveFunc = `
  const handleUploadToDrive = async (report: AutistiChecklistReport | SanitariChecklistReport, type: 'autisti' | 'sanitari') => {
    setIsUploadingDrive(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (!authRes?.accessToken) {
          throw new Error("Autenticazione fallita o annullata.");
        }
      }
      
      let doc;
      let filename;
      
      if (type === 'autisti') {
        const rep = report as AutistiChecklistReport;
        doc = await generateAutistiPDF(rep, {
          role: 'autisti',
          operatorName: rep.operator1 || 'N/D',
          vehicleCode: rep.vehicleCode,
          stationName: rep.stationName,
          assignedServiceStation: rep.assignedServiceStation,
          loginTime: '07:00'
        });
        filename = \`LocalRescue-Checklist-Autisti-\${rep.vehicleCode}-\${rep.date}.pdf\`;
      } else {
        const rep = report as SanitariChecklistReport;
        doc = await generateSanitariPDF(rep, {
          role: 'sanitari',
          operatorName: rep.operatorMat || 'N/D',
          vehicleCode: rep.vehicleCode,
          stationName: rep.stationName,
          assignedServiceStation: rep.assignedServiceStation,
          loginTime: '07:00'
        });
        filename = \`LocalRescue-Checklist-Sanitari-\${rep.vehicleCode}-\${rep.date}.pdf\`;
      }
      
      const blob = doc.output('blob');
      await uploadFileToDrive(filename, 'application/pdf', blob);
      alert('PDF salvato con successo su Google Drive!');
    } catch (error: any) {
      alert(error.message || 'Errore durante il salvataggio su Drive');
    } finally {
      setIsUploadingDrive(false);
    }
  };
`;

  if (!content.includes('handleUploadToDrive')) {
    content = content.replace("const handleLogout = () => {", driveFunc + "\n  const handleLogout = () => {");
  }

  const listBtnStr = `
                          {/* Drive Export */}
                          <button
                            onClick={() => handleUploadToDrive(report as any, isAut ? 'autisti' : 'sanitari')}
                            disabled={isUploadingDrive}
                            className="p-2 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/30 rounded-xl border border-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                            title="Salva in Google Drive"
                          >
                            <Cloud className="w-3.5 h-3.5" />
                          </button>
`;
  if (!content.includes('Salva in Google Drive')) {
    content = content.replace("{/* PDF Export */}", listBtnStr + "\n                          {/* PDF Export */}");
  }

  const modalBtnStr = `
              {/* Drive Download Button */}
              <button
                onClick={() => handleUploadToDrive(selectedAutisti || selectedSanitari as any, selectedAutisti ? 'autisti' : 'sanitari')}
                disabled={isUploadingDrive}
                className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl bg-cyan-600/20 border border-cyan-500/30 hover:bg-cyan-600/40 text-cyan-300 font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                <span>Salva in Drive</span>
              </button>
`;
  if (!content.includes('Drive Download Button')) {
    content = content.replace("{/* PDF Download Button inside the Modal too for convenience */}", modalBtnStr + "\n              {/* PDF Download Button inside the Modal too for convenience */}");
  }

  fs.writeFileSync(file, content);
}

patchAutistiForm();
patchSanitariForm();
patchCloudArchiveConsole();
console.log('Done!');
