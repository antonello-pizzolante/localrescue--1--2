const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

content = content.replace(/Mezzo \{report\.vehicleCode\}/g, "Checklist {report.date}");
content = content.replace(/Mezzo \{selectedAutisti\.vehicleCode\}/g, "Checklist");
content = content.replace(/Presidi \{selectedSanitari\.vehicleCode\}/g, "Presidi");
content = content.replace(/Mezzo: \$\{report\.vehicleCode\}\\n/g, "");
content = content.replace(/- \$\{report\.vehicleCode\} /g, "- ");

fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
