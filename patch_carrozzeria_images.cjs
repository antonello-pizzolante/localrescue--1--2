const fs = require('fs');
const file = 'src/components/CarrozzeriaSelector.tsx';
let content = fs.readFileSync(file, 'utf8');

const regexBgAutomedica = /const \[bgImageAutomedica, setBgImageAutomedica\] = useState<string \| null>\(\(\) => \{[\s\S]*?\}\);/m;
const regexBgAmbulanza = /const \[bgImageAmbulanza, setBgImageAmbulanza\] = useState<string \| null>\(\(\) => \{[\s\S]*?\}\);/m;
const regexCurrentBgImage = /const currentBgImage = vehicleType === 'automedica' \? bgImageAutomedica : bgImageAmbulanza;/m;

content = content.replace(regexBgAutomedica, '');
content = content.replace(regexBgAmbulanza, '');
content = content.replace(regexCurrentBgImage, 'const currentBgImage = vehicleType === "automedica" ? "/automedica.png" : "/ambulanza.png";');

// Remove useEffect for settings
const regexUseEffect = /useEffect\(\(\) => \{[\s\S]*?const docRefAuto = doc\(db, 'settings', 'vehicle_bg_automedica'\);[\s\S]*?return \(\) => \{[\s\S]*?unsubAuto\(\);[\s\S]*?unsubAmb\(\);[\s\S]*?\};[\s\S]*?\}, \[\]\);/m;
content = content.replace(regexUseEffect, '');

fs.writeFileSync(file, content);
console.log('patched CarrozzeriaSelector');
