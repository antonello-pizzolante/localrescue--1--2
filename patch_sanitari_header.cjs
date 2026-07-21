const fs = require('fs');
let content = fs.readFileSync('src/components/SanitariForm.tsx', 'utf8');

const regex = /<span>Mezzo: <strong className="bg-red-950 border border-red-500\/30 px-1\.5 py-0\.5 rounded text-red-300">\{session\.vehicleCode\}<\/strong><\/span>/;
content = content.replace(regex, '');

fs.writeFileSync('src/components/SanitariForm.tsx', content);
