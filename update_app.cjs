const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `            setDoc(doc(db, 'autisti_reports', r.id), finalR).catch(console.error);`,
  `            setDoc(doc(db, 'autisti_reports', r.id), finalR).catch(console.error);
            setDoc(doc(db, 'cecklist_prova', r.id), finalR).catch(console.error);`
);

content = content.replace(
  `            setDoc(doc(db, 'sanitari_reports', r.id), finalR).catch(console.error);`,
  `            setDoc(doc(db, 'sanitari_reports', r.id), finalR).catch(console.error);
            setDoc(doc(db, 'cecklist_prova', r.id), finalR).catch(console.error);`
);

content = content.replace(
  `        await setDoc(doc(db, 'autisti_reports', finalReport.id), finalReport);`,
  `        await setDoc(doc(db, 'autisti_reports', finalReport.id), finalReport);
        await setDoc(doc(db, 'cecklist_prova', finalReport.id), finalReport);`
);

content = content.replace(
  `        await setDoc(doc(db, 'sanitari_reports', finalReport.id), finalReport);`,
  `        await setDoc(doc(db, 'sanitari_reports', finalReport.id), finalReport);
        await setDoc(doc(db, 'cecklist_prova', finalReport.id), finalReport);`
);

fs.writeFileSync('src/App.tsx', content);
