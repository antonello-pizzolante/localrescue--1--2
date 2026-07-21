const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

content = content.replace(
  `      deleteDoc(doc(db, 'autisti_reports', id)).catch(console.error);`,
  `      deleteDoc(doc(db, 'autisti_reports', id)).catch(console.error);
      deleteDoc(doc(db, 'cecklist_prova', id)).catch(console.error);`
);

content = content.replace(
  `      deleteDoc(doc(db, 'sanitari_reports', id)).catch(console.error);`,
  `      deleteDoc(doc(db, 'sanitari_reports', id)).catch(console.error);
      deleteDoc(doc(db, 'cecklist_prova', id)).catch(console.error);`
);

content = content.replace(
  `                    deleteDoc(doc(db, 'autisti_reports', id)).catch(console.error);`,
  `                    deleteDoc(doc(db, 'autisti_reports', id)).catch(console.error);
                    deleteDoc(doc(db, 'cecklist_prova', id)).catch(console.error);`
);

content = content.replace(
  `                    deleteDoc(doc(db, 'sanitari_reports', id)).catch(console.error);`,
  `                    deleteDoc(doc(db, 'sanitari_reports', id)).catch(console.error);
                    deleteDoc(doc(db, 'cecklist_prova', id)).catch(console.error);`
);

content = content.replace(
  `                  autistiReports.forEach(r => batch.delete(doc(db, 'autisti_reports', r.id)));`,
  `                  autistiReports.forEach(r => { batch.delete(doc(db, 'autisti_reports', r.id)); batch.delete(doc(db, 'cecklist_prova', r.id)); });`
);

content = content.replace(
  `                  sanitariReports.forEach(r => batch.delete(doc(db, 'sanitari_reports', r.id)));`,
  `                  sanitariReports.forEach(r => { batch.delete(doc(db, 'sanitari_reports', r.id)); batch.delete(doc(db, 'cecklist_prova', r.id)); });`
);

fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
