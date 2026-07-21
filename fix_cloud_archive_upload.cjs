const fs = require('fs');
const file = 'src/components/CloudArchiveConsole.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /let token = await getAccessToken\(\);\n      if \(!token\) \{\n        token = await googleSignIn\(\);\n      \}\n      if \(!token\) \{\n        alert\("Autenticazione necessaria per Google Drive"\);\n        setIsUploadingDrive\(false\);\n        return;\n      \}[\s\S]*?await uploadFileToDrive\(filename, base64Data, token\);/m;

const replacement = `let token = await getAccessToken();
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
        filename = \`LocalRescue-Checklist-Autisti-\${report.vehicleCode}-\${report.date.replace(/\\//g, '-')}.pdf\`;
      } else {
        doc = await generateSanitariPDF(report, dummySession as any);
        filename = \`LocalRescue-Checklist-Sanitari-\${report.vehicleCode}-\${report.date.replace(/\\//g, '-')}.pdf\`;
      }
      
      const pdfBlob = doc.output('blob');
      await uploadFileToDrive(filename, 'application/pdf', pdfBlob, type);`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
