const fs = require('fs');
let content = fs.readFileSync('src/utils/exports.ts', 'utf8');

const regex = /  csv \+\= \`Operatore 1° Turno;\$\{report\.signatures\.turn1\?\.name \|\| 'N\/D'\}\\n\`;\n  csv \+\= \`Operatore 2° Turno;\$\{report\.signatures\.turn2\?\.name \|\| 'N\/D'\}\\n\`;\n  csv \+\= \`Operatore 3° Turno;\$\{report\.signatures\.turn3\?\.name \|\| 'N\/D'\}\\n\\n\`;/;
const replacement = `  csv += \`Autista 1° Turno;\${report.signatures.turn1?.name || 'N/D'}\n\`;
  csv += \`Soccorritore 1° Turno;\${report.signatures.turn1?.rescuerName || 'N/D'}\n\`;
  csv += \`Autista 2° Turno;\${report.signatures.turn2?.name || 'N/D'}\n\`;
  csv += \`Soccorritore 2° Turno;\${report.signatures.turn2?.rescuerName || 'N/D'}\n\`;
  csv += \`Autista 3° Turno;\${report.signatures.turn3?.name || 'N/D'}\n\`;
  csv += \`Soccorritore 3° Turno;\${report.signatures.turn3?.rescuerName || 'N/D'}\n\n\`;`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/utils/exports.ts', content);
