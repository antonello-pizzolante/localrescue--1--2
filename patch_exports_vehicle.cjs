const fs = require('fs');
let content = fs.readFileSync('src/utils/exports.ts', 'utf8');

// replace Mezzo ${report.vehicleCode} with just Mezzo if vehicleCode is empty
content = content.replace(/MEZZO \$\{report\.vehicleCode\} - \$\{report\.date\}/g, `MEZZO \${report.vehicleCode ? report.vehicleCode + ' - ' : ''}\${report.date}`);
content = content.replace(/Codice Mezzo;\$\{report\.vehicleCode\}\\n/g, "");

fs.writeFileSync('src/utils/exports.ts', content);
