const fs = require('fs');
const file = 'src/components/CarrozzeriaSelector.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{currentBgImage \? \([\s\S]*?<img src=\{currentBgImage\} alt="Diagramma" className="w-full h-full object-contain select-none pointer-events-none opacity-80" \/>[\s\S]*?\) : \([\s\S]*?\)\}/m, 
`<img src={currentBgImage || (vehicleType === "automedica" ? "/automedica.png" : "/ambulanza.png")} alt="Diagramma" className="w-full h-full object-contain select-none pointer-events-none opacity-80" />`);

fs.writeFileSync(file, content);
