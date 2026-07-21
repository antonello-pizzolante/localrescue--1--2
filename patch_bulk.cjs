const fs = require('fs');
const file = 'src/components/CloudArchiveConsole.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `const filteredReports = [...autistiReports, ...sanitariReports]`;

const bulkStr = `
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
          filename = \`LocalRescue-Checklist-Autisti-\${rep.vehicleCode}-\${rep.date.replace(/\\//g, '-')}.pdf\`;
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
          filename = \`LocalRescue-Checklist-Sanitari-\${rep.vehicleCode}-\${rep.date.replace(/\\//g, '-')}.pdf\`;
        }
        
        const blob = docPdf.output('blob');
        await uploadFileToDrive(filename, 'application/pdf', blob, isAut ? 'autisti' : 'sanitari');
        successCount++;
      }
      
      alert(\`\${successCount} referti caricati con successo su Drive.\`);
      setSelectedForBulk(new Set());
    } catch (e: any) {
      alert('Errore durante il caricamento massivo: ' + e.message);
    } finally {
      setIsBulkUploading(false);
    }
  };

  const filteredReports = [...autistiReports, ...sanitariReports]`;

content = content.replace(targetStr, bulkStr);

const targetBtnStr = `<div className="flex flex-col sm:flex-row gap-4 mb-6">`;
const newBtnStr = `<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
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
        <div className="flex flex-col sm:flex-row gap-4 mb-6">`;

content = content.replace(targetBtnStr, newBtnStr);

const targetCheckboxStr = `<div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">`;

const newCheckboxStr = `<div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex items-center justify-center cursor-pointer p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBulkSelection(report.id);
                          }}
                        >
                          <div className={\`w-5 h-5 rounded border flex items-center justify-center transition-all \${selectedForBulk.has(report.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-black/20 border-white/20'}\`}>
                            {selectedForBulk.has(report.id) && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>`;

content = content.replace(targetCheckboxStr, newCheckboxStr);

fs.writeFileSync(file, content);
console.log('Done');
