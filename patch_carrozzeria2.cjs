const fs = require('fs');
let content = fs.readFileSync('src/components/CarrozzeriaSelector.tsx', 'utf8');

content = content.replace(
  "<span>Carica Schema {vehicleType === 'automedica' ? 'Automedica' : 'Ambulanza'}</span>",
  "<span>Nessuno Schema Inserito ({vehicleType === 'automedica' ? 'Automedica' : 'Ambulanza'})</span>"
);

fs.writeFileSync('src/components/CarrozzeriaSelector.tsx', content);
