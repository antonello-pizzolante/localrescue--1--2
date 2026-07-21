const fs = require('fs');
const file = 'src/components/CarrozzeriaSelector.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace handleMainBgUpload
content = content.replace(/const handleMainBgUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\n  \};/m, '');
// replace mainFileInputRef
content = content.replace(/const mainFileInputRef = useRef<HTMLInputElement>\(null\);/m, '');
// replace the upload UI overlay inside the image container
const uploadUI = /\{!\(currentBgImage[\s\S]*?Carica Schema \{vehicleType === 'automedica' \? 'Automedica' : 'Ambulanza'\}<\/span>\n                <\/div>\n              \)\}/m;
content = content.replace(uploadUI, '');

// Also remove setBgImageAmbulanza usages just in case
content = content.replace(/setBgImageAmbulanza\(result\);/g, '');
content = content.replace(/setBgImageAutomedica\(result\);/g, '');

fs.writeFileSync(file, content);
