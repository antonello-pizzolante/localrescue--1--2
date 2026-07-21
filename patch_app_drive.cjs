const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { uploadFileToDrive }')) {
  content = content.replace("import { generateAutistiPDF, generateSanitariPDF } from './utils/exports';", "import { generateAutistiPDF, generateSanitariPDF } from './utils/exports';\nimport { uploadFileToDrive } from './lib/drive';\nimport { googleSignIn, getAccessToken } from './lib/auth';");
}

const autoDriveAutisti = `
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
             const filename = \`LocalRescue-Checklist-Autisti-\${finalReport.vehicleCode}-\${finalReport.date.replace(/\\//g, '-')}.pdf\`;
             await uploadFileToDrive(filename, 'application/pdf', blob, 'autisti');
          }
        } catch (e) {
          console.error("Auto upload to drive failed", e);
        }
`;

content = content.replace(`    if (isOnlineNow) {
      try {
        const sanitizedStation = finalReport.stationName.replace(/[/#]/g, '_') || 'default_station';
        await setDoc(doc(db, 'postazioni', sanitizedStation, 'autisti_reports', finalReport.id), finalReport);`, autoDriveAutisti);

const autoDriveSanitari = `
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
             const filename = \`LocalRescue-Checklist-Sanitari-\${finalReport.vehicleCode}-\${finalReport.date.replace(/\\//g, '-')}.pdf\`;
             await uploadFileToDrive(filename, 'application/pdf', blob, 'sanitari');
          }
        } catch (e) {
          console.error("Auto upload to drive failed", e);
        }
`;

content = content.replace(`    if (isOnlineNow) {
      try {
        const sanitizedStation = finalReport.stationName.replace(/[/#]/g, '_') || 'default_station';
        await setDoc(doc(db, 'postazioni', sanitizedStation, 'sanitari_reports', finalReport.id), finalReport);`, autoDriveSanitari);

fs.writeFileSync(file, content);
console.log('Done');
