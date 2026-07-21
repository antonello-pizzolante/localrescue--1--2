const fs = require('fs');
const file = 'src/components/CloudArchiveConsole.tsx';
let content = fs.readFileSync(file, 'utf8');

const singleUploadCode = `
  const handleUploadToDrive = async (report: any, type: 'autisti' | 'sanitari') => {
    try {
      setIsUploadingDrive(true);
      let token = await getAccessToken();
      if (!token) {
        token = await googleSignIn();
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
        filename = \`LocalRescue-Checklist-Autisti-\${report.vehicleCode}-\${report.date.replace(/\\//g, '-')}.pdf\`;
      } else {
        doc = await generateSanitariPDF(report, dummySession as any);
        filename = \`LocalRescue-Checklist-Sanitari-\${report.vehicleCode}-\${report.date.replace(/\\//g, '-')}.pdf\`;
      }
      
      const pdfBase64 = doc.output('datauristring');
      const base64Data = pdfBase64.split(',')[1];
      await uploadFileToDrive(filename, base64Data, token);
      alert('Upload su Drive completato con successo!');
    } catch (err) {
      console.error(err);
      alert('Errore durante upload su Drive');
    } finally {
      setIsUploadingDrive(false);
    }
  };
`;

if (!content.includes('const handleUploadToDrive = async')) {
  content = content.replace(/const handleBulkUploadToDrive = async \(\) => \{/, singleUploadCode + "\n  const handleBulkUploadToDrive = async () => {");
  fs.writeFileSync(file, content);
}
