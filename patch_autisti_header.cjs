const fs = require('fs');
let content = fs.readFileSync('src/components/AutistiForm.tsx', 'utf8');

const regex = /<span>Mezzo: <strong className="bg-cyan-950 border border-cyan-500\/30 px-1\.5 py-0\.5 rounded text-cyan-300">\{session\.vehicleCode\}<\/strong><\/span>/;
content = content.replace(regex, '');

fs.writeFileSync('src/components/AutistiForm.tsx', content);
