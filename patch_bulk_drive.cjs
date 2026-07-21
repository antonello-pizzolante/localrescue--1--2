const fs = require('fs');
const file = 'src/components/CloudArchiveConsole.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(new Set());')) {
  content = content.replace('const [isGoogleLinked, setIsGoogleLinked] = useState(false);', 'const [isGoogleLinked, setIsGoogleLinked] = useState(false);\n  const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(new Set());\n  const [isBulkUploading, setIsBulkUploading] = useState(false);');
}

const toggleBulkStr = `
  const toggleBulkSelection = (id: string) => {
    const newSet = new Set(selectedForBulk);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedForBulk(newSet);
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
        const report = filteredReports.find(r => r.id === id);
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
          filename = \`LocalRescue-Checklist-Autisti-\${rep.vehicleCode}-\${rep.date}.pdf\`;
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
          filename = \`LocalRescue-Checklist-Sanitari-\${rep.vehicleCode}-\${rep.date}.pdf\`;
        }
        
        const blob = docPdf.output('blob');
        await uploadFileToDrive(filename, 'application/pdf', blob, isAut ? 'autisti' : 'sanitari');
        successCount++;
      }
      
      alert(\`\${successCount} referti caricati con successo su Drive.\`);
      setSelectedForBulk(new Set()); // deselect all after success
    } catch (e: any) {
      alert('Errore durante il caricamento massivo: ' + e.message);
    } finally {
      setIsBulkUploading(false);
    }
  };
`;

if (!content.includes('handleBulkUploadToDrive')) {
  content = content.replace("const filteredReports = [...autistiReports, ...sanitariReports]", toggleBulkStr + "\n  const filteredReports = [...autistiReports, ...sanitariReports]");
}

const bulkBtnStr = `
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
`;

if (!content.includes('handleBulkUploadToDrive}')) {
  content = content.replace('<div className="flex flex-col sm:flex-row gap-4 mb-6">', `<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Archivio Referti
          </h2>
          {selectedForBulk.size > 0 && (
            <button
              onClick={handleBulkUploadToDrive}
              disabled={isBulkUploading}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              <Cloud className="w-4 h-4" />
              {isBulkUploading ? 'Caricamento in corso...' : \`Backup su Drive (\${selectedForBulk.size})\`}
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">`);
}

const checkboxStr = `
                        {/* Checkbox per Bulk Upload */}
                        <div 
                          className="mr-3 flex items-center justify-center cursor-pointer p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBulkSelection(report.id);
                          }}
                        >
                          <div className={\`w-5 h-5 rounded border flex items-center justify-center transition-all \${selectedForBulk.has(report.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-black/20 border-white/20'}\`}>
                            {selectedForBulk.has(report.id) && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>
`;

if (!content.includes('Checkbox per Bulk Upload')) {
  content = content.replace('const isSelected = isAut', checkboxStr + '\n                  const isSelected = isAut');
}


fs.writeFileSync(file, content);
console.log('Done');
