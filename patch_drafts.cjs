const fs = require('fs');

function patchAutisti() {
  let content = fs.readFileSync('src/components/AutistiForm.tsx', 'utf8');
  
  content = content.replace(
    "  const [report, setReport] = useState<AutistiChecklistReport>(() => {",
    `  const draftKey = \`draft_autisti_\${session.stationName}_\${session.vehicleCode}\`;
  const [report, setReport] = useState<AutistiChecklistReport>(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.date === todayStr && !(parsed.signatures?.turn1 && parsed.signatures?.turn2 && parsed.signatures?.turn3)) {
          return parsed;
        }
      } catch(e) {}
    }`
  );
  
  content = content.replace(
    "    onSaveReport(report);",
    "    localStorage.setItem(draftKey, JSON.stringify(report));\n    onSaveReport(report);"
  );

  // When submitting final report or clearing, we shouldn't necessarily delete the draft until it's actually finished.
  // Actually, if it's finished (all 3 signatures), the condition above won't load it anyway, but we can clear it.
  
  fs.writeFileSync('src/components/AutistiForm.tsx', content);
}

function patchSanitari() {
  let content = fs.readFileSync('src/components/SanitariForm.tsx', 'utf8');
  
  content = content.replace(
    "  const [report, setReport] = useState<SanitariChecklistReport>(() => {",
    `  const draftKey = \`draft_sanitari_\${session.stationName}_\${session.vehicleCode}\`;
  const [report, setReport] = useState<SanitariChecklistReport>(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.date === todayStr && !(parsed.signatures?.mat && parsed.signatures?.pom && parsed.signatures?.not)) {
          return parsed;
        }
      } catch(e) {}
    }`
  );
  
  content = content.replace(
    "    onSaveReport(report);",
    "    localStorage.setItem(draftKey, JSON.stringify(report));\n    onSaveReport(report);"
  );
  
  fs.writeFileSync('src/components/SanitariForm.tsx', content);
}

patchAutisti();
patchSanitari();
